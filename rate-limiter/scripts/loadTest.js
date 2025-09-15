const axios = require("axios");

async function loadTest(endpoint, concurrent = 50, duration = 30000) {
  const startTime = Date.now();
  const results = { success: 0, rateLimited: 0, errors: 0 };

  const makeRequest = async () => {
    try {
      const response = await axios.get(endpoint);
      results.success++;
    } catch (error) {
      if (error.response?.status === 429) {
        results.rateLimited++;
      } else {
        results.errors++;
      }
    }
  };

  // Run concurrent requests for specified duration
  const promises = [];
  const interval = setInterval(() => {
    if (Date.now() - startTime < duration) {
      for (let i = 0; i < concurrent; i++) {
        promises.push(makeRequest());
      }
    } else {
      clearInterval(interval);
    }
  }, 1000);

  // Wait for all requests to complete
  setTimeout(async () => {
    await Promise.all(promises);
    console.log("Load Test Results:", results);
    console.log(
      `Rate Limit Effectiveness: ${
        (results.rateLimited / (results.success + results.rateLimited)) * 100
      }%`
    );
  }, duration + 5000);
}

// Usage
loadTest("http://localhost:3001/api/token-bucket", 10, 30000);
