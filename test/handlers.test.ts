import assert from "assert";
import { 
  TestHelpers,
  EmergencyMode,
  Vault,
  Donation,
  Settlement,
  Claim,
  OwnershipTransfer
} from "../generated";
const { MockDb, SharingWishVault, Addresses } = TestHelpers;

describe("Event Handlers", () => {
  // Create mock db with event sync state
  const mockDb = MockDb.createMockDb();

  describe("handleEmergencyModeToggled", () => {
    // Creating mock event
    const event = SharingWishVault.EmergencyModeToggled.createMockEvent({
      mode: true,
      mockEventData: {
        chainId: 1,
        srcAddress: Addresses.defaultAddress,
        transaction: {
          hash: "0x0000000000000000000000000000000000000000000000000000000000000000",
          gasUsed: 0n,
        },
        logIndex: 0,
      },
    });

    it("creates emergency mode entity", async () => {
      const mockDbUpdated = await SharingWishVault.EmergencyModeToggled.processEvent({
        event,
        mockDb,
      });

      const actualEmergencyMode = mockDbUpdated.entities.EmergencyMode.get(event.transaction.hash + "-" + event.logIndex.toString());
      const expectedEmergencyMode: EmergencyMode = {
        id: event.transaction.hash + "-" + event.logIndex.toString(),
        mode: event.params.mode,
        transactionHash: event.transaction.hash,
        blockNumber: BigInt(event.block.number),
        timestamp: BigInt(event.block.timestamp),
      };

      assert.deepEqual(actualEmergencyMode, expectedEmergencyMode, "EmergencyMode entity should match expected values");
    });
  });

  describe("handleVaultCreated", () => {
    const event = SharingWishVault.VaultCreated.createMockEvent({
      vaultId: 1n,
      creator: Addresses.defaultAddress,
      message: "Test Vault",
      mockEventData: {
        chainId: 1,
        srcAddress: Addresses.defaultAddress,
        transaction: {
          hash: "0x0000000000000000000000000000000000000000000000000000000000000000",
          gasUsed: 0n,
        },
        logIndex: 0,
      },
    });

    it("creates new vault entity", async () => {
      const mockDbUpdated = await SharingWishVault.VaultCreated.processEvent({
        event,
        mockDb,
      });

      const actualVault = mockDbUpdated.entities.Vault.get(event.params.vaultId.toString());
      const expectedVault: Vault = {
        id: event.params.vaultId.toString(),
        vaultId: event.params.vaultId,
        creator: event.params.creator,
        message: event.params.message,
        createdAt: BigInt(event.block.timestamp),
        updatedAt: BigInt(event.block.timestamp),
        token: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        lockTime: 0n,
        totalAmount: 0n,
        totalClaimedAmount: 0n,
      };

      assert.deepEqual(actualVault, expectedVault, "Vault entity should match expected values");
    });
  });

  describe("handleFundsDonated", async () => {
    const vaultId = 1n;
    const amount = 100n;
    const token = Addresses.defaultAddress;

    // First create a vault
    const createEvent = SharingWishVault.VaultCreated.createMockEvent({
      vaultId,
      creator: Addresses.defaultAddress,
      message: "Test Vault",
      mockEventData: {
        chainId: 1,
        srcAddress: Addresses.defaultAddress,
        transaction: {
          hash: "0x0000000000000000000000000000000000000000000000000000000000000000",
          gasUsed: 0n,
        },
        logIndex: 0,
      },
    });

    let mockDbWithVault = MockDb.createMockDb();

    mockDbWithVault = await SharingWishVault.VaultCreated.processEvent({
      event: createEvent,
      mockDb: mockDbWithVault,
    });

    // Then create donation event
    const donateEvent = SharingWishVault.FundsDonated.createMockEvent({
      vaultId,
      donor: Addresses.defaultAddress,
      token,
      amount,
      mockEventData: {
        chainId: 1,
        srcAddress: Addresses.defaultAddress,
        transaction: {
          hash: "0x0000000000000000000000000000000000000000000000000000000000000001",
          gasUsed: 0n,
        },
        logIndex: 0,
      },
    });

    it("should process funds donated event correctly", async () => {
      const mockDbUpdated = await SharingWishVault.FundsDonated.processEvent({
        event: donateEvent,
        mockDb: mockDbWithVault,
      });

      const donationId = `${vaultId}-${donateEvent.transaction.hash}-${donateEvent.logIndex}`;
      const actualDonation = mockDbUpdated.entities.Donation.get(donationId);
      const expectedDonation: Donation = {
        id: donationId,
        vault_id: vaultId.toString(),
        donor: donateEvent.params.donor,
        token: donateEvent.params.token,
        amount: donateEvent.params.amount,
        blockNumber: BigInt(donateEvent.block.number),
        timestamp: BigInt(donateEvent.block.timestamp),
        transactionHash: donateEvent.transaction.hash,
      };

      assert.deepEqual(actualDonation, expectedDonation, "Donation entity should match expected values");

      const actualVault = mockDbUpdated.entities.Vault.get(vaultId.toString());
      assert.equal(actualVault?.totalAmount, amount, "Vault totalAmount should be updated");
    });
  });

  describe("handleVaultSettled", () => {
    const vaultId = 1n;
    const maxClaimableAmount = 100n;
    const token = Addresses.defaultAddress;
    const claimer = Addresses.defaultAddress;

    // First create a vault
    const createEvent = SharingWishVault.VaultCreated.createMockEvent({
      vaultId,
      creator: Addresses.defaultAddress,
      message: "Test Vault",
      mockEventData: {
        chainId: 1,
        srcAddress: Addresses.defaultAddress,
        transaction: {
          hash: "0x0000000000000000000000000000000000000000000000000000000000000000",
          gasUsed: 0n,
        },
        logIndex: 0,
      }
    });

    let mockDbWithVault: any;

    beforeEach(async () => {
      mockDbWithVault = MockDb.createMockDb();
      mockDbWithVault = await SharingWishVault.VaultCreated.processEvent({
        event: createEvent,
        mockDb: mockDbWithVault,
      });
    });

    // Then create settle event
    const settleEvent = SharingWishVault.VaultSettled.createMockEvent({
      vaultId,
      claimer,
      token,
      maxClaimableAmount,
      mockEventData: {
        chainId: 1,
        srcAddress: Addresses.defaultAddress,
        transaction: {
          hash: "0x0000000000000000000000000000000000000000000000000000000000000001",
          gasUsed: 0n,
        },
        logIndex: 0,
      },
    });

    it("creates settlement entity", async () => {
      const mockDbUpdated = await SharingWishVault.VaultSettled.processEvent({
        event: settleEvent,
        mockDb: mockDbWithVault,
      });

      const settlementId = `${settleEvent.transaction.hash}-${settleEvent.logIndex}`;
      const actualSettlement = mockDbUpdated.entities.Settlement.get(settlementId);
      const expectedSettlement: Settlement = {
        id: settlementId,
        vault_id: vaultId.toString(),
        claimer: settleEvent.params.claimer,
        token: settleEvent.params.token,
        maxClaimableAmount: settleEvent.params.maxClaimableAmount,
        blockNumber: BigInt(settleEvent.block.number),
        timestamp: BigInt(settleEvent.block.timestamp),
        transactionHash: settleEvent.transaction.hash,
      };

      assert.deepEqual(actualSettlement, expectedSettlement, "Settlement entity should match expected values");
    });
  });

  describe("handleFundsClaimed", async () => {
    const vaultId = 1n;
    const amount = 50n;
    const token = Addresses.defaultAddress;
    const claimer = Addresses.defaultAddress;

    // First create a vault
    const createEvent = SharingWishVault.VaultCreated.createMockEvent({
      vaultId,
      creator: Addresses.defaultAddress,
      message: "Test Vault",
      mockEventData: {
        chainId: 1,
        srcAddress: Addresses.defaultAddress,
        transaction: {
          hash: "0x0000000000000000000000000000000000000000000000000000000000000000",
          gasUsed: 0n,
        },
        logIndex: 0,
      },
    });

    let mockDbWithVault = MockDb.createMockDb();

    mockDbWithVault = await SharingWishVault.VaultCreated.processEvent({
      event: createEvent,
      mockDb: mockDbWithVault,
    });

    // Then create claim event
    const claimEvent = SharingWishVault.FundsClaimed.createMockEvent({
      vaultId,
      claimer,
      token,
      amount,
      mockEventData: {
        chainId: 1,
        srcAddress: Addresses.defaultAddress,
        transaction: {
          hash: "0x0000000000000000000000000000000000000000000000000000000000000001",
          gasUsed: 0n,
        },
        logIndex: 0,
      },
    });

    it("updates vault and creates claim entity", async () => {
      const mockDbUpdated = await SharingWishVault.FundsClaimed.processEvent({
        event: claimEvent,
        mockDb: mockDbWithVault,
      });

      const claimId = `${claimEvent.transaction.hash}-${claimEvent.logIndex}`;
      const actualClaim = mockDbUpdated.entities.Claim.get(claimId);
      const expectedClaim: Claim = {
        id: claimId,
        vault_id: vaultId.toString(),
        claimer: claimEvent.params.claimer,
        token: claimEvent.params.token,
        amount: claimEvent.params.amount,
        blockNumber: BigInt(claimEvent.block.number),
        timestamp: BigInt(claimEvent.block.timestamp),
        transactionHash: claimEvent.transaction.hash,
      };

      assert.deepEqual(actualClaim, expectedClaim, "Claim entity should match expected values");

      const actualVault = mockDbUpdated.entities.Vault.get(vaultId.toString());
      assert.equal(actualVault?.totalClaimedAmount, amount, "Vault totalClaimedAmount should be updated");
    });
  });

  describe("handleOwnershipTransferred", () => {
    const event = SharingWishVault.OwnershipTransferred.createMockEvent({
      previousOwner: Addresses.defaultAddress,
      newOwner: "0x5678901234567890123456789012345678901234",
      mockEventData: {
        chainId: 1,
        srcAddress: Addresses.defaultAddress,
        transaction: {
          hash: "0x0000000000000000000000000000000000000000000000000000000000000000",
          gasUsed: 0n,
        },
        logIndex: 0,
      },
    });

    it("creates ownership transfer entity", async () => {
      const mockDbUpdated = await SharingWishVault.OwnershipTransferred.processEvent({
        event,
        mockDb,
      });

      const actualTransfer = mockDbUpdated.entities.OwnershipTransfer.get(event.transaction.hash + "-" + event.logIndex.toString());
      const expectedTransfer: OwnershipTransfer = {
        id: event.transaction.hash + "-" + event.logIndex.toString(),
        previousOwner: event.params.previousOwner,
        newOwner: event.params.newOwner,
        timestamp: BigInt(event.block.timestamp),
        blockNumber: BigInt(event.block.number),
        transactionHash: event.transaction.hash,
      };

      assert.deepEqual(actualTransfer, expectedTransfer, "OwnershipTransfer entity should match expected values");
    });
  });
});
