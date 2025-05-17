# MutasikuSDK

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

- `getAccounts(options)` - Get all accounts with optional filters
- `getAccountById(accountId)` - Get a specific account by ID
- `removeAccount(accountId)` - Remove an account
- `getMutasi(options)` - Get transaction history with filters
- `addAccount(data)` - Add a new account (OVO, DANA, etc.)
- `verifyAccount(data)` - Verify account with OTP

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