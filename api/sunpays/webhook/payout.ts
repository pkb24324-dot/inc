import { parseBody, sendJson, setCors, store } from '../../_lib/common';

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
    const payoutId = data.payout_id || data.id;
    if (payoutId) {
      store.sunpaysPayoutRecords.set(payoutId, {
        ...data,
        status: data.status || 'success',
        timestamp: Date.now(),
      });
    }

    return sendJson(res, 200, { status: 'ok', received: true });
  } catch {
    return sendJson(res, 200, { status: 'ok' });
  }
}
