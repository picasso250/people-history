
<script>
    import { onMount } from 'svelte';
    import { ethers } from 'ethers';
    import abi from './lib/ABI.json';

    // --- 配置区 (来自 CONTRACT_SPEC.md) ---
    const contractAddress = "0xC415e346Ebb297Cf849E2323702C97E6DC01bee7";
    const targetNetwork = {
        chainId: '0xa4b1', // Arbitrum One
        chainName: 'Arbitrum One',
        rpcUrls: ['https://arb1.arbitrum.io/rpc'],
        nativeCurrency: { name: 'ETH', decimals: 18, symbol: 'ETH' },
        blockExplorerUrls: ['https://arbiscan.io']
    };

    // --- 状态管理 ---
    let provider;
    let signer;
    let contract;

    let account = null;
    let content = "";
    let view = "form"; // 'form', 'success'
    let statusMessage = "铭刻 (Inscribe)";
    let txHash = "";
    let errorMessage = "";
    let isLoading = false;

    // --- 生命周期 ---
    onMount(() => {
        if (typeof window.ethereum !== 'undefined') {
            provider = new ethers.BrowserProvider(window.ethereum);
            
            // 监听账户变化
            window.ethereum.on('accountsChanged', (accounts) => {
                if (accounts.length > 0) {
                    account = accounts[0];
                    signer = provider.getSigner(account);
                    contract = new ethers.Contract(contractAddress, abi, signer);
                } else {
                    account = null;
                    signer = null;
                    contract = null;
                }
            });
        } else {
            statusMessage = "请安装 MetaMask 钱包";
        }
    });

    // --- 核心函数 ---
    async function connectWallet() {
        if (!provider) return;
        isLoading = true;
        statusMessage = "连接钱包中...";
        try {
            const accounts = await provider.send("eth_requestAccounts", []);
            account = accounts[0];
            signer = await provider.getSigner();
            contract = new ethers.Contract(contractAddress, abi, signer);
            statusMessage = "铭刻 (Inscribe)";
        } catch (error) {
            console.error("连接钱包失败:", error);
            errorMessage = "用户拒绝了连接请求。";
            statusMessage = "连接钱包 (Connect Wallet)";
        } finally {
            isLoading = false;
        }
    }

    async function switchNetwork() {
        try {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: targetNetwork.chainId }],
            });
        } catch (switchError) {
            // This error code indicates that the chain has not been added to MetaMask.
            if (switchError.code === 4902) {
                try {
                    await window.ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [targetNetwork],
                    });
                } catch (addError) {
                   throw addError;
                }
            } else {
                throw switchError;
            }
        }
    }


    async function handleInscribe() {
        if (!account) {
            await connectWallet();
            return;
        }
        if (!content.trim()) {
            errorMessage = "铭刻内容不能为空。";
            return;
        }

        isLoading = true;
        errorMessage = "";
        statusMessage = "正在请求签名...";

        try {
            // 检查网络
            const network = await provider.getNetwork();
            if (`0x${network.chainId.toString(16)}` !== targetNetwork.chainId) {
                 statusMessage = "正在切换网络...";
                 await switchNetwork();
            }

            statusMessage = "正在铭刻...";
            const tx = await contract.inscribe(content);
            statusMessage = "等待链上确认...";
            const receipt = await tx.wait();
            
            txHash = receipt.hash;
            view = "success";

        } catch (error) {
            console.error("铭刻失败:", error);
            if (error.code === 'ACTION_REJECTED') {
                 errorMessage = "用户拒绝了交易。";
            } else {
                 errorMessage = "铭刻失败，请检查控制台获取更多信息。";
            }
        } finally {
            isLoading = false;
            statusMessage = "铭刻 (Inscribe)";
        }
    }

    function reset() {
        view = "form";
        content = "";
        txHash = "";
        errorMessage = "";
    }

    function copyTxHash() {
        navigator.clipboard.writeText(txHash);
        // 可以增加一个复制成功的提示
    }

</script>

<main>
    {#if view === 'form'}
        <div class="altar">
            <textarea 
                class="verse-box" 
                bind:value={content}
                placeholder="今天，你愿意铭刻下什么，留给一千年后的世界？"
                disabled={isLoading}
            ></textarea>
            
            <button 
                class="inscribe-button" 
                on:click={handleInscribe}
                disabled={isLoading || (statusMessage === '请安装 MetaMask 钱包')}
            >
                {account ? statusMessage : '连接钱包 (Connect Wallet)'}
            </button>
            
            {#if errorMessage}
                <p class="error">{errorMessage}</p>
            {/if}
        </div>
    {:else if view === 'success'}
        <div class="success-view">
            <h2>铭刻成功 (Inscribed)</h2>
            <p>你的永恒数字坐标：</p>
            <div class="tx-hash-wrapper">
                <span class="tx-hash">{txHash}</span>
                <button class="copy-button" on:click={copyTxHash}>复制</button>
            </div>
            <a 
                href={`https://arbiscan.io/tx/${txHash}`} 
                target="_blank" 
                rel="noopener noreferrer"
                class="arbiscan-link"
            >
                在 Arbiscan 上验证 &rarr;
            </a>
            <button class="inscribe-button" on:click={reset}>
                再铭刻一条 (Inscribe Another)
            </button>
        </div>
    {/if}
</main>

<footer>
    <a href="#">我们的承诺</a>
    <span>&bull;</span>
    <a href="#">阅览室</a>
</footer>

<style>
    .error {
        color: #ef5350;
    }
</style>