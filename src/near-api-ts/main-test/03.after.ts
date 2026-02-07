import {
  createClient,
  createMemoryKeyService,
  createMemorySignerFactory,
  deleteAccount,
  MemorySigner,
} from 'near-api-ts';
import {
  getReceiverId,
  numberOfReceivers,
  ownerId,
  ownerPrivateKey,
  rpcUrl,
} from './utils';

export const runAfter = async (userId: string, ftContractId: string) => {
  console.log('Start cleanup...');
  console.time('End cleanup:');

  const client = createClient({
    transport: { rpcEndpoints: { regular: [{ url: rpcUrl }] } },
  });

  const keyService = createMemoryKeyService({
    keySource: { privateKey: ownerPrivateKey },
  });

  const createSigner = createMemorySignerFactory({ client, keyService });

  const signers = await Promise.all([
    createSigner(ftContractId),
    createSigner(userId),
    ...new Array(numberOfReceivers)
      .fill(0)
      .map((_, i) => createSigner(getReceiverId(i))),
  ]);

  const deleteAccountAction = (signer: MemorySigner) =>
    signer.executeTransaction({
      intent: {
        action: deleteAccount({ beneficiaryAccountId: ownerId }),
        receiverAccountId: signer.signerAccountId,
      },
    });

  await Promise.all(signers.map((signer) => deleteAccountAction(signer)));

  console.timeEnd('End cleanup:');
};
