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

const parseBody = (body: any) => {
  if (!body) return {};
  if (typeof body === 'string') {
    try {
      return JSON.parse(body);
    } catch {
      return {};
    }
  }
  return body;
};

const toTrimmed = (value: unknown): string => {
  if (typeof value !== 'string') return '';
  return value.trim();
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
  if (req.method !== 'POST') {
    return sendJson(res, 405, { error: 'Method not allowed' });
  }

  if (!hasAuthConfig) {
    return sendJson(res, 500, { error: 'HubSpot OAuth not configured' });
  }

  const payload = parseBody(req.body);
  const email = toTrimmed(payload.email);
  const firstname = toTrimmed(payload.firstname);
  const lastname = toTrimmed(payload.lastname);

  if (!email) {
    return sendJson(res, 400, { error: 'Missing email' });
  }

  const updateProperties: Record<string, string> = {};
  if (firstname) updateProperties.firstname = firstname;
  if (lastname) updateProperties.lastname = lastname;

  try {
    const searchResponse = await hubspotRequest('https://api.hubapi.com/crm/v3/objects/contacts/search', {
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
        properties: ['email'],
        limit: 1,
      }),
    });

    if (!searchResponse.ok) {
      console.error('HubSpot search error:', searchResponse.result);
      return sendJson(res, 502, { error: 'HubSpot search failed' });
    }

    const existing = searchResponse.result?.results?.[0];
    if (existing?.id) {
      if (!Object.keys(updateProperties).length) {
        return sendJson(res, 200, { status: 'noop', id: existing.id });
      }

      const updateResponse = await hubspotRequest(`https://api.hubapi.com/crm/v3/objects/contacts/${existing.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ properties: updateProperties }),
      });

      if (!updateResponse.ok) {
        console.error('HubSpot update error:', updateResponse.result);
        return sendJson(res, 502, { error: 'HubSpot update failed' });
      }

      return sendJson(res, 200, { status: 'updated', id: existing.id });
    }

    const createProperties = { email, ...updateProperties };
    const createResponse = await hubspotRequest('https://api.hubapi.com/crm/v3/objects/contacts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ properties: createProperties }),
    });

    if (!createResponse.ok) {
      console.error('HubSpot create error:', createResponse.result);
      return sendJson(res, 502, { error: 'HubSpot create failed' });
    }

    return sendJson(res, 200, { status: 'created', id: createResponse.result?.id });
  } catch (error) {
    console.error('HubSpot upsert exception:', error);
    return sendJson(res, 500, { error: 'HubSpot upsert failed' });
  }
}
