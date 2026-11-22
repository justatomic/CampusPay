import {
  Horizon,
  TransactionBuilder,
  Networks,
  Asset,
  Operation,
  Keypair,
  BASE_FEE,
  Transaction,
} from '@stellar/stellar-sdk';

export const HORIZON_URL       = 'https://horizon-testnet.stellar.org';
export const NETWORK_PASSPHRASE = Networks.TESTNET;
export const server            = new Horizon.Server(HORIZON_URL);

// ── Types ──────────────────────────────────────────────────────────────────

export interface StellarWalletKit {
  getPublicKey(): Promise<string>;
  signTransaction(xdr: string, opts: { network: string }): Promise<string>;
}

// ── Wallet detection: Freighter / Lobstr / any window.stellar kit ─────────

/**
 * Returns true if any SEP-7 / Stellar wallet extension is available.
 * Freighter: window.freighter
 * Lobstr / Varial: window.stellar (XBIP-7)
 * Hana:     window.hanaWallet
 */
export function detectWallet(): 'freighter' | 'lobstr' | 'hana' | null {
  if (typeof window === 'undefined') return null;
  if ((window as any).freighter)   return 'freighter';
  if ((window as any).stellar)     return 'lobstr';    // Lobstr / Varial use window.stellar
  if ((window as any).hanaWallet)  return 'hana';
  return null;
}

export function walletName(type: ReturnType<typeof detectWallet>): string {
  if (type === 'freighter') return 'Freighter';
  if (type === 'lobstr')    return 'Lobstr / Varial';
  if (type === 'hana')      return 'Hana Wallet';
  return 'Stellar Wallet';
}

/** Request public key from whatever wallet is present */
export async function requestPublicKey(): Promise<string> {
  const type = detectWallet();

  if (type === 'freighter') {
    const w = (window as any).freighter;
    // Freighter ≥ 3.x: getAddress(); older: getPublicKey()
    const fn = w.getAddress ?? w.getPublicKey;
    const result = await fn.call(w);
    return typeof result === 'string' ? result : result.address ?? result.publicKey;
  }

  if (type === 'lobstr') {
    // Lobstr / Varial uses the XBIP-7 window.stellar API
    const w = (window as any).stellar;
    // Some versions expose getAddress, others getPublicKey
    if (w.getAddress)    { const r = await w.getAddress();    return typeof r === 'string' ? r : r.address; }
    if (w.getPublicKey)  { const r = await w.getPublicKey();  return typeof r === 'string' ? r : r.publicKey; }
    throw new Error('Lobstr/Varial: no address getter found');
  }

  if (type === 'hana') {
    const result = await (window as any).hanaWallet.getPublicKey();
    return typeof result === 'string' ? result : result.publicKey;
  }

  throw new Error('No Stellar wallet extension detected. Install Lobstr, Freighter, or Hana.');
}

/** Sign a transaction XDR string with the detected wallet */
export async function signXDR(xdr: string): Promise<string> {
  const type = detectWallet();

  if (type === 'freighter') {
    const w = (window as any).freighter;
    const fn = w.signTransaction ?? w.sign;
    const result = await fn.call(w, xdr, { networkPassphrase: NETWORK_PASSPHRASE });
    return typeof result === 'string' ? result : result.signedTxXdr ?? result.xdr;
  }

  if (type === 'lobstr') {
    const w = (window as any).stellar;
    const fn = w.signTransaction ?? w.sign;
    const result = await fn.call(w, xdr, { networkPassphrase: NETWORK_PASSPHRASE });
    return typeof result === 'string' ? result : result.signedTxXdr ?? result.xdr;
  }

  if (type === 'hana') {
    const result = await (window as any).hanaWallet.signTransaction(xdr, {
      networkPassphrase: NETWORK_PASSPHRASE,
    });
    return typeof result === 'string' ? result : result.signedTxXdr;
  }

  throw new Error('No wallet available to sign transaction');
}

// ── Helpers ────────────────────────────────────────────────────────────────

export function formatXLM(amount: string | number): string {
  const n = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(n)) return '0.00';
  return n.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 4 });
}

export function shortenAddress(addr: string, chars = 6): string {
  if (!addr || addr.length < chars * 2) return addr;
  return `${addr.slice(0, chars)}…${addr.slice(-chars)}`;
}

// ── Horizon calls ──────────────────────────────────────────────────────────

export async function getBalance(publicKey: string): Promise<string> {
  try {
    const account = await server.loadAccount(publicKey);
    const native  = account.balances.find(b => b.asset_type === 'native');
    return native?.balance ?? '0';
  } catch { return '0'; }
}

export interface TxRecord {
  id:           string;
  type:         'send' | 'receive';
  amount:       string;
  asset:        string;
  counterparty: string;
  memo:         string;
  createdAt:    string;
}

export async function getTransactions(publicKey: string): Promise<TxRecord[]> {
  try {
    const payments = await server.payments()
      .forAccount(publicKey)
      .order('desc')
      .limit(30)
      .call();

    const list: TxRecord[] = [];

    for (const r of payments.records) {
      if (r.type !== 'payment' && r.type !== 'create_account') continue;

      let amount = '0', asset = 'XLM', counterparty = '';
      let type: 'send' | 'receive' = 'receive';

      if (r.type === 'create_account') {
        const ca = r as Horizon.ServerApi.CreateAccountOperationRecord;
        amount       = ca.starting_balance;
        type         = ca.funder === publicKey ? 'send' : 'receive';
        counterparty = ca.funder === publicKey ? ca.account : ca.funder;
      } else {
        const pay = r as Horizon.ServerApi.PaymentOperationRecord;
        amount       = pay.amount;
        asset        = pay.asset_type === 'native' ? 'XLM' : pay.asset_code ?? 'XLM';
        type         = pay.from === publicKey ? 'send' : 'receive';
        counterparty = pay.from === publicKey ? pay.to : pay.from;
      }

      let memo = '';
      try { const tx = await r.transaction(); memo = tx.memo ?? ''; } catch {}

      list.push({ id: r.id, type, amount, asset, counterparty, memo, createdAt: r.created_at });
    }
    return list;
  } catch { return []; }
}

export async function sendPayment(
  fromKey: string, toKey: string, amount: string, memo: string
): Promise<{ success: boolean; hash?: string; error?: string }> {
  try {
    Keypair.fromPublicKey(toKey); // validate

    const sourceAccount = await server.loadAccount(fromKey);
    const builder = new TransactionBuilder(sourceAccount, {
      fee: BASE_FEE,
      networkPassphrase: NETWORK_PASSPHRASE,
    }).addOperation(Operation.payment({
      destination: toKey,
      asset:       Asset.native(),
      amount,
    })).setTimeout(30);

    if (memo.trim()) (builder as any).addMemo({ type: 'text', value: memo.slice(0, 28) });

    const tx     = builder.build();
    const signed = await signXDR(tx.toXDR());
    const finalTx = TransactionBuilder.fromXDR(signed, NETWORK_PASSPHRASE);
    const result  = await server.submitTransaction(finalTx as Transaction);

    return { success: true, hash: (result as any).hash };
  } catch (e: any) {
    return { success: false, error: e?.message ?? 'Payment failed' };
  }
}
