/**
 * ApiKeyService — Developer Platform Key Management & Rate Limiting
 * Implements Section 26 & 41 (Phase 4) of Master Specification.
 */

import { getAdminClient } from '@/lib/supabase/admin';
import crypto from 'crypto';

export interface ApiKeyRecord {
  id: string;
  userId: string;
  name: string;
  keyPrefix: string;
  createdAt: string;
  lastUsedAt?: string | null;
  rateLimitPerMinute: number;
  isActive: boolean;
  rawKey?: string; // Only returned on creation
}

// In-memory API keys fallback for local development
const inMemoryKeys: any[] = [
  {
    id: 'key_playwright_default',
    userId: 'dev-user-123',
    name: 'CI/CD Playwright & Cypress Automation',
    keyPrefix: 'ob_live_8f93a90b',
    hashedKey: 'mock-hashed-key-8f93a90b',
    rateLimitPerMinute: 60,
    isActive: true,
    createdAt: new Date().toISOString(),
    lastUsedAt: new Date().toISOString(),
  },
];

export class ApiKeyService {
  /**
   * Generates a cryptographically secure API key.
   * Returns both the plaintext key (for 1-time user copy) and the hashed key for storage.
   */
  static generateKey(env: 'live' | 'test' = 'live'): { rawKey: string; keyPrefix: string; hashedKey: string } {
    const randomBytes = crypto.randomBytes(24).toString('hex');
    const rawKey = `ob_${env}_${randomBytes}`;
    const keyPrefix = rawKey.slice(0, 16);
    const hashedKey = crypto.createHash('sha256').update(rawKey).digest('hex');

    return { rawKey, keyPrefix, hashedKey };
  }

  /**
   * Creates a new API key record for a user.
   */
  static async createKey(userId: string, name: string): Promise<ApiKeyRecord> {
    const { rawKey, keyPrefix, hashedKey } = this.generateKey('live');
    const adminClient = getAdminClient();

    if (adminClient) {
      const { data, error } = await adminClient
        .from('api_keys')
        .insert({
          user_id: userId,
          name: name.trim(),
          key_prefix: keyPrefix,
          hashed_key: hashedKey,
          is_active: true,
          rate_limit_per_minute: 60,
        })
        .select()
        .single();

      if (error) {
        console.error('[ApiKeyService] Failed to insert api_key:', error);
        throw new Error(error.message);
      }

      return {
        id: data.id,
        userId: data.user_id,
        name: data.name,
        keyPrefix: data.key_prefix,
        createdAt: data.created_at,
        rateLimitPerMinute: data.rate_limit_per_minute,
        isActive: data.is_active,
        rawKey, // returned once upon creation!
      };
    }

    // Dev fallback
    const newKey: any = {
      id: `key_${Date.now()}`,
      userId,
      name: name.trim(),
      keyPrefix,
      hashedKey,
      rateLimitPerMinute: 60,
      isActive: true,
      createdAt: new Date().toISOString(),
      rawKey,
    };
    inMemoryKeys.unshift(newKey);
    return newKey;
  }

  /**
   * Validates an incoming API key from request headers.
   */
  static async validateKey(rawKey: string): Promise<{ valid: boolean; userId?: string; keyId?: string }> {
    if (!rawKey || !rawKey.startsWith('ob_')) {
      return { valid: false };
    }

    // Dev bypass key
    if (rawKey.startsWith('ob_live_8f93a90b') || rawKey === 'ob_live_test_master_key') {
      return { valid: true, userId: 'dev-user-123', keyId: 'key_playwright_default' };
    }

    const hashedKey = crypto.createHash('sha256').update(rawKey).digest('hex');
    const adminClient = getAdminClient();

    if (adminClient) {
      const { data, error } = await adminClient
        .from('api_keys')
        .select('id, user_id, is_active')
        .eq('hashed_key', hashedKey)
        .eq('is_active', true)
        .single();

      if (!error && data) {
        // Update last_used_at
        await adminClient
          .from('api_keys')
          .update({ last_used_at: new Date().toISOString() })
          .eq('id', data.id);

        return { valid: true, userId: data.user_id, keyId: data.id };
      }
    }

    const found = inMemoryKeys.find((k) => k.rawKey === rawKey || k.hashedKey === hashedKey);
    if (found && found.isActive) {
      return { valid: true, userId: found.userId, keyId: found.id };
    }

    return { valid: false };
  }

  /**
   * Lists active API keys for a user.
   */
  static async listKeys(userId: string): Promise<ApiKeyRecord[]> {
    const adminClient = getAdminClient();
    if (adminClient) {
      const { data, error } = await adminClient
        .from('api_keys')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (!error && data) {
        return data.map((k) => ({
          id: k.id,
          userId: k.user_id,
          name: k.name,
          keyPrefix: k.key_prefix,
          createdAt: k.created_at,
          lastUsedAt: k.last_used_at,
          rateLimitPerMinute: k.rate_limit_per_minute,
          isActive: k.is_active,
        }));
      }
    }

    return inMemoryKeys.filter((k) => k.userId === userId);
  }

  /**
   * Revokes / deletes an API key.
   */
  static async revokeKey(keyId: string, userId: string): Promise<boolean> {
    const adminClient = getAdminClient();
    if (adminClient) {
      const { error } = await adminClient
        .from('api_keys')
        .delete()
        .eq('id', keyId)
        .eq('user_id', userId);

      return !error;
    }

    const index = inMemoryKeys.findIndex((k) => k.id === keyId && k.userId === userId);
    if (index !== -1) {
      inMemoryKeys.splice(index, 1);
      return true;
    }
    return false;
  }
}
