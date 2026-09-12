import crypto from 'crypto';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import {defineConfig, Plugin} from 'vite';

// In-memory store for orders notified via WatchPay webhook
const paidWatchPayOrders = new Map<string, any>();

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
              const domain = (data.domain || 'https://interface.sskking.com').replace(/\/+$/, '');
              const merchantNo = String(data.merchantNo || '100666859');
              const payKey = String(data.payKey || '4abd8ad7b8a44bfcbeaa8ad8e30dae30');
              const payType = String(data.payType || '101');
              const amount = Number(data.amount || 100);
              const amountStr = amount % 1 === 0 ? amount.toString() : amount.toFixed(2);
              const orderNo = String(data.orderNo || `WP${Date.now()}${Math.floor(100 + Math.random() * 900)}`);

              const now = new Date();
              const pad = (n: number) => n.toString().padStart(2, '0');
              const orderDate = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
              const goodsName = String(data.goodsName || `Recharge ${amountStr}`).slice(0, 50);

              const reqHost = req.headers.host || 'localhost:3000';
              const proto = (req.headers['x-forwarded-proto'] as string) || 'http';
              const origin = `${proto}://${reqHost}`;
              const notifyUrl = String(data.notifyUrl || `${origin}/api/watchpay/callback`);
              const pageUrl = String(data.pageUrl || `${origin}/`);

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

        // 3. Status query endpoint for polling
        if (url.startsWith('/api/watchpay/check-order')) {
          const u = new URL(url, 'http://localhost');
          const orderId = u.searchParams.get('orderNo') || '';
          const order = paidWatchPayOrders.get(orderId);
          res.setHeader('Content-Type', 'application/json');
          res.end(
            JSON.stringify({
              paid: !!order,
              order: order || null,
            })
          );
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
    plugins: [react(), tailwindcss(), aistudioMediaPlugin(), watchpayApiPlugin()],
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
