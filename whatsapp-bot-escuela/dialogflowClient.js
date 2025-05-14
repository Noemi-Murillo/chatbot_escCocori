const dialogflow = require('dialogflow');
const uuid = require('uuid');
require('dotenv').config();

const projectId = process.env.DIALOGFLOW_PROJECT_ID;

const sessionClient = new dialogflow.SessionsClient({
  keyFilename: './dialogflow-key.json',
});

async function detectIntent(texto, sessionId) {
  const sessionPath = sessionClient.sessionPath(projectId, sessionId);

  const request = {
    session: sessionPath,
    queryInput: {
      text: {
        text: texto,
        languageCode: 'es',
      },
    },
  };

  const responses = await sessionClient.detectIntent(request);
  const result = responses[0].queryResult;
  return result.fulfillmentText || "Lo siento, no tengo una respuesta para eso.";
}

module.exports = { detectIntent };
