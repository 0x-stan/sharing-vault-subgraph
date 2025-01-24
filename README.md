# SharingWishVault Subgraph

这是一个用于索引 SharingWishVault 智能合约事件的 Envio subgraph。该 subgraph 追踪保险库的创建、捐赠、认领和结算等事件。

## 功能特点

- 追踪保险库的创建和基本信息
- 记录所有捐赠交易
- 跟踪认领记录
- 监控结算情况
- 支持按各种条件查询数据

## Schema 示例

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

## 安装

1. 克隆仓库:
```bash
git clone <repository-url>
cd sharing-vault-subgraph
```

2. 安装依赖:
```bash
npm install
```

## 配置

1. 在 `config.yaml` 文件中配置你的网络和合约信息
2. 根据需要修改 schema 定义

## 部署

1. 编译项目:
```bash
npm run build
```

2. 部署到 Envio:
```bash
npm run deploy
```

## 本地开发

1. 启动本地节点:
```bash
npm run start:dev
```

2. 运行测试:
```bash
npm test
```

## 文档

更多详细信息，请参考 [Envio 官方文档](https://docs.envio.dev)。

## 贡献

欢迎提交 Pull Request 和 Issue。

## 许可证

MIT
