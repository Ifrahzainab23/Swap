// Test script to verify credit assignment system
// Run this with: node test_credit_system.js

const axios = require('axios');

const BACKEND_URL = 'http://localhost:5000';

// Test scenarios
const testScenarios = [
  {
    name: "Negative Price Difference (-700)",
    orderId: "6857ca0936a0006dd4bb650a",
    expectedBehavior: "Should assign 700 credits when marked as Completed"
  },
  {
    name: "Positive Price Difference (1000)", 
    orderId: "687b7a0776f8f94eece0348f",
    expectedBehavior: "Should NOT assign credits (customer pays more)"
  }
];

async function testCreditAssignment() {
  console.log("🧪 Testing Credit Assignment System\n");
  
  for (const scenario of testScenarios) {
    console.log(`📋 Testing: ${scenario.name}`);
    console.log(`Expected: ${scenario.expectedBehavior}`);
    
    try {
      // First, check the current exchange status
      const statusResponse = await axios.post(`${BACKEND_URL}/api/order/exchange-status`, {
        orderId: scenario.orderId,
        exchangeStatus: "Completed"
      }, {
        headers: {
          "Content-Type": "application/json",
          "token": "test" // This will fail but we can see the logic
        }
      });
      
      console.log(`✅ Response:`, statusResponse.data);
      
    } catch (error) {
      if (error.response) {
        console.log(`❌ Error: ${error.response.data.message}`);
      } else {
        console.log(`❌ Network Error: ${error.message}`);
      }
    }
    
    console.log("---\n");
  }
}

// Run the test
testCreditAssignment().catch(console.error); 