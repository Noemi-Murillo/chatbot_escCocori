const { makeWASocket, useMultiFileAuthState, DisconnectReason } = require('baileys'); 
const { detectIntent } = require('./dialogflowClient');
const P = require('pino');

console.log("🚀 Iniciando bot de WhatsApp...");

async function startBot() {
  console.log("🧠 Bot arrancó, cargando autenticación...");

  const { state, saveCreds } = await useMultiFileAuthState('auth');

  const sock = makeWASocket({
    auth: state,
    logger: P({ level: 'info' }),
    printQRInTerminal: true
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message || msg.key.fromMe) return;

    const texto = (msg.message.conversation || msg.message.extendedTextMessage?.text || '').trim();
    const from = msg.key.remoteJid;

    console.log(`📩 Mensaje recibido de ${from}: "${texto}"`);

    try {
      const respuesta = await detectIntent(texto, from); // usar Dialogflow
      console.log(`🤖 Respuesta generada: "${respuesta}"`);

      await sock.sendMessage(from, { text: respuesta });
    } catch (error) {
      console.error('❌ Error procesando el mensaje:', error);
      await sock.sendMessage(from, { text: "Lo siento, hubo un error al procesar tu mensaje." });
    }
  });

  sock.ev.on('connection.update', ({ connection, lastDisconnect }) => {
    if (connection === 'close') {
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log('❌ Conexión cerrada. ¿Reconectar?', shouldReconnect);
      if (shouldReconnect) startBot();
    } else if (connection === 'connecting') {
      console.log('🔄 Conectando con WhatsApp...');
    } else if (connection === 'open') {
      console.log('✅ Bot conectado correctamente a WhatsApp');
    }
  });
}

startBot();
