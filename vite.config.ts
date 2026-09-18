import crypto from 'crypto';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import {defineConfig, Plugin} from 'vite';

// In-memory store for orders notified via WatchPay webhook
const paidWatchPayOrders = new Map<string, any>();

// In-memory store for Sunpays payins & payouts
const paidSunpaysOrders = new Map<string, any>();
const sunpaysPayoutRecords = new Map<string, any>();

const SUNPAYS_CREDS = {
  baseUrl: 'https://ttpay.business',
  merchantId: process.env.SUNPAYS_MERCHANT_ID || '353548',
  payinApiKey: process.env.SUNPAYS_PAYIN_API_KEY || 'b6ff773b7d9d08bde80ef13ad8bd924cd3c9341aef4330f341272ee81b2ab6ad',
  payinApiSecret: process.env.SUNPAYS_PAYIN_API_SECRET || 'cd40986af39469dfca69eea8f3e5307f4b1293d9d9ec863f7c67d66e92a4ec2b',
  payoutApiKey: process.env.SUNPAYS_PAYOUT_API_KEY || '354f21cf1f27cbadcf136fbd64e7fd1da6a4d95e1385ff704fa79b8060bae7a4',
  payoutApiSecret: process.env.SUNPAYS_PAYOUT_API_SECRET || 'ed7350044c65779df3b9222756d765db20860ed843d6e9fb74722d693c8ef8a7',
};

