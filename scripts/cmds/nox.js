const axios = require('axios');

const Prefixes = [
  'nox',
];

function apply(text, fontMap) {
  return text.replace(/[a-zA-Z0-9]/g, (char) => fontMap[char] || char);
}

const sans = {
  a: "𝖺", b: "𝖻", c: "𝖼", d: "𝖽", e: "𝖾", f: "𝖿", g: "𝗀", h: "𝗁",
  i: "𝗂", j: "𝗃", k: "𝗄", l: "𝗅", m: "𝗆", n: "𝗇", o: "𝗈", p: "𝗉",
  q: "𝗊", r: "𝗋", s: "𝗌", t: "𝗍", u: "𝗎", v: "𝗏", w: "𝗐", x: "𝗑",
  y: "𝗒", z: "𝗓", A: "𝖠", B: "𝖡", C: "𝖢", D: "𝖣", E: "𝖤", F: "𝖥",
  G: "𝖦", H: "𝖧", I: "𝖨", J: "𝖩", K: "𝖪", L: "𝖫", M: "𝖬", N: "𝖭",
  O: "𝖮", P: "𝖯", Q: "𝖰", R: "𝖱", S: "𝖲", T: "𝖳", U: "𝖴", V: "𝖵",
  W: "𝖶", X: "𝖷", Y: "𝖸", Z: "𝖹", "0": "𝟢", "1": "𝟣", "2": "𝟤", "3": "𝟥",
  "4": "𝟦", "5": "𝟧", "6": "𝟨", "7": "𝟩", "8": "𝟪", "9": "𝟫",
};

module.exports = {
  config: {
    name: 'nox',
    version: '1.0.5',
    author: '©Custom AI | Nox Ai', // don't change credits please 🙏🙂
    role: 0,
    category: 'ai',
    longDescription: {
      en: 'AI is designed to answer user queries and engage in conversations based on user input. It provides responses and insights on a wide range of topics.'
    },
    guide: {
      en: `
      Command: ai [question]
      - Use this command to ask a question to the AI chatbot.
      - Example: ai What is the weather like today?

      Reply with "reset" to clear the conversation history.
      `
    }
  },
  onStart: async () => {},
  onChat: async ({ api, event, args, message }) => {
    const prefix = Prefixes.find(p => event.body.toLowerCase().startsWith(p));
    if (!prefix) return;

    const question = event.body.slice(prefix.length).trim();
    if (!question) {
      return message.reply("𝖧𝖾𝗅𝗅𝗈! 𝖧𝗈𝗐 𝖼𝖺𝗇 𝖨 𝖺𝗌𝗌𝗂𝗌𝗍 𝗒𝗈𝗎 𝗍𝗈𝖽𝖺𝗒?");
    }

    const uid = event.senderID;

    api.setMessageReaction("⏰", event.messageID, () => {}, true);

    const startTime = Date.now();

    try {
      const response = await axios.get('https://c-v1.onrender.com/c/v1', {
        params: {
          message: question,
          model: 'Nox',
          apiKey: 'c92728090acc',
          userId: uid
        }
      });

      if (response.status !== 200 || !response.data) {
        throw new Error('Invalid or missing response from API');
      }

      const answer = apply(response.data.response, sans);
      const endTime = Date.now();
      const processTimeMs = endTime - startTime;
      const processTimeSec = (processTimeMs / 1000).toFixed(2);

      const replyMessage = await message.reply(`${answer}`); 
      global.GoatBot.onReply.set(replyMessage.messageID, {
        commandName: module.exports.config.name,
        messageID: replyMessage.messageID,
        author: event.senderID
      });

      api.setMessageReaction("✅", event.messageID, () => {}, true);

    } catch (error) {
      console.error(`Error fetching response: ${error.message}, Status Code: ${error.response ? error.response.status : 'N/A'}`);
      message.reply(`⚠ An error occurred while processing your request. Error: ${error.message}${error.response ? `, Status Code: ${error.response.status}` : ''}. Please try again later.`);

      api.setMessageReaction("❌", event.messageID, () => {}, true);
    }
  },

  onReply: async ({ api, event, Reply, message }) => {
    const { author } = Reply;
    const userReply = event.body.trim();
    const userId = event.senderID;

    if (global.GoatBot.onReply.has(event.messageID)) {
      return;
    }

    api.setMessageReaction("⏰", event.messageID, () => {}, true);

    if (userReply.toLowerCase() === 'reset') {
      try {
        const response = await axios.get('https://c-v1.onrender.com/c/r', {
          params: { userId }
        });

        if (response.status !== 200 || !response.data.message) {
          throw new Error('Invalid or missing response from API');
        }

        message.reply("✅ The conversation history has been successfully cleared.");

        api.setMessageReaction("✅", event.messageID, () => {}, true);

      } catch (error) {
        console.error(`Error resetting conversation: ${error.message}, Status Code: ${error.response ? error.response.status : 'N/A'}`);
        message.reply(`⚠ An error occurred while clearing the conversation history. Error: ${error.message}${error.response ? `, Status Code: ${error.response.status}` : ''}. Please try again later.`);

        api.setMessageReaction("❌", event.messageID, () => {}, true);
      }
      return;
    }

    const startTime = Date.now();

    try {
      const response = await axios.get('https://c-v1.onrender.com/c/v1', {
        params: {
          message: userReply,
          model: 'Nox',
          apiKey: 'c92728090acc',
          userId: userId
        }
      });

      if (response.status !== 200 || !response.data) {
        throw new Error('Invalid or missing response from API');
      }

      const followUpResponse = apply(response.data.response, sans);
      const endTime = Date.now();
      const processTimeMs = endTime - startTime;
      const processTimeSec = (processTimeMs / 1000).toFixed(2);

      const followUpMessage = await message.reply(`${followUpResponse}`);

      global.GoatBot.onReply.set(followUpMessage.messageID, {
        commandName: module.exports.config.name,
        messageID: followUpMessage.messageID,
        author: event.senderID
      });

      api.setMessageReaction("✅", event.messageID, () => {}, true);

    } catch (error) {
      console.error(`Error fetching follow-up response: ${error.message}, Status Code: ${error.response ? error.response.status : 'N/A'}`);
      message.reply(`⚠ An error occurred while processing your reply. Error: ${error.message}${error.response ? `, Status Code: ${error.response.status}` : ''}. Please try again later.`);

      api.setMessageReaction("❌", event.messageID, () => {}, true);
    }
  }
};
