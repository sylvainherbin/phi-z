// =================================================================
// FICHIER JAVASCRIPT COMPLET - BASÉ SUR L'ORIGINAL DE 657 LIGNES
// =================================================================

// Configuration de MathJax (doit être définie avant le chargement de la librairie MathJax)
window.MathJax = {
  tex: {
    inlineMath: [['$', '$'], ['\\(', '\\)']],
    displayMath: [['$$', '$$'], ['\\[', '\\]']]
  }
};

// Create dynamic stars
function createStars() {
    const starsContainer = document.getElementById('stars');
    const starsCount = 300;

    for (let i = 0; i < starsCount; i++) {
        const star = document.createElement('div');
        star.classList.add('star');
        const size = Math.random() * 4;
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;
        const duration = 2 + Math.random() * 6;
        const delay = Math.random() * 5;
        star.style.setProperty('--duration', `${duration}s`);
        star.style.setProperty('--delay', `${delay}s`);
        star.style.background = Math.random() > 0.9 ? 'linear-gradient(45deg, #ff5555, #ffaaaa)' : 'white';
        star.style.boxShadow = Math.random() > 0.8 ? '0 0 10px rgba(255, 100, 100, 0.5)' : 'none';
        starsContainer.appendChild(star);
    }
}

// Navigate between pages
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(pageId).classList.add('active');
    document.querySelectorAll('nav a').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('onclick') === `showPage('${pageId}')`) {
            link.classList.add('active');
        }
    });
    // Close mobile menu when navigating
    const navMenu = document.getElementById('nav-menu');
    const hamburger = document.getElementById('hamburger');
    if (navMenu && hamburger) {
        navMenu.classList.remove('active');
        hamburger.classList.remove('active');
    }
    window.scrollTo(0, 0);
}

// --- Chatbot Functions ---
async function sendMessage() {
    const userInput = document.getElementById('user-input');
    const message = userInput ? userInput.value.trim() : '';
    const sendBtn = document.getElementById('send-btn');
    const statusDot = document.getElementById('status-dot');
    const statusText = document.getElementById('status-text');

    if (message) {
        addMessage(message, 'user');
        if (userInput) userInput.value = '';
        if (sendBtn) sendBtn.disabled = true;
        if (userInput) userInput.disabled = true;
        if (statusDot) {
            statusDot.classList.remove('connected');
            statusDot.style.backgroundColor = 'var(--warning)';
        }
        if (statusText) statusText.textContent = 'Processing...';

        const typingMessageDiv = addMessage('<div class="message-typing"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div>', 'ai', true);

        try {
            // Call Vercel Function
            const response = await fetch('https://dfcm-ai-api.vercel.app/api/chatbot', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message })
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Vercel Function error:', errorData);
                throw new Error(errorData.error || 'Failed to get AI response.');
            }

            const data = await response.json();
            const aiResponse = data.reply;

            if (typingMessageDiv) typingMessageDiv.remove();
            addMessage(aiResponse, 'ai');

        } catch (error) {
            console.error('Failed to send message to AI:', error);
            if (typingMessageDiv) typingMessageDiv.remove();
            // Fallback: Google Custom Search link
            const searchQuery = encodeURIComponent(message + ' site:arxiv.org | site:*.edu');
            addMessage(`Sorry, an error occurred. Try another question or check search results: <a href="https://www.google.com/search?q=${searchQuery}" target="_blank">View results</a>`, 'ai');
        } finally {
            if (sendBtn) sendBtn.disabled = false;
            if (userInput) userInput.disabled = false;
            if (userInput) userInput.focus();
            if (statusDot) {
                statusDot.classList.add('connected');
                statusDot.style.backgroundColor = 'var(--success)';
            }
            if (statusText) statusText.textContent = 'Connected & Ready';
            MathJax.typeset(); // Refresh MathJax for equations
        }
    }
}

