require("./config");
const fs = require("fs");
const axios = require("axios");
const { exec } = require("child_process");
const chalk = require("chalk");
const moment = require("moment-timezone");
const didyoumean = require("didyoumean");
const similarity = require("similarity");
const os = require("os");
const speed = require("performance-now");

module.exports = async (KingOfBear, m) => {
  try {
    const from = m.key.remoteJid;
    const body = (
        (m.mtype === 'conversation' && m.message.conversation) ||
        (m.mtype === 'imageMessage' && m.message.imageMessage.caption) ||
        (m.mtype === 'documentMessage' && m.message.documentMessage.caption) ||
        (m.mtype === 'videoMessage' && m.message.videoMessage.caption) ||
        (m.mtype === 'extendedTextMessage' && m.message.extendedTextMessage.text) ||
        (m.mtype === 'buttonsResponseMessage' && m.message.buttonsResponseMessage.selectedButtonId) ||
        (m.mtype === 'templateButtonReplyMessage' && m.message.templateButtonReplyMessage.selectedId)
    ) ? (
        (m.mtype === 'conversation' && m.message.conversation) ||
        (m.mtype === 'imageMessage' && m.message.imageMessage.caption) ||
        (m.mtype === 'documentMessage' && m.message.documentMessage.caption) ||
        (m.mtype === 'videoMessage' && m.message.videoMessage.caption) ||
        (m.mtype === 'extendedTextMessage' && m.message.extendedTextMessage.text) ||
        (m.mtype === 'buttonsResponseMessage' && m.message.buttonsResponseMessage.selectedButtonId) ||
        (m.mtype === 'templateButtonReplyMessage' && m.message.templateButtonReplyMessage.selectedId)
    ) : '';

    //==================[ TEMPAT CONST LIB ]=====================\\
    const { smsg, fetchJson, getBuffer, fetchBuffer, getGroupAdmins, TelegraPh, isUrl, hitungmundur, sleep, clockString, checkBandwidth, runtime, formatp, tanggal, getRandom } = require('./lib/myfunc')
    const { addResponList, delResponList, isAlreadyResponList, isAlreadyResponListGroup, sendResponList, updateResponList, getDataResponList } = require('./lib/respon-list');
    const { isSetProses, addSetProses, removeSetProses, changeSetProses, getTextSetProses } = require('./lib/setproses');
    const { isSetDone, addSetDone, removeSetDone, changeSetDone, getTextSetDone } = require('./lib/setdone');

    //===================[ TAMPAT PREFIX / ADMIN / OWNER ]====================\\
    const budy = (typeof m.text === 'string') ? m.text : '';
    const prefixRegex = /^[°zZ#$@*+,.?=''():√%!¢£¥€π¤ΠΦ_&><`™©®Δ^βα~¦|/\\©^]/;
    const prefix = prefixRegex.test(body) ? body.match(prefixRegex)[0] : '.';
    const isCmd = body.startsWith(prefix);
    const command = isCmd ? body.slice(prefix.length).trim().split(" ").shift().toLowerCase() : "";
    const args = body.trim().split(/ +/).slice(1);
    const text = args.join(" ");

    const sender = m.key.fromMe
      ? KingOfBear.user.id.split(":")[0] + "@s.whatsapp.net"
      : m.key.participant || m.key.remoteJid;
    const botNumber = await KingOfBear.decodeJid(KingOfBear.user.id);
    const senderNumber = sender.split("@")[0];

    const isCreator = (m && m.sender && [botNumber, ...global.owner].map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender)) || false;
    const pushname = m.pushName || senderNumber;
    const isBot = botNumber.includes(senderNumber);

    const quoted = m.quoted ? m.quoted : m
    const mime = (quoted.msg || quoted).mimetype || ''
    const groupMetadata = m.isGroup ? await KingOfBear.groupMetadata(from).catch(() => {}) : "";
    const groupName = m.isGroup ? groupMetadata.subject : "";
    const participants = m.isGroup ? await groupMetadata.participants : [];
    const groupAdmins = m.isGroup ? await getGroupAdmins(participants) : [];
    const isBotAdmins = m.isGroup ? groupAdmins.includes(botNumber) : false;
    const isAdmins = m.isGroup ? groupAdmins.includes(m.sender) : false;

    //=================[ TEMPAT FUNCTION DATABASE ]====================\\
    let db_respon_list = JSON.parse(fs.readFileSync('./database/list-message.json'));
    let listStore = JSON.parse(fs.readFileSync('./database/list-message.json'));
    let set_proses = JSON.parse(fs.readFileSync('./database/set_proses.json'));
    let set_done = JSON.parse(fs.readFileSync('./database/set_done.json'));

    //===================[ TAMPILAN CONSOLE ]=====================\\
    if (m.message) {
      console.log(
        chalk.black(chalk.bgWhite("[ PESAN ]")),
        chalk.black(chalk.bgGreen(new Date())),
        chalk.black(chalk.bgBlue(body || m.mtype)) +
          "\n" +
          chalk.magenta("=> Dari"),
        chalk.green(pushname),
        chalk.yellow(m.sender) +
          "\n" +
          chalk.blueBright("=> Di"),
        chalk.green(m.isGroup ? groupName : "Private Chat", from)
      );
    }

    //==================[ FUNCTION FITUR ]=====================\\
//    try {
// ppuser = await KingOfBear.profilePictureUrl(m.sender, 'image')
// } catch {
// ppuser = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png?q=60'
// }
    if (m.isGroup && isAlreadyResponList(m.chat, body.toLowerCase(), db_respon_list)) {
      let get_data_respon = getDataResponList(m.chat, body.toLowerCase(), db_respon_list);
      if (get_data_respon.isImage === false) {
        KingOfBear.sendMessage(m.chat, { text: sendResponList(m.chat, body.toLowerCase(), db_respon_list) }, { quoted: m });
      } else {
        KingOfBear.sendMessage(m.chat, { image: await getBuffer(get_data_respon.image_url), caption: get_data_respon.response }, { quoted: m });
      }
    }

    // Fungsi untuk reply cepat
    const reply = (teks) => {
      KingOfBear.sendMessage(
        from,
        {
          text: teks,
          contextInfo: {
            externalAdReply: {
              showAdAttribution: true,
              title: "Ytb @CallMyKyy",
              containsAutoReply: true,
              mediaType: 1,
              mediaUrl: "https://www.youtube.com/@CallMyKyy",
              sourceUrl: "https://www.youtube.com/@CallMyKyy",
            },
          },
        },
        { quoted: m }
      );
    };

    // Fungsi untuk waktu
    function getFormattedDate() {
      let d = new Date();
      let day = d.getDate();
      let month = d.getMonth() + 1;
      let year = d.getFullYear();
      let hours = d.getHours();
      let minutes = d.getMinutes();
      let seconds = d.getSeconds();
      return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
    }

    // Menentukan ucapan berdasarkan waktu
    const timee = moment().tz("Asia/Jakarta").format("HH:mm:ss");
    let waktuucapan = "Selamat Malam 🌃";
    if (timee < "19:00:00") waktuucapan = "Selamat Petang 🌆";
    if (timee < "18:00:00") waktuucapan = "Selamat Sore 🌅";
    if (timee < "15:00:00") waktuucapan = "Selamat Siang 🏙";
    if (timee < "10:00:00") waktuucapan = "Selamat Pagi 🌄";
    if (timee < "05:00:00") waktuucapan = "Selamat Subuh 🌉";
    if (timee < "03:00:00") waktuucapan = "Tengah Malam 🌌";

    // Menangani command yang salah
    if (prefix && command) {
      let caseNames = fs.readFileSync("case.js", "utf8").match(/case\s+'([^']+)'/g);
      let caseList = caseNames ? caseNames.map((match) => match.replace(/case\s+'([^']+)'/, "$1")) : [];
      let mean = didyoumean(command, caseList);
      let sim = similarity(command, mean);
      let similarityPercentage = parseInt(sim * 100);

      if (mean && command.toLowerCase() !== mean.toLowerCase()) {
        reply(`Maaf, command yang kamu berikan salah. Mungkin yang kamu maksud:\n\n•> ${prefix + mean}\n•> Kemiripan: ${similarityPercentage}%`);
      }
    }

    // Command handler (tambahkan case di sini)
    switch (command) {
      case "ping":
        reply(`Pong! Bot aktif.`);
        break;

      case "waktu":
        reply(`Sekarang: ${getFormattedDate()}`);
        break;

      default:
        if (isCmd) {
          reply(`Maaf, command "${command}" tidak ditemukan!`);
        }
        break;
    }
  } catch (err) {
    console.error(err);
  }
};
