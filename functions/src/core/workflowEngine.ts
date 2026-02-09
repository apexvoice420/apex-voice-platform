import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import * as logger from 'firebase-functions/logger';
// import { Workflow, WorkflowStep } from '../../../src/types/schema'; // We might need to copy types or link them

const db = getFirestore();

// Helper to use the schema types in functions (copying minimal needed if shared types not setup for monorepo)
// Since we are in subfolder, imports from root src might fail in build if not configured.
// For now, I'll trust standard relative import if TSConfig allows, otherwise I define interfaces here.

export async function triggerWorkflow(clientId: string, triggerType: string, payload: any) {
    logger.info(`Triggering workflow: ${triggerType} for client ${clientId}`);

    // Fetch active workflows for this trigger
    const workflowsSnap = await db.collection('workflows')
        .where('clientId', '==', clientId)
        .where('isActive', '==', true)
        .where('trigger.type', '==', triggerType)
        .get();

    if (workflowsSnap.empty) {
        logger.info('No workflows found');
        return;
    }

    for (const doc of workflowsSnap.docs) {
        const workflow = doc.data();
        logger.info(`Executing workflow ${workflow.name} (${doc.id})`);
        await executeWorkflowSteps(workflow.steps, payload, clientId);
    }
}

async function executeWorkflowSteps(steps: any[], payload: any, clientId: string) {
    // Sort steps by order? Assuming array is ordered for now.

    for (const step of steps) {
        try {
            switch (step.type) {
                case 'send_sms':
                    await sendSms(step.config, payload);
                    break;
                case 'add_tag':
                    await addTag(step.config, payload, clientId);
                    break;
                case 'move_stage':
                    await moveStage(step.config, payload, clientId);
                    break;
                default:
                    logger.warn(`Unknown step type: ${step.type}`);
            }
        } catch (err) {
            logger.error(`Error in step ${step.id}`, err);
            // Continue or break?
        }
    }
}

async function sendSms(config: any, payload: any) {
    logger.info('Action: Send SMS', config);
    // TODO: Integrate Twilio or similar
}

async function addTag(config: any, payload: any, clientId: string) {
    const { contactId } = payload;
    const tag = config.tag;
    if (contactId && tag) {
        await db.collection('contacts').doc(contactId).update({
            tags: FieldValue.arrayUnion(tag)
        }); // Need to import FieldValue properly or use adminSDK
    }
}

async function moveStage(config: any, payload: any, clientId: string) {
    const { contactId } = payload;
    const { pipelineId, stageId } = config;

    // Find Opportunity for this contact in the pipeline
    // Or create if not exists?
    // For simplicity: Update opportunity
    const oppsSnap = await db.collection('opportunities')
        .where('contactId', '==', contactId)
        .where('pipelineId', '==', pipelineId)
        .limit(1)
        .get();

    if (!oppsSnap.empty) {
        await oppsSnap.docs[0].ref.update({ stageId });
    }
}
