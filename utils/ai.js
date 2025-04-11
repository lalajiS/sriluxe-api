const OpenAI = require("openai");
const { log } = require("../utils/logger");


const openAI = new OpenAI({
  apiKey: process.env.OPEN_AI_KEY
});

const AI_tour_description = async (itineraryData) => {

  const prompt = `
    Given the following JSON itinerary, create a catchy tour title (max 10 words) and a promotional description (max 100 words). 
    Totals duration of the tour is under the property 'num_of_days'
    
    JSON:
    ${JSON.stringify(itineraryData, null, 2)}

    Return a JSON object with 'title' and 'description'.
  `;

  try {
    
    const response = await openAI.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "system", content: prompt }],
      temperature: 0.7,
    });

    const text = response.choices[0].message.content;
    console.log("AI_tour_description Output:", text);

    return JSON.parse(text);

  } catch (error) {
    console.error("AI_tour_description Error:", error.response ? error.response.data : error.message);
    log.error(error.response ? error.response.data : error.message);
  }
};



module.exports = {
  AI_tour_description,
};
