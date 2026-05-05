import { API_URL } from '../constants/config';

type SessionAuth = { access_token: string };

export function authHeaders(session: SessionAuth | null) {
  if (!session?.access_token) return {};
  return { Authorization: `Bearer ${session.access_token}` } as const;
}

export async function getMe(session: SessionAuth | null) {
  if (!session?.access_token) {
    return { ok: false as const, status: 401 };
  }
  const res = await fetch(`${API_URL}/api/me`, {
    headers: { ...authHeaders(session), 'Content-Type': 'application/json' },
  });
  if (!res.ok) {
    return { ok: false as const, status: res.status };
  }
  const data = await res.json();
  return { ok: true as const, diamonds: data.diamonds as number };
}

export async function saveReading(
  session: SessionAuth | null,
  body: { type: string; content: string; metadata?: Record<string, unknown> }
) {
  if (!session?.access_token) return { ok: false as const };
  const res = await fetch(`${API_URL}/api/readings`, {
    method: 'POST',
    headers: { ...authHeaders(session), 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return { ok: res.ok };
}

export async function claimDailyAd(session: SessionAuth | null) {
  if (!session?.access_token) {
    return { ok: false as const, error: 'no session' };
  }
  const res = await fetch(`${API_URL}/api/rewards/daily-ad`, {
    method: 'POST',
    headers: { ...authHeaders(session), 'Content-Type': 'application/json' },
  });
  if (!res.ok) {
    const t = await res.text();
    return { ok: false as const, error: t };
  }
  return { ok: true as const, ...(await res.json()) };
}

export async function mockPurchase(session: SessionAuth | null, amount: number) {
  if (!session?.access_token) {
    return { ok: false as const };
  }
  const res = await fetch(`${API_URL}/api/rewards/purchase`, {
    method: 'POST',
    headers: { ...authHeaders(session), 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount }),
  });
  if (!res.ok) {
    return { ok: false as const };
  }
  const j = await res.json();
  return { ok: true as const, diamonds: j.diamonds as number };
}
