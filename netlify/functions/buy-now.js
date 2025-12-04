// Netlify serverless function to proxy buy-now requests to pool server
// This bypasses CORS issues since server-to-server requests don't have CORS

const POOL_SERVER = 'https://simpleswap-automation-1.onrender.com';

exports.handler = async (event) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { amountUSD, size } = JSON.parse(event.body || '{}');

    if (!amountUSD) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Missing amountUSD' })
      };
    }

    // Validate amount - only accept valid pricing tiers
    const validAmounts = [19, 29, 59];
    if (!validAmounts.includes(amountUSD)) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Invalid amount' })
      };
    }

    console.log(`Processing order: $${amountUSD}, Size: ${size}`);

    // Forward request to pool server
    const response = await fetch(`${POOL_SERVER}/buy-now`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amountUSD })
    });

    const data = await response.json();

    return {
      statusCode: response.ok ? 200 : 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type'
      },
      body: JSON.stringify(data)
    };
  } catch (error) {
    console.error('Checkout error:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: error.message })
    };
  }
};
