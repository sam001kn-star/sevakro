/**
 * OTP Service — generates OTP, sends via EmailJS, verifies against UserAuth entity
 */
import emailjs from '@emailjs/browser';
import { base44 } from '@/api/base44Client';

const SERVICE_ID = 'service_k64mxfp';
const TEMPLATE_ID = 'template_skwc1hf';
const PUBLIC_KEY = 'XppzwSEj42IATx7N0';

export function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function sendOtpEmail(email, fullName, otpCode) {
  await emailjs.send(
    SERVICE_ID,
    TEMPLATE_ID,
    {
      to_email: email,
      to_name: fullName || email,
      otp_code: otpCode,
    },
    PUBLIC_KEY
  );
}

/**
 * Generate OTP, save to UserAuth record, send email.
 * userAuthId = the UserAuth record id
 */
export async function generateAndSendOtp(userAuthId, email, fullName) {
  const otp = generateOtp();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 min

  // Save OTP to DB first
  await base44.entities.UserAuth.update(userAuthId, {
    otp_code: otp,
    otp_expires_at: expiresAt,
  });

  // Send email — non-blocking: log error but don't prevent OTP screen from showing
  try {
    await sendOtpEmail(email, fullName, otp);
  } catch (emailErr) {
    console.error('EmailJS send failed:', emailErr);
    // OTP is still saved in DB; user can enter it manually or resend
  }

  return otp;
}

/**
 * Verify OTP against UserAuth record.
 * Returns true if valid, throws on failure.
 */
export async function verifyOtp(userAuthId, inputOtp) {
  // Fetch by id using list with filter
  const records = await base44.entities.UserAuth.list();
  const record = records?.find(r => r.id === userAuthId);

  if (!record) throw new Error('User record not found.');
  if (!record.otp_code) throw new Error('No OTP found. Please request a new one.');
  if (record.otp_code !== String(inputOtp).trim()) throw new Error('Incorrect OTP. Please try again.');

  const now = new Date();
  const expires = new Date(record.otp_expires_at);
  if (now > expires) throw new Error('OTP has expired. Please request a new one.');

  // Clear OTP and mark verified
  await base44.entities.UserAuth.update(userAuthId, {
    otp_code: null,
    otp_expires_at: null,
    email_verified: true,
  });

  return true;
}

/**
 * Verify OTP for login (does NOT change email_verified, just clears OTP).
 */
export async function verifyLoginOtp(userAuthId, inputOtp) {
  const records = await base44.entities.UserAuth.list();
  const record = records?.find(r => r.id === userAuthId);

  if (!record) throw new Error('User record not found.');
  if (!record.otp_code) throw new Error('No OTP found. Please request a new one.');
  if (record.otp_code !== String(inputOtp).trim()) throw new Error('Incorrect OTP. Please try again.');

  const now = new Date();
  const expires = new Date(record.otp_expires_at);
  if (now > expires) throw new Error('OTP has expired. Please request a new one.');

  await base44.entities.UserAuth.update(userAuthId, {
    otp_code: null,
    otp_expires_at: null,
  });

  return true;
}