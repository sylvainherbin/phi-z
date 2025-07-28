// netlify/functions/deepseek.js
exports.handler = async function(event, context) {
    // Debug: Log important information
    console.log('Request received:', {
        method: event.httpMethod,
        path: event.path,
        query: event.queryStringParameters,
        headers: event.headers
    });

    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method Not Allowed' }),
            headers: {
                'Content-Type': 'application/json',
                'Allow': 'POST'
            }
        };
    }

    try {
        // Parse the incoming message
        const { message } = JSON.parse(event.body);
        
        if (!message || typeof message !== 'string') {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Invalid message format' })
            };
        }

        // Get API key from environment variables
        const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
        if (!DEEPSEEK_API_KEY) {
            throw new Error('DeepSeek API key not configured');
        }

        // Prepare the request to DeepSeek API
        const requestBody = {
            model: 'deepseek-chat',
            messages: [
                {
                    role: 'system',
                    content: 'You are an expert in the Dynamic Fractal Cosmological Model (DFCM). ' +
                             'Provide accurate, technical answers about cosmology and physics. ' +
                             'Be concise but thorough in your explanations.'
                },
                {
                    role: 'user',
                    content: message
                }
            ],
            temperature: 0.7,
            max_tokens: 1000,
            stream: false
        };

        // Call DeepSeek API
        const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
                'Accept': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        // Handle API errors
        if (!response.ok) {
            const errorData = await response.json();
            console.error('DeepSeek API Error:', errorData);
            return {
                statusCode: response.status,
                body: JSON.stringify({
                    error: 'DeepSeek API Error',
                    details: errorData
                })
            };
        }

        // Process successful response
        const data = await response.json();
        const aiResponse = data.choices[0]?.message?.content || 'No response from AI';

        return {
            statusCode: 200,
            body: JSON.stringify({
                reply: aiResponse,
                debug: {
                    model: data.model,
                    usage: data.usage
                }
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        };

    } catch (error) {
        console.error('Server Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: 'Internal Server Error',
                message: error.message,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            })
        };
    }
};
