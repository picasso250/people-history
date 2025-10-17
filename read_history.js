import { ethers } from "ethers";
// 【已修正】将 'assert' 关键字替换为 'with'，以兼容新版 Node.js
import abi from "./ABI.json" with { type: "json" };

// --- 配置区 ---

// 1. 您的合约部署地址
const contractAddress = "0x18e55e2182b65633d0Ac4895f99D744378aAf67B";

// 2. Sepolia 测试网的公共 RPC 节点
// 您可以替换为您自己的 RPC 节点，例如从 Alchemy 或 Infura 获取
const rpcUrl = "https://rpc.sepolia.org";

// --- 脚本核心 ---

async function main() {
    console.log("正在连接到 Sepolia 测试网...");
    
    // 创建一个 Provider，用于连接到以太坊网络
    const provider = new ethers.JsonRpcProvider(rpcUrl);

    // 创建一个合约实例
    const contract = new ethers.Contract(contractAddress, abi, provider);

    console.log(`已连接到合约: ${await contract.getAddress()}`);
    
    try {
        // --- 优化：只查询最近24小时的事件 ---
        // 1. 获取最新区块号
        const latestBlockNumber = await provider.getBlockNumber();
        console.log(`当前最新区块: ${latestBlockNumber}`);

        // 2. 计算大约24小时前的区块号
        // Sepolia 测试网平均出块时间约为 12 秒
        // 每天的秒数 = 24 * 60 * 60 = 86400 秒
        // 每天的区块数 ≈ 86400 / 12 = 7200 个区块
        const blocksIn24Hours = 7200;
        const startBlock = Math.max(0, latestBlockNumber - blocksIn24Hours); // 使用Math.max确保区块号不为负

        console.log(`正在从区块 ${startBlock} 开始，获取最近24小时内的 'Record' 事件...\n`);

        // 3. 查询从计算出的起始区块到最新区块的所有 'Record' 事件
        const events = await contract.queryFilter("Record", startBlock, "latest");

        if (events.length === 0) {
            console.log("✅ 在最近24小时内未找到任何 'Record' 事件。");
            return;
        }

        console.log(`🎉 成功获取到 ${events.length} 条历史记录：\n`);

        // 遍历并打印每一条事件日志
        events.forEach(event => {
            const { author, timestamp, content } = event.args;
            const readableDate = new Date(Number(timestamp) * 1000).toLocaleString();

            console.log("----------------------------------------");
            console.log(`  铭刻内容: "${content}"`);
            console.log(`  作者地址: ${author}`);
            console.log(`  铭刻时间: ${readableDate}`);
            console.log(`  交易哈希: ${event.transactionHash}`);
            console.log("----------------------------------------\n");
        });

    } catch (error) {
        console.error("❌ 获取事件时发生错误:", error);
    }
}

main();