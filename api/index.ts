import { sendJson, setCors } from './_lib/common';

export default async function handler(req: any, res: any) {
  setCors(res);
  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    return res.end();
  }

  return sendJson(res, 200, {
    status: 'ok',
    app: 'AM invest Financial API',
    endpoints: [
      '/api/health',
      '/api/watchpay/create-order',
      '/api/watchpay/check-order',
      '/api/watchpay/callback',
      '/api/sunpays/create-payin',
      '/api/sunpays/check-order',
      '/api/sunpays/balance',
      '/api/sunpays/create-payout',
    ],
    timestamp: new Date().toISOString(),
  });
}
