// Custom auth utilities using localStorage session
const SESSION_KEY = 'pulsecare_session';

export function hashPassword(password) {
  // Simple deterministic hash (for demo – in production use bcrypt via backend)
  return btoa(unescape(encodeURIComponent(password + '_pulsecare_salt')));
}

export function saveSession(user) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

export function getSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

export function generateReferralCode(email, name) {
  const base = (name || email).replace(/\s+/g, '').toUpperCase().slice(0, 5);
  const suffix = Math.floor(1000 + Math.random() * 9000);
  return `${base}${suffix}`;
}

// Pending OTP registration state — persisted in localStorage so it survives redirects
const PENDING_REG_KEY = 'pulsecare_pending_reg';

export function savePendingRegistration(data) {
  localStorage.setItem(PENDING_REG_KEY, JSON.stringify(data));
}

export function getPendingRegistration() {
  try {
    const raw = localStorage.getItem(PENDING_REG_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function clearPendingRegistration() {
  localStorage.removeItem(PENDING_REG_KEY);
}