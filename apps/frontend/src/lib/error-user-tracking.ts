/**
 * User tracking utilities for error reporting
 *
 * This module provides utilities to set and clear user information
 * in error tracking services when users log in or out.
 */

import { errorTracker } from './error-tracking';

/**
 * Set user information for error tracking
 *
 * Call this when user logs in successfully
 */
export function setErrorTrackingUser(user: {
  id: string;
  email?: string;
  username?: string;
}) {
  try {
    errorTracker.setUser(user);
    console.log('[ErrorTracking] ✅ User set:', {
      id: user.id,
      email: user.email,
    });
  } catch (error) {
    console.error('[ErrorTracking] Failed to set user:', error);
  }
}

/**
 * Clear user information from error tracking
 *
 * Call this when user logs out
 */
export function clearErrorTrackingUser() {
  try {
    // Clear user by setting null
    errorTracker.setUser({ id: 'anonymous' });
    console.log('[ErrorTracking] ✅ User cleared');
  } catch (error) {
    console.error('[ErrorTracking] Failed to clear user:', error);
  }
}

/**
 * Update user context
 *
 * Call this when user information changes (e.g., profile update)
 */
export function updateErrorTrackingUser(updates: {
  email?: string;
  username?: string;
}) {
  try {
    errorTracker.setContext('user_updates', updates);
    console.log('[ErrorTracking] ✅ User context updated');
  } catch (error) {
    console.error('[ErrorTracking] Failed to update user context:', error);
  }
}
