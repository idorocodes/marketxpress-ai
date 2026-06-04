
 class AiClient {
  /**
   * Creates a new instance with the given API key.
   * @param {string} apiKey - The Groq Cloud API access key token
   */
  constructor(apiKey) {
    if (!apiKey) {
      throw new Error("[AiClient] Initialization failed: An API key must be supplied.");
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
   async parseUserRequirements(userMessage) {
    // Structural system instruction matrix ensuring a rigid JSON schema return signature
    const systemPrompt = `You are a strict data transformation engine. 
Convert the user's raw Nigerian market food requests into a valid JSON array.
Each object in the array must contain exactly two fields:
1. "name": (string, trimmed, normalized to UPPERCASE, e.g., "RICE", "YAM", "EGUSI")
2. "quantity": (integer, representing the units requested)

Examples:
- "I need 3 mudu of rice and 2 tubers of yam" -> [{"name": "RICE", "quantity": 3}, {"name": "YAM", "quantity": 2}]
- "Get me two cups of egusi" -> [{"name": "EGUSI", "quantity": 2}]

Output ONLY the raw JSON array. Do not wrap it in markdown code blocks like \`\`\`. No conversational text introduction.`;

    const body = {
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage }
      ],
      temperature: 0.1, // Set low to guarantee structural schema compliance
      max_tokens: 250,
      // Forces Groq to natively process and respond via JSON Object containment bounds
      response_format: { type: "json_object" } 
    };

    const response = await fetch(this.apiUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${this.apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    const status = response.status;
    const text = await response.text();

    if (!response.ok) {
      throw new Error(`Groq API response error status ${status}: ${text}`);
    }

    // Mirrors Serde parsing step
    const parsedData = JSON.parse(text);
    const rawContent = parsedData.choices[0]?.message?.content;

    if (!rawContent) {
      throw new Error("Empty completion array payload returned from the AI inference node.");
    }

    // Parse the inner generated structured content safely
    const innerJson = JSON.parse(rawContent);
    
    // Accommodate standard object nesting configurations if returned
    const finalArray = Array.isArray(innerJson) ? innerJson : (innerJson.required_items || innerJson.items);
    
    if (!Array.isArray(finalArray)) {
      throw new Error("AI output failed to comply with the standard required array signature formatting.");
    }

    return finalArray;
  }
}



export default AiClient