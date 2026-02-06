import 'dotenv/config';
import { TransactionBuilder } from 'near-kit';

export const rpcUrl = process.env.RPC_URL as string;
export const ownerId = process.env.OWNER_ACCOUNT_ID as string;
export const ownerPrivateKey = process.env.OWNER_PRIVATE_KEY as any;
export const ownerPublicKey = process.env.OWNER_PUBLIC_KEY as any;
export const numberOfReceivers = 10;

export const getFtContractId = () => `nabt-near-kit-ft.${ownerId}`;

export const getUserId = () => `nabt-near-kit-user.${ownerId}`;

export const getReceiverId = (index: number) =>
  `nabt-near-kit-receiver-${index}.${ownerId}`;

export const storageDeposit = (args: {
  transactionBuilder: TransactionBuilder;
  contractId: string;
  accountId: string;
}) =>
  args.transactionBuilder.functionCall(
    args.contractId,
    'storage_deposit',
    { account_id: args.accountId },
    {
      gas: '10 Tgas',
      attachedDeposit: '0.00125 NEAR',
    },
  );

export const ftTransfer = (
  transactionBuilder: TransactionBuilder,
  contractId: string,
  receiverId: string,
  amount: { units: string },
) =>
  transactionBuilder.functionCall(
    contractId,
    'ft_transfer',
    {
      receiver_id: receiverId,
      amount: amount.units,
    },
    {
      gas: '10 Tgas',
      attachedDeposit: '1 yocto',
    },
  );