function addMessage(text, sender, isHtml = false) {
    const chatMessages = document.getElementById('chat-messages');
    if (!chatMessages) {
        console.error("Chat messages container not found.");
        return null;
    }
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message');
    messageDiv.classList.add(sender + '-message');
    if (isHtml) {
        messageDiv.innerHTML = text;
    } else {
        messageDiv.textContent = text;
    }
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return messageDiv;
}

// --- Hamburger Menu Toggle ---
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('nav-menu');

if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        hamburger.classList.toggle('active');
    });

    // Close menu when a link is clicked
    navMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            hamburger.classList.remove('active');
        });
    });

    // Accessibility: Toggle menu with Enter or Space key
    hamburger.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            navMenu.classList.toggle('active');
            hamburger.classList.toggle('active');
        }
    });
}

// --- Cosmic Timeline ---
// Configuration
const config = {
    epochs: [
        { name: "BBN", z: 1e9, phi: 2.970, description: "Dense fractal primordial universe" },
        { name: "CMB", z: 1100, phi: 2.618, description: "Cosmic Microwave Background emission" },
        { name: "Galaxies", z: 10, phi: 2.0, description: "Formation of the first galaxies" },
        { name: "Present", z: 0, phi: 1.618, description: "Harmonious present era" }
    ],
    particleCount: 300,
    maxParticleSize: 6
};

// DOM Elements
const canvas = document.getElementById('cosmicCanvas');
const ctx = canvas ? canvas.getContext('2d') : null;
const timeSlider = document.getElementById('timeSlider');
const timelineProgress = document.getElementById('timelineProgress');
const epochDescription = document.querySelector('.epoch-description');
const playBtn = document.getElementById('playBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');

// State Variables
let currentTime = 0;
let animationId = null;
let particles = [];

// Initialize Canvas
function initCanvas() {
    if (!canvas || !ctx) return;
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    createParticles();
    drawVisualization();
}

// Create Particles
function createParticles() {
    particles = [];
    for (let i = 0; i < config.particleCount; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * config.maxParticleSize + 1,
            speedX: (Math.random() - 0.5) * 0.5,
            speedY: (Math.random() - 0.5) * 0.5,
            color: getRandomParticleColor(),
            originalSize: Math.random() * config.maxParticleSize + 1
        });
    }
}

function getRandomParticleColor() {
    const colors = [
        getComputedStyle(document.documentElement).getPropertyValue('--accent').trim(),
        getComputedStyle(document.documentElement).getPropertyValue('--accent-light').trim(),
        getComputedStyle(document.documentElement).getPropertyValue('--success').trim(),
        getComputedStyle(document.documentElement).getPropertyValue('--warning').trim()
    ];
    return colors[Math.floor(Math.random() * colors.length)];
}

// Calculate φ(z)
function calculatePhi(timePercent) {
    if (timePercent < 0.2) {
        return interpolate(timePercent, 0, 0.2, 2.970, 2.618);
    } else if (timePercent < 0.6) {
        return interpolate(timePercent, 0.2, 0.6, 2.618, 2.0);
    } else {
        return interpolate(timePercent, 0.6, 1.0, 2.0, 1.618);
    }
}

function interpolate(value, inMin, inMax, outMin, outMax) {
    return outMin + (outMax - outMin) * ((value - inMin) / (inMax - inMin));
}

// Draw Visualization
function drawVisualization() {
    if (!ctx) return;
    const timePercent = currentTime / 100;
    const phi = calculatePhi(timePercent);
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground(timePercent);
    drawFractalPatterns(timePercent, phi);
    updateInfoPanel(phi, timePercent);
}

