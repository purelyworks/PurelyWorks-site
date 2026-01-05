import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

const hubspotDevApiPlugin = (auth: {
  accessToken?: string;
  clientId?: string;
  clientSecret?: string;
  refreshToken?: string;
}) => ({
  name: 'hubspot-dev-api',
  apply: 'serve',
  configureServer(server: any) {
    const { accessToken, clientId, clientSecret, refreshToken } = auth;
    const hasOAuthConfig = Boolean(refreshToken && clientId && clientSecret);
    const hasAuthConfig = Boolean(accessToken || hasOAuthConfig);
    let cachedToken: { value: string; expiresAt: number } | null = null;

    const sendJson = (res: any, status: number, body: unknown) => {
      res.statusCode = status;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(body));
    };

    const readBody = async (req: any): Promise<string> =>
      new Promise((resolve) => {
        let data = '';
        req.on('data', (chunk: Buffer) => {
          data += chunk.toString();
        });
        req.on('end', () => resolve(data));
        req.on('error', () => resolve(''));
      });

    const getAccessToken = async (forceRefresh = false): Promise<string | null> => {
      if (!hasOAuthConfig) {
        return accessToken || null;
      }

      if (!forceRefresh && cachedToken && cachedToken.expiresAt - Date.now() > 60_000) {
        return cachedToken.value;
      }

      const body = new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: clientId as string,
        client_secret: clientSecret as string,
        refresh_token: refreshToken as string,
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

    const searchContact = async (email: string) => {
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
        console.error('HubSpot search error:', response.result);
        return { ok: false };
      }
      return { ok: true, contact: response.result?.results?.[0] };
    };

    const updateContact = async (id: string, properties: Record<string, string>) => {
      const response = await hubspotRequest(`https://api.hubapi.com/crm/v3/objects/contacts/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ properties }),
      });

      if (!response.ok) {
        console.error('HubSpot update error:', response.result);
        return { ok: false };
      }
      return { ok: true, id: response.result?.id || id };
    };

    const createContact = async (properties: Record<string, string>) => {
      const response = await hubspotRequest('https://api.hubapi.com/crm/v3/objects/contacts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ properties }),
      });

      if (!response.ok) {
        console.error('HubSpot create error:', response.result);
        return { ok: false };
      }
      return { ok: true, id: response.result?.id };
    };

    server.middlewares.use(async (req: any, res: any, next: () => void) => {
      if (!req.url) return next();
      const url = new URL(req.url, 'http://localhost');

      if (url.pathname === '/api/hubspot/lookup') {
        if (req.method !== 'GET') {
          return sendJson(res, 405, { error: 'Method not allowed' });
        }
        if (!hasAuthConfig) {
          return sendJson(res, 500, { error: 'HubSpot OAuth not configured' });
        }
        const email = (url.searchParams.get('email') || '').trim();
        if (!email) {
          return sendJson(res, 400, { error: 'Missing email' });
        }
        try {
          const search = await searchContact(email);
          if (!search.ok) {
            return sendJson(res, 502, { error: 'HubSpot lookup failed' });
          }
          if (!search.contact) {
            return sendJson(res, 200, { found: false });
          }
          return sendJson(res, 200, {
            found: true,
            contact: {
              id: search.contact.id,
              email: search.contact.properties?.email || email,
              firstname: search.contact.properties?.firstname || '',
              lastname: search.contact.properties?.lastname || '',
            },
          });
        } catch (error) {
          console.error('HubSpot lookup exception:', error);
          return sendJson(res, 500, { error: 'HubSpot lookup failed' });
        }
      }

      if (url.pathname === '/api/hubspot/upsert') {
        if (req.method !== 'POST') {
          return sendJson(res, 405, { error: 'Method not allowed' });
        }
        if (!hasAuthConfig) {
          return sendJson(res, 500, { error: 'HubSpot OAuth not configured' });
        }

        try {
          const rawBody = await readBody(req);
          const payload = rawBody ? JSON.parse(rawBody) : {};
          const email = typeof payload.email === 'string' ? payload.email.trim() : '';
          const firstname = typeof payload.firstname === 'string' ? payload.firstname.trim() : '';
          const lastname = typeof payload.lastname === 'string' ? payload.lastname.trim() : '';

          if (!email) {
            return sendJson(res, 400, { error: 'Missing email' });
          }

          const updateProperties: Record<string, string> = {};
          if (firstname) updateProperties.firstname = firstname;
          if (lastname) updateProperties.lastname = lastname;

          const search = await searchContact(email);
          if (!search.ok) {
            return sendJson(res, 502, { error: 'HubSpot search failed' });
          }

          if (search.contact?.id) {
            if (!Object.keys(updateProperties).length) {
              return sendJson(res, 200, { status: 'noop', id: search.contact.id });
            }
            const update = await updateContact(search.contact.id, updateProperties);
            if (!update.ok) {
              return sendJson(res, 502, { error: 'HubSpot update failed' });
            }
            return sendJson(res, 200, { status: 'updated', id: search.contact.id });
          }

          const create = await createContact({ email, ...updateProperties });
          if (!create.ok) {
            return sendJson(res, 502, { error: 'HubSpot create failed' });
          }
          return sendJson(res, 200, { status: 'created', id: create.id });
        } catch (error) {
          console.error('HubSpot upsert exception:', error);
          return sendJson(res, 500, { error: 'HubSpot upsert failed' });
        }
      }

      return next();
    });
  },
});

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    const hubspotPortalId = env.VITE_HUBSPOT_PORTAL_ID || env.VITE_HS_PORTAL_ID;
    const hubspotFormId = env.VITE_HUBSPOT_FORM_ID || env.VITE_HS_FORM_ID;
    const hubspotAccessToken = env.HUBSPOT_ACCESS_TOKEN;
    const hubspotClientId = env.HUBSPOT_CLIENT_ID;
    const hubspotClientSecret = env.HUBSPOT_CLIENT_SECRET;
    const hubspotRefreshToken = env.HUBSPOT_REFRESH_TOKEN;
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [
        hubspotDevApiPlugin({
          accessToken: hubspotAccessToken,
          clientId: hubspotClientId,
          clientSecret: hubspotClientSecret,
          refreshToken: hubspotRefreshToken,
        }),
        react(),
      ],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.REACT_APP_HS_PORTAL_ID': JSON.stringify(hubspotPortalId),
        'process.env.REACT_APP_HS_FORM_ID': JSON.stringify(hubspotFormId)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
