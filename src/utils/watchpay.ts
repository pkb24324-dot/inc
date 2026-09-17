// WatchPay Global Aggregator Payment Gateway Interface & Catalog
// Based on official WatchPay merchant documentation & test credentials

export interface WatchPayChannel {
  code: string;
  name: string;
  description: string;
  category: 'tier1' | 'tier2' | 'tier3';
}

export interface WatchPayCountryPreset {
  country: string;
  flag: string;
  currency: string;
  symbol: string;
  merchantNo: string;
  payKey: string;
  transferKey: string;
  defaultPayType: string;
  channelsTier1: WatchPayChannel[];
  channelsTier2: WatchPayChannel[];
  channelsTier3?: WatchPayChannel[];
  notes?: string;
}

export const WATCHPAY_CALLBACK_IP = '18.141.88.123';
export const WATCHPAY_DEFAULT_DOMAIN = 'https://api.watchglb.com';
export const WATCHPAY_ALT_DOMAINS = [
  'https://api.watchglb.com',
  'https://interface.sskking.com',
  'https://api.watchpay.net',
];

export const WATCHPAY_ENDPOINTS = {
  payWeb: '/pay/web', // 支付下单 (Pay / Deposit Web Cashier)
  payTransfer: '/pay/transfer', // 代付下单 (Payout / Transfer)
  queryTransfer: '/query/transfer', // 代付查询 (Transfer Query)
  queryBalance: '/query/balance', // 余额查询 (Balance Query)
};