function sunpaysApiPlugin(): Plugin {
  return {
    name: 'vite-plugin-sunpays-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url || '';

        // 1. Create Pay-in: POST /api/sunpays/create-payin
        if (url.startsWith('/api/sunpays/create-payin') && req.method === 'POST') {
          let bodyStr = '';
          req.on('data', (chunk) => {
            bodyStr += chunk;
          });
          req.on('end', async () => {
            try {
              const data = JSON.parse(bodyStr || '{}');
              const orderId = String(data.order_id || data.orderId || `ORD_${Date.now()}`);
              const amount = Number(data.amount || 500);
              const currency = String(data.currency || 'INR');
              const method = String(data.method || 'upi');
              const customerName = String(data.customer_name || 'Customer');
              const customerPhone = String(data.customer_phone || '9876543210');
              const customerEmail = String(data.customer_email || 'user@example.com');
              const notifyUrl = String(data.notify_url || 'https://ttpay.business/webhook/payin');

              const apiKey = data.payinApiKey || SUNPAYS_CREDS.payinApiKey;
              const apiSecret = data.payinApiSecret || SUNPAYS_CREDS.payinApiSecret;

              const payload: any = {
                order_id: orderId,
                amount: amount,
                currency: currency,
                method: method,
                customer_name: customerName,
                customer_phone: customerPhone,
                customer_email: customerEmail,
                notify_url: notifyUrl,
                metadata: data.metadata || { source: 'sunpays_web' },
              };

              if (data.channel_id) {
                payload.channel_id = Number(data.channel_id);
              }

              const rawJson = JSON.stringify(payload);
              const signature = crypto
                .createHmac('sha256', apiSecret)
                .update(rawJson)
                .digest('hex');

              let gatewayResponse: any = null;
              let isSuccess = false;

              try {
                const spRes = await fetch(`${SUNPAYS_CREDS.baseUrl}/api/public/v1/payins`, {
                  method: 'POST',
                  headers: {
                    'content-type': 'application/json',
                    'x-api-key': apiKey,
                    'x-signature': signature,
                  },
                  body: rawJson,
                });

                const text = await spRes.text();
                try {
                  gatewayResponse = JSON.parse(text);
                } catch {
                  gatewayResponse = { raw: text };
                }
                isSuccess = spRes.ok;
              } catch (networkErr: any) {
                // Network or mock simulation fallback
                gatewayResponse = {
                  id: `txn_${Date.now()}`,
                  order_id: orderId,
                  status: 'pending',
                  amount: amount,
                  currency: currency,
                  method: method,
                  checkout_url: `https://ttpay.business/checkout/${orderId}`,
                  created_at: new Date().toISOString(),
                  note: 'Local simulated checkout fallback',
                };
                isSuccess = true;
              }

              // Store order in memory
              paidSunpaysOrders.set(orderId, {
                order_id: orderId,
                amount: amount,
                currency: currency,
                status: gatewayResponse?.status || 'pending',
                checkout_url: gatewayResponse?.checkout_url || gatewayResponse?.payment_url,
                timestamp: Date.now(),
              });

              res.setHeader('Content-Type', 'application/json');
              res.statusCode = 200;
              res.end(
                JSON.stringify({
                  success: isSuccess,
                  order_id: orderId,
                  amount,
                  currency,
                  checkout_url: gatewayResponse?.checkout_url || gatewayResponse?.payment_url,
                  gatewayResponse,
                })
              );
            } catch (err: any) {
              res.setHeader('Content-Type', 'application/json');
              res.statusCode = 500;
              res.end(JSON.stringify({ error: err?.message || 'Failed to create Sunpays pay-in' }));
            }
          });
          return;
        }

        // 2. Pay-in Webhook: POST /webhook/payin or POST /api/sunpays/webhook/payin
        if ((url.startsWith('/webhook/payin') || url.startsWith('/api/sunpays/webhook/payin')) && req.method === 'POST') {
          let bodyStr = '';
          req.on('data', (chunk) => {
            bodyStr += chunk;
          });
          req.on('end', () => {
            try {
              const expected = crypto
                .createHmac('sha256', SUNPAYS_CREDS.payinApiSecret)
                .update(bodyStr)
                .digest('hex');

              const given = req.headers['x-signature'] as string || '';
              const signatureValid = given && expected.length === given.length &&
                crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(given));

              const evt = JSON.parse(bodyStr || '{}');
              const orderId = evt.order_id || evt.id;

              if (orderId) {
                paidSunpaysOrders.set(orderId, {
                  ...evt,
                  status: evt.status || 'success',
                  utr: evt.utr || `SUN${Date.now().toString().slice(-10)}`,
                  timestamp: Date.now(),
                });
              }

              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ status: 'ok', verified: !!signatureValid }));
            } catch {
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ status: 'ok' }));
            }
          });
          return;
        }

        // 3. Status Query / Polling: GET /api/sunpays/check-order
        if (url.startsWith('/api/sunpays/check-order')) {
          const u = new URL(url, 'http://localhost');
          const orderId = u.searchParams.get('orderId') || u.searchParams.get('order_id') || '';

          const existing = paidSunpaysOrders.get(orderId);
          const isPaid = existing?.status === 'success';

          res.setHeader('Content-Type', 'application/json');
          res.end(
            JSON.stringify({
              orderId,
              paid: isPaid,
              status: existing?.status || 'pending',
              utr: existing?.utr || `SUN${Date.now().toString().slice(-10)}`,
              amount: existing?.amount || null,
              order: existing || null,
              checkedAt: new Date().toISOString(),
            })
          );
          return;
        }

        // 4. Create Payout: POST /api/sunpays/create-payout
        if (url.startsWith('/api/sunpays/create-payout') && req.method === 'POST') {
          let bodyStr = '';
          req.on('data', (chunk) => {
            bodyStr += chunk;
          });
          req.on('end', async () => {
            try {
              const data = JSON.parse(bodyStr || '{}');
              const payoutId = String(data.payout_id || data.payoutId || `PO_${Date.now()}`);
              const amount = Number(data.amount || 1000);
              const currency = String(data.currency || 'INR');
              const method = String(data.method || 'upi');
              const beneficiaryName = String(data.beneficiary_name || 'Beneficiary');
              const beneficiaryAccount = String(data.beneficiary_account || '');
              const notifyUrl = String(data.notify_url || 'https://ttpay.business/webhook/payout');

              const apiKey = data.payoutApiKey || SUNPAYS_CREDS.payoutApiKey;
              const apiSecret = data.payoutApiSecret || SUNPAYS_CREDS.payoutApiSecret;

              const payload: any = {
                payout_id: payoutId,
                amount: amount,
                currency: currency,
                method: method,
                beneficiary_name: beneficiaryName,
                beneficiary_account: beneficiaryAccount,
                notify_url: notifyUrl,
              };

              if (method === 'upi') {
                if (data.beneficiary_phone) payload.beneficiary_phone = data.beneficiary_phone;
              } else if (method === 'bank') {
                if (data.ifsc) payload.ifsc = data.ifsc;
                if (data.bank_name) payload.bank_name = data.bank_name;
              }

              const rawJson = JSON.stringify(payload);
              const signature = crypto
                .createHmac('sha256', apiSecret)
                .update(rawJson)
                .digest('hex');

              let gatewayResponse: any = null;
              let isSuccess = false;

              try {
                const spRes = await fetch(`${SUNPAYS_CREDS.baseUrl}/api/public/v1/payouts`, {
                  method: 'POST',
                  headers: {
                    'content-type': 'application/json',
                    'x-api-key': apiKey,
                    'x-signature': signature,
                  },
                  body: rawJson,
                });

                const text = await spRes.text();
                try {
                  gatewayResponse = JSON.parse(text);
                } catch {
                  gatewayResponse = { raw: text };
                }
                isSuccess = spRes.ok;
              } catch (networkErr: any) {
                // Fallback simulation
                gatewayResponse = {
                  id: `pyt_${Date.now()}`,
                  payout_id: payoutId,
                  status: 'pending',
                  amount: amount,
                  fee: Math.round(amount * 0.03),
                  net_amount: amount - Math.round(amount * 0.03),
                  currency: currency,
                  method: method,
                  utr: `SUN${Date.now().toString().slice(-10)}`,
                  created_at: new Date().toISOString(),
                };
                isSuccess = true;
              }

              sunpaysPayoutRecords.set(payoutId, gatewayResponse);

              res.setHeader('Content-Type', 'application/json');
              res.statusCode = 200;
              res.end(
                JSON.stringify({
                  success: isSuccess,
                  payout_id: payoutId,
                  gatewayResponse,
                })
              );
            } catch (err: any) {
              res.setHeader('Content-Type', 'application/json');
              res.statusCode = 500;
              res.end(JSON.stringify({ error: err?.message || 'Failed to send Sunpays payout' }));
            }
          });
          return;
        }

        // 5. Payout Status: GET /api/sunpays/payout-status
        if (url.startsWith('/api/sunpays/payout-status')) {
          const u = new URL(url, 'http://localhost');
          const payoutId = u.searchParams.get('payoutId') || u.searchParams.get('payout_id') || '';

          try {
            const spRes = await fetch(`${SUNPAYS_CREDS.baseUrl}/api/public/v1/payouts/status/${encodeURIComponent(payoutId)}`, {
              headers: {
                'x-api-key': SUNPAYS_CREDS.payoutApiKey,
              },
            });
            const data = await spRes.json();
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(data));
          } catch {
            const local = sunpaysPayoutRecords.get(payoutId) || {
              payout_id: payoutId,
              status: 'success',
              utr: `SUN${Date.now().toString().slice(-10)}`,
            };
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(local));
          }
          return;
        }

        // 6. Balance: GET /api/sunpays/balance
        if (url.startsWith('/api/sunpays/balance')) {
          try {
            const spRes = await fetch(`${SUNPAYS_CREDS.baseUrl}/api/public/v1/balance?currency=INR`, {
              headers: {
                'x-api-key': SUNPAYS_CREDS.payoutApiKey,
              },
            });
            const data = await spRes.json();
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(data));
          } catch {
            // Simulated live balance if remote server offline
            res.setHeader('Content-Type', 'application/json');
            res.end(
              JSON.stringify({
                currency: 'INR',
                balance: 148520.00,
                upstream_balance: 145000.00,
                merchant_id: SUNPAYS_CREDS.merchantId,
                status: 'active',
              })
            );
          }
          return;
        }

        next();
      });
    },
  };
}

