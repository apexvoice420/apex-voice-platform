require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// VAPI Configuration
const VAPI_API_KEY = process.env.VAPI_API_KEY;
const VAPI_ASSISTANT_ID = process.env.VAPI_ASSISTANT_ID;

app.use(cors());
app.use(express.json());

// ============ HEALTH CHECK ============
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'ok',
        timestamp: new Date().toISOString(),
        vapi: VAPI_API_KEY ? 'configured' : 'missing'
    });
});

// ============ AUTH MIDDLEWARE ============
const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided' });
    }
    
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.userId = decoded.userId;
        req.tenantId = decoded.tenantId;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid token' });
    }
};

// ============ AUTH ENDPOINTS ============
app.post('/api/auth/register', async (req, res) => {
    const { email, password, name, tenantName } = req.body;

    try {
        // Create tenant first
        const tenant = await prisma.tenant.create({
            data: { name: tenantName || `${name || email}'s Business` }
        });

        // Create user
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name: name || email.split('@')[0],
                role: 'ADMIN',
                tenantId: tenant.id
            }
        });

        const token = jwt.sign(
            { userId: user.id, tenantId: tenant.id, email: user.email },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({ 
            token, 
            user: { id: user.id, email: user.email, name: user.name, tenantId: tenant.id }
        });
    } catch (error) {
        console.error('Registration error:', error);
        if (error.code === 'P2002') {
            return res.status(400).json({ error: 'Email already exists' });
        }
        res.status(500).json({ error: 'Could not create account' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await prisma.user.findUnique({
            where: { email },
            include: { tenant: true }
        });

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { userId: user.id, tenantId: user.tenantId, email: user.email },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({ 
            token, 
            user: { 
                id: user.id, 
                email: user.email, 
                name: user.name,
                tenantId: user.tenantId,
                tenant: user.tenant
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/auth/me', authMiddleware, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.userId },
            include: { tenant: true }
        });
        res.json({ user });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});

// Admin password reset (protected by admin key)
app.post('/api/admin/reset-password', async (req, res) => {
    const { email, newPassword, adminKey } = req.body;
    
    // Simple admin key check
    if (adminKey !== 'apex-admin-reset-2026') {
        return res.status(403).json({ error: 'Unauthorized' });
    }
    
    if (!email || !newPassword) {
        return res.status(400).json({ error: 'Email and newPassword required' });
    }
    
    try {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const user = await prisma.user.update({
            where: { email },
            data: { password: hashedPassword }
        });
        res.json({ success: true, message: `Password updated for ${email}` });
    } catch (error) {
        console.error('Password reset error:', error);
        res.status(500).json({ error: 'Failed to reset password' });
    }
});

// ============ LEADS ENDPOINTS ============
app.get('/api/leads', authMiddleware, async (req, res) => {
    try {
        const { status, search } = req.query;
        const where = { tenantId: req.tenantId };
        
        if (status) where.status = status;
        if (search) {
            where.OR = [
                { firstName: { contains: search, mode: 'insensitive' } },
                { lastName: { contains: search, mode: 'insensitive' } },
                { phone: { contains: search } },
                { email: { contains: search, mode: 'insensitive' } }
            ];
        }

        const leads = await prisma.lead.findMany({
            where,
            include: { calls: { take: 1, orderBy: { createdAt: 'desc' } } },
            orderBy: { createdAt: 'desc' }
        });
        res.json({ leads });
    } catch (error) {
        console.error('Fetch leads error:', error);
        res.status(500).json({ error: 'Failed to fetch leads' });
    }
});

app.post('/api/leads', authMiddleware, async (req, res) => {
    try {
        const lead = await prisma.lead.create({
            data: {
                ...req.body,
                tenantId: req.tenantId
            }
        });
        res.json({ lead });
    } catch (error) {
        console.error('Create lead error:', error);
        res.status(500).json({ error: 'Failed to create lead' });
    }
});

app.patch('/api/leads/:id', authMiddleware, async (req, res) => {
    try {
        const lead = await prisma.lead.update({
            where: { id: req.params.id, tenantId: req.tenantId },
            data: req.body
        });
        res.json({ lead });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update lead' });
    }
});

app.delete('/api/leads/:id', authMiddleware, async (req, res) => {
    try {
        await prisma.lead.delete({
            where: { id: req.params.id, tenantId: req.tenantId }
        });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete lead' });
    }
});

// ============ CALL LOGS ============
app.get('/api/calls', authMiddleware, async (req, res) => {
    try {
        const calls = await prisma.callLog.findMany({
            where: { tenantId: req.tenantId },
            include: { lead: true, agent: true },
            orderBy: { createdAt: 'desc' },
            take: 100
        });
        res.json({ calls });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch calls' });
    }
});

app.post('/api/calls', authMiddleware, async (req, res) => {
    try {
        const call = await prisma.callLog.create({
            data: {
                ...req.body,
                tenantId: req.tenantId
            }
        });
        res.json({ call });
    } catch (error) {
        res.status(500).json({ error: 'Failed to log call' });
    }
});

// ============ VAPI WEBHOOK ============
app.post('/api/vapi/webhook', async (req, res) => {
    try {
        const { message, call } = req.body;
        console.log('VAPI Webhook:', JSON.stringify(req.body, null, 2));

        // Handle different VAPI events
        if (message?.type === 'end-of-call-report') {
            const callData = message.call || call;
            
            // Log the call
            if (callData?.id) {
                // Find or create lead based on phone
                let lead = null;
                if (callData.customer?.number) {
                    lead = await prisma.lead.findFirst({
                        where: { phone: callData.customer.number }
                    });
                }

                await prisma.callLog.create({
                    data: {
                        vapiCallId: callData.id,
                        direction: callData.type === 'outboundPhoneCall' ? 'OUTBOUND' : 'INBOUND',
                        status: callData.status || 'COMPLETED',
                        duration: callData.duration,
                        transcript: callData.transcript,
                        summary: callData.summary,
                        outcome: callData.endedReason,
                        leadId: lead?.id,
                        tenantId: lead?.tenantId || 'default-tenant' // Fallback
                    }
                });
            }
        }

        res.json({ received: true });
    } catch (error) {
        console.error('VAPI webhook error:', error);
        res.status(500).json({ error: 'Webhook processing failed' });
    }
});

// ============ VAPI OUTBOUND CALL ============
app.post('/api/vapi/call', authMiddleware, async (req, res) => {
    try {
        const { phoneNumber, leadId } = req.body;

        if (!VAPI_API_KEY || !VAPI_ASSISTANT_ID) {
            return res.status(400).json({ error: 'VAPI not configured' });
        }

        // Create VAPI call
        const vapiResponse = await fetch('https://api.vapi.ai/call/phone', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${VAPI_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                assistantId: VAPI_ASSISTANT_ID,
                customer: { number: phoneNumber },
                metadata: { leadId, tenantId: req.tenantId }
            })
        });

        if (!vapiResponse.ok) {
            const error = await vapiResponse.text();
            return res.status(400).json({ error: 'VAPI call failed', details: error });
        }

        const callData = await vapiResponse.json();

        // Log the call
        await prisma.callLog.create({
            data: {
                vapiCallId: callData.id,
                direction: 'OUTBOUND',
                status: 'INITIATED',
                leadId,
                tenantId: req.tenantId
            }
        });

        res.json({ success: true, callId: callData.id });
    } catch (error) {
        console.error('VAPI call error:', error);
        res.status(500).json({ error: 'Failed to initiate call' });
    }
});

