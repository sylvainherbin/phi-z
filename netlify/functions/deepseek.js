// netlify/functions/deepseek.js
export const handler = async (event) => {
  // 1. HTTP Method Validation
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
      headers: { 'Content-Type': 'application/json' }
    };
  }

  // 2. Debug Logging
  console.log('Request received at:', new Date().toISOString());
  console.log('Headers:', event.headers);

  try {
    // 3. Message Extraction
    const { message } = JSON.parse(event.body);
    if (!message || typeof message !== 'string') {
      throw new Error('Invalid message format');
    }

    // 4. DeepSeek API Call (native fetch)
    const apiResponse = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: 'You are an expert in Dynamic Fractal Cosmological Model (DFCM). ' +
                     'Provide technical yet accessible answers in English. ' +
                     'Limit responses to 300 words maximum.'
          },
          {
            role: 'user',
            content: message
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    // 5. API Error Handling
    if (!apiResponse.ok) {
      const errorData = await apiResponse.json();
      console.error('DeepSeek API Error:', errorData);
      throw new Error(`API Error: ${apiResponse.status}`);
    }

    // 6. Response Processing
    const responseData = await apiResponse.json();
    const aiResponse = responseData.choices[0]?.message?.content || 'No response generated';

    return {
      statusCode: 200,
      body: JSON.stringify({
        reply: aiResponse,
        metadata: {
          model: responseData.model,
          tokens: responseData.usage?.total_tokens,
          timestamp: new Date().toISOString()
        }
      }),
      headers: { 'Content-Type': 'application/json' }
    };

  } catch (error) {
    // 7. Centralized Error Handling
    console.error('Error:', error.message, error.stack);

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Internal Server Error',
        details: process.env.NODE_ENV === 'development' 
          ? error.message 
          : 'Please try again later'
      }),
      headers: { 'Content-Type': 'application/json' }
    };
  }
};
