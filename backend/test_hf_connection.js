const axios = require('axios');

const HF_SEARCH_URL = "https://nemo-chewz.hf.space/api/v1/search/";

async function testConnection() {
    console.log(`Testing connection to ${HF_SEARCH_URL}...`);
    try {
        const start = Date.now();
    const response = await axios.get(HF_SEARCH_URL, {
            params: { 
                q: "bún bò", 
                top_k: 9999,
                lat: 10.7769,
                lon: 106.7009,
                radius: 0,
                alpha: 0.6
            },
            timeout: 10000 
        });
        const duration = Date.now() - start;
        
        console.log(`✅ Success! Status: ${response.status}`);
        console.log(`⏱️ Duration: ${duration}ms`);
        console.log("Response data sample:", JSON.stringify(response.data).slice(0, 200));
        
    } catch (error) {
        console.error("❌ Connection failed!");
        if (error.response) {
            console.error(`Status: ${error.response.status}`);
            console.error(`Data: ${JSON.stringify(error.response.data)}`);
        } else if (error.request) {
            console.error("No response received (Timeout or Network Error)");
            console.error(error.message);
        } else {
            console.error("Error setup failed:", error.message);
        }
    }
}

testConnection();
