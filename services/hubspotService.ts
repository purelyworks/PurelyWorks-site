
// services/hubspotService.ts

// These should be defined in your Vite environment variables
const PORTAL_ID =
  import.meta.env.VITE_HS_PORTAL_ID ||
  import.meta.env.VITE_HUBSPOT_PORTAL_ID ||
  import.meta.env.HS_PORTAL_ID ||
  'YOUR_PORTAL_ID';

const FORM_ID =
  import.meta.env.VITE_HS_FORM_ID ||
  import.meta.env.VITE_HUBSPOT_FORM_ID ||
  import.meta.env.HS_FORM_ID ||
  'YOUR_FORM_GUID';

const PRIVATE_APP_TOKEN =
  import.meta.env.VITE_HS_PRIVATE_APP_TOKEN ||
  import.meta.env.VITE_HUBSPOT_PRIVATE_APP_TOKEN ||
  import.meta.env.HS_PRIVATE_APP_TOKEN;

if (import.meta.env.DEV) {
  const hasPortal = Boolean(PORTAL_ID && PORTAL_ID !== 'YOUR_PORTAL_ID');
  const hasForm = Boolean(FORM_ID && FORM_ID !== 'YOUR_FORM_GUID');
  console.info('[HubSpot] config check', {
    portalConfigured: hasPortal,
    formConfigured: hasForm,
    privateTokenProvided: Boolean(PRIVATE_APP_TOKEN),
  });
}

interface HubSpotFormData {
  email: string;
  firstname?: string;
  lastname?: string;
  message?: string;
  subject?: string;
}

export interface HubSpotContact {
  id?: string;
  email: string;
  firstname?: string;
  lastname?: string;
}

// Helper to get the HubSpot Tracking Cookie (hubspotutk)
const getHubSpotCookie = (): string | undefined => {
  const matches = document.cookie.match(/hubspotutk=([^;]*)/);
  return matches && matches[1] ? matches[1] : undefined;
};

/**
 * Submits data to HubSpot Forms API v3.
 * This links the browser's tracking cookie to the contact record.
 */
export const submitToHubSpot = async (data: HubSpotFormData) => {
  if (!PORTAL_ID || !FORM_ID || PORTAL_ID === 'YOUR_PORTAL_ID') {
    console.warn("HubSpot Portal ID or Form ID not configured.");
    return;
  }

  const hutk = getHubSpotCookie();
  
  const fields = [
    { name: 'email', value: data.email },
  ];

  if (data.firstname) fields.push({ name: 'firstname', value: data.firstname });
  if (data.lastname) fields.push({ name: 'lastname', value: data.lastname });
  if (data.message) fields.push({ name: 'message', value: data.message }); // Ensure your form has a field named 'message'
  if (data.subject) fields.push({ name: 'subject', value: data.subject }); // Optional custom field

  const context = {
    hutk: hutk, // This associates the submission with the tracking cookie
    pageUri: window.location.href,
    pageName: document.title
  };

  const body = {
    fields,
    context,
    submittedAt: Date.now(), 
  };

  try {
    const response = await fetch(
      `https://api.hsforms.com/submissions/v3/public/submit/${PORTAL_ID}/${FORM_ID}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        mode: 'cors',
      }
    );

    const result = await response.json();
    if (!response.ok) {
      console.error('HubSpot Submission Error:', {
        status: response.status,
        statusText: response.statusText,
        result,
      });
      throw new Error(result.errors?.[0]?.message || 'Failed to submit to HubSpot');
    }
    console.info('HubSpot submission success', result?.inlineMessage || result?.status || 'ok');
    return result;
  } catch (error) {
    console.error('HubSpot API Error:', error);
    // We don't throw here to prevent blocking the UI flow if the API fails (e.g. AdBlocker)
  }
};

/**
 * Queries HubSpot for a contact by email when a Private App token is provided.
 */
export const findContactByEmail = async (email: string): Promise<HubSpotContact | null> => {
  if (!PRIVATE_APP_TOKEN) return null;

  try {
    const response = await fetch('https://api.hubapi.com/crm/v3/objects/contacts/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${PRIVATE_APP_TOKEN}`,
      },
      body: JSON.stringify({
        filterGroups: [
          {
            filters: [
              {
                propertyName: 'email',
                operator: 'EQ',
                value: email.trim().toLowerCase(),
              },
            ],
          },
        ],
        properties: ['firstname', 'lastname', 'email'],
        limit: 1,
      }),
      mode: 'cors',
    });

    if (!response.ok) {
      console.error('HubSpot contact lookup failed', {
        status: response.status,
        statusText: response.statusText,
        body: await response.text(),
      });
      return null;
    }

    const result = await response.json();
    console.info('HubSpot contact lookup result', result?.results?.length ? 'match found' : 'no match');
    const contact = result?.results?.[0];
    if (!contact) return null;

    return {
      id: contact.id,
      email: contact.properties?.email,
      firstname: contact.properties?.firstname,
      lastname: contact.properties?.lastname,
    };
  } catch (error) {
    console.error('HubSpot contact lookup error', error);
    return null;
  }
};

/**
 * Ensures the contact record exists/updates in HubSpot using the Private App token when available.
 * Falls back to form submission only when no token is configured.
 */
export const upsertContact = async (data: HubSpotFormData, existingContact?: HubSpotContact | null) => {
  // Always submit to the public form so activity is tracked and the hubspotutk is associated
  await submitToHubSpot(data);

  if (!PRIVATE_APP_TOKEN) return;

  const properties: Record<string, string> = { email: data.email };
  if (data.firstname) properties.firstname = data.firstname;
  if (data.lastname) properties.lastname = data.lastname;
  if (data.message) properties.message = data.message;
  if (data.subject) properties.subject = data.subject;

  try {
    const contact = existingContact ?? (await findContactByEmail(data.email));

    if (contact?.id) {
      const updateResponse = await fetch(`https://api.hubapi.com/crm/v3/objects/contacts/${contact.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${PRIVATE_APP_TOKEN}`,
        },
        body: JSON.stringify({ properties }),
        mode: 'cors',
      });

      if (!updateResponse.ok) {
        console.error('HubSpot contact update failed', {
          status: updateResponse.status,
          statusText: updateResponse.statusText,
          body: await updateResponse.text(),
        });
      } else {
        console.info('HubSpot contact updated');
      }
    } else {
      const createResponse = await fetch('https://api.hubapi.com/crm/v3/objects/contacts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${PRIVATE_APP_TOKEN}`,
        },
        body: JSON.stringify({ properties }),
        mode: 'cors',
      });

      if (!createResponse.ok) {
        console.error('HubSpot contact creation failed', {
          status: createResponse.status,
          statusText: createResponse.statusText,
          body: await createResponse.text(),
        });
      } else {
        console.info('HubSpot contact created');
      }
    }
  } catch (error) {
    console.error('HubSpot upsert error', error);
  }
};

/**
 * Manually tracks a page view in HubSpot.
 * Useful for Single Page Apps (SPA) where the URL might not change traditionally.
 */
export const trackHubSpotPageView = (path: string) => {
  // @ts-ignore
  const _hsq = window._hsq = window._hsq || [];
  _hsq.push(['setPath', path]);
  _hsq.push(['trackPageView']);
};
