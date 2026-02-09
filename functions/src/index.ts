import { initializeApp } from 'firebase-admin/app';

initializeApp();

export * from './triggers/auth';
export * from './webhooks/vapi';
