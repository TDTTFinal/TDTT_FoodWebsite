const axios = require('axios');

async function triggerSearch() {
  try {
    console.log("Triggering search...");
    const res = await axios.get('http://localhost:5000/api/search/advanced?q=bún%20bò');
    console.log("Status:", res.status);
    console.log("Data total:", res.data.total);
    console.log("Metadata:", res.data.metadata);
  } catch (error) {
    console.error("Error:", error.message);
    if(error.response) console.error(error.response.data);
  }
}

triggerSearch();
