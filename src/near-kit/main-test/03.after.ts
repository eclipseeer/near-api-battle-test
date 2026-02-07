import { Near } from 'near-kit';
import { ownerId, ownerPrivateKey, rpcUrl } from './utils';
import { getReceiverId, numberOfReceivers } from './utils';

const deleteAccount = (signerId: string) =>
  new Near({
    rpcUrl,
    privateKey: ownerPrivateKey,
    defaultSignerId: signerId,
    defaultWaitUntil: 'FINAL',
  })
    .transaction(signerId)
    .deleteAccount({ beneficiary: ownerId })
    .send();

export const runAfter = async (userId: string, ftContractId: string) => {
  console.log('Start cleanup...');
  console.time('End cleanup:');

  await Promise.all([
    deleteAccount(userId),
    deleteAccount(ftContractId),
    ...new Array(numberOfReceivers)
      .fill(0)
      .map((_, i) => deleteAccount(getReceiverId(i))),
  ]);

  console.timeEnd('End cleanup:');
};
