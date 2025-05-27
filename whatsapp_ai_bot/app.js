require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const twilio = require('twilio');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

// Twilio credentials (loaded from .env)
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
// It's good practice to ensure client is initialized only if credentials are valid,
// but for this example, we'll assume they are set in .env
// const client = new twilio(accountSid, authToken); 
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER; // Your Twilio WhatsApp number

// Store user state (e.g., language preference)
// In a real app, you'd use a database for this.
const userState = {};

// const AI_ASSISTANT_BASE_URL = process.env.AI_ASSISTANT_URL || 'https://your-ai-assistant-api.com/query';
const AI_ASSISTANT_BASE_URL = process.env.AI_ASSISTANT_URL || 'https://quattropole.saartech.io/ai';

const SAAREBRUCKEN = 'saarbrücken'; // Use lowercase for easier comparison
const UNSUPPORTED_CITIES = ['metz', 'trier', 'luxembourg'];

app.post('/whatsapp', (req, res) => {
    const incomingMsgRaw = req.body.Body || ''; // Ensure Body is not undefined
    const incomingMsg = incomingMsgRaw.toLowerCase().trim();
    const from = req.body.From;
    let messageToSend = '';

    console.log(`Message from ${from}: "${incomingMsgRaw}" (Processed: "${incomingMsg}")`);

    // Initialize user state if new user
    if (!userState[from]) {
        userState[from] = { language: null, selectedCity: null, awaiting: 'language' };
    }

    const currentUserState = userState[from];
    const twiml = new twilio.twiml.MessagingResponse();

    // --- 1. Awaiting Language Selection ---
    if (currentUserState.awaiting === 'language') {
        let languageConfirmed = false;
        if (['1', 'english'].includes(incomingMsg)) {
            currentUserState.language = 'en';
            messageToSend = 'You have selected English.';
            languageConfirmed = true;
        } else if (['2', 'français', 'francais', 'french'].includes(incomingMsg)) {
            currentUserState.language = 'fr';
            messageToSend = 'Vous avez sélectionné le Français.';
            languageConfirmed = true;
        } else if (['3', 'deutsch', 'german'].includes(incomingMsg)) {
            currentUserState.language = 'de';
            messageToSend = 'Sie haben Deutsch gewählt.';
            languageConfirmed = true;
        } else {
            messageToSend = 'Welcome! Please choose your language by replying with the number or name:\n1. English\n2. Français (French)\n3. Deutsch (German)';
        }

        if (languageConfirmed) {
            currentUserState.awaiting = 'city';
            let cityPrompt = '';
            if (currentUserState.language === 'en') {
                cityPrompt = 'Which city are you interested in? (e.g., Saarbrücken, Metz, Trier, Luxembourg)';
            } else if (currentUserState.language === 'fr') {
                cityPrompt = 'Quelle ville vous intéresse ? (par ex. Sarrebruck, Metz, Trèves, Luxembourg)';
            } else if (currentUserState.language === 'de') {
                cityPrompt = 'Für welche Stadt interessieren Sie sich? (z.B. Saarbrücken, Metz, Trier, Luxemburg)';
            }
            messageToSend += `\n${cityPrompt}`;
        }
    }
    // --- 2. Awaiting City Selection ---
    else if (currentUserState.awaiting === 'city') {
        const selectedCityLower = incomingMsg; // Already toLowerCase and trimmed

        if (selectedCityLower === SAAREBRUCKEN) {
            currentUserState.selectedCity = SAAREBRUCKEN;
            currentUserState.awaiting = 'query';
            if (currentUserState.language === 'en') {
                messageToSend = 'Great! You\'ve selected Saarbrücken. What would you like to know?';
            } else if (currentUserState.language === 'fr') {
                messageToSend = 'Parfait ! Vous avez sélectionné Sarrebruck. Que souhaitez-vous savoir ?';
            } else if (currentUserState.language === 'de') {
                messageToSend = 'Ausgezeichnet! Sie haben Saarbrücken gewählt. Was möchten Sie wissen?';
            }
        } else if (UNSUPPORTED_CITIES.includes(selectedCityLower)) {
            const cityNameCapitalized = selectedCityLower.charAt(0).toUpperCase() + selectedCityLower.slice(1);
            if (currentUserState.language === 'en') {
                messageToSend = `Support for ${cityNameCapitalized} is still in development. Please choose another city, or select Saarbrücken for now.`;
            } else if (currentUserState.language === 'fr') {
                messageToSend = `Le support pour ${cityNameCapitalized} est encore en développement. Veuillez choisir une autre ville, ou sélectionner Sarrebruck pour le moment.`;
            } else if (currentUserState.language === 'de') {
                messageToSend = `Die Unterstützung für ${cityNameCapitalized} befindet sich noch in der Entwicklung. Bitte wählen Sie eine andere Stadt oder wählen Sie vorerst Saarbrücken.`;
            }
            // currentUserState.awaiting remains 'city'
        } else { // Other unsupported cities
            if (currentUserState.language === 'en') {
                messageToSend = 'Sorry, I only have information for Saarbrücken at the moment. Please type \'Saarbrücken\' or choose from the supported list when available.';
            } else if (currentUserState.language === 'fr') {
                messageToSend = 'Désolé, je n\'ai des informations que pour Sarrebruck pour le moment. Veuillez taper \'Sarrebruck\' ou choisir parmi la liste prise en charge lorsqu\'elle sera disponible.';
            } else if (currentUserState.language === 'de') {
                messageToSend = 'Entschuldigung, ich habe im Moment nur Informationen für Saarbrücken. Bitte geben Sie \'Saarbrücken\' ein oder wählen Sie aus der unterstützten Liste, sobald verfügbar.';
            }
            // currentUserState.awaiting remains 'city'
        }
    }
    // --- 3. Awaiting Query for Saarbrücken ---
    else if (currentUserState.awaiting === 'query' && currentUserState.selectedCity === SAAREBRUCKEN) {
        const userQuery = incomingMsgRaw;
        // const aiQueryUrl = `${AI_ASSISTANT_BASE_URL}?text=${encodeURIComponent(userQuery)}`;
        const aiQueryUrl = `${AI_ASSISTANT_BASE_URL}?prompt=${encodeURIComponent(userQuery)}`;

        if (currentUserState.language === 'en') {
            messageToSend = `I'm preparing to forward your request about Saarbrücken to the AI assistant. The URL for your query would be: ${aiQueryUrl}`;
        } else if (currentUserState.language === 'fr') {
            messageToSend = `Je prépare la transmission de votre demande concernant Sarrebruck à l'assistant IA. L'URL de votre requête serait : ${aiQueryUrl}`;
        } else if (currentUserState.language === 'de') {
            messageToSend = `Ich bereite die Weiterleitung Ihrer Anfrage zu Saarbrücken an den KI-Assistenten vor. Die URL für Ihre Anfrage wäre: ${aiQueryUrl}`;
        }
        // Optional: Reset state or set to await another query
        // For now, we'll allow multiple queries for Saarbrücken without resetting language/city.
        // To reset completely: userState[from] = { language: null, selectedCity: null, awaiting: 'language' };
        // To just await a new query after this one (or language change):
        // currentUserState.awaiting = 'new_interaction_prompt'; // And then handle this state
    }
    // --- Fallback / Error State ---
    else {
        console.log(`Unexpected state for user ${from}: ${JSON.stringify(currentUserState)}`);
        // Reset user to start
        userState[from] = { language: null, selectedCity: null, awaiting: 'language' };
        messageToSend = 'Sorry, something went wrong. Let\'s start over. Welcome! Please choose your language:\n1. English\n2. Français (French)\n3. Deutsch (German)';
    }

    twiml.message(messageToSend);
    res.writeHead(200, { 'Content-Type': 'text/xml' });
    res.end(twiml.toString());
});

const PORT = process.env.PORT || 3005;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    if (!accountSid || !authToken) {
        console.warn('Twilio Account SID or Auth Token is missing. Check your .env file.');
    }
    // console.log(`AI Assistant Base URL configured to: ${AI_ASSISTANT_BASE_URL}`);
    console.log(`AI Assistant endpoint configured to: ${AI_ASSISTANT_BASE_URL}`);
}); 