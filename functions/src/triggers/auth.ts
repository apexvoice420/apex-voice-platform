import * as functions from 'firebase-functions/v1';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import * as logger from 'firebase-functions/logger';

const db = getFirestore();
const auth = getAuth();

export const onUserSignup = functions.auth.user().onCreate(async (user) => {
    if (!user) return;

    const { uid, email, displayName, photoURL } = user;

    logger.info(`New user signed up: ${email} (${uid})`);

    // Default role assignment logic
    // CAUTION: In a real production app, you might valid invitations or specific domains.
    // For this MVP, we might default to 'user' or handle via invite link logic (not implemented yet).
    // Here, we'll check if it's the very first user to make them super_admin, otherwise 'user'.

    // NOTE: This is a simplistic approach for demo purposes.
    // In a real multi-tenant app, user creation is usually invited by an admin, 
    // and the claim assignment happens there, not just on generic signup.
    // But for onUserCreated, we ensure the Firestore doc exists.

    let role = 'user';
    let clientId = '';

    try {
        // Check if any users exist? If not, first one is super_admin?
        // This query might be expensive if many users, but fine for bootstapping.
        const usersSnapshot = await db.collection('users').limit(1).get();
        if (usersSnapshot.empty) {
            role = 'super_admin';
            clientId = 'system'; // System tenant
        }

        // Set Custom Claims
        await auth.setCustomUserClaims(uid, { role, clientId });

        // Create User Profile in Firestore
        await db.collection('users').doc(uid).set({
            email,
            displayName: displayName || email?.split('@')[0] || 'User',
            photoURL,
            role,
            clientId,
            createdAt: Date.now(),
            updatedAt: Date.now(),
        });

        logger.info(`User profile created for ${uid} as ${role}`);

    } catch (error) {
        logger.error('Error handling new user:', error);
    }
});
