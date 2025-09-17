import { Principal } from "@dfinity/principal";
import Web3 from "web3";

class USDCConverter {
  constructor() {
    const isMainnet = import.meta.env.VITE_DFX_NETWORK === "ic";

    // Contract addresses based on environment
    this.usdcContract = isMainnet
      ? "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48" // Mainnet USDC
      : "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238"; // Sepolia USDC

    this.helperContract = isMainnet
      ? "0x18901044688D3756C35Ed2b36D93e6a5B8e00E68" // Mainnet Helper
      : "0x2D39863d30716aaf2B7fFFd85Dd03Dda2BFC2E38"; // Sepolia Helper

    this.chainId = isMainnet ? 1 : 11155111; // Ethereum mainnet : Sepolia

    this.usdcABI = [
      {
        inputs: [
          { name: "_spender", type: "address" },
          { name: "_value", type: "uint256" },
        ],
        name: "approve",
        outputs: [{ name: "", type: "bool" }],
        type: "function",
      },
      {
        inputs: [{ name: "_owner", type: "address" }],
        name: "balanceOf",
        outputs: [{ name: "balance", type: "uint256" }],
        type: "function",
      },
      {
        inputs: [
          { name: "_owner", type: "address" },
          { name: "_spender", type: "address" },
        ],
        name: "allowance",
        outputs: [{ name: "", type: "uint256" }],
        type: "function",
      },
    ];
    this.helperABI = [
      {
        inputs: [
          { name: "token", type: "address" },
          { name: "amount", type: "uint256" },
          { name: "principal", type: "bytes32" },
          { name: "subaccount", type: "bytes32" },
        ],
        name: "depositErc20",
        outputs: [],
        type: "function",
      },
    ];
  }

  async connectWallet(preferredWallet = null) {
    const availableWallets = this.detectWallets();

    if (availableWallets.length === 0) {
      throw new Error("No wallets detected");
    }

    let selectedProvider;
    if (
      preferredWallet &&
      availableWallets.find((w) => w.name === preferredWallet)
    ) {
      selectedProvider = this.getWalletProvider(preferredWallet);
    } else if (availableWallets.length === 1) {
      selectedProvider = availableWallets[0].provider;
    } else {
      // Multiple wallets - let user choose
      const choice = await this.showWalletSelector(availableWallets);
      selectedProvider = choice.provider;
    }

    await selectedProvider.request({ method: "eth_requestAccounts" });

    const currentChainId = await selectedProvider.request({
      method: "eth_chainId",
    });
    const expectedChainId = `0x${this.chainId.toString(16)}`;

    if (currentChainId !== expectedChainId) {
      try {
        await selectedProvider.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: expectedChainId }],
        });
      } catch (switchError) {
        if (switchError.code === 4902 && this.chainId === 11155111) {
          await selectedProvider.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: expectedChainId,
                chainName: "Sepolia Test Network",
                nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
                rpcUrls: ["https://sepolia.infura.io/v3/"],
                blockExplorerUrls: ["https://sepolia.etherscan.io/"],
              },
            ],
          });
        } else {
          throw switchError;
        }
      }
    }

    return new Web3(selectedProvider);
  }

  detectWallets() {
    const wallets = [];

    if (window.ethereum?.isMetaMask)
      wallets.push({ name: "MetaMask", provider: window.ethereum });
    if (window.okxwallet)
      wallets.push({ name: "OKX", provider: window.okxwallet });
    if (window.ethereum?.isCoinbaseWallet)
      wallets.push({ name: "Coinbase", provider: window.ethereum });
    if (
      window.ethereum &&
      !window.ethereum.isMetaMask &&
      !window.ethereum.isCoinbaseWallet
    ) {
      wallets.push({ name: "Unknown", provider: window.ethereum });
    }

    return wallets;
  }

  getWalletProvider(walletName) {
    switch (walletName) {
      case "MetaMask":
        return window.ethereum;
      case "OKX":
        return window.okxwallet;
      case "Coinbase":
        return window.ethereum;
      default:
        return window.ethereum;
    }
  }

  async showWalletSelector(wallets) {
    return new Promise((resolve) => {
      const modal = document.createElement("div");
      modal.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(0,0,0,0.5); display: flex; align-items: center; 
      justify-content: center; z-index: 10000;
    `;

      const content = document.createElement("div");
      content.style.cssText = `
      background: white; padding: 24px; border-radius: 12px; 
      max-width: 400px; width: 90%;
    `;

      content.innerHTML = `
      <h3 style="margin: 0 0 16px 0;">Select Wallet</h3>
      <div id="wallet-options"></div>
    `;

      const options = content.querySelector("#wallet-options");
      wallets.forEach((wallet) => {
        const button = document.createElement("button");
        button.style.cssText = `
        width: 100%; padding: 12px; margin: 8px 0; border: 1px solid #ddd;
        border-radius: 8px; cursor: pointer; background: white;
      `;
        button.textContent = wallet.name;
        button.onclick = () => {
          document.body.removeChild(modal);
          resolve(wallet);
        };
        options.appendChild(button);
      });

      modal.appendChild(content);
      document.body.appendChild(modal);
    });
  }

  encodePrincipal(principalText) {
    const principal = Principal.fromText(principalText);
    const bytes = principal.toUint8Array();
    const padded = new Uint8Array(32);
    padded.set(bytes, 32 - bytes.length);
    return (
      "0x" +
      Array.from(padded)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("")
    );
  }

  async convertUSDC(amount, icPrincipal) {
    const web3 = await this.connectWallet();
    const accounts = await web3.eth.getAccounts();
    const userAddress = accounts[0];

    const usdcContract = new web3.eth.Contract(this.usdcABI, this.usdcContract);
    const helperContract = new web3.eth.Contract(
      this.helperABI,
      this.helperContract,
    );

    const usdcAmount = (amount * 1_000_000).toString();
    const encodedPrincipal = this.encodePrincipal(icPrincipal);

    // Check current allowance
    const allowance = await usdcContract.methods
      .allowance(userAddress, this.helperContract)
      .call();
    let approveHash = null;

    if (BigInt(allowance) < BigInt(usdcAmount)) {
      const approveTx = await usdcContract.methods
        .approve(this.helperContract, usdcAmount)
        .send({ from: userAddress });
      approveHash = approveTx.transactionHash;
    }

    const depositTx = await helperContract.methods
      .depositErc20(
        this.usdcContract,
        usdcAmount,
        encodedPrincipal,
        "0x0000000000000000000000000000000000000000000000000000000000000000",
      )
      .send({ from: userAddress });

    return {
      success: true,
      approveHash,
      depositHash: depositTx.transactionHash,
      explorerUrl: this.getExplorerUrl(depositTx.transactionHash),
    };
  }

  async getUSDCBalance() {
    const web3 = await this.connectWallet();
    const accounts = await web3.eth.getAccounts();
    const contract = new web3.eth.Contract(this.usdcABI, this.usdcContract);
    const balance = await contract.methods.balanceOf(accounts[0]).call();
    return (Number(balance) / 1_000_000).toFixed(2);
  }

  getExplorerUrl(txHash) {
    const baseUrl =
      this.chainId === 1
        ? "https://etherscan.io"
        : "https://sepolia.etherscan.io";
    return `${baseUrl}/tx/${txHash}`;
  }

  getNetworkName() {
    return this.chainId === 1 ? "Ethereum Mainnet" : "Sepolia Testnet";
  }
}

export const usdcConverter = new USDCConverter();
