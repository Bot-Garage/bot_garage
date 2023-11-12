const fetch = require("node-fetch");

class OpenAI{
    constructor(API_KEY, ORG_ID){
        if(!API_KEY)
            throw Error("API_KEY is required")
        this.API_KEY = API_KEY;

        if(!ORG_ID)
            throw Error("ORG_ID is required")
        this.ORG_ID = ORG_ID;
    }

    async ChatCompletion(options){
        // Validation: options.messages
        if(!options.messages)
            throw new Error("Messages are required for request");
        
        // Fetch response from OpenAI
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + this.API_KEY,
                "OpenAI-Organization": this.ORG_ID
            },
            body: JSON.stringify({
                model: (options.model || "gpt-4-vision-preview"),
                temperature: (options.temperature || 1.2),
                top_p: (options.top_p || 1),
                n: (options.n || 1),
                max_tokens: (options.max_tokens || 500),
                messages: options.messages
            })
        });

        // Make sure response was good
        if(response.status != 200)
            throw new Error("API Error: " + response.status + " : " + response.statusText);

        // Get the response JOSN for the actual body
        return await response.json();
    }
}

module.exports = OpenAI;