export const WATCHPAY_PRESETS: Record<string, WatchPayCountryPreset> = {
  india: {
    country: 'India (Live WatchPay)',
    flag: '🇮🇳',
    currency: 'INR',
    symbol: '₹',
    merchantNo: '100666859',
    payKey: '4abd8ad7b8a44bfcbeaa8ad8e30dae30',
    transferKey: 'ZGZY3REWQJLAWRCRTHWQVGWYPMD878KQ',
    defaultPayType: '101',
    notes: 'Live WatchPay Merchant 100666859 (Gateway: api.watchglb.com, pay_type=101)',
    channelsTier1: [
      { code: '101', name: 'WatchPay Native 一类 (Paytm/UPI)', description: 'WatchPay 极速原生通道 pay_type=101 (推荐使用)', category: 'tier1' },
      { code: '104', name: 'WatchPay 娱乐', description: '印度Paytm娱乐通道', category: 'tier1' },
      { code: '131', name: 'WatchPay 跑分一类', description: '印度Paytm跑分一类高并发通道', category: 'tier1' },
      { code: '132', name: 'UPI 跑分一类', description: 'UPI跑分一类极速结算', category: 'tier1' },
    ],
    channelsTier2: [
      { code: '105', name: 'UPI 娱乐', description: '印度UPI娱乐通道', category: 'tier2' },
      { code: '122', name: 'UPI 跑分二类', description: '印度UPI跑分二类', category: 'tier2' },
      { code: '152', name: 'UPI 原生二类', description: '印度UPI原生二类高成功率', category: 'tier2' },
    ],
  },
  indiaTest: {
    country: 'India (Test 222887002)',
    flag: '🇮🇳',
    currency: 'INR',
    symbol: '₹',
    merchantNo: '222887002',
    payKey: '8979d78b437948f18c14628ff1ad5f41',
    transferKey: 'ZGZY3REWQJLAWRCRTHWQVGWYPMD878KQ',
    defaultPayType: '101',
    notes: '印度测试商户222887002 (代收测试通道 pay_type=101)',
    channelsTier1: [
      { code: '101', name: 'Paytm Native 一类', description: '印度Paytm原生一类', category: 'tier1' },
      { code: '105', name: 'UPI 娱乐', description: '印度UPI娱乐通道', category: 'tier1' },
    ],
    channelsTier2: [
      { code: '152', name: 'UPI 原生二类', description: 'UPI原生二类', category: 'tier2' },
    ],
  },
  usdt: {
    country: 'USDT Crypto',
    flag: '🪙',
    currency: 'USDT',
    symbol: '₮',
    merchantNo: '922000001',
    payKey: '8c72f0a25c9e4a7686f55207c82c51c6',
    transferKey: 'ZNMDATHRASYDLOYKBYANKAWBGW0VAQHR',
    defaultPayType: '700',
    notes: 'USDT TRC20 / ERC20 全球区块链虚拟币直连',
    channelsTier1: [
      { code: '700', name: 'USDT 虚拟币网关', description: 'USDT TRC20 / BEP20 自动化区块确认', category: 'tier1' },
    ],
    channelsTier2: [
      { code: '700', name: 'USDT 备用通道', description: 'USDT 多链聚合汇率网关', category: 'tier2' },
    ],
  },
  thailand: {
    country: 'Thailand',
    flag: '🇹🇭',
    currency: 'THB',
    symbol: '฿',
    merchantNo: '600111001',
    payKey: '01d38989aa524b099962e19301f4553c',
    transferKey: '36EUKXWAUAB2VLWKDX1EOMVUOJO4AG7X',
    defaultPayType: '300',
    channelsTier1: [
      { code: '300', name: 'SUPEX 扫码一类', description: '泰国SUPEX一类扫码', category: 'tier1' },
      { code: '301', name: 'UPEX 一类', description: '泰国UPEX一类', category: 'tier1' },
      { code: '302', name: 'TrueMoney 一类', description: '泰国TRUEMONEY一类电子钱包', category: 'tier1' },
      { code: '307', name: 'PromptPay 一类', description: '泰国PromptPay二维码直连', category: 'tier1' },
    ],
    channelsTier2: [
      { code: '320', name: 'SUPEX 扫码二类', description: '泰国SUPEX二类扫码', category: 'tier2' },
      { code: '321', name: 'UPEX 二类', description: '泰国UPEX二类', category: 'tier2' },
      { code: '322', name: 'TrueMoney 二类', description: '泰国TRUEMONEY二类', category: 'tier2' },
      { code: '327', name: 'PromptPay 二类', description: '泰国PromptPay二类', category: 'tier2' },
    ],
  },
  indonesia: {
    country: 'Indonesia',
    flag: '🇮🇩',
    currency: 'IDR',
    symbol: 'Rp',
    merchantNo: '222888001',
    payKey: '6QUOUSXE6BCZPW8KZ1LQF7XZARXE69XO',
    transferKey: 'F67KSR2APPUJJVHSYAW8SSKAIGZMPWUE',
    defaultPayType: '200',
    channelsTier1: [
      { code: '200', name: '网银 B2C 一类', description: '印尼网银B2C一类直连', category: 'tier1' },
      { code: '202', name: 'OVO 钱包一类', description: '印尼OVO钱包一类', category: 'tier1' },
      { code: '203', name: 'QRIS 扫码一类', description: '印尼QRIS国家统一二维码一类', category: 'tier1' },
    ],
    channelsTier2: [
      { code: '220', name: '网银 B2C 二类', description: '印尼网银B2C二类', category: 'tier2' },
      { code: '222', name: 'OVO 钱包二类', description: '印尼OVO钱包二类', category: 'tier2' },
      { code: '223', name: 'QRIS 扫码二类', description: '印尼QRIS扫码二类', category: 'tier2' },
    ],
    channelsTier3: [
      { code: '240', name: '网银 B2C 三类', description: '印尼网银B2C三类通道', category: 'tier3' },
      { code: '243', name: 'QRIS 扫码三类', description: '印尼QRIS钱包扫码三类', category: 'tier3' },
    ],
  },
  brazil: {
    country: 'Brazil',
    flag: '🇧🇷',
    currency: 'BRL',
    symbol: 'R$',
    merchantNo: '222886001',
    payKey: 'GM4NVMDPPLV3MZGLHDTK3VDJ1PZVUHH2',
    transferKey: 'T3GQYFLQY4R5LR4XYJNDX3HNFB04DFYH',
    defaultPayType: '600',
    channelsTier1: [
      { code: '600', name: 'PIX 钱包一类', description: '巴西央行PIX极速即时结算一类', category: 'tier1' },
    ],
    channelsTier2: [
      { code: '620', name: 'PIX 钱包二类', description: '巴西PIX钱包二类备用通道', category: 'tier2' },
      { code: '624', name: '巴西 PIX 理财', description: '巴西PIX理财专属通道', category: 'tier2' },
    ],
  },
  vietnam: {
    country: 'Vietnam',
    flag: '🇻🇳',
    currency: 'VND',
    symbol: '₫',
    merchantNo: '800100001',
    payKey: 'ae89fc17c9f043858fc03872ca72e8d0',
    transferKey: '1SLHHB9ZRY2LM8VYVDMJ8BZUAHTM8SMR',
    defaultPayType: '001',
    channelsTier1: [
      { code: '001', name: '网银直连一类', description: '越南网银直连一类 (需填写bank_code)', category: 'tier1' },
      { code: '000', name: '网银扫码一类', description: '越南网银扫码 (需填写bank_code)', category: 'tier1' },
      { code: '002', name: '网银转卡一类', description: '越南网银转卡一类', category: 'tier1' },
      { code: '003', name: 'Momo 钱包', description: '越南Momo电子钱包一类', category: 'tier1' },
      { code: '004', name: 'Zalo Pay', description: '越南Zalo Pay一类', category: 'tier1' },
    ],
    channelsTier2: [
      { code: '021', name: '网银直连二类', description: '越南网银直连二类', category: 'tier2' },
      { code: '022', name: '网银转卡二类', description: '越南网银转卡二类', category: 'tier2' },
      { code: '023', name: 'Momo 二类', description: '越南Momo二类', category: 'tier2' },
    ],
  },
  pakistan: {
    country: 'Pakistan',
    flag: '🇵🇰',
    currency: 'PKR',
    symbol: '₨',
    merchantNo: '111001001',
    payKey: '26932395d8a443f6864847dfb3017727',
    transferKey: '26GN8DYTMTOSRMY0GVN8F85ZUPQY0M8U',
    defaultPayType: '2400',
    channelsTier1: [
      { code: '2400', name: '巴基斯坦网关一类', description: '巴基斯坦全网银聚合一类', category: 'tier1' },
      { code: '2401', name: 'JazzCash 一类', description: '巴基斯坦JazzCash钱包一类', category: 'tier1' },
      { code: '2402', name: 'EasyPaisa 一类', description: '巴基斯坦EasyPaisa一类', category: 'tier1' },
    ],
    channelsTier2: [
      { code: '2420', name: '巴基斯坦网关二类', description: '巴基斯坦网关二类', category: 'tier2' },
      { code: '2421', name: 'JazzCash 二类', description: '巴基斯坦JazzCash二类', category: 'tier2' },
      { code: '2422', name: 'EasyPaisa 二类', description: '巴基斯坦EasyPaisa二类', category: 'tier2' },
    ],
  },
  bangladesh: {
    country: 'Bangladesh',
    flag: '🇧🇩',
    currency: 'BDT',
    symbol: '৳',
    merchantNo: '955001001',
    payKey: 'e67d789a20e44abe98e9a4187559d060',
    transferKey: '8RPHUXGSVVTDCV1XPL3D3ZYOGOHWT6KY',
    defaultPayType: '2200',
    channelsTier1: [
      { code: '2200', name: '孟加拉网关一类 (bKash/Nagad)', description: '孟加拉主流移动钱包网关', category: 'tier1' },
    ],
    channelsTier2: [
      { code: '2220', name: '孟加拉网关二类', description: '孟加拉网关二类备用通道', category: 'tier2' },
    ],
  },
  malaysia: {
    country: 'Malaysia',
    flag: '🇲🇾',
    currency: 'MYR',
    symbol: 'RM',
    merchantNo: '111887001',
    payKey: '8ba4b3d14415441aa9fc1eca23093c7c',
    transferKey: '2A0QHL5ZQ0LLNYUCZGPFQ1TPOJELOGG3',
    defaultPayType: '400',
    channelsTier1: [
      { code: '400', name: '马来网银转卡', description: '马来西亚网银FPX转卡一类', category: 'tier1' },
      { code: '401', name: '马来扫码 DuitNow', description: '马来西亚DuitNow扫码一类', category: 'tier1' },
      { code: '402', name: '马来钱包 TNG', description: 'Touch n Go 电子钱包一类', category: 'tier1' },
      { code: '403', name: '马来网关一类', description: '马来网关一类全聚合', category: 'tier1' },
    ],
    channelsTier2: [
      { code: '423', name: '马来网关二类', description: '马来网关二类', category: 'tier2' },
      { code: '421', name: '马来扫码二类', description: '马来扫码二类', category: 'tier2' },
    ],
  },
  nigeria: {
    country: 'Nigeria',
    flag: '🇳🇬',
    currency: 'NGN',
    symbol: '₦',
    merchantNo: '999000001',
    payKey: '45309fa6af2543aa9474e46d628bda5f',
    transferKey: 'EZ1RVKZNMH2KYH0R9LXKAFT8QLVBBDAL',
    defaultPayType: '501',
    channelsTier1: [
      { code: '501', name: '尼日利亚卡卡 (Card-to-Card)', description: '尼日利亚银行卡即时互转', category: 'tier1' },
      { code: '500', name: '尼日利亚网银', description: '尼日利亚网银直连', category: 'tier1' },
    ],
    channelsTier2: [
      { code: '501', name: '尼日利亚卡卡二类', description: '尼日利亚备用高成功率通道', category: 'tier2' },
    ],
  },
  philippines: {
    country: 'Philippines',
    flag: '🇵🇭',
    currency: 'PHP',
    symbol: '₱',
    merchantNo: '777000001',
    payKey: '66441809a4d5480195299c4934eeb605',
    transferKey: 'N1LCGYE1VOZEFNQUEDTS5I7S1HC1NAKA',
    defaultPayType: '1700',
    channelsTier1: [
      { code: '1700', name: '菲律宾网关 (GCash/Maya)', description: '菲律宾聚合电子钱包网关一类', category: 'tier1' },
      { code: '1705', name: '菲律宾 QRPH 一类', description: '菲律宾国家央行QRPH统一标准一类', category: 'tier1' },
    ],
    channelsTier2: [
      { code: '1720', name: '菲律宾网关二类', description: '菲律宾网关二类', category: 'tier2' },
      { code: '1725', name: '菲律宾 QRPH 二类', description: '菲律宾QRPH二维码二类', category: 'tier2' },
    ],
  },
  mexico: {
    country: 'Mexico',
    flag: '🇲🇽',
    currency: 'MXN',
    symbol: '$',
    merchantNo: '700111001',
    payKey: 'XOPAHBSMHYCCJQV3Z6P9OKM9TOIVNOIW',
    transferKey: 'T1FMZ3JURVPOAZXRFJPFQCMU8TWCJMNY',
    defaultPayType: '772',
    channelsTier1: [
      { code: '771', name: 'STP 一类', description: '墨西哥SPEI/STP实时清算一类', category: 'tier1' },
      { code: '701', name: 'OXXO 便利店一类', description: '墨西哥OXXO现金条码一类', category: 'tier1' },
    ],
    channelsTier2: [
      { code: '772', name: 'STP 二类', description: '墨西哥STP二类专线', category: 'tier2' },
      { code: '721', name: 'OXXO 二类', description: '墨西哥OXXO二类', category: 'tier2' },
    ],
  },
  colombia: {
    country: 'Colombia',
    flag: '🇨🇴',
    currency: 'COP',
    symbol: '$',
    merchantNo: '977000001',
    payKey: '572ec680736f4a42a711c83a44d312d9',
    transferKey: 'VMARQ7ULGHUMBJ5KF9WWTDFQHCGY3GEO',
    defaultPayType: '1100',
    channelsTier1: [
      { code: '1100', name: '哥伦比亚网关一类', description: 'PSE网关与Bancolombia一类', category: 'tier1' },
    ],
    channelsTier2: [
      { code: '1120', name: '哥伦比亚网关二类', description: '哥伦比亚网关二类', category: 'tier2' },
      { code: '1130', name: '哥伦比亚网关三类', description: '哥伦比亚网关三类备用', category: 'tier2' },
    ],
  },
  kenya: {
    country: 'Kenya',
    flag: '🇰🇪',
    currency: 'KES',
    symbol: 'KSh',
    merchantNo: '333001001',
    payKey: 'd2638027d9c847d492c7447cd77da82a',
    transferKey: 'YXWZ54LHIKIHRJO8Y3H5E4ZK7M5FM2T8',
    defaultPayType: '800',
    channelsTier1: [
      { code: '800', name: 'DARAJA 一类 (M-Pesa)', description: '肯尼亚Safaricom M-Pesa官方通道一类', category: 'tier1' },
    ],
    channelsTier2: [
      { code: '821', name: 'DARAJA 二类', description: '肯尼亚DARAJA二类', category: 'tier2' },
    ],
  },
  southafrica: {
    country: 'South Africa',
    flag: '🇿🇦',
    currency: 'ZAR',
    symbol: 'R',
    merchantNo: '888000001',
    payKey: 'fd9d93b1fc914d419f39a8e8bceff795',
    transferKey: '7IX0PVBQFVAK86SVQXSWMJ0MY9XXSOI6',
    defaultPayType: '901',
    channelsTier1: [
      { code: '901', name: '南非网银一类 (Ozow/Capitec)', description: '南非EFT与即时网银一类', category: 'tier1' },
    ],
    channelsTier2: [
      { code: '921', name: '南非网银二类', description: '南非网银二类备用通道', category: 'tier2' },
    ],
  },
};

