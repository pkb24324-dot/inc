import { sendJson, setCors } from './_lib/common';

export default async function handler(req: any, res: any) {
  setCors(res);
  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    return res.end();
  }

  return sendJson(res, 200, {
    status: 'ok',
    platform: 'AM invest',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: process.env.VERCEL ? 'vercel' : 'standard',
  });
}
