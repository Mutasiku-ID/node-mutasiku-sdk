// server.js
import MutasikuSDK from 'mutasiku-sdk';

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

async function testGetDanaBanks() {
    // Get available banks for DANA transfer
    const banks = await sdk.getDanaBanks('xxxxxxxxxxxxxxxxxxxxxxxxxxxx');
    if (banks.success) {
        console.log('Available banks:', banks.data);
    }
}

async function testTransferDanaQris() {
    // From file input
    const fileInput = document.getElementById('qr-upload');
    const file = fileInput.files[0];

    const result = await sdk.payDanaQris('xxxxxxxxxxxxxxxxxxxxxxxxxxxx', file, 25000);
    if (result.success) {
        console.log('Payment successful');
    } else {
        console.error('Transfer QRIS initialization failed:', result.message || result.error);
    }
}


async function testTransferDanaBankInit() {
  // Check account name before transfer
  const initResult = await sdk.transferDanaBankInit('xxxxxxxxxxxxxxxxxxxxxxxxxxxx', {
    accountNumber: 'xxxxxxxxx',
    amount: 20000,
    instId: 'xxxxxxx',
    instLocalName: 'xxx',
    payMethod: 'xxxxxxxxxxx',
    payOption: 'xxxxxxxxxxx'
  });
  
  if (initResult.success) {
      console.log('Account verified:', initResult.data.accountName);
      
      // Step 2: Confirm transfer (you'll need the bankAccountIndexNo from init response)
      const confirmResult = await sdk.transferDanaBankCreate('xxxxxxxxxxxxxxxxxxxxxxxxxxxx', {
          amount: 20000,
          bankAccountIndexNo: initResult.data.bankAccountIndexNo // From init response
      });
      
      if (confirmResult.success) {
          console.log('Transfer completed successfully!');
      } else {
          console.error('Transfer confirmation failed:', confirmResult.message);
      }
  } else {
      console.error('Transfer initialization failed:', initResult.message);
  }
}

// Run the tests
testTransferDanaBankInit();