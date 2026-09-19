import { sendJson, setCors, store } from '../_lib/common';

export default async function handler(req: any, res: any) {
  setCors(res);
  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    return res.end();
  }

  const url = new URL(req.url || '', 'http://localhost');
  const orderId =
    url.searchParams.get('orderNo') ||
    url.searchParams.get('orderId') ||
    url.searchParams.get('mchOrderNo') ||
    url.searchParams.get('mch_order_no') ||
    (req.query && (req.query.orderNo || req.query.orderId || req.query.mchOrderNo || req.query.mch_order_no)) ||
    '';

  const order = store.paidWatchPayOrders.get(orderId);
  const isCompleted = !!order;
  const status = isCompleted ? 'completed' : 'pending';

  return sendJson(res, 200, {
    orderNo: orderId,
    paid: isCompleted,
    status: status,
    order: order || null,
    utr: order?.utr || order?.orderNo || `WP${Date.now().toString().slice(-10)}`,
    amount: order?.amount || null,
    checkedAt: new Date().toISOString(),
  });
}
