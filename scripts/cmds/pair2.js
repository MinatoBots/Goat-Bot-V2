const { createCanvas, loadImage } = require('canvas');
const fs = require('fs-extra');
const path = require('path');
const axios = require('axios');

module.exports = {
  config: {
    name: "pairdp2",
    aliases: [],
    version: "1.1",
    author: "Vex_kshitiz",
    shortDescription: "Matching profile picture",
    longDescription: "Search for paired profile pictures",
    category: "image",
    guide: {
      en: "{p}pairdp2 {query1} and {query2} -{imageIndex}"
    }
  },
  onStart: async function ({ message, event, args, api }) {
    try {
      const input = args.join(" ");
      const [queries, imageIndex] = input.split(' -');
      if (!queries || !imageIndex) {
        return message.reply("❌ || Please provide two queries separated by 'and' and the image index separated by '-'. Example: pairdp2 zoro and sanji -2");
      }

      const [query1, query2] = queries.split(' and ');
      if (!query1 || !query2) {
        return message.reply("❌ || Please provide two queries separated by 'and'. Example: pairdp2 zoro and sanji -2");
      }

      const searchQuery = `${query1} and ${query2}`;
      const apiUrl = `https://pin-two.vercel.app/pin?search=${encodeURIComponent(searchQuery)}`;

      const response = await axios.get(apiUrl);
      const imageData = response.data.result;

      const index = parseInt(imageIndex) - 1;
      if (index < 0 || index >= imageData.length) {
        return message.reply(`❌ || Please provide a valid image index between 1 and ${imageData.length}.`);
      }

      const imageUrl = imageData[index];


      const imgResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });

    
      const image = await loadImage(imgResponse.data);
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

      const timestamp = Date.now();
      const leftImagePath = path.join(cacheFolderPath, `${timestamp}left.png`);
      const rightImagePath = path.join(cacheFolderPath, `${timestamp}right.png`);

      await Promise.all([
        fs.promises.writeFile(leftImagePath, canvasLeft.toBuffer('image/png')),
        fs.promises.writeFile(rightImagePath, canvasRight.toBuffer('image/png'))
      ]);

      const imgData = [
        fs.createReadStream(leftImagePath),
        fs.createReadStream(rightImagePath)
      ];

      await api.sendMessage({
        attachment: imgData,
        body: "Pair DP image!"
      }, event.threadID, event.messageID);

      fs.unlinkSync(leftImagePath);
      fs.unlinkSync(rightImagePath);

      console.log("Images sent successfully and cache cleaned");
    } catch (error) {
      console.error("Error:", error);
      message.reply("❌ | An error occurred.");
    }
  }
};
