// index.js
const axios = require('axios');

class MutasikuSDK {
  constructor(options = {}) {
    this.apiBaseUrl = 'https://mutasiku.co.id';
    this.apiKey = options.apiKey;
    this.logger = options.logger || console;
    
    // Validate required options
    if (!this.apiKey) {
      throw new Error('API key is required to initialize the Mutasiku SDK');
    }
  }

  // Core API request method
  async makeApiRequest(endpoint, data = null, method = 'POST') {
    try {
      const url = `${this.apiBaseUrl}${endpoint}`;
      
      const config = {
        method,
        url,
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey
        }
      };
      
      if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
        config.data = data;
      } else if (data) {
        // For GET/DELETE requests, convert data to query parameters
        const queryParams = new URLSearchParams();
        for (const key in data) {
          if (data[key] !== undefined && data[key] !== null) {
            queryParams.append(key, data[key].toString());
          }
        }
        
        const queryString = queryParams.toString();
        if (queryString) {
          config.url = `${url}${url.includes('?') ? '&' : '?'}${queryString}`;
        }
      }
      
      const response = await axios(config);
      return response.data;
    } catch (error) {
      this.logger.error('API request failed', {
        endpoint,
        error: error.response?.data || error.message
      });
      
      if (axios.isAxiosError(error) && error.response) {
        return {
          success: false,
          status: 'error',
          message: error.response.data?.message || 'API request failed',
          error: error.response.data
        };
      }
      
      return {
        success: false,
        status: 'error',
        message: error.message || 'API request failed'
      };
    }
  }

  // Account methods
  async getAccounts(options = {}) {
    const queryParams = {};
    
    if (options.limit) queryParams.limit = options.limit;
    if (options.page) queryParams.page = options.page;
    if (options.type) queryParams.type = options.type;
    if (options.isActive !== undefined) queryParams.isActive = options.isActive;
    if (options.providerCode) queryParams.providerCode = options.providerCode;
    
    return this.makeApiRequest('/api/v1/accounts', queryParams, 'GET');
  }

  async getAccountById(accountId) {
    if (!accountId) {
      return {
        success: false,
        message: 'Account ID is required'
      };
    }
    
    return this.makeApiRequest(`/api/v1/accounts/${accountId}`, null, 'GET');
  }

  async removeAccount(accountId) {
    if (!accountId) {
      return {
        success: false,
        message: 'Account ID is required'
      };
    }
    
    return this.makeApiRequest(`/api/v1/accounts/${accountId}`, null, 'DELETE');
  }

  // Transactions (Mutasi) methods
  async getMutasi(options = {}) {
    const queryParams = {};
    
    // Set default values
    queryParams.limit = options.limit || 10;
    queryParams.page = options.page || 1;
    
    // Date range
    if (options.days) {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - options.days);
      
      queryParams.startDate = startDate.toISOString();
      queryParams.endDate = endDate.toISOString();
    } else {
      if (options.startDate) queryParams.startDate = options.startDate;
      if (options.endDate) queryParams.endDate = options.endDate;
    }
    
    // Add optional filters
    if (options.accountId) queryParams.accountId = options.accountId;
    if (options.type) queryParams.type = options.type.toUpperCase();
    if (options.providerCode) queryParams.providerCode = options.providerCode.toUpperCase();
    if (options.minAmount !== undefined) queryParams.minAmount = options.minAmount;
    if (options.maxAmount !== undefined) queryParams.maxAmount = options.maxAmount;
    if (options.search) queryParams.search = options.search;
    
    return this.makeApiRequest('/api/v1/mutations', queryParams, 'GET');
  }

  // Replace the addDanaAccount method with a more generic addAccount method
  async addAccount(data) {
    // Basic validation
    if (!data.action || !data.phoneNumber || !data.accountName || !data.intervalMinutes || !data.verificationMethod || !data.providerCode) {
      return {
        success: false,
        message: 'Required fields missing: action, phoneNumber, accountName, intervalMinutes, verificationMethod, and providerCode are required'
      };
    }
    
    // Specific validation based on action
    if (data.action === 'dana-send-otp' && !data.pin) {
      return {
        success: false,
        message: 'PIN is required for DANA accounts'
      };
    }
    
    // Build the request payload
    const payload = {
      action: data.action,
      phoneNumber: data.phoneNumber,
      providerCode: data.providerCode,
      accountName: data.accountName,
      intervalMinutes: data.intervalMinutes || 1,
      verificationMethod: data.verificationMethod || 'SMS'
    };
    
    // Add pin for DANA accounts
    if (data.action === 'dana-send-otp' && data.pin) {
      payload.pin = data.pin;
    }
    
    // Send the request
    return this.makeApiRequest('/api/v1/accounts', payload);
  }

  async verifyAccount(data) {
    // Basic validation
    if (!data.action || !data.sessionId || !data.otp) {
      return {
        success: false,
        message: 'Action, session ID, and OTP are required to verify the account'
      };
    }
    
    // Specific validation based on action
    if (data.action === 'ovo-verify-otp' && !data.pin) {
      return {
        success: false,
        message: 'PIN is required for OVO account verification'
      };
    }
    
    // Build the request payload
    const payload = {
      action: data.action,
      sessionId: data.sessionId,
      otp: data.otp
    };
    
    // Add pin for OVO accounts
    if (data.action === 'ovo-verify-otp' && data.pin) {
      payload.pin = data.pin;
    }
    
    return this.makeApiRequest('/api/v1/accounts', payload);
  }
}

module.exports = MutasikuSDK;