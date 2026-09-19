import crypto from 'crypto';
import { parseBody, sendJson, setCors, store, SUNPAYS_CREDS } from '../../_lib/common';

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
    const rawBody = typeof req.body === 'string' ? req.body : JSON.stringify(data);

    const expected = crypto
      .createHmac('sha256', SUNPAYS_CREDS.payinApiSecret)
      .update(rawBody)
      .digest('hex');

    const given = (req.headers['x-signature'] as string) || '';
    const signatureValid =
      given &&
      expected.length === given.length &&
      crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(given));

    const orderId = data.order_id || data.id;
    if (orderId) {
      store.paidSunpaysOrders.set(orderId, {
        ...data,
        status: data.status || 'success',
        utr: data.utr || `SUN${Date.now().toString().slice(-10)}`,
        timestamp: Date.now(),
      });
    }

    return sendJson(res, 200, { status: 'ok', verified: !!signatureValid });
  } catch {
    return sendJson(res, 200, { status: 'ok' });
  }
}
