// netlify/functions/deepseek.js (ou api/deepseek.js pour Vercel)

const fetch = require('node-fetch'); // Nécessaire pour faire des requêtes HTTP

exports.handler = async function(event, context) {
    // Vérifie si la méthode est POST (pour recevoir les questions)
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Méthode non autorisée' };
    }

    // Analyse le message envoyé par votre site web
    const { message } = JSON.parse(event.body);

    if (!message) {
        return { statusCode: 400, body: 'Message manquant' };
    }

    try {
        // IMPORTANT : Votre clé API sera injectée ici via les variables d'environnement de Netlify/Vercel
        const deepseekApiKey = process.env.DEEPSEEK_API_KEY; 

        const deepseekResponse = await fetch('https://api.deepseek.com/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${deepseekApiKey}`
            },
            body: JSON.stringify({
                model: 'deepseek-chat', // Assurez-vous que c'est le bon nom de modèle
                messages: [
                    {"role": "system", "content": "You are a helpful AI assistant specialized in the Dynamic Fractal Cosmological Model (DFCM). Provide concise and accurate information based on DFCM principles."},
                    {"role": "user", "content": message}
                ],
                stream: false
            })
        });

        if (!deepseekResponse.ok) {
            const errorData = await deepseekResponse.json();
            console.error('Erreur API DeepSeek :', errorData);
            return { statusCode: deepseekResponse.status, body: JSON.stringify({ error: 'Erreur de l\'API DeepSeek', details: errorData }) };
        }

        const data = await deepseekResponse.json();
        const aiResponseContent = data.choices[0].message.content;

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reply: aiResponseContent })
        };

    } catch (error) {
        console.error('Erreur de la fonction sans serveur :', error);
        return { statusCode: 500, body: JSON.stringify({ error: 'Erreur interne du serveur' }) };
    }
};