import { md5 } from './md5';

// Format date to WatchPay format: yyyy-MM-dd HH:mm:ss
export function formatWatchPayDate(date: Date = new Date()): string {
  const pad = (n: number) => n.toString().padStart(2, '0');
  const yyyy = date.getFullYear();
  const MM = pad(date.getMonth() + 1);
  const dd = pad(date.getDate());
  const HH = pad(date.getHours());
  const mm = pad(date.getMinutes());
  const ss = pad(date.getSeconds());
  return `${yyyy}-${MM}-${dd} ${HH}:${mm}:${ss}`;
}

// Real RFC 1321 MD5 calculation for WatchPay Gateway
// Strictly per official WatchPay specification:
// 1. Exclude 'sign', 'sign_type', and 'signType'
// 2. Exclude empty or undefined parameters
// 3. Sort keys alphabetically
// 4. Concatenate key1=val1&key2=val2...&key=KEY
export function calculateWatchPaySign(params: Record<string, string | number>, key: string): string {
  const keys = Object.keys(params)
    .filter(k => 
      k !== 'sign' && 
      k !== 'sign_type' && 
      k !== 'signType' && 
      params[k] !== undefined && 
      params[k] !== null && 
      String(params[k]).trim() !== ''
    )
    .sort();

  const paramString = keys.map(k => `${k}=${params[k]}`).join('&') + `&key=${key}`;
  return md5(paramString);
}