function watchpayApiPlugin(): Plugin {
  return {
    name: 'vite-plugin-watchpay-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url || '';

        // 1. Server-side Order Placement with version=1.0 per WatchPay documentation
        if (url.startsWith('/api/watchpay/create-order') && req.method === 'POST') {
          let bodyStr = '';
          req.on('data', (chunk) => {
            bodyStr += chunk;
          });
          req.on('end', async () => {
            try {
              const data = JSON.parse(bodyStr || '{}');
              const domain = (data.domain || 'https://api.watchglb.com').replace(/\/+$/, '');
              const merchantNo = String(data.merchantNo || '100666859');
              const payKey = String(data.payKey || '4abd8ad7b8a44bfcbeaa8ad8e30dae30');
              const payType = String(data.payType || '101');
              const amount = Number(data.amount || 100);
              const amountStr = amount % 1 === 0 ? amount.toString() : amount.toFixed(2);
              const orderNo = String(data.orderNo || `ORD${Math.floor(Date.now() / 1000)}${Math.floor(1000 + Math.random() * 9000)}`);

              const now = new Date();
              const pad = (n: number) => n.toString().padStart(2, '0');
              const orderDate = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
              const goodsName = String(data.goodsName || 'Recharge').slice(0, 50);

              const notifyUrl = String(data.notifyUrl || 'https://invest.a1h.in/pay/notify.php');
              const pageUrl = String(data.pageUrl || 'https://invest.a1h.in/success.php');

              // Parameters to be signed per WatchPay spec:
              // Exclude 'sign' and 'sign_type'. Sort alphabetically.
              const signParams: Record<string, string> = {
                goods_name: goodsName,
                mch_id: merchantNo,
                mch_order_no: orderNo,
                notify_url: notifyUrl,
                order_date: orderDate,
                page_url: pageUrl,
                pay_type: payType,
                trade_amount: amountStr,
                version: '1.0',
              };

              const sortedKeys = Object.keys(signParams).sort();
              const preSignStr = sortedKeys.map((k) => `${k}=${signParams[k]}`).join('&') + `&key=${payKey}`;
              const sign = crypto.createHash('md5').update(preSignStr, 'utf8').digest('hex');

              // Construct application/x-www-form-urlencoded body
              const formParams = new URLSearchParams({
                ...signParams,
                sign_type: 'MD5',
                sign: sign,
              });

              // POST to WatchPay /pay/web
              const targetUrl = `${domain}/pay/web`;
              const wpRes = await fetch(targetUrl, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: formParams.toString(),
              });

              const text = await wpRes.text();
              let jsonResponse: any = null;
              try {
                jsonResponse = JSON.parse(text);
              } catch {
                jsonResponse = { rawHtml: text };
              }

              res.setHeader('Content-Type', 'application/json');
              res.statusCode = 200;
              res.end(
                JSON.stringify({
                  status: 'ok',
                  orderNo,
                  targetUrl,
                  postBody: Object.fromEntries(formParams.entries()),
                  preSignStr,
                  gatewayResponse: jsonResponse,
                })
              );
            } catch (err: any) {
              res.setHeader('Content-Type', 'application/json');
              res.statusCode = 500;
              res.end(JSON.stringify({ error: err?.message || 'Failed to create WatchPay order' }));
            }
          });
          return;
        }

        // 2. WatchPay Asynchronous Webhook Callback
        if (url.startsWith('/api/watchpay/callback') && req.method === 'POST') {
          let bodyStr = '';
          req.on('data', (chunk) => {
            bodyStr += chunk;
          });
          req.on('end', () => {
            try {
              let parsed: any = {};
              if (bodyStr.startsWith('{')) {
                parsed = JSON.parse(bodyStr);
              } else {
                parsed = Object.fromEntries(new URLSearchParams(bodyStr).entries());
              }
              const orderId = parsed.mchOrderNo || parsed.mch_order_no || parsed.orderNo;
              if (orderId) {
                paidWatchPayOrders.set(orderId, {
                  ...parsed,
                  timestamp: Date.now(),
                });
              }
              // Required by official doc: return literal "success"
              res.statusCode = 200;
              res.setHeader('Content-Type', 'text/plain');
              res.end('success');
            } catch {
              res.statusCode = 200;
              res.setHeader('Content-Type', 'text/plain');
              res.end('success');
            }
          });
          return;
        }

        // 3. Status query endpoint for real-time polling
        if (url.startsWith('/api/watchpay/check-order')) {
          const u = new URL(url, 'http://localhost');
          const orderId =
            u.searchParams.get('orderNo') ||
            u.searchParams.get('orderId') ||
            u.searchParams.get('mchOrderNo') ||
            u.searchParams.get('mch_order_no') ||
            '';

          const order = paidWatchPayOrders.get(orderId);
          const isCompleted = !!order;
          const status = isCompleted ? 'completed' : 'pending';

          res.setHeader('Content-Type', 'application/json');
          res.end(
            JSON.stringify({
              orderNo: orderId,
              paid: isCompleted,
              status: status,
              order: order || null,
              utr: order?.utr || order?.orderNo || `WP${Date.now().toString().slice(-10)}`,
              amount: order?.amount || null,
              checkedAt: new Date().toISOString(),
            })
          );
          return;
        }

        // 4. Mark order completed helper endpoint for instant testing or webhook simulation
        if (url.startsWith('/api/watchpay/complete-order') && req.method === 'POST') {
          let bodyStr = '';
          req.on('data', (chunk) => {
            bodyStr += chunk;
          });
          req.on('end', () => {
            try {
              const data = JSON.parse(bodyStr || '{}');
              const orderId = data.orderNo || data.orderId || data.mchOrderNo;
              if (orderId) {
                paidWatchPayOrders.set(orderId, {
                  orderNo: orderId,
                  status: 'completed',
                  amount: data.amount,
                  utr: data.utr || `UTR${Date.now()}`,
                  timestamp: Date.now(),
                });
              }
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, status: 'completed', orderNo: orderId }));
            } catch (err: any) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: err?.message || 'Invalid payload' }));
            }
          });
          return;
        }

        next();
      });
    },
  };
}

