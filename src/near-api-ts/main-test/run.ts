import { runBefore } from './01.before';
import { testNat } from './02.test';
import { runAfter } from './03.after';
import { getFtContractId, getUserId } from './utils';
import diagnosticsChannel from 'node:diagnostics_channel';

console.time('Whole test took:');

// Count all output fetch requests to RPC
let requestCount = 0;

diagnosticsChannel.subscribe('undici:request:create', () => {
  requestCount++;
});

const userId = getUserId('nat');
const ftContractId = getFtContractId('nat');

await runBefore(userId, ftContractId);
await testNat(userId, ftContractId);
await runAfter(userId, ftContractId);

console.log(`Total HTTP requests: ${requestCount}`);
console.timeEnd('Whole test took:');
