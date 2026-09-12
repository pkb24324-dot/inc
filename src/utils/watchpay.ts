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
export const WATCHPAY_DEFAULT_DOMAIN = 'https://api.watchpay.net';

export const WATCHPAY_ENDPOINTS = {
  payWeb: '/pay/web', // 支付下单 (Pay / Deposit Web Cashier)
  payTransfer: '/pay/transfer', // 代付下单 (Payout / Transfer)
  queryTransfer: '/query/transfer', // 代付查询 (Transfer Query)
  queryBalance: '/query/balance', // 余额查询 (Balance Query)
};

export const WATCHPAY_PRESETS: Record<string, WatchPayCountryPreset> = {
  india: {
    country: 'India (Live)',
    flag: '🇮🇳',
    currency: 'INR',
    symbol: '₹',
    merchantNo: '100666859',
    payKey: '4abd8ad7b8a44bfcbeaa8ad8e30dae30',
    transferKey: 'ZGZY3REWQJLAWRCRTHWQVGWYPMD878KQ',
    defaultPayType: '101',
    notes: 'Live Merchant 100666859 (Active Deposit Channel pay_type=101)',
    channelsTier1: [
      { code: '101', name: 'Paytm Native 一类', description: '印度Paytm原生一类 (推荐使用)', category: 'tier1' },
      { code: '104', name: 'Paytm 娱乐', description: '印度Paytm娱乐通道', category: 'tier1' },
      { code: '131', name: 'Paytm 跑分一类', description: '印度Paytm跑分一类高并发通道', category: 'tier1' },
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

// Simple pseudo-MD5 / hash calculation for signing requests
export function calculateWatchPaySign(params: Record<string, string | number>, key: string): string {
  // 1. Filter out null, undefined, empty strings and "sign" itself
  const keys = Object.keys(params)
    .filter(k => k !== 'sign' && params[k] !== undefined && params[k] !== null && String(params[k]).trim() !== '')
    .sort();

  // 2. Build string: param1=val1&param2=val2...&key=KEY
  const paramString = keys.map(k => `${k}=${params[k]}`).join('&') + `&key=${key}`;

  // 3. Generate 32-character hexadecimal MD5 simulation
  let hash = 0;
  for (let i = 0; i < paramString.length; i++) {
    const char = paramString.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  
  // Deterministic 32-char hex string derived from paramString & key
  const baseHex = Math.abs(hash).toString(16).padStart(8, '0');
  const tailHex = key.slice(0, 8);
  const middle = paramString.length.toString(16).padStart(4, '0');
  const salt = 'wp89a';
  
  return (baseHex + tailHex + middle + salt + '1e4c8b92d0').slice(0, 32);
}

// Build official WatchPay Deposit (/pay/web) request object
export interface WatchPayDepositRequest {
  merchant_no: string;
  order_no: string;
  amount: string;
  pay_type: string;
  notify_url: string;
  return_url: string;
  goods_name?: string;
  custom?: string;
  sign: string;
}

export function buildWatchPayDepositPayload(options: {
  merchantNo: string;
  payKey: string;
  amount: number;
  payType: string;
  orderNo?: string;
  notifyUrl?: string;
  returnUrl?: string;
}): { payload: WatchPayDepositRequest; cashierUrl: string; signStringPreview: string } {
  const orderNo = options.orderNo || `WP-DEP-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const amountStr = options.amount.toFixed(2);
  const notifyUrl = options.notifyUrl || 'https://client-api.global/api/watchpay/callback';
  const returnUrl = options.returnUrl || 'https://client-api.global/pay/success';

  const rawParams: Record<string, string | number> = {
    amount: amountStr,
    goods_name: `Treasury Wallet Deposit ${amountStr}`,
    merchant_no: options.merchantNo,
    notify_url: notifyUrl,
    order_no: orderNo,
    pay_type: options.payType,
    return_url: returnUrl,
  };

  const sign = calculateWatchPaySign(rawParams, options.payKey);
  const payload: WatchPayDepositRequest = {
    ...rawParams,
    goods_name: String(rawParams.goods_name),
    merchant_no: String(rawParams.merchant_no),
    notify_url: String(rawParams.notify_url),
    order_no: String(rawParams.order_no),
    pay_type: String(rawParams.pay_type),
    return_url: String(rawParams.return_url),
    amount: amountStr,
    sign,
  };

  const sortedKeys = Object.keys(rawParams).sort();
  const signStringPreview = sortedKeys.map(k => `${k}=${rawParams[k]}`).join('&') + `&key=${options.payKey}`;
  const cashierUrl = `https://api.watchpay.net/pay/web?merchant_no=${options.merchantNo}&order_no=${orderNo}&amount=${amountStr}&pay_type=${options.payType}&sign=${sign}`;

  return { payload, cashierUrl, signStringPreview };
}
