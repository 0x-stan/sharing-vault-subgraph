# SharingWishVault subgraph

```graphql
{
  Vault {
    id
    vaultId
    creator
    createdAt
    message
    token
    totalAmount
    totalClaimedAmount
    lockTime
    donations {
      donor
      amount
      token
    }
    claims {
      claimer
      token
      amount
    }
    settlements {
      claimer
      maxClaimableAmount
    }
  }
}
```

## Envio Blank Template

*Please refer to the [documentation website](https://docs.envio.dev) for a thorough guide on all Envio indexer features*
