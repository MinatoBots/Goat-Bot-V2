const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const path = require('path');

module.exports = {
  config: {
    name: "pairdp",
    aliases: [],
    version: "1.0",
    author: "Vex_kshitiz",
    shortDescription: "make copuple mathcing pfp",
    longDescription: "make couple matching pair dp ",
    category: "image",
    guide: {
      en: "{p}pairdp"
    }
  },
  onStart: async function ({ message, event, args, api }) {
    try {
      if (event.type !== "message_reply") {
        return message.reply("❌ || Reply to a single image to create pair DP.");
      }

      const attachment = event.messageReply.attachments;
      if (!attachment || attachment.length !== 1 || attachment[0].type !== "photo") {
        return message.reply("❌ || Please reply to a single image to create pair DP.");
      }

      const imageUrl = attachment[0].url;
      const image = await loadImage(imageUrl);

      const width = image.width;
      const height = image.height;
      const halfWidth = width / 2;

      const canvasLeft = createCanvas(halfWidth, height);
      const ctxLeft = canvasLeft.getContext('2d');
      ctxLeft.drawImage(image, 0, 0, halfWidth, height, 0, 0, halfWidth, height);

      const canvasRight = createCanvas(halfWidth, height);
      const ctxRight = canvasRight.getContext('2d');
      ctxRight.drawImage(image, halfWidth, 0, halfWidth, height, 0, 0, halfWidth, height);

      const cacheFolderPath = path.join(__dirname, 'cache');
      if (!fs.existsSync(cacheFolderPath)) {
        fs.mkdirSync(cacheFolderPath);
      }

      const leftImagePath = path.join(cacheFolderPath, `${Date.now()}left.png`);
      const rightImagePath = path.join(cacheFolderPath, `${Date.now()}right.png`);

      const outLeft = fs.createWriteStream(leftImagePath);
      const streamLeft = canvasLeft.createPNGStream();
      streamLeft.pipe(outLeft);

      const outRight = fs.createWriteStream(rightImagePath);
      const streamRight = canvasRight.createPNGStream();
      streamRight.pipe(outRight);

      outLeft.on('finish', () => {
        outRight.on('finish', () => {
          message.reply({
            body: "pair DP image!",
            attachment: [
              fs.createReadStream(leftImagePath),
              fs.createReadStream(rightImagePath)
            ]
          });
        });
      });

    } catch (error) {
      console.error("Error:", error);
      message.reply("❌ | An error occurred.");
    }
  }
};
