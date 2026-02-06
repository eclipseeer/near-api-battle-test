import { runBefore } from './01.before';

import { getFtContractId, getUserId } from './utils';
import diagnosticsChannel from 'node:diagnostics_channel';
import { testKit } from './02.test';

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

console.log(`Total HTTP requests: ${requestCount}`);
console.timeEnd('Whole test took:');
