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
} from './utils';
import diagnosticsChannel from 'node:diagnostics_channel';

export const testNat = async (userId: string, ftContractId: string) => {
  console.log('Start adding keys...');
  console.time('Adding keys done:');

  const client = createClient({
    transport: { rpcEndpoints: { regular: [{ url: rpcUrl }] } },
  });

  // add 100 FA keys for nat user
  const baseKeyService = createMemoryKeyService({
    keySource: { privateKey: ownerPrivateKey },
  });

  const baseUser = createMemorySigner({
    signerAccountId: userId,
    client,
    keyService: baseKeyService,
  });

  const keyPairs = new Array(100).fill(0).map(() => randomEd25519KeyPair());

  await baseUser.executeTransaction({
    intent: {
      actions: keyPairs.map((keyPair) => addFullAccessKey(keyPair)),
      receiverAccountId: baseUser.signerAccountId,
    },
  });

  console.timeEnd('Adding keys done:');

  // create a new keyService with 100 keys
  const keyService = createMemoryKeyService({ keySources: keyPairs });

  const user = createMemorySigner({
    signerAccountId: userId,
    client,
    keyService,
    taskQueue: { timeoutMs: 600_000 },
  });

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

  // Send 1000 TXs to 10 accounts in parallel; 10 TXs per 1 key; 100 TX per 1 receiver
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

  // TIME TO RUN THE TEST!

  // Count all output fetch requests to RPC
  let requestCount = 0;

  diagnosticsChannel.subscribe('undici:request:create', () => {
    requestCount++;
  });

  // 10 txs per receiver * 10 receivers * 100 runs = 10 000 txs
  const txs = new Array(10).fill(0).reduce((acc) => {
    acc.push(...createFullTxPackForOneRun());
    return acc;
  }, []);

  console.log(`Run ${txs.length} transactions...`);
  console.time(`${txs.length} transactions done:`);

  try {
    const res = await Promise.allSettled(txs);
    console.log(
      'Successful txs:',
      res.reduce(
        (acc, r) => acc + (r.status === 'fulfilled' && r.value ? 1 : 0),
        0,
      ),
    );
    console.log(
      'Rejected txs:',
      res.reduce((acc, r) => acc + (r.status === 'rejected' ? 1 : 0), 0),
    );
  } catch (e) {
    console.dir(e, { depth: null });
  }

  console.timeEnd(`${txs.length} transactions done:`);
  console.log(`HTTP requests send: ${requestCount}`);

  // END OF THE TEST

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
