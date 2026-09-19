import { sendJson, setCors, store } from '../_lib/common';

export default async function handler(req: any, res: any) {
  setCors(res);
  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    return res.end();
  }

  const url = new URL(req.url || '', 'http://localhost');
  const orderId =
    url.searchParams.get('orderId') ||
    url.searchParams.get('order_id') ||
    (req.query && (req.query.orderId || req.query.order_id)) ||
    '';

  const existing = store.paidSunpaysOrders.get(orderId);
  const isPaid = existing?.status === 'success';

  return sendJson(res, 200, {
    orderId,
    paid: isPaid,
    status: existing?.status || 'pending',
    utr: existing?.utr || `SUN${Date.now().toString().slice(-10)}`,
    amount: existing?.amount || null,
    order: existing || null,
    checkedAt: new Date().toISOString(),
  });
}
