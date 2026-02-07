import { runBefore } from './01.before';

import { getFtContractId, getUserId } from './utils';
import diagnosticsChannel from 'node:diagnostics_channel';
import { testKit } from './02.test';
import { runAfter } from './03.after';

console.time('Whole test took:');

// Count all output fetch requests to RPC
let requestCount = 0;

diagnosticsChannel.subscribe('undici:request:create', () => {
  requestCount++;
});

const userId = getUserId();
const ftContractId = getFtContractId();

await runBefore(userId, ftContractId);
await testKit(userId, ftContractId);
await runAfter(userId, ftContractId);

console.log(`Total HTTP requests: ${requestCount}`);
console.timeEnd('Whole test took:');
