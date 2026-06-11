/**
 * AI Service — Barbershop Recommender (Google Gemini).
 * ----------------------------------------------------
 * Gathers barbershops (with their city, services, and reviews) from MySQL,
 * builds a context string, and asks Gemini to recommend the best shop for the
 * user's free-text request. The API key is read from process.env on the
 * server side only — it is never exposed to the frontend.
 */

const { GoogleGenAI } = require('@google/genai');
const { Barbershop, Service, Review } = require('../../models');

// Initialize the Gemini client with the server-side API key
const ai = new GoogleGenAI({ apiKey: process.env.AI_API_KEY });

// Build a compact text summary of all shops for the model to reason over.
async function buildShopContext() {
  const shops = await Barbershop.findAll({
    include: [{ model: Service }, { model: Review }],
  });

  return shops.map((shop) => {
    const s = shop.toJSON();
    const services = (s.Services || [])
      .map((sv) => `${sv.name} (${sv.price}₪)`)
      .join(', ') || 'none listed';

    const reviews = s.Reviews || [];
    const avg = reviews.length
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : 'no reviews';
    const sampleComments = reviews.slice(0, 3).map((r) => `"${r.comment}"`).join(' ');

    return `Shop: ${s.name} | City: ${s.city} | Avg rating: ${avg} (${reviews.length} reviews) | Services: ${services} | Sample reviews: ${sampleComments}`;
  }).join('\n');
}

/**
 * Ask Gemini to recommend a barbershop for the given user request.
 * Returns the model's text recommendation.
 */
async function recommendBarbershop(userRequest) {
  const context = await buildShopContext();

  const prompt = `You are a helpful assistant for a barbershop directory app called Scissors.
Here is the list of available barbershops with their city, services, prices, ratings, and sample reviews:

${context}

The user is looking for: "${userRequest}"

Based ONLY on the barbershops listed above, recommend the single best match.
Reply in 2-3 short sentences: name the shop, its city, and briefly explain why it fits
(mention price, rating, or a relevant review). If nothing fits well, say so honestly.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
  });

  return response.text;
}

module.exports = { recommendBarbershop };