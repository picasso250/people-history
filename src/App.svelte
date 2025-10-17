<script>
    import { onMount } from 'svelte';
    import { ethers } from 'ethers';
    import abi from './lib/ABI.json';
    import snapshotData from './lib/history_snapshot.json';
    import Altar from './lib/Altar.svelte';
    import RecentInscriptions from './lib/RecentInscriptions.svelte';

    // --- 配置区 ---
    const contractAddress = "0xC415e346Ebb297Cf849E2323702C97E6DC01bee7";
    const publicRpcUrl = "https://arb1.arbitrum.io/rpc";
    const targetNetwork = {
        chainId: '0xa4b1',
        chainName: 'Arbitrum One',
        rpcUrls: [publicRpcUrl],
        nativeCurrency: { name: 'ETH', decimals: 18, symbol: 'ETH' },
        blockExplorerUrls: ['https://arbiscan.io']
    };

    // --- 状态管理 ---
    let browserProvider;
    let signer;
    let contract;
    let readonlyProvider = new ethers.JsonRpcProvider(publicRpcUrl);
    let readonlyContract = new ethers.Contract(contractAddress, abi, readonlyProvider);

    let account = null;
    let view = "form"; // 'form', 'success'
    let statusMessage = "铭刻 (Inscribe)";
    let txHash = "";
    let errorMessage = "";
    let isLoading = false;
    let recentInscriptions = [];

    // --- 子组件引用 ---
    let altarComponent;

    // --- 生命周期 ---
    onMount(() => {
        recentInscriptions = snapshotData.sort((a, b) => b.timestamp - a.timestamp);
        fetchLiveInscriptions();

        if (typeof window.ethereum !== 'undefined') {
            browserProvider = new ethers.BrowserProvider(window.ethereum);
            window.ethereum.on('accountsChanged', (accounts) => {
                if (accounts.length > 0) {
                    connectWallet(true);
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
    
    // --- 数据获取 ---
    async function fetchLiveInscriptions() {
        try {
            const latestBlock = await readonlyProvider.getBlockNumber();
            const startBlock = Math.max(0, latestBlock - 1000);
            const events = await readonlyContract.queryFilter("Record", startBlock, "latest");

            if (events.length > 0) {
                const liveData = events.map(event => ({
                    author: event.args.author,
                    timestamp: Number(event.args.timestamp),
                    content: event.args.content,
                    transactionHash: event.transactionHash
                }));
                const allData = [...snapshotData, ...liveData];
                const uniqueData = Array.from(new Map(allData.map(item => [item.transactionHash, item])).values());
                recentInscriptions = uniqueData.sort((a, b) => b.timestamp - a.timestamp).slice(0, 10);
            }
        } catch (error) {
            console.error("获取实时事件失败:", error);
        }
    }

    // --- 核心 Web3 函数 ---
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

    async function handleInscribe(event) {
        const content = event.detail.content;
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
            altarComponent.view = "success"; // Directly update child's exported `view` prop

            fetchLiveInscriptions();

        } catch (error) {
            console.error("铭刻失败:", error);
            errorMessage = error.code === 'ACTION_REJECTED' 
                ? "用户拒绝了交易。" 
                : "铭刻失败，请检查控制台获取更多信息。";
        } finally {
            isLoading = false;
            statusMessage = "铭刻 (Inscribe)";
        }
    }

    function handleReset() {
        view = "form";
        txHash = "";
        errorMessage = "";
    }
</script>

<main>
    <header class="project-header">
        <h1>People's History</h1>
        <h2>众语史书</h2>
    </header>

    <Altar 
        bind:this={altarComponent}
        {isLoading}
        {account}
        {statusMessage}
        {errorMessage}
        {txHash}
        on:inscribe={handleInscribe}
        on:reset={handleReset}
    />

    <RecentInscriptions inscriptions={recentInscriptions} />

</main>

<footer>
    <a href="#">我们的承诺</a>
    <span>&bull;</span>
    <a href="#">阅览室</a>
</footer>