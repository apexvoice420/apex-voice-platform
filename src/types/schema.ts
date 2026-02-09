export type Role = 'super_admin' | 'client_admin' | 'user';

export interface BaseDocument {
    id?: string;
    createdAt: number; // Timestamp (ms)
    updatedAt: number;
    deletedAt?: number | null;
}

export interface Client extends BaseDocument {
    name: string;
    domain?: string;
    vapiApiKey: string; // Encrypted or stored securely
    settings: {
        timezone: string;
        currency: string;
        [key: string]: any;
    };
}

export interface User extends BaseDocument {
    email: string;
    displayName: string;
    photoURL?: string;
    role: Role;
    clientId: string;
}

export interface Contact extends BaseDocument {
    clientId: string;
    firstName: string;
    lastName?: string;
    email?: string;
    phone?: string;
    tags: string[];
    customFields?: Record<string, any>;
    pipelineStageId?: string; // Current stage
}

export interface Pipeline extends BaseDocument {
    clientId: string;
    name: string;
    stages: PipelineStage[];
}

export interface PipelineStage {
    id: string;
    name: string;
    order: number;
    color?: string;
}

export interface Opportunity extends BaseDocument {
    clientId: string;
    pipelineId: string;
    stageId: string;
    contactId: string;
    value: number;
    status: 'open' | 'won' | 'lost';
    title: string;
}

export type ChannelType = 'sms' | 'email' | 'voice';
export type MessageDirection = 'inbound' | 'outbound';

export interface Conversation extends BaseDocument {
    clientId: string;
    contactId: string;
    lastMessageAt: number;
    snippet: string;
    status: 'open' | 'closed';
    unreadCount?: number;
}

export interface Message extends BaseDocument {
    conversationId: string;
    channel: ChannelType;
    direction: MessageDirection;
    content: string;
    status: 'sent' | 'delivered' | 'read' | 'failed';
    metadata?: Record<string, any>; // Call recording URL, etc.
}

export interface Agent extends BaseDocument {
    clientId: string;
    vapiAgentId: string;
    name: string;
    phoneNumberId?: string;
    config?: Record<string, any>;
}

// Workflow Types
export interface Workflow extends BaseDocument {
    clientId: string;
    name: string;
    isActive: boolean;
    trigger: WorkflowTrigger;
    steps: WorkflowStep[];
    version: number;
}

export interface WorkflowTrigger {
    type: 'contact_created' | 'pipeline_stage_changed' | 'call_completed' | 'webhook';
    config?: Record<string, any>;
}

export interface WorkflowStep {
    id: string;
    type: 'send_sms' | 'send_email' | 'delay' | 'condition' | 'add_tag' | 'move_stage';
    config: Record<string, any>;
    nextStepId?: string;
}
