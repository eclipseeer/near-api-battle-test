import { createClient } from 'near-api-ts';
import { getFtContractId, getReceiverId, getUserId, rpcUrl } from './utils';

const client = createClient({
  transport: { rpcEndpoints: { regular: [{ url: rpcUrl }] } },
});

const res = await Promise.all([
  client.safeGetAccountInfo({ accountId: getUserId('nat') }),
  client.safeGetAccountInfo({ accountId: getFtContractId('nat') }),
  client.safeGetAccountInfo({ accountId: getReceiverId(0) }),
  client.safeGetAccountInfo({ accountId: getReceiverId(1) }),
  client.safeGetAccountInfo({ accountId: getReceiverId(2) }),
  client.safeGetAccountInfo({ accountId: getReceiverId(3) }),
  client.safeGetAccountInfo({ accountId: getReceiverId(4) }),
  client.safeGetAccountInfo({ accountId: getReceiverId(5) }),
  client.safeGetAccountInfo({ accountId: getReceiverId(6) }),
  client.safeGetAccountInfo({ accountId: getReceiverId(7) }),
  client.safeGetAccountInfo({ accountId: getReceiverId(8) }),
  client.safeGetAccountInfo({ accountId: getReceiverId(9) }),
]);

console.log(res.map((r) => r.ok));