// Official WatchPay Deposit (/pay/web) interface definitions
export interface WatchPayDepositRequest {
  // Official snake_case parameters per documentation
  mch_id: string;
  mch_order_no: string;
  trade_amount: string;
  order_date: string;
  goods_name: string;
  pay_type: string;
  notify_url: string;
  page_url?: string;
  version?: string;
  bank_code?: string;
  mch_return_msg?: string;
  payer_phone?: string;
  sign_type: string;
  sign: string;

  // Compatibility aliases
  mchId?: string;
  merOrderId?: string;
  orderAmount?: string;
  [key: string]: string | undefined;
}

export interface WatchPaySyncResponse {
  respCode: 'SUCCESS' | 'FAIL';
  tradeMsg: string;
  tradeResult?: string; // '1' = success
  payInfo?: string; // Direct payment cashier link
  mchId?: string;
  mchOrderNo?: string;
  orderNo?: string;
  oriAmount?: string;
  tradeAmount?: string;
  orderDate?: string;
  signType?: string;
  sign?: string;
}

export function buildWatchPayDepositPayload(options: {
  merchantNo: string;
  payKey: string;
  amount: number;
  payType: string;
  domain?: string;
  orderNo?: string;
  notifyUrl?: string;
  pageUrl?: string;
  goodsName?: string;
  withVersion?: boolean; // Set true for JSON mode (version=1.0)
}): { 
  payload: WatchPayDepositRequest; 
  cashierUrl: string; 
  signStringPreview: string;
  postParams: Record<string, string>;
  jsonApiParams: Record<string, string>;
  postActionUrl: string;
} {
  const baseDomain = (options.domain || WATCHPAY_DEFAULT_DOMAIN).replace(/\/+$/, '');
  const orderNo = options.orderNo || `ORD${Math.floor(Date.now() / 1000)}${Math.floor(1000 + Math.random() * 9000)}`;
  const amountStr = options.amount % 1 === 0 ? options.amount.toString() : options.amount.toFixed(2);
  const orderDate = formatWatchPayDate();
  const goodsName = options.goodsName || 'Recharge';

  const notifyUrl = options.notifyUrl || 'https://invest.a1h.in/pay/notify.php';
  const pageUrl = options.pageUrl || 'https://invest.a1h.in/success.php';

  // 1. Direct POST Redirection parameters (no version field, per doc:
  // "You need to be redirected directly to the payment page; you don't need to fill in the version number. Use a POST request.")
  const directSignParams: Record<string, string | number> = {
    goods_name: goodsName,
    mch_id: options.merchantNo,
    mch_order_no: orderNo,
    notify_url: notifyUrl,
    order_date: orderDate,
    page_url: pageUrl,
    pay_type: options.payType,
    trade_amount: amountStr,
  };

  const directSign = calculateWatchPaySign(directSignParams, options.payKey);

  const sortedDirectKeys = Object.keys(directSignParams).sort();
  const signStringPreview = sortedDirectKeys.map(k => `${k}=${directSignParams[k]}`).join('&') + `&key=${options.payKey}`;

  const postParams: Record<string, string> = {
    goods_name: goodsName,
    mch_id: options.merchantNo,
    mch_order_no: orderNo,
    notify_url: notifyUrl,
    order_date: orderDate,
    page_url: pageUrl,
    pay_type: options.payType,
    trade_amount: amountStr,
    sign_type: 'MD5',
    sign: directSign,
  };

  // 2. JSON API parameters (with version=1.0, per doc:
  // "If you need to return JSON data, be sure to fill in version=1.0 and use curl to make the request.")
  const jsonSignParams: Record<string, string | number> = {
    ...directSignParams,
    version: '1.0',
  };
  const jsonSign = calculateWatchPaySign(jsonSignParams, options.payKey);

  const jsonApiParams: Record<string, string> = {
    goods_name: goodsName,
    mch_id: options.merchantNo,
    mch_order_no: orderNo,
    notify_url: notifyUrl,
    order_date: orderDate,
    page_url: pageUrl,
    pay_type: options.payType,
    trade_amount: amountStr,
    version: '1.0',
    sign_type: 'MD5',
    sign: jsonSign,
  };

  // Query URL fallback
  const queryParams = new URLSearchParams(postParams);
  const cashierUrl = `${baseDomain}/pay/web?${queryParams.toString()}`;
  const postActionUrl = `${baseDomain}/pay/web`;

  const payload: WatchPayDepositRequest = {
    ...postParams,
    goods_name: goodsName,
    mch_id: options.merchantNo,
    mch_order_no: orderNo,
    notify_url: notifyUrl,
    order_date: orderDate,
    page_url: pageUrl,
    pay_type: options.payType,
    trade_amount: amountStr,
    sign_type: 'MD5',
    sign: directSign,
  };

  return { 
    payload, 
    cashierUrl, 
    signStringPreview, 
    postParams, 
    jsonApiParams,
    postActionUrl 
  };
}

