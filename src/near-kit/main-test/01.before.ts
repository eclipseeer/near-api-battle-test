import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Near, TransactionBuilder } from 'near-kit';
import {
  rpcUrl,
  ownerId,
  ownerPrivateKey,
  ownerPublicKey,
  getReceiverId,
  numberOfReceivers,
  storageDeposit,
} from './utils';

export const runBefore = async (userId: string, ftContractId: string) => {
  console.log('Start preparations...');
  console.time('Preparations done:');

  // Set up a client
  const near = new Near({
    rpcUrl,
    privateKey: ownerPrivateKey,
    defaultSignerId: ownerId,
    defaultWaitUntil: 'FINAL',
  });

  // Create user
  await near
    .transaction(ownerId)
    .createAccount(userId)
    .transfer(userId, '10 NEAR')
    .addKey(ownerPublicKey, { type: 'fullAccess' })
    .send();

  // Create a 1 FT contract
  const buffer = await readFile(
    path.join(
      path.dirname(fileURLToPath(import.meta.url)),
      './fungible_token.wasm',
    ),
  );

  await near
    .transaction(ownerId)
    .createAccount(ftContractId)
    .transfer(ftContractId, '5 NEAR')
    .addKey(ownerPublicKey, { type: 'fullAccess' })
    .deployContract(ftContractId, new Uint8Array(buffer))
    .functionCall(
      ftContractId,
      'new',
      {
        owner_id: userId,
        total_supply: '100000000', // 1_000_000 tokens
        metadata: {
          spec: 'ft-1.0.0',
          name: 'NearApiBattleTest FT KIT',
          symbol: 'NABTFT-K',
          decimals: 2,
        },
      },
      { gas: '100 Tgas' },
    )
    .send();

  // Check FT balance of the user
  const ftBalance = await near.view(
    ftContractId,
    'ft_balance_of',
    { account_id: userId },
    { finality: 'final' },
  );
  console.log('User FT Balance (in units):', ftBalance);

  // Create 10 receivers
  await Promise.all(
    new Array(numberOfReceivers)
      .fill(0)
      .map((_, index) =>
        near
          .transaction(ownerId)
          .createAccount(getReceiverId(index))
          .transfer(getReceiverId(index), '0.1 NEAR')
          .addKey(ownerPublicKey, { type: 'fullAccess' })
          .send(),
      ),
  );

  // Register them

  await new Array(numberOfReceivers)
    .fill(0)
    .reduce<TransactionBuilder>(
      (acc, index) =>
        storageDeposit({
          transactionBuilder: acc,
          contractId: ftContractId,
          accountId: getReceiverId(index),
        }),
      near.transaction(ownerId),
    )
    .send();

  console.timeEnd('Preparations done:');
};