function drawBackground(timePercent) {
    if (!ctx) return;
    const gradient = ctx.createRadialGradient(
        canvas.width/2, canvas.height/2, 0,
        canvas.width/2, canvas.height/2, Math.max(canvas.width, canvas.height)/2
    );
    
    const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim();
    const accentColor = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();
    const accentLightColor = getComputedStyle(document.documentElement).getPropertyValue('--accent-light').trim();
    
    if (timePercent < 0.3) {
        gradient.addColorStop(0, 'rgba(255, 100, 150, 0.1)');
        gradient.addColorStop(0.5, 'rgba(150, 50, 100, 0.05)');
        gradient.addColorStop(1, 'rgba(50, 10, 30, 0.01)');
    } else if (timePercent < 0.7) {
        gradient.addColorStop(0, `rgba(${hexToRgb(accentColor)}, 0.15)`);
        gradient.addColorStop(0.5, `rgba(${hexToRgb(accentLightColor)}, 0.08)`);
        gradient.addColorStop(1, `rgba(${hexToRgb(primaryColor)}, 0.02)`);
    } else {
        const successColor = getComputedStyle(document.documentElement).getPropertyValue('--success').trim();
        gradient.addColorStop(0, `rgba(${hexToRgb(successColor)}, 0.1)`);
        gradient.addColorStop(0.5, `rgba(${hexToRgb(accentColor)}, 0.05)`);
        gradient.addColorStop(1, `rgba(${hexToRgb(primaryColor)}, 0.01)`);
    }
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? 
        `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` 
        : '106, 90, 249';
}

function drawFractalPatterns(timePercent, phi) {
    if (!ctx) return;
    drawParticles(timePercent, phi);
    
    if (timePercent < 0.3) {
        drawFractalClusters();
    } else if (timePercent > 0.8) {
        drawGoldenSpiral();
    }
}

