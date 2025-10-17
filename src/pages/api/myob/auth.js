// pages/api/myob/auth.js
// Step 1: Redirect user to MYOB login

export default function handler(req, res) {
  try {
    const clientId = process.env.MYOB_CLIENT_ID;
    const redirectUri = encodeURIComponent(process.env.MYOB_REDIRECT_URI);
    const scope = encodeURIComponent('CompanyFile');
    const baseUrl = process.env.MYOB_BASE_URL;

    if (!clientId || !redirectUri || !baseUrl) {
      return res.status(400).json({ 
        error: 'Missing MYOB configuration in environment variables' 
      });
    }

    const authUrl = `${baseUrl}/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=code`;

    console.log('Redirecting to:', authUrl);
    res.redirect(authUrl);
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ error: error.message });
  }
}