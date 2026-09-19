import crypto from 'crypto';
import { parseBody, sendJson, setCors } from '../_lib/common';

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

    // Parameters to be signed per WatchPay spec
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

    const formParams = new URLSearchParams({
      ...signParams,
      sign_type: 'MD5',
      sign: sign,
    });

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

    return sendJson(res, 200, {
      status: 'ok',
      orderNo,
      targetUrl,
      postBody: Object.fromEntries(formParams.entries()),
      preSignStr,
      gatewayResponse: jsonResponse,
    });
  } catch (err: any) {
    return sendJson(res, 500, { error: err?.message || 'Failed to create WatchPay order' });
  }
}
