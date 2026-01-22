/** Minimal Hardhat config for Base mainnet fork */
module.exports = {
  networks: {
    hardhat: {
      chainId: 8453,
      forking: {
        url: "https://mainnet.base.org",
      },
    },
  },
};


