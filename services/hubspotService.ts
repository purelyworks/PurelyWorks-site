
// services/hubspotService.ts

// These should be defined in your environment variables
const PORTAL_ID = process.env.REACT_APP_HS_PORTAL_ID || 'YOUR_PORTAL_ID';
const FORM_ID = process.env.REACT_APP_HS_FORM_ID || 'YOUR_FORM_GUID';

interface HubSpotFormData {
  email: string;
  firstname?: string;
  lastname?: string;
  message?: string;
  subject?: string;
}

interface HubSpotContact {
  id?: string;
  email: string;
  firstname?: string;
  lastname?: string;
}

interface HubSpotLookupResponse {
  found: boolean;
  contact?: HubSpotContact;
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
  if (!PORTAL_ID || !FORM_ID || PORTAL_ID === 'YOUR_PORTAL_ID' || FORM_ID === 'YOUR_FORM_GUID') {
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
      `https://api.hsforms.com/submissions/v3/integration/submit/${PORTAL_ID}/${FORM_ID}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }
    );

    const result = await response.json();
    if (!response.ok) {
      console.error('HubSpot Submission Error:', result);
      throw new Error(result.errors?.[0]?.message || 'Failed to submit to HubSpot');
    }
    return result;
  } catch (error) {
    console.error('HubSpot API Error:', error);
    // We don't throw here to prevent blocking the UI flow if the API fails (e.g. AdBlocker)
  }
};

export const lookupHubSpotContact = async (email: string): Promise<HubSpotLookupResponse | undefined> => {
  try {
    const response = await fetch(`/api/hubspot/lookup?email=${encodeURIComponent(email)}`);
    if (!response.ok) {
      console.error('HubSpot lookup request failed:', response.status);
      return;
    }
    return await response.json();
  } catch (error) {
    console.error('HubSpot lookup error:', error);
  }
};

export const upsertHubSpotContact = async (data: {
  email: string;
  firstname?: string;
  lastname?: string;
}) => {
  try {
    const response = await fetch('/api/hubspot/upsert', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      console.error('HubSpot upsert request failed:', response.status);
      return;
    }
    return await response.json();
  } catch (error) {
    console.error('HubSpot upsert error:', error);
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
