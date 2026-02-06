import { Near, TransactionBuilder } from 'near-kit';
import { ownerId, ownerPrivateKey, rpcUrl } from './utils';

import {
  getReceiverId,
  numberOfReceivers,
} from '../../near-api-ts/main-test/utils';

export const runAfter = async (userId: string, ftContractId: string) => {
  console.log('Start cleanup...');
  console.time('End cleanup:');

  const near = new Near({
    rpcUrl,
    privateKey: ownerPrivateKey,
    defaultWaitUntil: 'FINAL',
  });

  const signers = [
    near.transaction(userId),
    near.transaction(ftContractId),
    ...new Array(numberOfReceivers)
      .fill(0)
      .map((_, i) => near.transaction(getReceiverId(i))),
  ];

  const deleteAccountAction = (txBuilder: TransactionBuilder) =>
    txBuilder.deleteAccount({ beneficiary: ownerId });

  await Promise.all(
    signers.map((txBuilder) => deleteAccountAction(txBuilder).send()),
  );

  console.timeEnd('End cleanup:');
};
