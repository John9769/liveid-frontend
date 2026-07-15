const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// ============================================================
// TOKEN + SESSION
// ============================================================

const TOKEN_KEY = 'liveid_token';
const USER_KEY = 'liveid_user';

export function getToken() {
  if (typeof window === 'undefined') return null;
  const t = localStorage.getItem(TOKEN_KEY);
  return t && t !== 'undefined' && t !== 'null' ? t : null;
}

export function getStoredUser() {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw || raw === 'undefined' || raw === 'null') return null;
  try {
    return JSON.parse(raw);
  } catch {
    localStorage.removeItem(USER_KEY);
    return null;
  }
}

export function saveSession(token, user) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

// Thrown on 401/403 so pages can redirect to login instead of showing an error
export class AuthError extends Error {
  constructor(message) {
    super(message);
    this.name = 'AuthError';
    this.isAuthError = true;
  }
}

// ============================================================
// FETCH WRAPPERS
// ============================================================

async function parseResponse(res, fallbackMessage) {
  let data = null;
  try {
    data = await res.json();
  } catch {
    // BE returned HTML or an empty body
    throw new Error(fallbackMessage);
  }

  if (!res.ok) {
    if (res.status === 401 || res.status === 403) {
      clearSession();
      throw new AuthError(data?.error || 'Your session has expired. Please log in again.');
    }
    throw new Error(data?.error || fallbackMessage);
  }

  return data;
}

// Public call — no token
async function publicFetch(path, options = {}, fallbackMessage = 'Request failed') {
  const res = await fetch(`${API_URL}${path}`, options);
  return parseResponse(res, fallbackMessage);
}

// Authenticated call — attaches the bearer token
async function authFetch(path, options = {}, fallbackMessage = 'Request failed') {
  const token = getToken();
  if (!token) {
    clearSession();
    throw new AuthError('Not logged in');
  }

  const headers = { ...(options.headers || {}), Authorization: `Bearer ${token}` };

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  return parseResponse(res, fallbackMessage);
}

const jsonHeaders = { 'Content-Type': 'application/json' };

// ============================================================
// HANDLES
// ============================================================

export async function searchHandle(query) {
  return publicFetch(
    `/api/handles/search?query=${encodeURIComponent(query)}`,
    {},
    'Search failed'
  );
}

export async function getBillboard() {
  return publicFetch('/api/handles/billboard', {}, 'Billboard fetch failed');
}

export async function verifyHandle(handleName) {
  return publicFetch(`/api/handles/verify/${handleName}`, {}, 'Verification failed');
}

export async function getMyHandle(userId) {
  return authFetch(`/api/handles/mine/${userId}`, {}, 'Failed to get handle');
}

export async function purchaseHandle({ userId, handleName }) {
  return authFetch(
    '/api/handles/purchase',
    { method: 'POST', headers: jsonHeaders, body: JSON.stringify({ userId, handleName }) },
    'Handle purchase failed'
  );
}

// ============================================================
// AUTH — public
// ============================================================

export async function verifyLiveness(imageBlob) {
  const formData = new FormData();
  formData.append('photo', imageBlob, 'selfie.jpg');
  return publicFetch(
    '/api/auth/verify-liveness',
    { method: 'POST', body: formData },
    'Liveness check failed'
  );
}

export async function startVerification({ phone, email, password, handleName, faceId, photoUrl, referralCode }) {
  return publicFetch(
    '/api/auth/start-verification',
    {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify({ phone, email, password, handleName, faceId, photoUrl, referralCode }),
    },
    'Registration failed'
  );
}

export async function checkTransactionStatus(transactionId) {
  return publicFetch(`/api/auth/transaction-status/${transactionId}`, {}, 'Status check failed');
}

export async function getTransactionStatus(transactionId) {
  return checkTransactionStatus(transactionId);
}

// Exchanges a paid transaction for a session — used by the payment success page
export async function claimSession(transactionId) {
  const data = await publicFetch(
    '/api/auth/claim-session',
    { method: 'POST', headers: jsonHeaders, body: JSON.stringify({ transactionId }) },
    'Could not start your session'
  );
  if (data.token && data.user) saveSession(data.token, data.user);
  return data;
}

export async function loginUser({ phone, password }) {
  const data = await publicFetch(
    '/api/auth/login',
    { method: 'POST', headers: jsonHeaders, body: JSON.stringify({ phone, password }) },
    'Login failed'
  );
  if (data.token && data.user) saveSession(data.token, data.user);
  return data;
}

export async function forgotPassword({ email }) {
  return publicFetch(
    '/api/auth/forgot-password',
    { method: 'POST', headers: jsonHeaders, body: JSON.stringify({ email }) },
    'Request failed'
  );
}

export async function resetPassword({ token, newPassword }) {
  return publicFetch(
    '/api/auth/reset-password',
    { method: 'POST', headers: jsonHeaders, body: JSON.stringify({ token, password: newPassword }) },
    'Reset failed'
  );
}

