import { onRequest } from 'firebase-functions/v2/https';
import { getFirestore } from 'firebase-admin/firestore';
import * as logger from 'firebase-functions/logger';
import { triggerWorkflow } from '../core/workflowEngine';

const db = getFirestore();

export const vapiWebhook = onRequest(async (req, res) => {
    if (req.method !== 'POST') {
        res.status(405).send('Method Not Allowed');
        return;
    }

    const { message } = req.body;

    if (!message) {
        logger.warn('No message in webhook body', req.body);
        res.status(200).send('OK'); // Ack to stop retries if invalid
        return;
    }

    const { type, call, transcript } = message;

    // Depending on Vapi payload structure. 
    // 'call-status-update', 'end-of-call-report', 'function-call', etc.

    logger.info(`Received Vapi event: ${type}`, { transcript });

    try {
        // 1. Identify Client and Contact based on call data
        // Assuming we pass clientId in metadata or lookup by phone number
        const assistantId = call?.assistantId;
        logger.debug('Processing call for assistant', { assistantId });
        // TODO: Lookup client by assistantId or PhoneNumber

        // For now, assume metadata has client info if we passed it on outbound
        // or we have a mapping.
        // Let's assume inbound call handling logic finding contact by phone.

        if (type === 'end-of-call-report') {
            const { summary, recordingUrl, status, customer } = message;
            const phoneNumber = customer?.number;

            if (phoneNumber) {
                // Find contact
                const contactsRef = db.collection('contacts');
                const snapshot = await contactsRef.where('phone', '==', phoneNumber).limit(1).get();

                if (!snapshot.empty) {
                    const contactDoc = snapshot.docs[0];
                    const contactId = contactDoc.id;
                    const { clientId } = contactDoc.data();

                    // Log Call Message
                    const conversationRef = db.collection('conversations').where('contactId', '==', contactId).limit(1);
                    const conversationSnap = await conversationRef.get();

                    let conversationId;
                    if (conversationSnap.empty) {
                        // Create new conversation
                        const newConv = await db.collection('conversations').add({
                            clientId,
                            contactId,
                            lastMessageAt: Date.now(),
                            status: 'open',
                            type: 'call'
                        });
                        conversationId = newConv.id;
                    } else {
                        conversationId = conversationSnap.docs[0].id;
                    }

                    await db.collection('messages').add({
                        conversationId,
                        channel: 'voice',
                        direction: 'inbound', // or outbound depending on call
                        content: summary || 'Call completed',
                        status: 'delivered', // complete
                        metadata: {
                            recordingUrl,
                            duration: message.duration,
                            cost: message.cost,
                            callId: call.id
                        },
                        createdAt: Date.now(),
                        clientId
                    });

                    // Trigger Workflow
                    await triggerWorkflow(clientId, 'call_completed', {
                        contactId,
                        callOutcome: status,
                        summary
                    });
                }
            }
        }

        res.status(200).send('OK');
    } catch (error) {
        logger.error('Error processing Vapi webhook', error);
        res.status(500).send('Internal Server Error');
    }
});
