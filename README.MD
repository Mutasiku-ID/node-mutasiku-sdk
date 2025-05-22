# Mutasiku SDK

Mutasiku JavaScript SDK for interacting with the Mutasiku API to manage financial accounts and track transactions for Indonesian payment providers like DANA, OVO, GOPAY MERCHANT and etc.

## Installation

```bash
npm install mutasiku-sdk
```

## Usage

### Initialize the SDK

```javascript
const MutasikuSDK = require('mutasiku-sdk');

const mutasiku = new MutasikuSDK({
  apiKey: 'your-api-key-here'
});
```

### Account Management

#### Get All Accounts

```javascript
// Get all accounts
const accounts = await mutasiku.getAccounts();

// With pagination and filters
const filteredAccounts = await mutasiku.getAccounts({
  limit: 10,
  page: 1,
  providerCode: 'OVO',
  isActive: true
});
```

#### Get Account by ID

```javascript
const account = await mutasiku.getAccountById('account-id-here');
```

#### Remove an Account

```javascript
const result = await mutasiku.removeAccount('account-id-here');
```

### Adding New Accounts

#### Add OVO Account

```javascript
const addOvoResult = await mutasiku.addAccount({
  action: "ovo-send-otp",
  phoneNumber: "+628123456789",
  providerCode: "OVO",
  accountName: "My OVO Account",
  intervalMinutes: 5,
  verificationMethod: "WhatsApp"
});

// If successful, verify with OTP
if (addOvoResult.success) {
  const verifyResult = await mutasiku.verifyAccount({
    action: "ovo-verify-otp",
    sessionId: addOvoResult.data.sessionId,
    otp: "123456", // OTP received via WhatsApp or SMS
    pin: "123456"  // OVO PIN
  });
}
```

#### Add DANA Account

```javascript
const addDanaResult = await mutasiku.addAccount({
  action: "dana-send-otp",
  phoneNumber: "08123456789",
  pin: "123456", // DANA PIN
  providerCode: "dana",
  accountName: "My DANA Account",
  intervalMinutes: 5,
  verificationMethod: "SMS"
});

// If successful, verify with OTP
if (addDanaResult.success) {
  const verifyResult = await mutasiku.verifyAccount({
    action: "dana-verify-otp",
    sessionId: addDanaResult.data.sessionId,
    otp: "123456" // OTP received via SMS
  });
}
```

### DANA Transfer Features

#### Get Available Banks for DANA Transfer

```javascript
const banks = await mutasiku.getDanaBanks('dana-account-id');
if (banks.success) {
  console.log('Available banks:', banks.data);
  // Returns list of supported banks with their details
}
```

#### DANA QRIS Payment

Upload a QR code image to make QRIS payments through DANA:

```javascript
// For browser usage with file input
const fileInput = document.getElementById('qr-upload');
const file = fileInput.files[0];

const result = await mutasiku.transferDanaQris('dana-account-id', file, 25000);
if (result.success) {
  console.log('QRIS payment successful');
} else {
  console.error('QRIS payment failed:', result.message);
}
```

#### DANA Bank Transfer

Transfer money from DANA to bank accounts using a two-step process:

**Step 1: Initialize Transfer (Check Account Name)**

```javascript
const initResult = await mutasiku.transferDanaBankInit('dana-account-id', {
  accountNumber: '1234567890',
  amount: 10000,
  instId: 'BCAC1ID',
  instLocalName: 'BCA',
  payMethod: 'WITHDRAW_BANKCARD',
  payOption: 'WITHDRAW_BANKCARD_BCA'
});

if (initResult.success) {
  console.log('Account verified:', initResult.data.accountName);
  console.log('Bank Account Index:', initResult.data.bankAccountIndexNo);
}
```

**Step 2: Confirm Transfer**

```javascript
if (initResult.success) {
  const confirmResult = await mutasiku.transferDanaBankCreate('dana-account-id', {
    amount: 10000,
    bankAccountIndexNo: initResult.data.bankAccountIndexNo // From init response
  });
  
  if (confirmResult.success) {
    console.log('Transfer completed successfully!');
  } else {
    console.error('Transfer failed:', confirmResult.message);
  }
}
```

