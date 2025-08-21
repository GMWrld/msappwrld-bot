const nlp = require('compromise');
const { fetchSneakerInventory } = require('./sneakerServices');

async function processUserMessage(userText) {
  const sneakers = await fetchSneakerInventory();

  const doc = nlp(userText.toLowerCase());

  // Extract potential brand
  const brandCandidates = ["nike", "adidas", "converse", "vans"];
  let brand = brandCandidates.find(b => userText.toLowerCase().includes(b));

  // Extract numbers (possible price)
  let numbers = doc.numbers().out('array').map(n => parseInt(n));
  let maxPrice = numbers.length ? Math.max(...numbers) : null;

  // Filter sneakers
  let filtered = sneakers.filter(s => {
    let ok = true;
    if (brand) ok = ok && s.Brand.toLowerCase() === brand;
    if (maxPrice) ok = ok && s.Price <= maxPrice;
    return ok;
  });

  // Prepare messages
  if (!filtered.length) {
    return [{ text: `Sorry, no sneakers found for "${userText}" 😔` }];
  }

  const topSneakers = filtered.slice(0, 5);

  const messages = topSneakers.map((s, idx) => ({
    text: `${idx + 1}. ${s.Name} (${s.Brand}) - $${s.Price}\nSizes: ${s.Sizes?.join(', ')}`,
    image: s.ImageURL || null,
  }));

  return messages;
}

module.exports = { processUserMessage };
