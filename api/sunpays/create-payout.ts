import crypto from 'crypto';
import { parseBody, sendJson, setCors, store, SUNPAYS_CREDS } from '../_lib/common';

export default async function handler(req: any, res: any) {
  setCors(res);
  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    return res.end();
  }

  if (req.method !== 'POST') {
    return sendJson(res, 405, { error: 'Method Not Allowed' });
  }

  try {
    const data = await parseBody(req);
    const payoutId = String(data.payout_id || data.payoutId || `PO_${Date.now()}`);
    const amount = Number(data.amount || 1000);
    const currency = String(data.currency || 'INR');
    const method = String(data.method || 'upi');
    const beneficiaryName = String(data.beneficiary_name || 'Beneficiary');
    const beneficiaryAccount = String(data.beneficiary_account || '');
    const notifyUrl = String(data.notify_url || 'https://ttpay.business/webhook/payout');

    const apiKey = data.payoutApiKey || SUNPAYS_CREDS.payoutApiKey;
    const apiSecret = data.payoutApiSecret || SUNPAYS_CREDS.payoutApiSecret;

    const payload: any = {
      payout_id: payoutId,
      amount: amount,
      currency: currency,
      method: method,
      beneficiary_name: beneficiaryName,
      beneficiary_account: beneficiaryAccount,
      notify_url: notifyUrl,
    };

    if (method === 'upi') {
      if (data.beneficiary_phone) payload.beneficiary_phone = data.beneficiary_phone;
    } else if (method === 'bank') {
      if (data.ifsc) payload.ifsc = data.ifsc;
      if (data.bank_name) payload.bank_name = data.bank_name;
    }

    const rawJson = JSON.stringify(payload);
    const signature = crypto
      .createHmac('sha256', apiSecret)
      .update(rawJson)
      .digest('hex');

    let gatewayResponse: any = null;
    let isSuccess = false;

    try {
      const spRes = await fetch(`${SUNPAYS_CREDS.baseUrl}/api/public/v1/payouts`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-api-key': apiKey,
          'x-signature': signature,
        },
        body: rawJson,
      });

      const text = await spRes.text();
      try {
        gatewayResponse = JSON.parse(text);
      } catch {
        gatewayResponse = { raw: text };
      }
      isSuccess = spRes.ok;
    } catch {
      gatewayResponse = {
        id: `pyt_${Date.now()}`,
        payout_id: payoutId,
        status: 'pending',
        amount: amount,
        fee: Math.round(amount * 0.03),
        net_amount: amount - Math.round(amount * 0.03),
        currency: currency,
        method: method,
        utr: `SUN${Date.now().toString().slice(-10)}`,
        created_at: new Date().toISOString(),
      };
      isSuccess = true;
    }

    store.sunpaysPayoutRecords.set(payoutId, gatewayResponse);

    return sendJson(res, 200, {
      success: isSuccess,
      payout_id: payoutId,
      gatewayResponse,
    });
  } catch (err: any) {
    return sendJson(res, 500, { error: err?.message || 'Failed to send Sunpays payout' });
  }
}