// ============================================================
// AUTH — authenticated
// ============================================================

export async function changePassword({ currentPassword, newPassword }) {
  return authFetch(
    '/api/auth/change-password',
    { method: 'POST', headers: jsonHeaders, body: JSON.stringify({ currentPassword, newPassword }) },
    'Change password failed'
  );
}

export async function getUserProfile(userId) {
  return authFetch(`/api/auth/profile/${userId}`, {}, 'Profile fetch failed');
}

export async function deleteAccount(userId, confirmation, password) {
  return authFetch(
    `/api/auth/account/${userId}`,
    { method: 'DELETE', headers: jsonHeaders, body: JSON.stringify({ confirmation, password }) },
    'Failed to delete account'
  );
}

export function logout() {
  clearSession();
}

// ============================================================
// INVITATIONS — public
// ============================================================

export async function getInvitation(token) {
  return publicFetch(`/api/invites/${token}`, {}, 'Invitation not found');
}

export async function acceptInvitation({ token, faceId, password, photoUrl }) {
  return publicFetch(
    `/api/invites/${token}/accept`,
    { method: 'POST', headers: jsonHeaders, body: JSON.stringify({ faceId, password, photoUrl }) },
    'Failed to complete onboarding'
  );
}

// ============================================================
// TRANSACTIONS — all authenticated
// ============================================================

export async function initiateRenewal(userId) {
  return authFetch(
    '/api/transactions/renew',
    { method: 'POST', headers: jsonHeaders, body: JSON.stringify({ userId }) },
    'Renewal failed'
  );
}

export async function initiateVaultPurchase({ userId, vaultHandleName }) {
  return authFetch(
    '/api/transactions/vault-purchase',
    { method: 'POST', headers: jsonHeaders, body: JSON.stringify({ userId, vaultHandleName }) },
    'Vault purchase failed'
  );
}

export async function initiateVaultRenewal(userId) {
  return authFetch(
    '/api/transactions/vault-renewal',
    { method: 'POST', headers: jsonHeaders, body: JSON.stringify({ userId }) },
    'Vault renewal failed'
  );
}

export async function initiatePremiumPurchase({ userId, handleName }) {
  return authFetch(
    '/api/transactions/premium-purchase',
    { method: 'POST', headers: jsonHeaders, body: JSON.stringify({ userId, handleName }) },
    'Premium purchase failed'
  );
}

export async function initiatePremiumRenewal(userId) {
  return authFetch(
    '/api/transactions/premium-renewal',
    { method: 'POST', headers: jsonHeaders, body: JSON.stringify({ userId }) },
    'Premium renewal failed'
  );
}

export async function getUserTransactions(userId) {
  return authFetch(`/api/transactions/${userId}`, {}, 'Transactions fetch failed');
}

// ============================================================
// VAULT — public
// ============================================================

export async function getVaultBillboard() {
  return publicFetch('/api/vault/billboard', {}, 'Vault billboard fetch failed');
}

export async function getVaultHandles() {
  return publicFetch('/api/vault', {}, 'Vault handles fetch failed');
}

export async function getVaultHandle(name) {
  return publicFetch(`/api/vault/${name}`, {}, 'Vault handle fetch failed');
}

export async function submitVaultOffer({ name, offerName, phone, email, offerAmount, message }) {
  return publicFetch(
    `/api/vault/${name}/offer`,
    {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify({ offerName, phone, email, offerAmount, message }),
    },
    'Offer submission failed'
  );
}

// ============================================================
// PROFILE
// ============================================================

export async function getPublicProfile(handleName) {
  return publicFetch(`/api/profiles/public/${handleName}`, {}, 'Profile fetch failed');
}

export async function getFullProfile(userId) {
  return authFetch(`/api/profiles/${userId}`, {}, 'Profile fetch failed');
}

export async function updateProfile(userId, profileData) {
  return authFetch(
    `/api/profiles/${userId}`,
    { method: 'PUT', headers: jsonHeaders, body: JSON.stringify(profileData) },
    'Profile update failed'
  );
}

export async function uploadProfilePhoto(userId, imageBlob) {
  const formData = new FormData();
  formData.append('photo', imageBlob, 'profile.jpg');
  return authFetch(
    `/api/profiles/${userId}/photo`,
    { method: 'POST', body: formData },
    'Photo upload failed'
  );
}

// ============================================================
// WAITLIST — public
// ============================================================

export async function joinWaitlist({ type, handleName, name, phone, email, userId }) {
  return publicFetch(
    '/api/waitlist',
    {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify({ type, handleName, name, phone, email, userId }),
    },
    'Waitlist join failed'
  );
}

// ============================================================
// REFERRAL
// ============================================================

export async function validateReferralCode(code) {
  return publicFetch(`/api/referrals/validate/${code}`, {}, 'Validation failed');
}

export async function getMyReferralDashboard(email) {
  return authFetch(
    `/api/referrals/my-dashboard/${encodeURIComponent(email)}`,
    {},
    'Not a referral'
  );
}