// server.js
const MutasikuSDK = require('mutasiku-sdk');

// Initialize the SDK with your API key
const sdk = new MutasikuSDK({
  apiKey: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
});

// Test function to run all our tests
async function runTests() {
  try {
    // Test 1: Get accounts
    console.log('Testing getAccounts()...');
    const accounts = await sdk.getAccounts({ limit: 5 });
    console.log('Accounts:', JSON.stringify(accounts, null, 2));
    
    // If accounts exist, test getAccountById with the first account
    if (accounts.success && accounts.data && accounts.data.length > 0) {
      const accountId = accounts.data[0].id;
      
      // Test 2: Get account by ID
      console.log(`\nTesting getAccountById(${accountId})...`);
      const account = await sdk.getAccountById(accountId);
      console.log('Account:', JSON.stringify(account, null, 2));
      
      // Test 3: Get mutations/transactions for this account
      console.log(`\nTesting getMutasi() for account ${accountId}...`);
      const mutations = await sdk.getMutasi({ 
        accountId,
        days: 30,
        limit: 3
      });
      console.log('Mutations:', JSON.stringify(mutations, null, 2));
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

async function testDanaAccount() {
    try {
      // Step 1: Add DANA account and request OTP
      console.log('Testing addDanaAccount()...');
      const otpRequest = await sdk.addAccount({
        action: 'dana-send-otp',
        phoneNumber: 'xxxxxxxxxxx',
        pin: 'xxxxxx',
        providerCode: 'dana',
        accountName: 'test',
        intervalMinutes: 1,
        verificationMethod: 'whatsapp'
      });
      console.log('OTP Request:', JSON.stringify(otpRequest, null, 2));
      
      if (otpRequest.success && otpRequest.sessionId) {
        // Use readline to get OTP from user input in Node.js
        const readline = require('readline');
        const rl = readline.createInterface({
          input: process.stdin,
          output: process.stdout
        });
        
        // Create a promise-based version of the question method
        const askQuestion = (question) => {
          return new Promise((resolve) => {
            rl.question(question, (answer) => {
              resolve(answer);
            });
          });
        };
        
        // Ask for OTP
        const otp = await askQuestion('Enter the OTP received: ');
        
        // Step 2: Verify OTP
        console.log('\nTesting verifyDanaAccount()...');
        const verification = await sdk.verifyDanaAccount({
          sessionId: otpRequest.sessionId,
          otp: otp
        });
        console.log('Verification:', JSON.stringify(verification, null, 2));
        
        // Close the readline interface
        rl.close();
      }
    } catch (error) {
      console.error('DANA account test failed:', error);
    }
}

// Run the tests
testDanaAccount();