// Sunpays Gateway API Utility (ttpay.business)
// Comprehensive integration for pay-ins, payouts, balance, and callbacks

export const SUNPAYS_DEFAULT_CONFIG = {
  baseUrl: 'https://ttpay.business',
  merchantId: '353548',
  payinApiKey: 'b6ff773b7d9d08bde80ef13ad8bd924cd3c9341aef4330f341272ee81b2ab6ad',
  payinApiSecret: 'cd40986af39469dfca69eea8f3e5307f4b1293d9d9ec863f7c67d66e92a4ec2b',
  payoutApiKey: '354f21cf1f27cbadcf136fbd64e7fd1da6a4d95e1385ff704fa79b8060bae7a4',
  payoutApiSecret: 'ed7350044c65779df3b9222756d765db20860ed843d6e9fb74722d693c8ef8a7',
  currency: 'INR',
};

export interface SunpaysPayinOrderParams {
  order_id: string;
  amount: number;
  currency?: string;
  method?: 'upi' | 'bank' | 'usdt';
  customer_name?: string;
  customer_phone?: string;
  customer_email?: string;
  notify_url?: string;
  channel_id?: number;
  metadata?: Record<string, any>;
}

export interface SunpaysPayoutParams {
  payout_id: string;
  amount: number;
  currency?: string;
  method: 'upi' | 'bank' | 'usdt';
  beneficiary_name: string;
  beneficiary_account: string;
  beneficiary_phone?: string;
  ifsc?: string;
  bank_name?: string;
  notify_url?: string;
}

export interface SunpaysPayinResponse {
  id?: string;
  order_id: string;
  status: 'pending' | 'processing' | 'success' | 'failed' | 'expired';
  amount: number;
  currency: string;
  method: string;
  checkout_url?: string;
  payment_url?: string;
  redirect_url?: string;
  created_at?: string;
  error?: string;
}

export interface SunpaysPayoutResponse {
  id?: string;
  payout_id: string;
  status: 'pending' | 'processing' | 'success' | 'failed';
  amount: number;
  fee?: number;
  net_amount?: number;
  currency: string;
  method: string;
  utr?: string;
  created_at?: string;
  error?: string;
}

export interface SunpaysBalanceResponse {
  currency: string;
  balance: number;
  upstream_balance?: number;
  error?: string;
}

/**
 * Call local backend endpoint to create Sunpays Pay-in order with server-side HMAC-SHA256 signature
 */
export async function createSunpaysPayin(params: SunpaysPayinOrderParams): Promise<{
  success: boolean;
  data?: SunpaysPayinResponse;
  checkout_url?: string;
  error?: string;
}> {
  try {
    const res = await fetch('/api/sunpays/create-payin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const data = await res.json();
    if (!res.ok || data.error) {
      return { success: false, error: data.error || 'Payment gateway returned an error' };
    }
    return {
      success: true,
      data: data.gatewayResponse || data,
      checkout_url: data.checkout_url || data.gatewayResponse?.checkout_url || data.gatewayResponse?.payment_url,
    };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Network request failed' };
  }
}

/**
 * Check pay-in order status via polling
 */
export async function checkSunpaysOrder(orderId: string): Promise<{
  paid: boolean;
  status: string;
  utr?: string;
  amount?: number;
  order?: any;
}> {
  try {
    const res = await fetch(`/api/sunpays/check-order?orderId=${encodeURIComponent(orderId)}`);
    return await res.json();
  } catch {
    return { paid: false, status: 'pending' };
  }
}

/**
 * Call local backend to initiate a real Payout via Sunpays Payout API
 */
export async function sendSunpaysPayout(params: SunpaysPayoutParams): Promise<{
  success: boolean;
  data?: SunpaysPayoutResponse;
  error?: string;
}> {
  try {
    const res = await fetch('/api/sunpays/create-payout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const data = await res.json();
    if (!res.ok || data.error) {
      return { success: false, error: data.error || 'Payout failed' };
    }
    return {
      success: true,
      data: data.gatewayResponse || data,
    };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Network request failed' };
  }
}

/**
 * Fetch Merchant balance from Sunpays API
 */
export async function fetchSunpaysBalance(): Promise<SunpaysBalanceResponse> {
  try {
    const res = await fetch('/api/sunpays/balance');
    return await res.json();
  } catch (err: any) {
    return { currency: 'INR', balance: 0, error: err?.message || 'Failed to fetch balance' };
  }
}
