const POOL_API = 'https://simpleswap-automation-1.onrender.com';

exports.handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { amountUSD, size } = JSON.parse(event.body);

    // Validate amount - only accept valid pricing tiers
    const validAmounts = [19, 29, 59];
    if (!validAmounts.includes(amountUSD)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid amount' })
      };
    }

    console.log(`Processing order: $${amountUSD}, Size: ${size}`);

    // Get exchange from pool
    const response = await fetch(`${POOL_API}/get-exchange?amount=${amountUSD}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      throw new Error(`Pool API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.url) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          url: data.url,
          exchangeId: data.id,
          amount: amountUSD
        })
      };
    } else {
      throw new Error('No exchange URL returned');
    }

  } catch (error) {
    console.error('Checkout error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to process order. Please try again.' })
    };
  }
};
