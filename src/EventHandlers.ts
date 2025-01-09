/*
 * Please refer to https://docs.envio.dev for a thorough guide on all Envio indexer features
 */
import { SharingWishVault } from "generated";

SharingWishVault.EmergencyModeToggled.handler(async ({ event, context }) => {
  const entity = {
    id: event.transactionHash,
    mode: event.params.mode,
    timestamp: event.block.timestamp,
    blockNumber: event.block.number,
    transactionHash: event.transactionHash,
  };

  context.EmergencyMode.set(entity);
});

SharingWishVault.OwnershipTransferred.handler(async ({ event, context }) => {
  const entity = {
    id: event.transactionHash,
    previousOwner: event.params.previousOwner,
    newOwner: event.params.newOwner,
    timestamp: event.block.timestamp,
    blockNumber: event.block.number,
    transactionHash: event.transactionHash,
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
    createdAt: event.block.timestamp,
    updatedAt: event.block.timestamp,
  };

  context.Vault.set(vault);
});

SharingWishVault.FundsDonated.handler(async ({ event, context }) => {
  const vaultId = event.params.vaultId.toString();
  const vault = await context.Vault.get(vaultId);

  if (vault) {
    // Update vault
    vault.token = event.params.token;
    vault.totalAmount = vault.totalAmount + event.params.amount;
    vault.updatedAt = event.block.timestamp;
    context.Vault.set(vault);

    // Create donation record
    const donation = {
      id: `${event.transactionHash}-${event.logIndex}`,
      vault: vaultId,
      donor: event.params.donor,
      token: event.params.token,
      amount: event.params.amount,
      blockNumber: event.block.number,
      timestamp: event.block.timestamp,
      transactionHash: event.transactionHash,
    };

    context.Donation.set(donation);
  }
});

SharingWishVault.VaultSettled.handler(async ({ event, context }) => {
  const vaultId = event.params.vaultId.toString();
  const vault = await context.Vault.get(vaultId);

  if (vault) {
    const settlement = {
      id: `${event.transactionHash}-${event.logIndex}`,
      vault: vaultId,
      claimer: event.params.claimer,
      token: event.params.token,
      maxClaimableAmount: event.params.maxClaimableAmount,
      blockNumber: event.block.number,
      timestamp: event.block.timestamp,
      transactionHash: event.transactionHash,
    };

    context.Settlement.set(settlement);
  }
});

SharingWishVault.FundsClaimed.handler(async ({ event, context }) => {
  const vaultId = event.params.vaultId.toString();
  const vault = await context.Vault.get(vaultId);

  if (vault) {
    // Update vault
    vault.totalAmount = vault.totalAmount - event.params.amount;
    vault.totalClaimedAmount = vault.totalClaimedAmount + event.params.amount;
    vault.updatedAt = event.block.timestamp;
    context.Vault.set(vault);

    // Create claim record
    const claim = {
      id: `${event.transactionHash}-${event.logIndex}`,
      vault: vaultId,
      claimer: event.params.claimer,
      token: event.params.token,
      amount: event.params.amount,
      blockNumber: event.block.number,
      timestamp: event.block.timestamp,
      transactionHash: event.transactionHash,
    };

    context.Claim.set(claim);
  }
});

SharingWishVault.FundsWithdrawn.handler(async ({ event, context }) => {
  const vaultId = event.params.vaultId.toString();
  const vault = await context.Vault.get(vaultId);

  if (vault) {
    // Update vault
    vault.totalAmount = vault.totalAmount - event.params.amount;
    vault.updatedAt = event.block.timestamp;
    context.Vault.set(vault);

    // Create withdrawal record
    const withdrawal = {
      id: `${event.transactionHash}-${event.logIndex}`,
      vault: vaultId,
      withdrawer: event.params.withdrawer,
      token: event.params.token,
      amount: event.params.amount,
      blockNumber: event.block.number,
      timestamp: event.block.timestamp,
      transactionHash: event.transactionHash,
    };

    context.Withdrawal.set(withdrawal);
  }
});