// ============ AGENTS ============
app.get('/api/agents', authMiddleware, async (req, res) => {
    try {
        const agents = await prisma.agent.findMany({
            where: { tenantId: req.tenantId },
            orderBy: { createdAt: 'desc' }
        });
        res.json({ agents });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch agents' });
    }
});

// ============ VAPI SYNC - Fetch all VAPI assistants ============
app.get('/api/vapi/assistants', authMiddleware, async (req, res) => {
    try {
        if (!VAPI_API_KEY) {
            return res.status(400).json({ error: 'VAPI_API_KEY not configured' });
        }

        const response = await fetch('https://api.vapi.ai/assistant', {
            headers: {
                'Authorization': `Bearer ${VAPI_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const error = await response.text();
            return res.status(400).json({ error: 'Failed to fetch VAPI assistants', details: error });
        }

        const assistants = await response.json();
        
        // Transform VAPI data for frontend
        const formattedAssistants = assistants.map(assistant => ({
            id: assistant.id,
            name: assistant.name,
            voice: assistant.voice?.voiceId || 'default',
            voiceProvider: assistant.voice?.provider || '11labs',
            model: assistant.model?.model || 'gpt-4o',
            firstMessage: assistant.firstMessage,
            status: 'active',
            createdAt: assistant.createdAt,
            updatedAt: assistant.updatedAt
        }));

        res.json({ assistants: formattedAssistants });
    } catch (error) {
        console.error('VAPI fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch VAPI assistants' });
    }
});

// Sync VAPI assistants to local database
app.post('/api/agents/sync-vapi', authMiddleware, async (req, res) => {
    try {
        if (!VAPI_API_KEY) {
            return res.status(400).json({ error: 'VAPI_API_KEY not configured' });
        }

        const response = await fetch('https://api.vapi.ai/assistant', {
            headers: {
                'Authorization': `Bearer ${VAPI_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            return res.status(400).json({ error: 'Failed to fetch from VAPI' });
        }

        const vapiAssistants = await response.json();
        const syncedAgents = [];

        for (const vapiAgent of vapiAssistants) {
            // Check if agent already exists
            let agent = await prisma.agent.findFirst({
                where: { 
                    vapiAgentId: vapiAgent.id,
                    tenantId: req.tenantId 
                }
            });

            if (agent) {
                // Update existing
                agent = await prisma.agent.update({
                    where: { id: agent.id },
                    data: {
                        name: vapiAgent.name,
                        config: JSON.stringify({
                            voice: vapiAgent.voice,
                            model: vapiAgent.model,
                            firstMessage: vapiAgent.firstMessage
                        }),
                        updatedAt: new Date()
                    }
                });
            } else {
                // Create new
                agent = await prisma.agent.create({
                    data: {
                        name: vapiAgent.name,
                        vapiAgentId: vapiAgent.id,
                        status: 'ACTIVE',
                        config: JSON.stringify({
                            voice: vapiAgent.voice,
                            model: vapiAgent.model,
                            firstMessage: vapiAgent.firstMessage
                        }),
                        tenantId: req.tenantId
                    }
                });
            }
            syncedAgents.push(agent);
        }

        res.json({ 
            success: true, 
            synced: syncedAgents.length,
            agents: syncedAgents 
        });
    } catch (error) {
        console.error('VAPI sync error:', error);
        res.status(500).json({ error: 'Failed to sync VAPI agents' });
    }
});

app.post('/api/agents', authMiddleware, async (req, res) => {
    try {
        const agent = await prisma.agent.create({
            data: {
                ...req.body,
                tenantId: req.tenantId
            }
        });
        res.json({ agent });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create agent' });
    }
});

// ============ DASHBOARD STATS ============
app.get('/api/stats', authMiddleware, async (req, res) => {
    try {
        const { tenantId } = req;
        
        const [totalCalls, totalLeads, newLeads, bookedCalls] = await Promise.all([
            prisma.callLog.count({ where: { tenantId } }),
            prisma.lead.count({ where: { tenantId } }),
            prisma.lead.count({ where: { tenantId, status: 'NEW' } }),
            prisma.callLog.count({ 
                where: { tenantId, outcome: 'booked' } 
            })
        ]);

        res.json({
            totalCalls,
            totalLeads,
            newLeads,
            bookedCalls,
            conversionRate: totalCalls > 0 ? ((bookedCalls / totalCalls) * 100).toFixed(1) : 0
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

// ============ SEED DEFAULT DATA ============
const seedDefaultData = async () => {
    try {
        const userCount = await prisma.user.count();
        if (userCount === 0) {
            console.log('No users found. Creating default tenant and admin...');
            
            const tenant = await prisma.tenant.create({
                data: { name: 'Apex Voice Solutions', industry: 'Technology' }
            });

            const hashedPassword = await bcrypt.hash('Mommy@420!', 10);
            await prisma.user.create({
                data: {
                    email: 'apexvoicesolutions@gmail.com',
                    password: hashedPassword,
                    name: 'Maurice',
                    role: 'ADMIN',
                    tenantId: tenant.id
                }
            });

            console.log('✅ Default user created: apexvoicesolutions@gmail.com');
            console.log(`✅ Tenant ID: ${tenant.id}`);
        }
    } catch (error) {
        console.error('Error seeding default data:', error);
    }
};

// ============ START SERVER ============
app.listen(PORT, async () => {
    console.log(`🚀 Apex Voice Server running on port ${PORT}`);
    console.log(`📡 Health check: http://localhost:${PORT}/health`);
    console.log(`🔐 VAPI: ${VAPI_API_KEY ? 'Configured' : 'Missing'}`);
    
    await seedDefaultData();
});
