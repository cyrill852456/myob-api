export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const token = await getMYOBToken();
    
    if (!token) {
      return res.status(401).json({ error: 'Failed to authenticate with MYOB' });
    }

    const items = await fetchMYOBItems(token);
    
    res.status(200).json({
      success: true,
      data: items,
      count: items.length
    });
  } catch (error) {
    console.error('MYOB API Error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
}

async function getMYOBToken() {
  const clientId = process.env.MYOB_CLIENT_ID;
  const clientSecret = process.env.MYOB_SECRET;
  const baseUrl = process.env.MYOB_BASE_URL;

  if (!clientId || !clientSecret) {
    throw new Error('Missing MYOB credentials');
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
    throw new Error(`Token request failed: ${response.status}`);
  }

  const data = await response.json();
  return data.access_token;
}

async function fetchMYOBItems(token) {
  const apiEndpoint = process.env.MYOB_API_ENDPOINT;
  const companyId = process.env.MYOB_COMPANY_ID;
  const url = `${apiEndpoint}/Company/${companyId}/Item`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Items request failed: ${response.status}`);
  }

  const data = await response.json();
  
  let items = [];
  if (Array.isArray(data)) {
    items = data;
  } else if (data.Item && Array.isArray(data.Item)) {
    items = data.Item;
  } else if (data.Item) {
    items = [data.Item];
  }

  return items.map(item => ({
    number: item.Number || '',
    name: item.Name || '',
    description: item.Description || '',
    price: item.SellPrice || 0,
  }));
}