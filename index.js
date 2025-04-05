const express = require('express');
const { default: makeWASocket, DisconnectReason, makeInMemoryStore, jidDecode, proto, getContentType, useMultiFileAuthState, downloadContentFromMessage } = require("@adiwajshing/baileys")
const pino = require('pino')
const { Boom } = require('@hapi/boom')
const fs = require('fs')
const path = require("path");
const readline = require("readline");
const _ = require('lodash')
const yargs = require('yargs/yargs')
const PhoneNumber = require('awesome-phonenumber')
let handler = require('./case'); // Import handler.js
const moment = require('moment-timezone');

//==================[ FUNCTION AUTO LOAD ]======================\\
const fileToWatch = path.join(__dirname, 'case.js');
let reloadTimeout;

function loadCase() {
    try {
        console.log('♻️ case.js berubah, memuat ulang...');

        // Hapus cache agar tidak menggunakan versi lama
        const resolvedPath = require.resolve('./case.js');
        if (require.cache[resolvedPath]) delete require.cache[resolvedPath];

        // Perbarui handler dengan yang baru
        handler = require('./case'); // ✅ Bisa diperbarui karena `let`

        console.log('✅ case.js berhasil dimuat ulang');
    } catch (error) {
        console.error('❌ Gagal memuat ulang case.js:', error);
    }
}

// Pantau perubahan file dengan `fs.watchFile`
fs.watchFile(fileToWatch, { interval: 500 }, (curr, prev) => {
    if (curr.mtime !== prev.mtime) {
        if (reloadTimeout) clearTimeout(reloadTimeout);
        reloadTimeout = setTimeout(loadCase, 500); // Delay agar tidak reload dua kali
    }
});

//==================[ FUNCTION WAKTU ]======================\\
function getFormattedDate() {
  var currentDate = new Date();
  var day = currentDate.getDate();
  var month = currentDate.getMonth() + 1;
  var year = currentDate.getFullYear();
  var hours = currentDate.getHours();
  var minutes = currentDate.getMinutes();
  var seconds = currentDate.getSeconds();
}

let d = new Date(new Date + 3600000)
let locale = 'id'
let week = d.toLocaleDateString(locale, { weekday: 'long' })
let date = d.toLocaleDateString(locale, {
  day: 'numeric',
  month: 'long',
  year: 'numeric'
})
const hariini = d.toLocaleDateString('id', { day: 'numeric', month: 'long', year: 'numeric' })

var low
try {
low = require('lowdb')
} catch (e) {
low = require('./lib/lowdb')}
//=================================================//
const { Low, JSONFile } = low
const mongoDB = require('./lib/mongoDB')

const app = express();
const port = process.env.PORT || 5000;
app.use(express.json());
let conn;
//=================================================//
//=================================================//
const store = makeInMemoryStore({ logger: pino().child({ level: 'silent', stream: 'store' }) })
//=================================================//
global.opts = new Object(yargs(process.argv.slice(2)).exitProcess(false).parse())
global.db = new Low(
/https?:\/\//.test(opts['db'] || '') ?
new cloudDBAdapter(opts['db']) : /mongodb/.test(opts['db']) ?
new mongoDB(opts['db']) :
new JSONFile(`./src/database.json`)
)
global.DATABASE = global.db // Backwards Compatibility
global.loadDatabase = async function loadDatabase() {
if (global.db.READ) return new Promise((resolve) => setInterval(function () { (!global.db.READ ? (clearInterval(this), resolve(global.db.data == null ? global.loadDatabase() : global.db.data)) : null) }, 1 * 1000))
if (global.db.data !== null) return
global.db.READ = true
await global.db.read()
global.db.READ = false
global.db.data = {
users: {},
chats: {},
game: {},
database: {},
settings: {},
setting: {},
others: {},
sticker: {},
...(global.db.data || {})}
  global.db.chain = _.chain(global.db.data)}
loadDatabase()


const question = (text) => { const rl = readline.createInterface({ input: process.stdin, output: process.stdout }); return new Promise((resolve) => { rl.question(text, resolve) }) };

