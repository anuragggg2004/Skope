import dotenv from 'dotenv';
dotenv.config();

const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent`;
const payload = {
  contents: [{ role: 'user', parts: [{ text: "What is the capital of France? Return JSON." }] }],
  tools: [{ googleSearch: {} }],
  generationConfig: { responseMimeType: 'application/json' }
};

fetch(url, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-goog-api-key': process.env.GEMINI_API_KEY
  },
  body: JSON.stringify(payload)
})
.then(res => res.text().then(text => console.log(res.status, text)))
.catch(console.error);