### Get Transaction History (Mutasi)

```javascript
// Get all transactions from the past 7 days
const recentTransactions = await mutasiku.getMutasi({
  days: 7
});

// With custom date range and filters
const customTransactions = await mutasiku.getMutasi({
  startDate: '2025-01-01T00:00:00Z',
  endDate: '2025-01-31T23:59:59Z',
  accountId: 'account-id-here',
  type: 'CREDIT', // or 'DEBIT'
  minAmount: 10000,
  maxAmount: 1000000,
  search: 'coffee',
  limit: 50,
  page: 1
});
```

## API Reference

### Constructor Options

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| apiKey | string | Yes | Your Mutasiku API key |
| logger | object | No | Custom logger (defaults to console) |

### Available Methods

#### Account Management
- `getAccounts(options)` - Get all accounts with optional filters
- `getAccountById(accountId)` - Get a specific account by ID
- `removeAccount(accountId)` - Remove an account
- `addAccount(data)` - Add a new account (OVO, DANA, etc.)
- `verifyAccount(data)` - Verify account with OTP

#### Transaction History
- `getMutasi(options)` - Get transaction history with filters

#### DANA Transfer Methods
- `getDanaBanks(accountId)` - Get available banks for DANA transfer
- `transferDanaQris(accountId, qrImage, amount)` - Make QRIS payment using QR code image
- `transferDanaBankInit(accountId, transferData)` - Initialize bank transfer and verify account name
- `transferDanaBankCreate(accountId, transferData)` - Confirm and execute bank transfer

### DANA Transfer Parameters

#### `transferDanaBankInit` Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| accountId | string | Yes | DANA account ID |
| transferData.accountNumber | string | Yes | Destination bank account number |
| transferData.amount | number | Yes | Transfer amount (minimum Rp 10,000) |
| transferData.instId | string | Yes | Bank institution ID |
| transferData.instLocalName | string | Yes | Bank local name |
| transferData.payMethod | string | Yes | Payment method |
| transferData.payOption | string | Yes | Payment option |

#### `transferDanaBankCreate` Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| accountId | string | Yes | DANA account ID |
| transferData.amount | number | Yes | Transfer amount |
| transferData.bankAccountIndexNo | string | Yes | Bank account index from init response |

#### `transferDanaQris` Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| accountId | string | Yes | DANA account ID |
| qrImage | File/Blob | Yes | QR code image file |
| amount | number | Yes | Payment amount |

## Error Handling

All API methods return a response object with the following structure:

```javascript
{
  success: true/false,
  status: 'success'/'error',
  message: 'Human readable message',
  data: { /* response data */ },
  error: { /* error details if any */ }
}
```

## Common Use Cases

### Complete DANA Bank Transfer Flow

```javascript
async function performDanaTransfer() {
  // 1. Get available banks
  const banks = await mutasiku.getDanaBanks('your-dana-account-id');
  
  // 2. Initialize transfer to verify account
  const initResult = await mutasiku.transferDanaBankInit('your-dana-account-id', {
    accountNumber: '1234567890',
    amount: 10000,
    instId: 'BCAC1ID',
    instLocalName: 'BCA',
    payMethod: 'WITHDRAW_BANKCARD',
    payOption: 'WITHDRAW_BANKCARD_BCA'
  });
  
  if (initResult.success) {
    console.log(`Transferring to: ${initResult.data.accountName}`);
    
    // 3. Confirm transfer
    const result = await mutasiku.transferDanaBankCreate('your-dana-account-id', {
      amount: 10000,
      bankAccountIndexNo: initResult.data.bankAccountIndexNo
    });
    
    if (result.success) {
      console.log('Transfer successful!');
    }
  }
}
```

## License

MIT License

---

# MIT License

```
MIT License

Copyright (c) 2025 PT. Cobra Code Indonesia

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```