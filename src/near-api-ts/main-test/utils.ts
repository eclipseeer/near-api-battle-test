import 'dotenv/config';
import { functionCall } from 'near-api-ts';

export const rpcUrl = process.env.RPC_URL as string;
export const ownerId = process.env.OWNER_ACCOUNT_ID as string;
export const ownerPrivateKey = process.env.OWNER_PRIVATE_KEY as any;
export const ownerPublicKey = process.env.OWNER_PUBLIC_KEY as any;
export const numberOfReceivers = 10;

export const getFtContractId = (libName: string) =>
  `nabt-${libName}-ft.${ownerId}`;

export const getUserId = (libName: string) => `nabt-${libName}-user.${ownerId}`;

export const getReceiverId = (index: number) =>
  `nabt-receiver-${index}.${ownerId}`;

export const storageDeposit = (accountId: string) =>
  functionCall({
    functionName: 'storage_deposit',
    functionArgs: {
      account_id: accountId,
    },
    gasLimit: { teraGas: '10' },
    attachedDeposit: { near: '0.00125' },
  });

export const ftTransfer = (receiverId: string, amount: { units: string }) =>
  functionCall({
    functionName: 'ft_transfer',
    functionArgs: {
      receiver_id: receiverId,
      amount: amount.units,
    },
    gasLimit: { teraGas: '10' },
    attachedDeposit: { yoctoNear: '1' },
  });

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));
