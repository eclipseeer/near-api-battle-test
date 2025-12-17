import {
  addFullAccessKey,
  createClient,
  createMemoryKeyService,
  createMemorySigner,
  randomEd25519KeyPair,
  transfer,
} from 'near-api-ts';
import {
  ftTransfer,
  getReceiverId,
  numberOfReceivers,
  ownerPrivateKey,
  rpcUrl,
  sleep,
} from '../utils';
import diagnosticsChannel from 'node:diagnostics_channel';

export const testNat = async (userId: string, ftContractId: string) => {
  console.log('Start adding keys...');
  console.time('Adding keys done:');

  const client = await createClient({
    transport: {
      rpcEndpoints: {
        regular: [{ url: rpcUrl }],
      },
    },
  });

  // add 100 FA keys for nat user
  const baseKeyService = await createMemoryKeyService({
    keySource: { privateKey: ownerPrivateKey },
  });

  const baseUser = await createMemorySigner({
    signerAccountId: userId,
    client,
    keyService: baseKeyService,
  });

  const keyPairs = new Array(100).fill(0).map(() => randomEd25519KeyPair());

  await baseUser.executeTransaction({
    intent: {
      actions: keyPairs.map((keyPair) =>
        addFullAccessKey({ publicKey: keyPair.publicKey }),
      ),
      receiverAccountId: baseUser.signerAccountId,
    },
  });

  console.timeEnd('Adding keys done:');

  baseUser.stop();

  // create new keyService with 100 keys
  const keyService = await createMemoryKeyService({ keySources: keyPairs });

  // make sure data updated
  await sleep(3000);

  const user = await createMemorySigner({
    signerAccountId: userId,
    client,
    keyService,
    taskQueue: { maxWaitInQueueMs: 600_000 },
  });

  // Send 1000 TXs to 10 accounts in parallel; 10 TXs per 1 key;  100 TX per 1 receiver
  const executeFtTransfer = (receiverId: string, units: string) =>
    user.executeTransaction({
      intent: {
        action: ftTransfer(receiverId, { units }),
        receiverAccountId: ftContractId,
      },
    });

  const executeTransfer = (receiverId: string, yoctoNear: bigint) =>
    user.executeTransaction({
      intent: {
        action: transfer({ amount: { yoctoNear } }),
        receiverAccountId: receiverId,
      },
    });

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

  // 10 TXs * num of receivers
  const createFullTxPackForOneRun = () =>
    new Array(numberOfReceivers).fill(0).reduce((acc, i) => {
      acc.push(...createTxPackForOneReceiver(getReceiverId(i)));
      return acc;
    }, []);

  await sleep(2000);
  // Check balance before run
  const ftTokensBalanceBefore = await client.callContractReadFunction({
    contractAccountId: ftContractId,
    functionName: 'ft_balance_of',
    functionArgs: { account_id: getReceiverId(0) },
  });
  console.log(
    `${getReceiverId(0)} ft balance (units):`,
    ftTokensBalanceBefore.result,
  );

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
    await Promise.all(txs);
  } catch (e) {
    console.log(e);
  }

  console.timeEnd(`${txs.length} transactions done:`);
  console.log(`HTTP requests send: ${requestCount}`);
  user.stop();

  // END OF THE TEST

  await sleep(3000);
  // Check balance after
  const ftTokensBalanceAfter = await client.callContractReadFunction({
    contractAccountId: ftContractId,
    functionName: 'ft_balance_of',
    functionArgs: { account_id: getReceiverId(0) },
  });
  console.log(
    `${getReceiverId(0)} ft balance (units):`,
    ftTokensBalanceAfter.result,
  );
};