async function startBotz() {
const { state, saveCreds } = await useMultiFileAuthState("session")
const conn = makeWASocket({
logger: pino({ level: "silent" }),
printQRInTerminal: false,
auth: state,
connectTimeoutMs: 60000,
defaultQueryTimeoutMs: 0,
keepAliveIntervalMs: 10000,
emitOwnEvents: true,
fireInitQueries: true,
generateHighQualityLinkPreview: true,
syncFullHistory: true,
markOnlineOnConnect: true,
browser: ["Ubuntu", "Chrome", "20.0.04"],
});

// Membuat alias KingOfBear untuk conn
const KingOfBear = conn;

if (!conn.authState.creds.registered) {
const phoneNumber = await question('𝙼𝚊𝚜𝚞𝚔𝚊𝚗 𝙽𝚘𝚖𝚎𝚛 𝚈𝚊𝚗𝚐 𝙰𝚔𝚝𝚒𝚏 𝙰𝚠𝚊𝚕𝚒 𝙳𝚎𝚗𝚐𝚊𝚗 𝟼𝟸 :\n');
let code = await conn.requestPairingCode(phoneNumber);
code = code?.match(/.{1,4}/g)?.join("-") || code;
console.log(`𝙲𝙾𝙳𝙴 𝙿𝙰𝙸𝚁𝙸𝙽𝙶 :`, code);
}

store.bind(conn.ev)

KingOfBear.ev.on('messages.upsert', async chatUpdate => {
    try {
        mek = chatUpdate.messages[0];
        if (!mek.message) return;
        mek.message = (Object.keys(mek.message)[0] === 'ephemeralMessage') ? mek.message.ephemeralMessage.message : mek.message;
        if (mek.key && mek.key.remoteJid === 'status@broadcast') return;
        if (!conn.public && !mek.key.fromMe && chatUpdate.type === 'notify') return;
        if (mek.key.id.startsWith('BAE5') && mek.key.id.length === 16) return;

        // Konversi pesan ke objek smsg
        m = smsg(conn, mek, store);

        await handler(KingOfBear, m);

    } catch (err) {
        console.log("Terjadi kesalahan:", err);
    }
});


// Setting
conn.decodeJid = (jid) => {
if (!jid) return jid
if (/:\d+@/gi.test(jid)) {
let decode = jidDecode(jid) || {}
return decode.user && decode.server && decode.user + '@' + decode.server || jid
} else return jid
}

conn.getName = (jid, withoutContact= false) => {
id = conn.decodeJid(jid)
withoutContact = conn.withoutContact || withoutContact 
let v
if (id.endsWith("@g.us")) return new Promise(async (resolve) => {
v = store.contacts[id] || {}
if (!(v.name || v.subject)) v = conn.groupMetadata(id) || {}
resolve(v.name || v.subject || PhoneNumber('+' + id.replace('@s.whatsapp.net', '')).getNumber('international'))
})
else v = id === '0@s.whatsapp.net' ? {
id,
name: 'WhatsApp'
} : id === conn.decodeJid(conn.user.id) ?
conn.user :
(store.contacts[id] || {})
return (withoutContact ? '' : v.name) || v.subject || v.verifiedName || PhoneNumber('+' + jid.replace('@s.whatsapp.net', '')).getNumber('international')
}

conn.public = true

conn.serializeM = (m) => smsg(conn, m, store);
conn.ev.on('connection.update', (update) => {
const { connection, lastDisconnect } = update;
if (connection === 'close') {
let reason = new Boom(lastDisconnect?.error)?.output.statusCode;
if (reason === DisconnectReason.badSession || reason === DisconnectReason.connectionClosed || reason === DisconnectReason.connectionLost || reason === DisconnectReason.connectionReplaced || reason === DisconnectReason.restartRequired || reason === DisconnectReason.timedOut) {
startBotz();
} else if (reason === DisconnectReason.loggedOut) {
} else {
conn.end(`Unknown DisconnectReason: ${reason}|${connection}`);
}
} else if (connection === 'open') {
console.log('[Connected] ' + JSON.stringify(conn.user.id, null, 2));
}
});

conn.ev.on('creds.update', saveCreds)

//=================================================//
conn.sendText = (jid, text, quoted = '', options) => conn.sendMessage(jid, { text: text, ...options }, { quoted })

//=================================================//
conn.sendReact = async (jid, emoticon, keys = {}) => {
let reactionMessage = {
react: {
text: emoticon,
key: keys
}
}
return await conn.sendMessage(jid, reactionMessage)
}

//=================================================//
conn.ev.on('group-participants.update', async (anu) => {

console.log(anu)
try {
let metadata = await conn.groupMetadata(anu.id)
let participants = anu.participants
for (let num of participants) {
// Get Profile Picture User
try {
ppuser = await conn.profilePictureUrl(num, 'image')
} catch {
ppuser = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png?q=60'
}

// Get Profile Picture Group
try {
ppgroup = await conn.profilePictureUrl(anu.id, 'image')
} catch {
ppgroup = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png?q=60'
}

const reSize = async(buffer, ukur1, ukur2) => {
   return new Promise(async(resolve, reject) => {
      let jimp = require('jimp')
      var baper = await jimp.read(buffer);
      var ab = await baper.resize(ukur1, ukur2).getBufferAsync(jimp.MIME_JPEG)
      resolve(ab)
   })
}
    const fkethmb = await reSize(ppuser, 300, 300)

if (anu.action == 'add') {
let a = `Hii @${num.split("@")[0]},\nWelcome To ${metadata.subject}\n\n*Info Group:*\n${metadata.desc ? metadata.desc : 'Tidak ada deskripsi'}}`
conn.sendMessage(anu.id, { text : a, contextInfo:{ forwardingScore: 999, isForwarded: false, mentionedJid:[anu.id],
"externalAdReply":{
"showAdAttribution": true,
"renderLargerThumbnail": true,
"title": `Welcome In ${metadata.subject}`, 
"containsAutoReply": true,
"mediaType": 1, 
"thumbnail": fkethmb, 
"mediaUrl": `https://youtube.com/@SaipulAnuar`,
"sourceUrl": `https://youtube.com/@SaipulAnuar`
}}})
  } else if (anu.action == 'remove') {
let a = `GoodBye @${num.split("@")[0]} 👋\nLeaving From ${metadata.subject}`
conn.sendMessage(anu.id, { text : a, contextInfo:{ forwardingScore: 999, isForwarded: false, mentionedJid:[anu.id],
"externalAdReply":{
"showAdAttribution": true,
"renderLargerThumbnail": true,
"title": `GoodBye In ${metadata.subject}`, 
"containsAutoReply": true,
"mediaType": 1, 
"thumbnail": fkethmb, 
"mediaUrl": `https://youtube.com/@SaipulAnuar`,
"sourceUrl": `https://youtube.com/@SaipulAnuar`
}}})
  } else if (anu.action == 'demote') {
let a = `Demote @${num.split("@")[0]}, on being demote to admin of this group ${metadata.subject} 🎉`
conn.sendMessage(anu.id, { text : a, contextInfo:{ forwardingScore: 999, isForwarded: false, mentionedJid:[anu.id],
"externalAdReply":{
"showAdAttribution": true,
"renderLargerThumbnail": true,
"title": `Promoted In ${metadata.subject}`, 
"containsAutoReply": true,
"mediaType": 1, 
"thumbnail": fkethmb, 
"mediaUrl": `https://youtube.com/@SaipulAnuar`,
"sourceUrl": `https://youtube.com/@SaipulAnuar`
}}})
  } else if (anu.action == 'promote') {
let a = `Congratulations @${num.split("@")[0]}, on being promoted to admin of this group ${metadata.subject} 🎉`
conn.sendMessage(anu.id, { text : a, contextInfo:{ forwardingScore: 999, isForwarded: false, mentionedJid:[anu.id],
"externalAdReply":{
"showAdAttribution": true,
"renderLargerThumbnail": true,
"title": `Demoted In ${metadata.subject}`, 
"containsAutoReply": true,
"mediaType": 1, 
"thumbnail": fkethmb, 
"mediaUrl": `https://youtube.com/@SaipulAnuar`,
"sourceUrl": `https://youtube.com/@SaipulAnuar`
}}})
}
}
} catch (err) {
console.log(err)
}
})
// Menyajikan file index.html
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// Menyajikan file pay.html
app.get('/pay', (req, res) => {
    res.sendFile(__dirname + '/pay.html');
});

app.post('/send-message', async (req, res) => {
    let { jid, message } = req.body;

    if (!jid || !message) {
        return res.status(400).json({ status: 'error', message: 'JID dan pesan harus disediakan' });
    }

    const suffix = ':12@s.whatsapp.net';
    const groupSuffix = '@g.us';

    // Menghapus suffix yang tidak diinginkan jika ada
    if (jid.endsWith(suffix)) {
        jid = jid.substring(0, jid.length - suffix.length);
    } else if (jid.endsWith(groupSuffix)) {
        jid = jid.substring(0, jid.length - groupSuffix.length);
    }

    // Mengubah jid sesuai dengan awalan dan menambahkan suffix yang sesuai
    if (jid.startsWith('0')) {
        jid = '62' + jid.substring(1);
    }
    
    if (jid.startsWith('62')) {
        jid = jid + suffix;
    } else {
        jid = jid + groupSuffix;
    }

    console.log('JID:', jid);
    console.log('Message:', message);

    try {
        if (!conn || typeof conn.sendMessage !== 'function') {
            throw new Error('Koneksi tidak valid atau metode sendMessage tidak ada');
        }

        // Mengirim pesan
        await conn.sendMessage(jid, { text: message + '\n\n> Send Via Bot King Of Bear'});
        // Menyediakan respons sukses
        res.status(200).json({ status: 'success', message: 'Pesan berhasil dikirim' });
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ status: 'error', message: 'Terjadi kesalahan saat mengirim pesan' });
    }
});

