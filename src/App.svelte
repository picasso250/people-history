<script>
    import { onMount } from 'svelte';
    import { ethers } from 'ethers';
    import abi from './lib/ABI.json';
    import snapshotData from './lib/history_snapshot.json';

    // --- 配置区 (来自 CONTRACT_SPEC.md) ---
    const contractAddress = "0xC415e346Ebb297Cf849E2323702C97E6DC01bee7";
    const publicRpcUrl = "https://arb1.arbitrum.io/rpc";
    const targetNetwork = {
        chainId: '0xa4b1', // Arbitrum One
        chainName: 'Arbitrum One',
        rpcUrls: [publicRpcUrl],
        nativeCurrency: { name: 'ETH', decimals: 18, symbol: 'ETH' },
        blockExplorerUrls: ['https://arbiscan.io']
    };

    // --- 状态管理 ---
    let browserProvider;
    let signer;
    let contract;
    let readonlyProvider = new ethers.JsonRpcProvider(publicRpcUrl); // For read-only operations
    let readonlyContract = new ethers.Contract(contractAddress, abi, readonlyProvider);

    let account = null;
    let content = "";
    let view = "form"; // 'form', 'success'
    let statusMessage = "铭刻 (Inscribe)";
    let txHash = "";
    let errorMessage = "";
    let isLoading = false;
    
    // --- 新增状态：最近铭刻 ---
    let recentInscriptions = [];

    // --- 生命周期 ---
    onMount(() => {
        // 1. 立即加载并渲染本地快照
        recentInscriptions = snapshotData.sort((a, b) => b.timestamp - a.timestamp);
        
        // 2. 并行获取实时数据
        fetchLiveInscriptions();

        if (typeof window.ethereum !== 'undefined') {
            browserProvider = new ethers.BrowserProvider(window.ethereum);
            
            window.ethereum.on('accountsChanged', (accounts) => {
                if (accounts.length > 0) {
                    connectWallet(true); // Re-connect silently
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
    
    // --- 新增函数：获取和合并数据 ---
    async function fetchLiveInscriptions() {
        try {
            const latestBlock = await readonlyProvider.getBlockNumber();
            const startBlock = Math.max(0, latestBlock - 1000); // 扫描最近1000个区块
            
            const events = await readonlyContract.queryFilter("Record", startBlock, "latest");

            if (events.length > 0) {
                const liveData = events.map(event => ({
                    author: event.args.author,
                    timestamp: Number(event.args.timestamp),
                    content: event.args.content,
                    transactionHash: event.transactionHash
                }));

                // 合并、去重、排序
                const allData = [...snapshotData, ...liveData];
                const uniqueData = Array.from(new Map(allData.map(item => [item.transactionHash, item])).values());
                recentInscriptions = uniqueData.sort((a, b) => b.timestamp - a.timestamp).slice(0, 10);
            }
        } catch (error) {
            console.error("获取实时事件失败:", error);
            // 即使失败，页面上依然有快照数据，体验不会中断
        }
    }


    // --- 核心函数 (有微调) ---
    async function connectWallet(silent = false) {
        if (!browserProvider) return;
        isLoading = true;
        if (!silent) statusMessage = "连接钱包中...";
        
        try {
            const accounts = await browserProvider.send("eth_requestAccounts", []);
            account = accounts[0];
            signer = await browserProvider.getSigner();
            contract = new ethers.Contract(contractAddress, abi, signer);
            if (!silent) statusMessage = "铭刻 (Inscribe)";
        } catch (error) {
            console.error("连接钱包失败:", error);
            if (!silent) errorMessage = "用户拒绝了连接请求。";
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
            if (switchError.code === 4902) {
                await window.ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [targetNetwork],
                });
            } else { throw switchError; }
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
            const network = await browserProvider.getNetwork();
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

            // 成功后，刷新一下最近列表
            fetchLiveInscriptions();

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
    }
    
    // --- 新增辅助函数 ---
    function formatAddress(address) {
        if (!address) return '';
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    }
    
    function formatDate(timestamp) {
        return new Date(timestamp * 1000).toLocaleString();
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

    <!-- ========== 新增：最近铭刻 ========== -->
    <section class="recent-inscriptions">
        <h3>最近铭刻</h3>
        {#if recentInscriptions.length > 0}
            {#each recentInscriptions as item (item.transactionHash)}
                <div class="inscription-card">
                    <p class="inscription-content">"{item.content}"</p>
                    <div class="inscription-meta">
                        <span>{formatDate(item.timestamp)}</span>
                        <a href={`https://arbiscan.io/address/${item.author}`} target="_blank" rel="noopener noreferrer">
                            by: {formatAddress(item.author)}
                        </a>
                    </div>
                </div>
            {/each}
        {:else}
            <p>正在加载历史记录...</p>
        {/if}
    </section>
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