// pages/api/myob/login.js
// Simple login endpoint using Client Credentials flow (no redirect needed)

export default async function handler(req, res) {
  try {
    const clientId = process.env.MYOB_CLIENT_ID;
    const clientSecret = process.env.MYOB_SECRET;
    const baseUrl = process.env.MYOB_BASE_URL;

    if (!clientId || !clientSecret || !baseUrl) {
      return res.status(400).json({
        success: false,
        error: 'Missing MYOB configuration',
      });
    }

    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    const response = await fetch(`${baseUrl}/oauth/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials&scope=CompanyFile',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Token request failed:', errorText);
      return res.status(response.status).json({
        success: false,
        error: `Token request failed: ${errorText}`,
      });
    }

    const data = await response.json();

    res.status(200).json({
      success: true,
      accessToken: data.access_token,
      expiresIn: data.expires_in,
      tokenType: data.token_type,
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}