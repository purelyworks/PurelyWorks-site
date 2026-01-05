const HUBSPOT_ACCESS_TOKEN = process.env.HUBSPOT_ACCESS_TOKEN;
const HUBSPOT_REFRESH_TOKEN = process.env.HUBSPOT_REFRESH_TOKEN;
const HUBSPOT_CLIENT_ID = process.env.HUBSPOT_CLIENT_ID;
const HUBSPOT_CLIENT_SECRET = process.env.HUBSPOT_CLIENT_SECRET;

const hasOAuthConfig = Boolean(HUBSPOT_REFRESH_TOKEN && HUBSPOT_CLIENT_ID && HUBSPOT_CLIENT_SECRET);
const hasAuthConfig = Boolean(HUBSPOT_ACCESS_TOKEN || hasOAuthConfig);

let cachedToken: { value: string; expiresAt: number } | null = null;

const sendJson = (res: any, status: number, body: unknown) => {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
};

const getEmail = (query: any): string => {
  if (!query || typeof query.email === 'undefined') return '';
  if (Array.isArray(query.email)) return query.email[0] || '';
  if (typeof query.email === 'string') return query.email;
  return '';
};

const getAccessToken = async (forceRefresh = false): Promise<string | null> => {
  if (!hasOAuthConfig) {
    return HUBSPOT_ACCESS_TOKEN || null;
  }

  if (!forceRefresh && cachedToken && cachedToken.expiresAt - Date.now() > 60_000) {
    return cachedToken.value;
  }

  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    client_id: HUBSPOT_CLIENT_ID as string,
    client_secret: HUBSPOT_CLIENT_SECRET as string,
    refresh_token: HUBSPOT_REFRESH_TOKEN as string,
  });

  const response = await fetch('https://api.hubapi.com/oauth/v1/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  });

  const result = await response.json();
  if (!response.ok) {
    console.error('HubSpot token refresh error:', result);
    return null;
  }

  const expiresIn = typeof result.expires_in === 'number' ? result.expires_in : 1800;
  cachedToken = {
    value: result.access_token,
    expiresAt: Date.now() + expiresIn * 1000,
  };
  return cachedToken.value;
};

const hubspotRequest = async (url: string, options: RequestInit, retry = true) => {
  const token = await getAccessToken();
  if (!token) {
    return { ok: false, result: { error: 'HubSpot authentication not configured' } };
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
    },
  });

  let result: any = null;
  try {
    result = await response.json();
  } catch {
    result = null;
  }

  if (response.ok) {
    return { ok: true, result };
  }

  const expired = response.status === 401 || result?.category === 'EXPIRED_AUTHENTICATION';
  if (expired && retry && hasOAuthConfig) {
    const refreshed = await getAccessToken(true);
    if (refreshed) {
      return hubspotRequest(url, options, false);
    }
  }

  return { ok: false, result };
};

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    return sendJson(res, 405, { error: 'Method not allowed' });
  }

  if (!hasAuthConfig) {
    return sendJson(res, 500, { error: 'HubSpot OAuth not configured' });
  }

  const email = getEmail(req.query).trim();
  if (!email) {
    return sendJson(res, 400, { error: 'Missing email' });
  }

  try {
    const response = await hubspotRequest('https://api.hubapi.com/crm/v3/objects/contacts/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filterGroups: [
          {
            filters: [
              { propertyName: 'email', operator: 'EQ', value: email },
            ],
          },
        ],
        properties: ['email', 'firstname', 'lastname'],
        limit: 1,
      }),
    });

    if (!response.ok) {
      console.error('HubSpot lookup error:', response.result);
      return sendJson(res, 502, { error: 'HubSpot lookup failed' });
    }

    const contact = response.result?.results?.[0];
    if (!contact) {
      return sendJson(res, 200, { found: false });
    }

    return sendJson(res, 200, {
      found: true,
      contact: {
        id: contact.id,
        email: contact.properties?.email || email,
        firstname: contact.properties?.firstname || '',
        lastname: contact.properties?.lastname || '',
      },
    });
  } catch (error) {
    console.error('HubSpot lookup exception:', error);
    return sendJson(res, 500, { error: 'HubSpot lookup failed' });
  }
}