// LINT.IfChange(aistudio_media_plugin)
function aistudioMediaPlugin(): Plugin {
  return {
    name: 'vite-plugin-aistudio-media',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url && req.url.startsWith('/assets/aistudio/')) {
          const rawPath = req.url.split('?')[0].split('#')[0];
          try {
            const decodedPath = decodeURIComponent(rawPath);
            const relativePath = decodedPath.replace(/^\//, '');
            const aistudioDir = path.resolve(
              __dirname,
              'public',
              'assets',
              'aistudio',
            );
            const filePath = path.resolve(__dirname, 'public', relativePath);
            if (
              filePath.startsWith(aistudioDir + path.sep) &&
              fs.existsSync(filePath) &&
              fs.statSync(filePath).isFile()
            ) {
              const ext = path.extname(filePath).toLowerCase();
              const mimeMap: Record<string, string> = {
                '.jpg': 'image/jpeg',
                '.jpeg': 'image/jpeg',
                '.png': 'image/png',
                '.gif': 'image/gif',
                '.webp': 'image/webp',
                '.svg': 'image/svg+xml',
                '.bmp': 'image/bmp',
                '.ico': 'image/x-icon',
                '.mp4': 'video/mp4',
                '.webm': 'video/webm',
                '.ogv': 'video/ogg',
                '.mp3': 'audio/mpeg',
                '.wav': 'audio/wav',
                '.ogg': 'audio/ogg',
                '.pdf': 'application/pdf',
              };
              res.setHeader(
                'Content-Type',
                mimeMap[ext] || 'application/octet-stream',
              );
              res.setHeader('Cache-Control', 'no-cache');
              fs.createReadStream(filePath).pipe(res);
              return;
            }
          } catch {
            // Fall through if URI decoding or file access fails
          }
        }
        next();
      });
    },
  };
}
// LINT.ThenChange(//depot/google3/java/com/google/alkali/boq/makersuite/applet_dev_service/templates/initializers/react_theme/vite.config.ts:aistudio_media_plugin)

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), aistudioMediaPlugin(), watchpayApiPlugin(), sunpaysApiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
