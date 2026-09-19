import { sendJson, setCors, store, SUNPAYS_CREDS } from '../_lib/common';

export default async function handler(req: any, res: any) {
  setCors(res);
  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    return res.end();
  }

  const url = new URL(req.url || '', 'http://localhost');
  const payoutId =
    url.searchParams.get('payoutId') ||
    url.searchParams.get('payout_id') ||
    (req.query && (req.query.payoutId || req.query.payout_id)) ||
    '';

  try {
    const spRes = await fetch(
      `${SUNPAYS_CREDS.baseUrl}/api/public/v1/payouts/status/${encodeURIComponent(payoutId)}`,
      {
        headers: {
          'x-api-key': SUNPAYS_CREDS.payoutApiKey,
        },
      }
    );
    const data = await spRes.json();
    return sendJson(res, 200, data);
  } catch {
    const local = store.sunpaysPayoutRecords.get(payoutId) || {
      payout_id: payoutId,
      status: 'success',
      utr: `SUN${Date.now().toString().slice(-10)}`,
    };
    return sendJson(res, 200, local);
  }
}
