const { exec } = require('child_process');

module.exports = {
  config: {
    name: "runcmd",
    version: "1.0",
    author: "Cruizex",
    countDown: 0,
    role: 2,
    category: "Utility",
    description: {
    en: "Run linux commands"
    },
    guide: {
      en: "{pn} <command> - Run a terminal command",
    },
  },

  onStart: async function ({ api, args, message, event }) {
    let senderID = event.senderID;

    if (senderID !== 100087975355210'') {
      return message.reply('You are not authorized to use this command.');
    }

    const command = args.join(' ');

    if (!command) {
      return message.reply('Please provide a command to execute.');
    }

    exec(command, (error, stdout, stderr) => {
      if (error) {
        message.reply(`Error: ${error.message}`);
        return;
      }
      if (stderr) {
        message.reply(`Error: ${stderr}`);
        return;
      }
      message.reply(`${stdout}`);
    });
  }
};