// Payment on Behalf / Payout / Transfer (/pay/transfer)
export interface WatchPayTransferRequest {
  mch_id: string;
  mch_transferId: string;
  transfer_amount: string;
  apply_date: string;
  bank_code: string;
  receive_name: string;
  receive_account: string;
  remark?: string; // IFSC code for India
  back_url?: string;
  sign_type: string;
  sign: string;
}

export function buildWatchPayTransferPayload(options: {
  merchantNo: string;
  transferKey: string;
  amount: number;
  transferId?: string;
  bankCode?: string;
  receiveName: string;
  receiveAccount: string;
  ifscCode?: string;
  backUrl?: string;
}): {
  payload: WatchPayTransferRequest;
  signString: string;
  sign: string;
} {
  const transferId = options.transferId || `TF${Date.now()}${Math.floor(100 + Math.random() * 900)}`;
  const applyDate = formatWatchPayDate();
  const amountStr = Math.round(options.amount).toString(); // Integers in yuan/rupees per doc

  const signParams: Record<string, string | number> = {
    apply_date: applyDate,
    bank_code: options.bankCode || 'UPI',
    mch_id: options.merchantNo,
    mch_transferId: transferId,
    receive_account: options.receiveAccount,
    receive_name: options.receiveName,
    transfer_amount: amountStr,
  };

  if (options.ifscCode) {
    signParams.remark = options.ifscCode;
  }
  if (options.backUrl) {
    signParams.back_url = options.backUrl;
  }

  const sign = calculateWatchPaySign(signParams, options.transferKey);

  const sortedKeys = Object.keys(signParams).sort();
  const signString = sortedKeys.map(k => `${k}=${signParams[k]}`).join('&') + `&key=${options.transferKey}`;

  const payload: WatchPayTransferRequest = {
    apply_date: applyDate,
    bank_code: options.bankCode || 'UPI',
    mch_id: options.merchantNo,
    mch_transferId: transferId,
    receive_account: options.receiveAccount,
    receive_name: options.receiveName,
    transfer_amount: amountStr,
    remark: options.ifscCode,
    back_url: options.backUrl,
    sign_type: 'MD5',
    sign: sign,
  };

  return { payload, signString, sign };
}
