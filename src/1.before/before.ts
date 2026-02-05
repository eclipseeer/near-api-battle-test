import {
  addFullAccessKey,
  createAccount,
  createClient,
  createMemoryKeyService,
  createMemorySigner,
  deployContract,
  functionCall,
  transfer,
} from 'near-api-ts';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { numberOfReceivers, sleep, storageDeposit } from '../utils';
import {
  rpcUrl,
  ownerId,
  ownerPrivateKey,
  ownerPublicKey,
  getReceiverId,
} from '../utils';

export const runBefore = async (userId: string, ftContractId: string) => {
  console.log('Start preparations...');
  console.time('Preparations done:');

  const client = createClient({
    transport: {
      rpcEndpoints: {
        regular: [{ url: rpcUrl }],
      },
    },
  });

  const keyService = createMemoryKeyService({
    keySource: { privateKey: ownerPrivateKey },
  });

  const owner = createMemorySigner({
    signerAccountId: ownerId,
    client,
    keyService,
  });

  // Create user
  await owner.executeTransaction({
    intent: {
      actions: [
        createAccount(),
        transfer({ amount: { near: '10' } }),
        addFullAccessKey({ publicKey: ownerPublicKey }),
      ],
      receiverAccountId: userId,
    },
  });

  // Create a 1 FT contract
  const buffer = await readFile(
    path.join(
      path.dirname(fileURLToPath(import.meta.url)),
      './fungible_token.wasm',
    ),
  );

  await owner.executeTransaction({
    intent: {
      actions: [
        createAccount(),
        transfer({ amount: { near: '5' } }),
        addFullAccessKey({ publicKey: ownerPublicKey }),
        deployContract({ wasmBytes: new Uint8Array(buffer) }),
        functionCall({
          functionName: 'new',
          functionArgs: {
            owner_id: userId,
            total_supply: '100000000', // 1_000_000 tokens
            metadata: {
              spec: 'ft-1.0.0',
              name: 'NearApiBattleTest FT',
              symbol: 'NABTFT',
              decimals: 2,
            },
          },
          gasLimit: { teraGas: '100' },
        }),
      ],
      receiverAccountId: ftContractId,
    },
  });

  await sleep(2000);
  // Check FT balance of the user
  const ftBalance = await client.callContractReadFunction({
    contractAccountId: ftContractId,
    functionName: 'ft_balance_of',
    functionArgs: { account_id: userId },
    withStateAt: 'LatestFinalBlock',
  });
  console.log('User FT Balance (in units):', ftBalance.result);

  // Create 10 receivers
  await Promise.all(
    new Array(numberOfReceivers).fill(0).map((_, index) =>
      owner.executeTransaction({
        intent: {
          actions: [
            createAccount(),
            transfer({ amount: { near: '0.1' } }),
            addFullAccessKey({ publicKey: ownerPublicKey }),
          ],
          receiverAccountId: getReceiverId(index),
        },
      }),
    ),
  );

  // Register them
  await owner.executeTransaction({
    intent: {
      actions: new Array(numberOfReceivers)
        .fill(0)
        .map((_, index) => storageDeposit(getReceiverId(index))),
      receiverAccountId: ftContractId,
    },
  });

  console.timeEnd('Preparations done:');
};