// Metode GET
app.get('/send-message', async (req, res) => {
    let { chatId, message } = req.query;

    if (!chatId || !message) {
        return res.status(400).json({ status: 'error', message: 'chatId dan pesan harus disediakan' });
    }

    const suffix = ':12@s.whatsapp.net';
    const groupSuffix = '@g.us';

    // Menghapus suffix yang tidak diinginkan jika ada
    if (chatId.endsWith(suffix)) {
        chatId = chatId.substring(0, chatId.length - suffix.length);
    } else if (chatId.endsWith(groupSuffix)) {
        chatId = chatId.substring(0, chatId.length - groupSuffix.length);
    }

    // Mengubah chatId sesuai dengan awalan dan menambahkan suffix yang sesuai
    if (chatId.startsWith('0')) {
        chatId = '62' + chatId.substring(1);
    }
    
    if (chatId.startsWith('62')) {
        chatId = chatId + suffix;
    } else {
        chatId = chatId + groupSuffix;
    }

    console.log('chatId:', chatId);
    console.log('Message:', message);

    try {
        if (!conn || typeof conn.sendMessage !== 'function') {
            throw new Error('Koneksi tidak valid atau metode sendMessage tidak ada');
        }

        // Mengirim pesan
//        await conn.sendMessage(chatId, { text: message + '\n\n> Send Via Bot King Of Bear'});
const Styles = (text, style = 1) => {
  var xStr = 'abcdefghijklmnopqrstuvwxyz1234567890'.split('');
  var yStr = {
    1: 'ᴀʙᴄᴅᴇꜰɢʜɪᴊᴋʟᴍɴᴏᴘqʀꜱᴛᴜᴠᴡxʏᴢ1234567890'
  };
  var replacer = [];
  xStr.map((v, i) =>
    replacer.push({
      original: v,
      convert: yStr[style].split('')[i]
    })
  );
  var str = text.toLowerCase().split('');
  var output = [];
  str.map((v) => {
    const find = replacer.find((x) => x.original == v);
    find ? output.push(find.convert) : output.push(v);
  });
  return output.join('');
};
        await KingOfBear.relayMessage(chatId,  {
requestPaymentMessage: {
currencyCodeIso4217: 'IDR',
amount1000: 1000000000,
requestFrom: chatId,
noteMessage: {
extendedTextMessage: {
text: Styles(message + '\n\n> Send Via Bot King Of Bear'),
contextInfo: {
externalAdReply: {
showAdAttribution: true,
"containsAutoReply": true
}}}}}}, {});
        // Menyediakan respons sukses
        res.status(200).json({ status: 'success', message: 'Pesan berhasil dikirim' });
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ status: 'error', message: 'Terjadi kesalahan saat mengirim pesan' });
    }
});




    app.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
    });
