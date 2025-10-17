// pages/api/myob/callback.js
// Step 2: Handle callback from MYOB with authorization code

export default async function handler(req, res) {
  try {
    const { code, state, error } = req.query;

    console.log('Callback received:', { code: code ? 'present' : 'missing', error, state });

    // Check for errors from MYOB
    if (error) {
      console.error('MYOB error:', error);
      return res.status(400).json({ 
        success: false,
        error: `MYOB authorization failed: ${error}`,
        state 
      });
    }

    if (!code) {
      console.error('No authorization code received');
      return res.status(400).json({ 
        success: false,
        error: 'Missing authorization code' 
      });
    }

    // Exchange authorization code for access token
    const token = await exchangeCodeForToken(code);
    
    if (!token) {
      return res.status(401).json({ 
        success: false,
        error: 'Failed to exchange code for token' 
      });
    }

    // Return token to client
    res.status(200).json({
      success: true,
      accessToken: token.access_token,
      expiresIn: token.expires_in,
      tokenType: token.token_type,
      scope: token.scope,
    });

  } catch (error) {
    console.error('Callback error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
}

async function exchangeCodeForToken(code) {
  const clientId = process.env.MYOB_CLIENT_ID;
  const clientSecret = process.env.MYOB_SECRET;
  const redirectUri = process.env.MYOB_REDIRECT_URI;
  const baseUrl = process.env.MYOB_BASE_URL;

  console.log('Exchanging code for token with:', {
    clientId: clientId ? 'present' : 'missing',
    clientSecret: clientSecret ? 'present' : 'missing',
    redirectUri: redirectUri ? 'present' : 'missing',
    baseUrl: baseUrl ? 'present' : 'missing',
  });

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error('Missing MYOB configuration: clientId, clientSecret, or redirectUri');
  }

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  try {
    const tokenUrl = `${baseUrl}/oauth/token`;
    console.log('Requesting token from:', tokenUrl);

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirectUri,
        scope: 'CompanyFile',
      }).toString(),
    });

    console.log('Token response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Token exchange failed:', errorText);
      throw new Error(`Token exchange failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Token received successfully');
    return data;

  } catch (error) {
    console.error('Token exchange error:', error);
    throw error;
  }
}