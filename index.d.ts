declare module 'mutasiku-sdk' {
    export interface MutasikuSDKOptions {
      apiKey: string;
      logger?: Console;
    }
  
    export interface AccountOptions {
      limit?: number;
      page?: number;
      type?: string;
      isActive?: boolean;
      providerCode?: string;
    }
  
    export interface MutasiOptions {
      limit?: number;
      page?: number;
      days?: number;
      startDate?: string;
      endDate?: string;
      accountId?: string;
      type?: string;
      providerCode?: string;
      minAmount?: number;
      maxAmount?: number;
      search?: string;
    }
  
    export interface AddAccountData {
      action: string;
      phoneNumber: string;
      accountName: string;
      intervalMinutes: number;
      verificationMethod: string;
      providerCode: string;
      pin?: string;
    }
  
    export interface VerifyAccountData {
      action: string;
      sessionId: string;
      otp: string;
      pin?: string;
    }
  
    export default class MutasikuSDK {
      constructor(options: MutasikuSDKOptions);
      
      makeApiRequest(endpoint: string, data?: any, method?: string): Promise<any>;
      
      getAccounts(options?: AccountOptions): Promise<any>;
      
      getAccountById(accountId: string): Promise<any>;
      
      removeAccount(accountId: string): Promise<any>;
      
      getMutasi(options?: MutasiOptions): Promise<any>;
      
      addAccount(data: AddAccountData): Promise<any>;
      
      verifyAccount(data: VerifyAccountData): Promise<any>;
    }
  }