/*
 * Please refer to https://docs.envio.dev for a thorough guide on all Envio indexer features
 */
import { SharingWishVault } from "generated";

SharingWishVault.EmergencyModeToggled.handler(async ({ event, context }) => {
  const entity = {
    id: event.transaction.hash + "-" + event.logIndex.toString(),  
    mode: event.params.mode,
    timestamp: BigInt(event.block.timestamp),
    blockNumber: BigInt(event.block.number),
    transactionHash: event.transaction.hash,
  };

  context.EmergencyMode.set(entity);
});

SharingWishVault.OwnershipTransferred.handler(async ({ event, context }) => {
  const entity = {
    id: event.transaction.hash + "-" + event.logIndex.toString(),
    previousOwner: event.params.previousOwner,
    newOwner: event.params.newOwner,
    timestamp: BigInt(event.block.timestamp),
    blockNumber: BigInt(event.block.number),
    transactionHash: event.transaction.hash,
  };

  context.OwnershipTransfer.set(entity);
});

SharingWishVault.VaultCreated.handler(async ({ event, context }) => {
  const vault = {
    id: event.params.vaultId.toString(),
    vaultId: event.params.vaultId,
    creator: event.params.creator,
    message: event.params.message,
    totalAmount: BigInt(0),
    totalClaimedAmount: BigInt(0),
    token: event.params.token,
    lockTime: BigInt(0), // Default lock time
    createdAt: BigInt(event.block.timestamp),
    updatedAt: BigInt(event.block.timestamp),
  };

  context.Vault.set(vault);
});

SharingWishVault.FundsDonated.handler(async ({ event, context }) => {
  const vaultId = event.params.vaultId.toString();
  const existingVault = await context.Vault.get(vaultId);

  if (existingVault) {
    // Create updated vault
    const vault = {
      ...existingVault,
      token: event.params.token,
      totalAmount: existingVault.totalAmount + event.params.amount,
      updatedAt: BigInt(event.block.timestamp),
    };
    context.Vault.set(vault);

    // Create donation record
    const donation = {
      id: `${vaultId}-${event.transaction.hash}-${event.logIndex}`,
      vault_id: vaultId,
      donor: event.params.donor,
      token: event.params.token,
      amount: event.params.amount,
      blockNumber: BigInt(event.block.number),
      timestamp: BigInt(event.block.timestamp),
      transactionHash: event.transaction.hash,
    };

    context.Donation.set(donation);
  }
});

SharingWishVault.VaultSettled.handler(async ({ event, context }) => {
  const vaultId = event.params.vaultId.toString();
  const vault = await context.Vault.get(vaultId);

  if (vault) {
    const settlement = {
      id: `${event.transaction.hash}-${event.logIndex}`,
      vault_id: vaultId,
      claimer: event.params.claimer,
      token: event.params.token,
      maxClaimableAmount: event.params.maxClaimableAmount,
      blockNumber: BigInt(event.block.number),
      timestamp: BigInt(event.block.timestamp),
      transactionHash: event.transaction.hash,
    };

    context.Settlement.set(settlement);
  }
});

SharingWishVault.FundsClaimed.handler(async ({ event, context }) => {
  const vaultId = event.params.vaultId.toString();
  const existingVault = await context.Vault.get(vaultId);

  if (existingVault) {
    // Update vault
    const vault = {
      ...existingVault,
      totalAmount: existingVault.totalAmount - event.params.amount,
      totalClaimedAmount: existingVault.totalClaimedAmount + event.params.amount,
      updatedAt: BigInt(event.block.timestamp),
    };
    context.Vault.set(vault);

    // Create claim record
    const claim = {
      id: `${event.transaction.hash}-${event.logIndex}`,
      vault_id: vaultId,
      claimer: event.params.claimer,
      token: event.params.token,
      amount: event.params.amount,
      blockNumber: BigInt(event.block.number),
      timestamp: BigInt(event.block.timestamp),
      transactionHash: event.transaction.hash,
    };

    context.Claim.set(claim);
  }
});

SharingWishVault.FundsWithdrawn.handler(async ({ event, context }) => {
  const vaultId = event.params.vaultId.toString();
  const existingVault = await context.Vault.get(vaultId);

  if (existingVault) {
    // Update vault
    const vault = {
      ...existingVault,
      totalAmount: existingVault.totalAmount - event.params.amount,
      updatedAt: BigInt(event.block.timestamp),
    };
    context.Vault.set(vault);

    // Create withdrawal record
    const withdrawal = {
      id: `${event.transaction.hash}-${event.logIndex}`,
      vault_id: vaultId,
      withdrawer: event.params.withdrawer,
      token: event.params.token,
      amount: event.params.amount,
      blockNumber: BigInt(event.block.number),
      timestamp: BigInt(event.block.timestamp),
      transactionHash: event.transaction.hash,
    };

    context.Withdrawal.set(withdrawal);
  }
});
