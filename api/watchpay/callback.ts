import { parseBody, sendText, setCors, store } from '../_lib/common';

export default async function handler(req: any, res: any) {
  setCors(res);
  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    return res.end();
  }

  if (req.method !== 'POST') {
    return sendText(res, 405, 'Method Not Allowed');
  }

  try {
    const data = await parseBody(req);
    const orderId = data.mchOrderNo || data.mch_order_no || data.orderNo;
    if (orderId) {
      store.paidWatchPayOrders.set(orderId, {
        ...data,
        timestamp: Date.now(),
      });
    }
    // WatchPay requires literal "success"
    return sendText(res, 200, 'success');
  } catch {
    return sendText(res, 200, 'success');
  }
}
