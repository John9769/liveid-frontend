const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// ============================================================
// HANDLES
// ============================================================

export async function searchHandle(query) {
  const res = await fetch(`${API_URL}/api/handles/search?query=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error('Search failed');
  return res.json();
}

export async function getBillboard() {
  const res = await fetch(`${API_URL}/api/handles/billboard`);
  if (!res.ok) throw new Error('Billboard fetch failed');
  return res.json();
}

export async function getMyHandle(userId) {
  const res = await fetch(`${API_URL}/api/handles/mine/${userId}`);
  if (!res.ok) throw new Error('Failed to get handle');
  return res.json();
}

export async function verifyHandle(handleName) {
  const res = await fetch(`${API_URL}/api/handles/verify/${handleName}`);
  if (!res.ok) throw new Error('Verification failed');
  return res.json();
}

// ============================================================
// AUTH
// ============================================================

export async function verifyLiveness(imageBlob) {
  const formData = new FormData();
  formData.append('photo', imageBlob, 'selfie.jpg');

  const res = await fetch(`${API_URL}/api/auth/verify-liveness`, {
    method: 'POST',
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Liveness check failed');
  return data;
}

export async function startVerification({ phone, email, password, handleName, faceId, referralCode }) {
  const res = await fetch(`${API_URL}/api/auth/start-verification`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, email, password, handleName, faceId, referralCode }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Registration failed');
  return data;
}

export async function checkTransactionStatus(transactionId) {
  const res = await fetch(`${API_URL}/api/auth/transaction-status/${transactionId}`);
  if (!res.ok) throw new Error('Status check failed');
  return res.json();
}

export async function loginUser({ phone, password }) {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Login failed');
  return data;
}

export async function forgotPassword({ email }) {
  const res = await fetch(`${API_URL}/api/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export async function resetPassword({ token, newPassword }) {
  const res = await fetch(`${API_URL}/api/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, newPassword }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Reset failed');
  return data;
}

export async function changePassword({ userId, currentPassword, newPassword }) {
  const res = await fetch(`${API_URL}/api/auth/change-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, currentPassword, newPassword }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Change password failed');
  return data;
}

export async function getUserProfile(userId) {
  const res = await fetch(`${API_URL}/api/auth/profile/${userId}`);
  if (!res.ok) throw new Error('Profile fetch failed');
  return res.json();
}

// ============================================================
// TRANSACTIONS
// ============================================================

export async function getTransactionStatus(transactionId) {
  const res = await fetch(`${API_URL}/api/auth/transaction-status/${transactionId}`);
  if (!res.ok) throw new Error('Status check failed');
  return res.json();
}

export async function initiateRenewal(userId) {
  const res = await fetch(`${API_URL}/api/transactions/renew`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Renewal failed');
  return data;
}

export async function initiateVaultPurchase({ userId, vaultHandleName }) {
  const res = await fetch(`${API_URL}/api/transactions/vault-purchase`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, vaultHandleName }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Vault purchase failed');
  return data;
}

export async function initiateVaultRenewal(userId) {
  const res = await fetch(`${API_URL}/api/transactions/vault-renewal`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Vault renewal failed');
  return data;
}

export async function initiatePremiumPurchase({ userId, handleName }) {
  const res = await fetch(`${API_URL}/api/transactions/premium-purchase`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, handleName }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Premium purchase failed');
  return data;
}

export async function initiatePremiumRenewal(userId) {
  const res = await fetch(`${API_URL}/api/transactions/premium-renewal`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Premium renewal failed');
  return data;
}

export async function getUserTransactions(userId) {
  const res = await fetch(`${API_URL}/api/transactions/${userId}`);
  if (!res.ok) throw new Error('Transactions fetch failed');
  return res.json();
}

// ============================================================
// VAULT
// ============================================================

export async function getVaultBillboard() {
  const res = await fetch(`${API_URL}/api/vault/billboard`);
  if (!res.ok) throw new Error('Vault billboard fetch failed');
  return res.json();
}

export async function getVaultHandles() {
  const res = await fetch(`${API_URL}/api/vault`);
  if (!res.ok) throw new Error('Vault handles fetch failed');
  return res.json();
}

export async function getVaultHandle(name) {
  const res = await fetch(`${API_URL}/api/vault/${name}`);
  if (!res.ok) throw new Error('Vault handle fetch failed');
  return res.json();
}

export async function submitVaultOffer({ name, offerName, phone, email, offerAmount, message }) {
  const res = await fetch(`${API_URL}/api/vault/${name}/offer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: offerName, phone, email, offerAmount, message }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Offer submission failed');
  return data;
}

// ============================================================
// PROFILE
// ============================================================

export async function getPublicProfile(handleName) {
  const res = await fetch(`${API_URL}/api/profiles/public/${handleName}`);
  if (!res.ok) throw new Error('Profile fetch failed');
  return res.json();
}

export async function getFullProfile(userId) {
  const res = await fetch(`${API_URL}/api/profiles/${userId}`);
  if (!res.ok) throw new Error('Profile fetch failed');
  return res.json();
}

export async function updateProfile(userId, profileData) {
  const res = await fetch(`${API_URL}/api/profiles/${userId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profileData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Profile update failed');
  return data;
}

export async function uploadProfilePhoto(userId, imageBlob) {
  const formData = new FormData();
  formData.append('photo', imageBlob, 'profile.jpg');

  const res = await fetch(`${API_URL}/api/profiles/${userId}/photo`, {
    method: 'POST',
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Photo upload failed');
  return data;
}

// ============================================================
// WAITLIST
// ============================================================

export async function joinWaitlist({ type, handleName, name, phone, email, userId }) {
  const res = await fetch(`${API_URL}/api/waitlist`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, handleName, name, phone, email, userId }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Waitlist join failed');
  return data;
}

// ============================================================
// REFERRAL
// ============================================================

export async function validateReferralCode(code) {
  const res = await fetch(`${API_URL}/api/referrals/validate/${code}`);
  if (!res.ok) throw new Error('Validation failed');
  return res.json();
}

export async function getMyReferralDashboard(email) {
  const res = await fetch(`${API_URL}/api/referrals/my-dashboard/${encodeURIComponent(email)}`);
  if (!res.ok) throw new Error('Not a referral');
  return res.json();
}

export async function deleteAccount(userId, confirmation) {
  const res = await fetch(`${API_URL}/api/auth/account/${userId}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ confirmation }),
  });
  if (!res.ok) throw new Error('Failed to delete account');
  return res.json();
}