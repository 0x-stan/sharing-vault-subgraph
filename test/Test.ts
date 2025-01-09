import assert from "assert";
import { 
  TestHelpers,
  SharingWishVault_EmergencyModeToggled
} from "generated";
const { MockDb, SharingWishVault } = TestHelpers;

describe("SharingWishVault contract EmergencyModeToggled event tests", () => {
  // Create mock db
  const mockDb = MockDb.createMockDb();

  // Creating mock for SharingWishVault contract EmergencyModeToggled event
  const event = SharingWishVault.EmergencyModeToggled.createMockEvent({/* It mocks event fields with default values. You can overwrite them if you need */});

  it("SharingWishVault_EmergencyModeToggled is created correctly", async () => {
    // Processing the event
    const mockDbUpdated = await SharingWishVault.EmergencyModeToggled.processEvent({
      event,
      mockDb,
    });

    // Getting the actual entity from the mock database
    let actualSharingWishVaultEmergencyModeToggled = mockDbUpdated.entities.SharingWishVault_EmergencyModeToggled.get(
      `${event.chainId}_${event.block.number}_${event.logIndex}`
    );

    // Creating the expected entity
    const expectedSharingWishVaultEmergencyModeToggled: SharingWishVault_EmergencyModeToggled = {
      id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
      mode: event.params.mode,
    };
    // Asserting that the entity in the mock database is the same as the expected entity
    assert.deepEqual(actualSharingWishVaultEmergencyModeToggled, expectedSharingWishVaultEmergencyModeToggled, "Actual SharingWishVaultEmergencyModeToggled should be the same as the expectedSharingWishVaultEmergencyModeToggled");
  });
});
