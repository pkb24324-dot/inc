import crypto from 'crypto';

// Persistent global store across warm serverless invocations
interface Store {
  paidWatchPayOrders: Map<string, any>;
  paidSunpaysOrders: Map<string, any>;
  sunpaysPayoutRecords: Map<string, any>;
}

const g = globalThis as unknown as { __am_invest_store?: Store };
if (!g.__am_invest_store) {
  g.__am_invest_store = {
    paidWatchPayOrders: new Map<string, any>(),
    paidSunpaysOrders: new Map<string, any>(),
    sunpaysPayoutRecords: new Map<string, any>(),
  };
}

export const store = g.__am_invest_store;

export const SUNPAYS_CREDS = {
  baseUrl: 'https://ttpay.business',
  merchantId: process.env.SUNPAYS_MERCHANT_ID || '353548',
  payinApiKey: process.env.SUNPAYS_PAYIN_API_KEY || 'b6ff773b7d9d08bde80ef13ad8bd924cd3c9341aef4330f341272ee81b2ab6ad',
  payinApiSecret: process.env.SUNPAYS_PAYIN_API_SECRET || 'cd40986af39469dfca69eea8f3e5307f4b1293d9d9ec863f7c67d66e92a4ec2b',
  payoutApiKey: process.env.SUNPAYS_PAYOUT_API_KEY || '354f21cf1f27cbadcf136fbd64e7fd1da6a4d95e1385ff704fa79b8060bae7a4',
  payoutApiSecret: process.env.SUNPAYS_PAYOUT_API_SECRET || 'ed7350044c65779df3b9222756d765db20860ed843d6e9fb74722d693c8ef8a7',
};

export function setCors(res: any) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, x-api-key, x-signature'
  );
}

export async function parseBody(req: any): Promise<any> {
  if (req.body) {
    if (typeof req.body === 'string') {
      try {
        return JSON.parse(req.body);
      } catch {
        return req.body;
      }
    }
    return req.body;
  }

  return new Promise((resolve) => {
    let data = '';
    req.on('data', (chunk: any) => {
      data += chunk;
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(data || '{}'));
      } catch {
        resolve(data);
      }
    });
  });
}

export function sendJson(res: any, status: number, data: any) {
  setCors(res);
  if (typeof res.status === 'function' && typeof res.json === 'function') {
    return res.status(status).json(data);
  }
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(data));
}

export function sendText(res: any, status: number, text: string) {
  setCors(res);
  if (typeof res.status === 'function' && typeof res.send === 'function') {
    return res.status(status).send(text);
  }
  res.statusCode = status;
  res.setHeader('Content-Type', 'text/plain');
  res.end(text);
}
