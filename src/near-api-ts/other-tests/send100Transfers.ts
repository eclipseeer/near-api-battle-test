import 'dotenv/config';
import {
  addFullAccessKey,
  createMemoryKeyService,
  createMemorySigner,
  createTestnetClient,
  deleteKey,
  randomEd25519KeyPair,
  transfer,
  type AccountId,
  type PrivateKey,
  createClient,
} from 'near-api-ts';
import { rpcUrl } from '../main-test/utils';

export const signerAccountId = process.env.OWNER_ACCOUNT_ID as AccountId;
export const signerPrivateKey = process.env.OWNER_PRIVATE_KEY as PrivateKey;

// 1. Setup base signer;
const client = createTestnetClient();

// const client = createClient({
//   transport: { rpcEndpoints: { regular: [{ url: rpcUrl }] } },
// });

const baseKeyService = createMemoryKeyService({
  keySource: { privateKey: signerPrivateKey },
});

const baseSigner = createMemorySigner({
  signerAccountId,
  client,
  keyService: baseKeyService,
});

// 2. Add 10 full access keys for this signer;
const keyPairs = new Array(10).fill(0).map(() => randomEd25519KeyPair());

const tx1 = await baseSigner.executeTransaction({
  intent: {
    actions: keyPairs.map((keyPair) => addFullAccessKey(keyPair)),
    receiverAccountId: signerAccountId,
  },
});
console.log('Added 10 full access keys', tx1.rawRpcResult.transaction.hash);

// 3. Set up a signer with 10 keys
const keyService = createMemoryKeyService({ keySources: keyPairs });

const signer = createMemorySigner({
  signerAccountId,
  client,
  keyService,
});

// 4. Send 100 transfer transactions in parallel
const sendNearTokensResults = await Promise.all(
  new Array(100).fill(0).map(() =>
    signer.executeTransaction({
      intent: {
        action: transfer({ amount: { near: '0.001' } }),
        receiverAccountId: signerAccountId,
      },
    }),
  ),
);

sendNearTokensResults.forEach((result) =>
  console.log(result.rawRpcResult.transaction.hash, result.rawRpcResult.status),
);

// 5. Clean up
await baseSigner.executeTransaction({
  intent: {
    actions: keyPairs.map((keyPair) => deleteKey(keyPair)),
    receiverAccountId: baseSigner.signerAccountId,
  },
});
