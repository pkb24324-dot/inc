import { parseBody, sendJson, setCors, store } from '../_lib/common';

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
    const orderId = data.orderNo || data.orderId || data.mchOrderNo;
    if (orderId) {
      store.paidWatchPayOrders.set(orderId, {
        orderNo: orderId,
        status: 'completed',
        amount: data.amount,
        utr: data.utr || `UTR${Date.now()}`,
        timestamp: Date.now(),
      });
    }
    return sendJson(res, 200, { success: true, status: 'completed', orderNo: orderId });
  } catch (err: any) {
    return sendJson(res, 400, { error: err?.message || 'Invalid payload' });
  }
}
