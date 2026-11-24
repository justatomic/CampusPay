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

    // Sign with Varial (Freighter) wallet — v6 returns { signedTxXdr, error? }
    const { signTransaction } = await import('@stellar/freighter-api');
    const result = await signTransaction(xdr, {
      networkPassphrase: NETWORK_PASSPHRASE,
    });

    if (result.error) throw new Error(result.error.message ?? 'User cancelled signing');
    if (!result.signedTxXdr) throw new Error('User cancelled signing');

    const signedXdr = result.signedTxXdr;

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

/** Check if Varial (Freighter) wallet extension is installed */
export async function isFreighterInstalled(): Promise<boolean> {
  try {
    const { isConnected } = await import('@stellar/freighter-api');
    const result = await isConnected();
    // v6 returns { isConnected: boolean, error?: ... }
    if (typeof result === 'boolean') return result;
    if (result.error) return false;
    return result.isConnected ?? false;
  } catch {
    return false;
  }
}

/** Request access and get public key from Varial (Freighter) wallet.
 *  - First calls requestAccess() which triggers the wallet popup
 *  - Falls back to getAddress() if already allowed
 */
export async function getFreighterPublicKey(): Promise<string | null> {
  try {
    const { requestAccess, getAddress, isAllowed } = await import('@stellar/freighter-api');

    // Check if already allowed — if not, requestAccess triggers the popup
    const allowedResult = await isAllowed();
    let result: { address: string; error?: any };

    if (!allowedResult.isAllowed) {
      // This opens the Varial wallet approval popup
      result = await requestAccess();
    } else {
      result = await getAddress();
    }

    if (result.error) {
      throw new Error(result.error.message ?? 'Wallet returned an error');
    }

    return result.address || null;
  } catch (err: any) {
    throw err; // Let wallet-context surface the real message
  }
}

/**
 * Send payment signed with a local Stellar keypair (Google auth path).
 * The keypair is derived client-side — private key never leaves the browser.
 */
export async function sendPaymentLocal(
  keypair:    import('@stellar/stellar-sdk').Keypair,
  toPublicKey: string,
  amount:     string,
  memo:       string,
): Promise<{ success: boolean; hash?: string; error?: string }> {
  try {
    Keypair.fromPublicKey(toPublicKey);
    const sourceAccount = await server.loadAccount(keypair.publicKey());

    const txBuilder = new TransactionBuilder(sourceAccount, {
      fee: BASE_FEE,
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(Operation.payment({
        destination: toPublicKey,
        asset: Asset.native(),
        amount: amount.toString(),
      }))
      .setTimeout(30);

    if (memo) txBuilder.addMemo({ type: 'text', value: memo } as any);

    const transaction = txBuilder.build();
    transaction.sign(keypair);

    const result = await server.submitTransaction(transaction as any);
    return { success: true, hash: (result as any).hash };
  } catch (error: any) {
    return { success: false, error: error.message || 'Payment failed' };
  }
}