//=========================================\\
conn.downloadAndSaveMediaMessage = async (message, filename, attachExtension = true) => {
let quoted = message.msg ? message.msg : message
let mime = (message.msg || message).mimetype || ''
let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0]
const stream = await downloadContentFromMessage(quoted, messageType)
let buffer = Buffer.from([])
for await(const chunk of stream) {
buffer = Buffer.concat([buffer, chunk])
}
let type = await FileType.fromBuffer(buffer)
let trueFileName = attachExtension ? ('./sticker/' + filename + '.' + type.ext) : './sticker/' + filename
// save to file
await fs.writeFileSync(trueFileName, buffer)
return trueFileName
}
//=========================================\\
conn.sendTextWithMentions = async (jid, text, quoted, options = {}) => conn.sendMessage(jid, { text: text, mentions: [...text.matchAll(/@(\d{0,16})/g)].map(v => v[1] + '@s.whatsapp.net'), ...options }, { quoted })
//=========================================\\
conn.downloadMediaMessage = async (message) => {
let mime = (message.msg || message).mimetype || ''
let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0]
const stream = await downloadContentFromMessage(message, messageType)
let buffer = Buffer.from([])
for await(const chunk of stream) {
buffer = Buffer.concat([buffer, chunk])
}
return buffer
}

