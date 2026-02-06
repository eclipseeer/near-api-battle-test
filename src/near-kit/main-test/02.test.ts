import {
  Amount,
  generateKey,
  Near,
  RotatingKeyStore,
  TransactionBuilder,
} from 'near-kit';
import {
  ftTransfer,
  getReceiverId,
  numberOfReceivers,
  ownerPrivateKey,
  rpcUrl,
} from './utils';
import diagnosticsChannel from 'node:diagnostics_channel';
import { sleep } from '../../near-api-ts/main-test/utils';

export const testKit = async (userId: string, ftContractId: string) => {
  console.log('Start adding keys...');
  console.time('Adding keys done:');

  const baseUser = new Near({
    rpcUrl,
    privateKey: ownerPrivateKey,
    defaultSignerId: userId,
    defaultWaitUntil: 'FINAL',
  });

  const keyPairs = new Array(100).fill(0).map(() => generateKey());

  await keyPairs
    .reduce<TransactionBuilder>(
      (acc, keyPair) =>
        acc.addKey(keyPair.publicKey.toString(), { type: 'fullAccess' }),
      baseUser.transaction(userId),
    )
    .send();

  console.timeEnd('Adding keys done:');

  // create a new keyService with 100 keys
  const keyStore = new RotatingKeyStore({
    [userId]: keyPairs.map((keyPair) => keyPair.secretKey.toString()),
  });

  const user = new Near({
    rpcUrl,
    keyStore,
    defaultSignerId: userId,
    defaultWaitUntil: 'FINAL',
  });

  // Check FT balance before run
  const ftTokensBalanceBefore = await user.view(
    ftContractId,
    'ft_balance_of',
    { account_id: getReceiverId(0) },
    { finality: 'final' },
  );

  console.log(`${getReceiverId(0)} ft balance (units):`, ftTokensBalanceBefore);

  // Send 1000 TXs to 10 accounts in parallel; 10 TXs per 1 key; 100 TX per 1 receiver
  const executeFtTransfer = (receiverId: string, units: string) =>
    ftTransfer(user.transaction(userId), ftContractId, receiverId, {
      units,
    }).send({ waitUntil: 'FINAL' });

  const executeTransfer = (receiverId: string, yoctoNear: bigint) =>
    user
      .transaction(userId)
      .transfer(receiverId, Amount.yocto(yoctoNear))
      .send({ waitUntil: 'FINAL' });

  const createTxPackForOneReceiver = (receiverId: string) => [
    executeFtTransfer(receiverId, '100'),
    executeTransfer(receiverId, 1n),
    executeFtTransfer(receiverId, '200'),
    executeTransfer(receiverId, 2n),
    executeFtTransfer(receiverId, '300'),
    executeTransfer(receiverId, 3n),
    executeFtTransfer(receiverId, '400'),
    executeTransfer(receiverId, 4n),
    executeFtTransfer(receiverId, '500'),
    executeTransfer(receiverId, 5n),
  ];

  // // 10 TXs * num of receivers
  const createFullTxPackForOneRun = () =>
    new Array(numberOfReceivers).fill(0).reduce((acc, i) => {
      acc.push(...createTxPackForOneReceiver(getReceiverId(i)));
      return acc;
    }, []);

  // TIME TO RUN THE TEST!

  // Count all output fetch requests to RPC
  let requestCount = 0;

  diagnosticsChannel.subscribe('undici:request:create', () => {
    requestCount++;
  });

  const txs = new Array(100).fill(0).reduce((acc) => {
    acc.push(...createFullTxPackForOneRun());
    return acc;
  }, []);

  console.log(`Run ${txs.length} transactions...`);
  console.time(`${txs.length} transactions done:`);

  try {
    const res = await Promise.allSettled(txs);
    console.log(
      'Successful txs:',
      res.reduce((acc, r) => acc + (r.status === 'fulfilled' && r.value ? 1 : 0), 0),
    );
    console.log(
      'Rejected txs:',
      res.reduce((acc, r) => acc + (r.status === 'rejected' ? 1 : 0), 0),
    );

  } catch (e) {
    console.log(e);
  }

  console.timeEnd(`${txs.length} transactions done:`);
  console.log(`HTTP requests send: ${requestCount}`);

  // END OF THE TEST

  // Check balance after
  const ftTokensBalanceAfter = await user.view(
    ftContractId,
    'ft_balance_of',
    { account_id: getReceiverId(0) },
    { finality: 'final' },
  );

  console.log(`${getReceiverId(0)} ft balance (units):`, ftTokensBalanceAfter);
};
