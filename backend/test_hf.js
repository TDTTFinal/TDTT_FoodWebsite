const axios = require('axios');

const HF_SEARCH_URL = "https://nemo-chewz.hf.space/api/v1/search/";

async function testHF() {
  try {
    console.log(`Testing URL: ${HF_SEARCH_URL}?q=pho&top_k=5`);
    const res = await axios.get(HF_SEARCH_URL, {
        params: { q: "pho", top_k: 5 },
        timeout: 10000
    });
    console.log("Status:", res.status);
    console.log("Data:", JSON.stringify(res.data, null, 2));
  } catch (error) {
    console.error("Error:", error.message);
    if (error.response) {
        console.error("Response data:", error.response.data);
    }
  }
}

testHF();