return conn
}


    
startBotz()

function smsg(conn, m, store) {
if (!m) return m
let M = proto.WebMessageInfo
if (m.key) {
m.id = m.key.id
m.isBaileys = m.id.startsWith('BAE5') && m.id.length === 16
m.chat = m.key.remoteJid
m.fromMe = m.key.fromMe
m.isGroup = m.chat.endsWith('@g.us')
m.sender = conn.decodeJid(m.fromMe && conn.user.id || m.participant || m.key.participant || m.chat || '')
if (m.isGroup) m.participant = conn.decodeJid(m.key.participant) || ''
}
if (m.message) {
m.mtype = getContentType(m.message)
m.msg = (m.mtype == 'viewOnceMessage' ? m.message[m.mtype].message[getContentType(m.message[m.mtype].message)] : m.message[m.mtype])
m.body = m.message.conversation || m.msg.caption || m.msg.text || (m.mtype == 'listResponseMessage') && m.msg.singleSelectReply.selectedRowId || (m.mtype == 'buttonsResponseMessage') && m.msg.selectedButtonId || (m.mtype == 'viewOnceMessage') && m.msg.caption || m.text
let quoted = m.quoted = m.msg.contextInfo ? m.msg.contextInfo.quotedMessage : null
m.mentionedJid = m.msg.contextInfo ? m.msg.contextInfo.mentionedJid : []
if (m.quoted) {
let type = getContentType(quoted)
m.quoted = m.quoted[type]
if (['productMessage'].includes(type)) {
type = getContentType(m.quoted)
m.quoted = m.quoted[type]
}
if (typeof m.quoted === 'string') m.quoted = {
text: m.quoted
}
m.quoted.mtype = type
m.quoted.id = m.msg.contextInfo.stanzaId
m.quoted.chat = m.msg.contextInfo.remoteJid || m.chat
m.quoted.isBaileys = m.quoted.id ? m.quoted.id.startsWith('BAE5') && m.quoted.id.length === 16 : false
m.quoted.sender = conn.decodeJid(m.msg.contextInfo.participant)
m.quoted.fromMe = m.quoted.sender === conn.decodeJid(conn.user.id)
m.quoted.text = m.quoted.text || m.quoted.caption || m.quoted.conversation || m.quoted.contentText || m.quoted.selectedDisplayText || m.quoted.title || ''
m.quoted.mentionedJid = m.msg.contextInfo ? m.msg.contextInfo.mentionedJid : []
m.getQuotedObj = m.getQuotedMessage = async () => {
if (!m.quoted.id) return false
let q = await store.loadMessage(m.chat, m.quoted.id, conn)
 return exports.smsg(conn, q, store)
}
let vM = m.quoted.fakeObj = M.fromObject({
key: {
remoteJid: m.quoted.chat,
fromMe: m.quoted.fromMe,
id: m.quoted.id
},
message: quoted,
...(m.isGroup ? { participant: m.quoted.sender } : {})
})
m.quoted.delete = () => conn.sendMessage(m.quoted.chat, { delete: vM.key })
m.quoted.copyNForward = (jid, forceForward = false, options = {}) => conn.copyNForward(jid, vM, forceForward, options)
m.quoted.download = () => conn.downloadMediaMessage(m.quoted)
}
}
if (m.msg.url) m.download = () => conn.downloadMediaMessage(m.msg)
m.text = m.msg.text || m.msg.caption || m.message.conversation || m.msg.contentText || m.msg.selectedDisplayText || m.msg.title || ''
m.reply = (text, chatId = m.chat, options = {}) => Buffer.isBuffer(text) ? conn.sendMedia(chatId, text, 'file', '', m, { ...options }) : conn.sendText(chatId, text, m, { ...options })
m.copy = () => exports.smsg(conn, M.fromObject(M.toObject(m)))
m.copyNForward = (jid = m.chat, forceForward = false, options = {}) => conn.copyNForward(jid, m, forceForward, options)

return m
}


let file = require.resolve(__filename)
fs.watchFile(file, () => {
fs.unwatchFile(file)
console.log(`Update ${__filename}`)
delete require.cache[file]
require(file)
})