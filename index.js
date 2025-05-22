// index.js
import axios from 'axios';

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
  async makeApiRequest(endpoint, data = null, method = 'POST', isFormData = false) {
    try {
      const url = `${this.apiBaseUrl}${endpoint}`;
      
      const config = {
        method,
        url,
        headers: {
          'x-api-key': this.apiKey
        }
      };

      // Set content type based on data type
      if (!isFormData) {
        config.headers['Content-Type'] = 'application/json';
      }
      // For FormData, don't set Content-Type - let axios handle it
      
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

  /**
   * Get available bank options for DANA transfer
   * @param {string} accountId - DANA account ID
   * @returns {Promise} API response with bank options
   */
  async getDanaBanks(accountId) {
    if (!accountId) {
      return {
        success: false,
        message: 'Account ID is required'
      };
    }

    const payload = {
      action: 'dana-bank-list'
    };

    return this.makeApiRequest(`/api/v1/accounts/${accountId}/transfer`, payload);
  }

  /**
   * Upload QR code for DANA QRIS payment
   * @param {string} accountId - DANA account ID
   * @param {File|Blob} qrImage - QR code image file
   * @param {number} amount - Payment amount
   * @returns {Promise} API response with transfer result
   */
  async transferDanaQris(accountId, qrImage, amount) {
    if (!accountId) {
      return {
        success: false,
        message: 'Account ID is required'
      };
    }

    if (!qrImage) {
      return {
        success: false,
        message: 'QR image is required'
      };
    }

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return {
        success: false,
        message: 'Valid amount is required'
      };
    }

    // Create FormData for file upload
    const formData = new FormData();
    formData.append('action', 'dana-qris-create');
    formData.append('qrImage', qrImage);
    formData.append('amount', amount.toString());

    return this.makeApiRequest(`/api/v1/accounts/${accountId}/transfer`, formData, 'POST', true);
  }

  /**
   * Initialize DANA bank transfer (check account name)
   * @param {string} accountId - DANA account ID
   * @param {Object} transferData - Transfer details
   * @param {string} transferData.accountNumber - Destination bank account number
   * @param {number} transferData.amount - Transfer amount
   * @param {string} transferData.instId - Bank institution ID
   * @param {string} transferData.instLocalName - Bank local name
   * @param {string} transferData.payMethod - Payment method
   * @param {string} transferData.payOption - Payment option
   * @returns {Promise} API response with account name verification
   */
  async transferDanaBankInit(accountId, transferData) {
    if (!accountId) {
      return {
        success: false,
        message: 'Account ID is required'
      };
    }

    // Validation
    const requiredFields = ['accountNumber', 'amount', 'instId', 'instLocalName', 'payMethod', 'payOption'];
    const missingFields = requiredFields.filter(field => !transferData[field]);
    
    if (missingFields.length > 0) {
      return {
        success: false,
        message: `Required fields missing: ${missingFields.join(', ')}`
      };
    }

    // Amount validation
    if (typeof transferData.amount !== 'number' || transferData.amount <= 0) {
      return {
        success: false,
        message: 'Amount must be a positive number'
      };
    }

    if (transferData.amount < 10000) {
      return {
        success: false,
        message: 'Minimum transfer amount is Rp 10,000'
      };
    }

    const payload = {
      action: 'dana-bank-init',
      accountNumber: transferData.accountNumber,
      amount: transferData.amount,
      instId: transferData.instId,
      instLocalName: transferData.instLocalName,
      payMethod: transferData.payMethod,
      payOption: transferData.payOption
    };

    return this.makeApiRequest(`/api/v1/accounts/${accountId}/transfer`, payload);
  }

   /**
   * Confirm DANA bank transfer flow (get banks -> init -> confirm)
   * @param {string} accountId - DANA account ID
   * @param {number} transferData.amount - Transfer amount
   * @param {Object} transferData.bankAccountIndexNo - Bank Account Index No
   * @returns {Promise} API response with transfer confirmation
   */
   async transferDanaBankCreate(accountId, transferData) {
    if (!accountId) {
      return {
        success: false,
        message: 'Account ID is required'
      };
    }

    // Validation
    const requiredFields = ['amount', 'bankAccountIndexNo'];
    const missingFields = requiredFields.filter(field => !transferData[field]);
    
    if (missingFields.length > 0) {
      return {
        success: false,
        message: `Required fields missing: ${missingFields.join(', ')}`
      };
    }

    // Amount validation
    if (typeof transferData.amount !== 'number' || transferData.amount <= 0) {
      return {
        success: false,
        message: 'Amount must be a positive number'
      };
    }

    if (transferData.amount < 10000) {
      return {
        success: false,
        message: 'Minimum transfer amount is Rp 10,000'
      };
    }

    const payload = {
      action: 'dana-bank-create',
      amount: transferData.amount,
      bankAccountIndexNo: transferData.bankAccountIndexNo
    };

    return this.makeApiRequest(`/api/v1/accounts/${accountId}/transfer`, payload);
  }
}

export default MutasikuSDK;