/**
 * Auth Service — 100% custom, no base44.auth.*
 * Uses UserAuth entity + EmailJS OTP for verification.
 */
import { base44 } from '@/api/base44Client';
import { hashPassword, generateReferralCode } from '@/lib/customAuth';

const SESSION_KEY = 'pulsecare_session';

// ── Session ──────────────────────────────────────────────────────────────────

export function getStoredSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function storeSession(user) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

export function clearStoredSession() {
  localStorage.removeItem(SESSION_KEY);
}

// ── Login ─────────────────────────────────────────────────────────────────────

export async function loginUser({ email, password, role = 'user' }) {
  const normalizedEmail = email.toLowerCase().trim();
  const users = await base44.entities.UserAuth.filter({ email: normalizedEmail });

  if (!users || users.length === 0) throw new Error('No account found with this email.');

  // Find matching role record
  const userRecord = users.find(u => u.role === role) || users[0];

  if (userRecord.password_hash !== hashPassword(password)) throw new Error('Incorrect password.');
  if (!userRecord.is_active) throw new Error('Your account has been deactivated.');

  storeSession(userRecord);
  return { user: userRecord };
}

// ── Register ──────────────────────────────────────────────────────────────────

export async function registerUser({ email, password, full_name, phone = '', referral_code_input = '', role = 'user' }) {
  const normalizedEmail = email.toLowerCase().trim();

  // Check for existing account with this email + role
  const existing = await base44.entities.UserAuth.filter({ email: normalizedEmail, role });

  if (existing && existing.length > 0) {
    const existingUser = existing[0];

    // If account exists but is NOT verified — allow re-sending OTP (resume flow)
    if (!existingUser.email_verified) {
      return { user: existingUser, referralApplied: false, isResume: true };
    }

    // Verified account already exists
    throw new Error('An account with this email already exists. Please sign in.');
  }

  // Referral lookup (user role only)
  const referralCode = generateReferralCode(normalizedEmail, full_name);
  let referredBy = null;
  if (role === 'user' && referral_code_input?.trim()) {
    const referrers = await base44.entities.UserAuth.filter({
      referral_code: referral_code_input.trim().toUpperCase(),
    });
    if (!referrers || referrers.length === 0) throw new Error('Invalid referral code.');
    referredBy = referrers[0].email;
  }

  // Create UserAuth record (email_verified: false until OTP confirmed)
  const newUser = await base44.entities.UserAuth.create({
    email: normalizedEmail,
    full_name: full_name.trim(),
    phone: phone?.trim() || '',
    password_hash: hashPassword(password),
    role,
    referral_code: role === 'user' ? referralCode : undefined,
    referred_by: referredBy,
    referral_rewarded: false,
    is_active: true,
    email_verified: false,
  });

  // Referral rewards (after account creation)
  let referralApplied = false;
  if (referredBy) {
    try {
      await Promise.all([
        base44.entities.WalletTransaction.create({
          user_email: newUser.email, type: 'credit', amount: 100,
          description: `Welcome bonus – referred by ${referredBy}`,
          source: 'referral', reference_id: referredBy,
        }),
        base44.entities.WalletTransaction.create({
          user_email: referredBy, type: 'credit', amount: 100,
          description: `Referral bonus – ${newUser.email} joined`,
          source: 'referral', reference_id: newUser.email,
        }),
        base44.entities.UserAuth.update(newUser.id, { referral_rewarded: true }),
      ]);
      referralApplied = true;
    } catch (e) {
      // Referral bonus failed — non-critical, continue
      console.warn('Referral bonus failed:', e);
    }
  }

  return { user: newUser, referralApplied };
}