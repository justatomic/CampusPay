import {
  Horizon,
  TransactionBuilder,
  Networks,
  Asset,
  Operation,
  Keypair,
  BASE_FEE,
} from '@stellar/stellar-sdk';
import type { Transaction } from './types';

// Stellar Testnet
export const HORIZON_URL = 'https://horizon-testnet.stellar.org';
export const NETWORK_PASSPHRASE = Networks.TESTNET;
export const FRIENDBOT_URL = 'https://friendbot.stellar.org';

export const server = new Horizon.Server(HORIZON_URL);

/** Format raw XLM stroops to readable decimal */
export function formatXLM(amount: string | number): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return num.toLocaleString('en-NG', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  });
}

/** Shorten a Stellar address for display */
export function shortenAddress(address: string, chars = 6): string {
  if (!address) return '';
  return `${address.slice(0, chars)}…${address.slice(-chars)}`;
}

/** Fetch XLM balance for an account */
export async function getBalance(publicKey: string): Promise<string> {
  try {
    const account = await server.loadAccount(publicKey);
    const nativeBalance = account.balances.find(
      (b) => b.asset_type === 'native'
    );
    return nativeBalance ? nativeBalance.balance : '0';
  } catch (error) {
    console.error('Balance fetch error:', error);
    return '0';
  }
}

/** Fetch recent transactions for an account */
export async function getTransactions(publicKey: string): Promise<Transaction[]> {
  try {
    const payments = await server
      .payments()
      .forAccount(publicKey)
      .order('desc')
      .limit(20)
      .call();

    const txs: Transaction[] = [];

    for (const record of payments.records) {
      // Only handle payment operations
      if (record.type !== 'payment' && record.type !== 'create_account') continue;

      let amount = '0';
      let asset = 'XLM';
      let type: 'send' | 'receive' = 'receive';
      let counterparty = '';

      if (record.type === 'create_account') {
        const ca = record as Horizon.ServerApi.CreateAccountOperationRecord;
        amount = ca.starting_balance;
        asset = 'XLM';
        type = ca.funder === publicKey ? 'send' : 'receive';
        counterparty = ca.funder === publicKey ? ca.account : ca.funder;
      } else {
        const pay = record as Horizon.ServerApi.PaymentOperationRecord;
        amount = pay.amount;
        asset = pay.asset_type === 'native' ? 'XLM' : pay.asset_code || 'XLM';
        type = pay.from === publicKey ? 'send' : 'receive';
        counterparty = pay.from === publicKey ? pay.to : pay.from;
      }

      // Fetch memo from parent transaction
      let memo = '';
      try {
        const txRecord = await record.transaction();
        memo = txRecord.memo || '';
      } catch {}

      txs.push({
        id: record.id,
        type,
        amount,
        asset,
        counterparty,
        memo,
        createdAt: record.created_at,
        successful: true,
      });
    }

    return txs;
  } catch (error) {
    console.error('Transaction fetch error:', error);
    return [];
  }
}

/** Build + sign + submit an XLM payment using Freighter */
export async function sendPayment(
  fromPublicKey: string,
  toPublicKey: string,
  amount: string,
  memo: string
): Promise<{ success: boolean; hash?: string; error?: string }> {
  try {
    // Validate destination
    Keypair.fromPublicKey(toPublicKey);

    const sourceAccount = await server.loadAccount(fromPublicKey);

    const txBuilder = new TransactionBuilder(sourceAccount, {
      fee: BASE_FEE,
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(
        Operation.payment({
          destination: toPublicKey,
          asset: Asset.native(),
          amount: amount.toString(),
        })
      )
      .setTimeout(30);

    if (memo) {
      txBuilder.addMemo({ type: 'text', value: memo } as any);
    }

    const transaction = txBuilder.build();
    const xdr = transaction.toXDR();

    // Sign with Freighter
    const freighter = await import('@stellar/freighter-api');
    const signFn = (freighter as any).signTransaction;
    if (!signFn) throw new Error('signTransaction not available in Freighter');
    const result = await signFn(xdr, {
      networkPassphrase: NETWORK_PASSPHRASE,
    });

    if (!result.signedTxXdr) throw new Error('User cancelled signing');

    // Parse the returned XDR (Freighter API v2 returns object)
    const signedXdr =
      typeof result === 'string' ? result : result.signedTxXdr;

    const { TransactionBuilder: TxBuilder } = await import('@stellar/stellar-sdk');
    const signedTx = TxBuilder.fromXDR(signedXdr, NETWORK_PASSPHRASE);
    const submitResult = await server.submitTransaction(signedTx as any);

    return { success: true, hash: (submitResult as any).hash };
  } catch (error: any) {
    return { success: false, error: error.message || 'Payment failed' };
  }
}

/** Fund a testnet account via Friendbot */
export async function fundTestnetAccount(publicKey: string): Promise<boolean> {
  try {
    const res = await fetch(`${FRIENDBOT_URL}?addr=${publicKey}`);
    return res.ok;
  } catch {
    return false;
  }
}

/** Check if Freighter is installed */
export async function isFreighterInstalled(): Promise<boolean> {
  try {
    const { isConnected } = await import('@stellar/freighter-api');
    const result = await isConnected();
    return typeof result === 'boolean' ? result : (result as any).isConnected;
  } catch {
    return false;
  }
}

/** Get public key from Freighter */
export async function getFreighterPublicKey(): Promise<string | null> {
  try {
    const freighter = await import('@stellar/freighter-api');
    // Freighter v2 uses getAddress; v1 used getPublicKey
    const getFn = (freighter as any).getAddress || (freighter as any).getPublicKey;
    if (!getFn) throw new Error('No address getter in Freighter');
    const result = await getFn();
    if (typeof result === 'string') return result;
    return (result as any).address || (result as any).publicKey || null;
  } catch {
    return null;
  }
}
