// netlify/functions/deepseek.js
exports.handler = async function(event, context) {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Méthode non autorisée' };
    }

    const { message } = JSON.parse(event.body);
    if (!message) return { statusCode: 400, body: 'Message manquant' };

    try {
        const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
            },
            body: JSON.stringify({
                model: 'deepseek-chat',
                messages: [
                    {
                        role: "system",
                        content: "You are an expert in Dynamic Fractal Cosmological Model (DFCM). Provide concise, accurate answers about cosmology and DFCM."
                    },
                    { role: "user", content: message }
                ],
                temperature: 0.7,
                max_tokens: 1000
            })
        });

        if (!response.ok) throw new Error(`API Error: ${response.status}`);

        const data = await response.json();
        return {
            statusCode: 200,
            body: JSON.stringify({ reply: data.choices[0].message.content })
        };

    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ 
                error: "Internal Server Error",
                message: error.message 
            })
        };
    }
};
