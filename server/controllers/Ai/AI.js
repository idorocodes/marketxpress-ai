class AiClient {
  /**
   * Creates a new instance with the given API key.
   * @param {string} apiKey - The Groq Cloud API access key token
   */
  constructor(apiKey) {
    if (!apiKey) {
      throw new Error(
        "[AiClient] Initialization failed: An API key must be supplied.",
      );
    }
    this.apiKey = apiKey;
    this.apiUrl = "https://api.groq.com/openai/v1/chat/completions";
  }

  /**
   * Parses free-form conversational user chat text into a structured item array.
   * Mirrors the exact execution pattern of your Rust async generate block.
   * * @param {string} userMessage - Raw text from your client dashboard input
   * @returns {Promise<Array<{name: string, quantity: number}>>}
   */
  // Inside your AiClient class in AI.js

  async parseUserRequirements(message) {
    try {
      const systemPrompt = `You are a strict data-extraction engine. Your sole job is to parse conversational cooking or shopping requests into a structured JSON array.

CRITICAL MAP MATCHING RULES:
1. Standardize all item names into their exact uppercase singular or designated dictionary names:
   - "oil", "vegetable oil" -> "VEGETABLE OIL"
   - "palm oil" -> "PALM OIL"
   - "maggi", "seasoning cubes" -> "MAGGI CUBES"
   - "peppers", "ata rodo", "shombo" -> "PEPPER"
   - "onions" -> "ONIONS"
   - "tomatoes" -> "TOMATOES"
   - "curry", "thyme", "seasoning" -> "SPICES"
   - "meat", "beef" -> "BEEF"

Each object in the array must strictly match this shape:
{ "name": "STANDARD_NAME_IN_UPPERCASE", "quantity": number }

Example input: "Cook jollof rice for 4 people, budget ₦2,500"
Example output: [{"name": "RICE", "quantity": 4}, {"name": "TOMATOES", "quantity": 2}, {"name": "ONIONS", "quantity": 2}, {"name": "PEPPER", "quantity": 2}, {"name": "VEGETABLE OIL", "quantity": 1}, {"name": "MAGGI CUBES", "quantity": 1}]`;
      const response = await fetch(this.apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: message },
          ],
          temperature: 0.1,
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(
          `Groq API returned HTTP ${response.status}: ${errText}`,
        );
      }

      const data = await response.json();
      let rawText = data.choices[0].message.content.trim();
      console.log("[DeciderAI] Raw model response text:", rawText);

      // ─── HIGH SECURITY CLEANING STEP ───
      // Slices out everything except the actual raw [...] array block
      const arrayMatch = rawText.match(/\[\s*\{[\s\S]*\}\s*\]/);
      if (arrayMatch) {
        rawText = arrayMatch[0];
      }

      

      // Safely parse the isolated block
      const parsedArray = JSON.parse(rawText);

      if (!Array.isArray(parsedArray)) {
        throw new Error("Parsed result is not an array");
      }

      return parsedArray.map((item) => ({
        name: String(item.name).toUpperCase().trim(),
        quantity: Number(item.quantity) || 1,
      }));
    } catch (error) {
      console.error(
        "[DeciderAI] Structural extraction breakdown:",
        error.message,
      );
      throw new Error(
        "AI output failed to comply with the standard required array signature formatting.",
      );
    }
  }
}

export default AiClient;
