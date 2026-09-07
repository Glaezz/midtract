declare module 'midtrans-client' {
  export interface MidtransClientOptions {
    isProduction: boolean;
    serverKey: string;
    clientKey: string;
  }

  export interface TransactionDetails {
    order_id: string;
    gross_amount: number;
  }

  export interface SnapItemDetail {
    id: string;
    price: number;
    quantity: number;
    name: string;
  }

  export interface SnapTransactionParameters {
    transaction_details: TransactionDetails;
    item_details?: SnapItemDetail[];
    enabled_payments?: string[];
    [key: string]: unknown;
  }

  export interface SnapTransactionResponse {
    token: string;
    redirect_url: string;
  }

  export class Transaction {
    status(transactionId: string): Promise<Record<string, unknown>>;
    statusb2b(transactionId: string): Promise<Record<string, unknown>>;
    approve(transactionId: string): Promise<Record<string, unknown>>;
    deny(transactionId: string): Promise<Record<string, unknown>>;
    cancel(transactionId: string): Promise<Record<string, unknown>>;
    expire(transactionId: string): Promise<Record<string, unknown>>;
    refund(transactionId: string, parameter?: Record<string, unknown>): Promise<Record<string, unknown>>;
    refundDirect(transactionId: string, parameter?: Record<string, unknown>): Promise<Record<string, unknown>>;
    notification(notificationObj: unknown): Promise<Record<string, unknown>>;
  }

  export class Snap {
    constructor(options: MidtransClientOptions);
    transaction: Transaction;
    createTransaction(parameter: SnapTransactionParameters): Promise<SnapTransactionResponse>;
    createTransactionToken(parameter: SnapTransactionParameters): Promise<string>;
    createTransactionRedirectUrl(parameter: SnapTransactionParameters): Promise<string>;
  }

  export class CoreApi {
    constructor(options: MidtransClientOptions);
    charge(parameter: Record<string, unknown>): Promise<Record<string, unknown>>;
  }
}
