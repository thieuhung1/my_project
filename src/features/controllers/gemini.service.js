const { genAI } = require("../Config/gemini.config.js");

const generateReply = async (prompt) => {
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash"
  });

  const result = await model.generateContent(prompt);
  const response = await result.response;

  return response.text();
};

module.exports = { generateReply };