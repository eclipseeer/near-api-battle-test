import { runBefore } from './1.before/before';
import { testNat } from './2.test/testNat';
import { runAfter } from './3.after/after';
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