function drawParticles(timePercent, phi) {
    if (!ctx) return;
    const fractalFactor = 1 - (phi - 1.618) / (2.970 - 1.618);
    
    particles.forEach(particle => {
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;
        
        const sizeFactor = timePercent < 0.3 ? 1.5 : 1;
        const currentSize = particle.originalSize * sizeFactor * fractalFactor;
        
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, currentSize, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.fill();
        
        if (timePercent < 0.4) {
            particles.forEach(other => {
                const dx = particle.x - other.x;
                const dy = particle.y - other.y;
                const distance = Math.sqrt(dx*dx + dy*dy);
                
                if (distance < 80) {
                    ctx.beginPath();
                    ctx.moveTo(particle.x, particle.y);
                    ctx.lineTo(other.x, other.y);
                    ctx.strokeStyle = `rgba(106, 90, 249, ${0.3 * (1 - distance/80)})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            });
        }
    });
}

function drawFractalClusters() {
    if (!ctx) return;
    for (let i = 0; i < 15; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const size = 30 + Math.random() * 70;
        const branchCount = 5 + Math.floor(Math.random() * 8);
        
        ctx.save();
        ctx.translate(x, y);
        
        for (let j = 0; j < branchCount; j++) {
            ctx.rotate((Math.PI * 2) / branchCount);
            drawFractalBranch(0, 0, size, 0, 5);
        }
        
        ctx.restore();
    }
}

function drawFractalBranch(x, y, length, angle, depth) {
    if (depth === 0 || !ctx) return;
    
    const endX = x + length * Math.cos(angle);
    const endY = y + length * Math.sin(angle);
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(endX, endY);
    ctx.strokeStyle = `rgba(255, 121, 198, ${0.4 - depth * 0.07})`;
    ctx.lineWidth = depth * 0.7;
    ctx.stroke();
    
    const subBranches = 2 + Math.floor(Math.random() * 3);
    for (let i = 0; i < subBranches; i++) {
        const newAngle = angle - Math.PI/4 + Math.random() * Math.PI/2;
        const newLength = length * (0.5 + Math.random() * 0.3);
        drawFractalBranch(endX, endY, newLength, newAngle, depth - 1);
    }
}

function drawGoldenSpiral() {
    if (!ctx) return;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const maxRadius = Math.min(canvas.width, canvas.height) * 0.4;
    let radius = 1;
    let angle = 0;
    
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    
    while (radius < maxRadius) {
        angle += 0.1;
        radius = Math.exp(angle * 0.306);
        
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        
        ctx.lineTo(x, y);
    }
    
    const goldenColor = getComputedStyle(document.documentElement).getPropertyValue('--warning').trim();
    ctx.strokeStyle = `${goldenColor}cc`;
    ctx.lineWidth = 2;
    ctx.stroke();
    
    for (let i = 0; i < 100; i++) {
        angle = i * 0.2;
        radius = Math.exp(angle * 0.306);
        
        if (radius > maxRadius) break;
        
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fillStyle = goldenColor;
        ctx.fill();
    }
}

function updateInfoPanel(phi, timePercent) {
    const phiDynamicValue = document.getElementById('phi-dynamic-value');
    if (phiDynamicValue) phiDynamicValue.textContent = phi.toFixed(3);
    
    if (epochDescription) {
        if (timePercent < 0.2) {
            epochDescription.textContent = "Dense fractal primordial universe";
        } else if (timePercent < 0.4) {
            epochDescription.textContent = "Cosmic Microwave Background emission";
        } else if (timePercent < 0.7) {
            epochDescription.textContent = "Galaxy formation and structures";
        } else {
            epochDescription.textContent = "Harmonious present era dominated by the golden ratio";
        }
    }
}

// Event Handlers
if (timeSlider) {
    timeSlider.addEventListener('input', () => {
        currentTime = parseInt(timeSlider.value);
        if (timelineProgress) timelineProgress.style.width = `${currentTime}%`;
        drawVisualization();
    });
}

if (playBtn) {
    playBtn.addEventListener('click', () => {
        if (animationId) return;
        
        function animate() {
            currentTime += 0.35;
            if (currentTime > 100) currentTime = 0;
            
            if (timeSlider) timeSlider.value = currentTime;
            if (timelineProgress) timelineProgress.style.width = `${currentTime}%`;
            drawVisualization();
            
            animationId = requestAnimationFrame(animate);
        }
        
        animate();
    });
}

if (pauseBtn) {
    pauseBtn.addEventListener('click', () => {
        if (animationId) {
            cancelAnimationFrame(animationId);
            animationId = null;
        }
    });
}

if (resetBtn) {
    resetBtn.addEventListener('click', () => {
        if (animationId) {
            cancelAnimationFrame(animationId);
            animationId = null;
        }
        currentTime = 0;
        if (timeSlider) timeSlider.value = currentTime;
        if (timelineProgress) timelineProgress.style.width = `${currentTime}%`;
        drawVisualization();
    });
}

// Initialize on page load
window.onload = function() {
    createStars();

    // Event listener for user input (Enter key)
    const userInputElement = document.getElementById('user-input');
    if (userInputElement) {
        userInputElement.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }

    // Event listener for the Send button
    const sendButtonElement = document.getElementById('send-btn');
    if (sendButtonElement) {
        sendButtonElement.addEventListener('click', sendMessage);
    }

    // Focus on input when AI Assistant page is shown
    const aiAssistantLink = document.querySelector('nav a[onclick="showPage(\'ai_assistant\')"]');
    if (aiAssistantLink) {
        aiAssistantLink.addEventListener('click', function() {
            setTimeout(() => {
                const currentUserInput = document.getElementById('user-input');
                if (currentUserInput) currentUserInput.focus();
            }, 500);
        });
    }

    // Initialize cosmic timeline
    initCanvas();
    window.addEventListener('resize', initCanvas);
    if(typeof MathJax !== 'undefined') {
        MathJax.typeset();
    }
};

// Initialize listeners that don't depend on `window.onload`
document.addEventListener('DOMContentLoaded', () => {
    const toggleButton = document.getElementById('toggle-all-descriptions');
    const tableContainer = document.querySelector('.futuristic-table');

    if(toggleButton) {
        toggleButton.addEventListener('click', () => {
            const toggleIcon = toggleButton.querySelector('i');
            tableContainer.classList.toggle('show-descriptions');
            if (tableContainer.classList.contains('show-descriptions')) {
                toggleIcon.classList.remove('fa-eye');
                toggleIcon.classList.add('fa-eye-slash');
                toggleButton.innerHTML = `<i class="fas fa-eye-slash"></i> Hide Descriptions`;
            } else {
                toggleIcon.classList.remove('fa-eye-slash');
                toggleIcon.classList.add('fa-eye');
                toggleButton.innerHTML = `<i class="fas fa-eye"></i> `;
            }
        });
    }
});


// =================================================================
// --- SECTION CORRIGÉE POUR LA CONSOLE DE REPRODUCTIBILITÉ ---
// =================================================================

// Fonction pour ajouter un message à la console de reproductibilité
function addConsoleMessage(text, type = 'default') {
    const consoleOutput = document.getElementById('console-output');
    if (!consoleOutput) {
        console.error("Console output element not found.");
        return;
    }
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('console-message');
    if (type !== 'default') {
        messageDiv.classList.add(type);
    }
    // Utilisez innerHTML pour les retours à la ligne générés par les scripts
    messageDiv.innerHTML = text; 
    consoleOutput.appendChild(messageDiv);
    consoleOutput.scrollTop = consoleOutput.scrollHeight;
}

// Fonction pour exécuter un script en lisant son contenu côté client et en l'envoyant à l'API du chatbot
async function runScript(scriptName) {
    const consoleOutput = document.getElementById('console-output');
    const consolePrompt = document.getElementById('console-prompt');
    const commandLoader = document.getElementById('command-loader');
    const allButtons = document.querySelectorAll('.futuristic-button-small');

    // Gère l'interface utilisateur
    allButtons.forEach(btn => btn.disabled = true);
    if (consolePrompt) consolePrompt.textContent = `Executing ${scriptName}...`;
    if (commandLoader) commandLoader.style.display = 'flex';
    if (consoleOutput) consoleOutput.innerHTML = '';
    addConsoleMessage(`> python3 ${scriptName}`, 'input');
    
    try {
        // ÉTAPE 1: Lire le contenu du script depuis le dossier /scripts de votre site web
        addConsoleMessage(`[INFO] Reading script content...`, 'info');
        const scriptResponse = await fetch(`scripts/${scriptName}`);
        if (!scriptResponse.ok) {
            throw new Error(`Could not find script file: scripts/${scriptName}`);
        }
        const scriptContent = await scriptResponse.text();

        // ÉTAPE 2: Préparer le prompt pour Gemini, comme un copier-coller
        const promptForGemini = `Exécute ce script Python et retourne uniquement la sortie texte brute (stdout), sans aucun commentaire additionnel de ta part:\n\n\`\`\`python\n${scriptContent}\n\`\`\``;
        
        // ÉTAPE 3: Envoyer ce contenu à l'API du CHATBOT (car on sait qu'elle fonctionne)
        addConsoleMessage(`[INFO] Sending script to execution engine...`, 'info');
        const API_URL = 'https://dfcm-ai-api.vercel.app/api/chatbot'; 
        const apiResponse = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                message: promptForGemini // On utilise le champ "message" car c'est celui qui marche
            })
        });

        if (!apiResponse.ok) {
            const errorData = await apiResponse.json();
            throw new Error(`Server Error (${apiResponse.status}): ${JSON.stringify(errorData)}`);
        }

        const data = await apiResponse.json();

        // On traite la réponse de l'API, qui doit contenir une "reply"
        if (data.reply) {
            addConsoleMessage(`[SUCCESS] Execution complete.`, 'success');
            const formattedOutput = data.reply.replace(/\n/g, '<br>');
            addConsoleMessage(formattedOutput, 'default');
        } else {
            throw new Error('API response did not contain a "reply". Full response: ' + JSON.stringify(data));
        }

    } catch (error) {
        console.error('runScript Error:', error);
        addConsoleMessage(`[CRITICAL ERROR] An error occurred.`, 'error');
        addConsoleMessage(error.message, 'error');
    } finally {
        // Réinitialisation de l'interface
        allButtons.forEach(btn => btn.disabled = false);
        if (consolePrompt) consolePrompt.textContent = 'Waiting for command...';
        if (commandLoader) commandLoader.style.display = 'none';
        
        if (typeof MathJax !== 'undefined') {
            try {
                MathJax.typesetPromise();
            } catch(e) { console.error("MathJax typesetting failed", e); }
        }
        if (consoleOutput) consoleOutput.scrollTop = consoleOutput.scrollHeight;
    }
}
