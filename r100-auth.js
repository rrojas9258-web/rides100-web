import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.118.0';

const SUPABASE_URL = 'https://utpprhmhbnioisavfdst.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_Pj1o3idV7wjYgi3xkbQtFw_sVXbHnmC';
const RIDES_ENDPOINT = SUPABASE_URL + '/functions/v1/r100-rides';
const COMPLIANCE_ENDPOINT = SUPABASE_URL + '/functions/v1/r100-driver-compliance';
const SAFETY_ENDPOINT = SUPABASE_URL + '/functions/v1/r100-safety';

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session || null;
}

async function signInWithMagicLink(email, target) {
  const redirect = new URL(target || 'rider-dashboard.html', window.location.origin).toString();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: true, emailRedirectTo: redirect },
  });
  if (error) throw error;
}

async function signOut() {
  await supabase.auth.signOut({ scope: 'local' });
}

async function callRides(action, payload = {}) {
  const session = await getSession();
  if (!session?.access_token) throw new Error('Sign in is required.');
  const response = await fetch(RIDES_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + session.access_token,
      'apikey': SUPABASE_PUBLISHABLE_KEY,
    },
    body: JSON.stringify({ action, ...payload }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data?.error || 'Rides100 request failed.');
  return data;
}

async function callProtectedEndpoint(endpoint, payload = {}) {
  const session = await getSession();
  if (!session?.access_token) throw new Error('Sign in is required.');
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + session.access_token,
      'apikey': SUPABASE_PUBLISHABLE_KEY,
    },
    body: JSON.stringify(payload),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data?.error || 'Rides100 request failed.');
  return data;
}

async function callCompliance(action, payload = {}) {
  return callProtectedEndpoint(COMPLIANCE_ENDPOINT, { action, ...payload });
}

async function callSafety(action, payload = {}) {
  return callProtectedEndpoint(SAFETY_ENDPOINT, { action, ...payload });
}

async function upsertProfile(profile = {}) {
  const session = await getSession();
  if (!session?.user?.id) throw new Error('Sign in is required.');
  const row = {
    user_id: session.user.id,
    full_name: profile.fullName || null,
    phone: profile.phone || null,
    updated_at: new Date().toISOString(),
  };
  const { error } = await supabase.from('r100_profiles').upsert(row, { onConflict: 'user_id' });
  if (error) throw error;
}

async function driverStatus() {
  const session = await getSession();
  if (!session?.user?.id) return null;
  const { data, error } = await supabase
    .from('r100_driver_accounts')
    .select('status,vehicle_class,approved_at')
    .eq('user_id', session.user.id)
    .maybeSingle();
  if (error) throw error;
  return data || null;
}

window.R100Auth = { supabase, getSession, signInWithMagicLink, signOut, callRides, callCompliance, callSafety, upsertProfile, driverStatus };
window.dispatchEvent(new CustomEvent('r100-auth-ready'));

async function wireAuthPage() {
  const form = document.querySelector('[data-r100-auth-form]');
  if (form) {
    const status = form.querySelector('[data-auth-status]');
    const emailInput = form.querySelector('input[type="email"]');
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const email = emailInput?.value.trim() || '';
      if (!email) return;
      const target = form.dataset.authTarget || 'rider-dashboard.html';
      const button = form.querySelector('button[type="submit"]');
      if (button) button.disabled = true;
      if (status) status.textContent = 'Sending secure sign-in link…';
      try {
        await signInWithMagicLink(email, target);
        if (status) status.textContent = 'Check your email for your secure Rides100 sign-in link.';
      } catch (error) {
        if (status) status.textContent = error instanceof Error ? error.message : 'Could not send sign-in link.';
      } finally {
        if (button) button.disabled = false;
      }
    });
  }

  document.querySelectorAll('[data-r100-signout]').forEach((button) => {
    button.addEventListener('click', async () => {
      await signOut();
      window.location.href = 'index.html';
    });
  });

  const guard = document.body.dataset.r100RequireAuth;
  if (guard === 'true') {
    const session = await getSession().catch(() => null);
    if (!session) {
      const role = document.body.dataset.r100Role === 'driver' ? 'driver' : 'rider';
      window.location.replace(role + '-signin.html');
      return;
    }
    document.querySelectorAll('[data-auth-email]').forEach((node) => {
      node.textContent = session.user.email || 'Signed in';
    });

    if (document.body.dataset.r100Role === 'driver') {
      let status = await driverStatus().catch(() => null);
      if (!status) {
        try {
          const enrolled = await callRides('enrollDriver', {});
          status = enrolled?.driver || null;
        } catch {}
      }
      const pill = document.querySelector('[data-driver-approval]');
      if (pill) pill.textContent = status?.status ? status.status.toUpperCase() : 'NOT ENROLLED';
    }
  }
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', wireAuthPage);
else wireAuthPage();
