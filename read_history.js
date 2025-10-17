import { ethers } from "ethers";
// 【已修正】将 'assert' 关键字替换为 'with'，以兼容新版 Node.js
import abi from "./ABI.json" with { type: "json" };

// --- 配置区 ---

// 1. 您的合约部署地址
const contractAddress = "0x18e55e2182b65633d0Ac4895f99D744378aAf67B";

// 2. Sepolia 测试网的 RPC 节点 (已更新为您提供的 Key)
const rpcUrl = "https://eth-sepolia.g.alchemy.com/v2/GJunG4kALQY7OQTqKS3ymQlDNg0L9NBI";

// --- 脚本核心 ---

async function main() {
    console.log("正在连接到 Sepolia 测试网...");
    
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const contract = new ethers.Contract(contractAddress, abi, provider);

    console.log(`已连接到合约: ${await contract.getAddress()}`);
    
    try {
        // --- 核心逻辑：仅查询最近的 10 个区块 ---
        // 这是为了在测试阶段快速验证，避免不必要的复杂性。
        const latestBlockNumber = await provider.getBlockNumber();
        const startBlock = Math.max(0, latestBlockNumber - 9); // 查询范围为10个区块

        console.log(`当前最新区块: ${latestBlockNumber}`);
        console.log(`正在扫描最近的 10 个区块 (${startBlock} -> ${latestBlockNumber}) 以查找 'Record' 事件...\n`);

        // 直接进行一次小范围查询
        const events = await contract.queryFilter("Record", startBlock, "latest");

        if (events.length === 0) {
            console.log("✅ 在最近 10 个区块中未找到任何 'Record' 事件。");
            return;
        }

        console.log(`🎉 成功在最近 10 个区块中获取到 ${events.length} 条记录：\n`);

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