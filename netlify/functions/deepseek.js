const fetch = require('node-fetch');

exports.handler = async function(event, context) {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Méthode non autorisée' };
    }

    const { message } = JSON.parse(event.body);

    if (!message) {
        return { statusCode: 400, body: 'Message manquant' };
    }

    try {
        const deepseekApiKey = process.env.DEEPSEEK_API_KEY;

        const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${deepseekApiKey}`
            },
            body: JSON.stringify({
                model: 'deepseek-chat',
                messages: [
                    {
                        "role": "system", 
                        "content": "You are an expert in the Dynamic Fractal Cosmological Model (DFCM). Provide accurate, technical answers about DFCM, cosmology, and physics. Be concise but thorough."
                    },
                    {
                        "role": "user", 
                        "content": message
                    }
                ],
                temperature: 0.7,
                max_tokens: 1000
            })
        });

        if (!response.ok) {
            const error = await response.text();
            console.error('DeepSeek API Error:', error);
            return {
                statusCode: response.status,
                body: JSON.stringify({ error: 'API Error', details: error })
            };
        }

        const data = await response.json();
        return {
            statusCode: 200,
            body: JSON.stringify({ reply: data.choices[0].message.content })
        };

    } catch (error) {
        console.error('Function error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};
