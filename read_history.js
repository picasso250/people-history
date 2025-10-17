import { ethers } from "ethers";
// 【已修正】将 'assert' 关键字替换为 'with'，以兼容新版 Node.js
import abi from "./ABI.json" with { type: "json" };

// --- 配置区 ---

// 1. 【已更新】合约已部署至 Arbitrum One 主网
const contractAddress = "0xC415e346Ebb297Cf849E2323702C97E6DC01bee7";

// 2. 【已更新】使用 Arbitrum One 主网的公共 RPC 节点
const rpcUrl = "https://arb1.arbitrum.io/rpc";

// --- 脚本核心 ---

async function main() {
    console.log("正在连接到 Arbitrum One 主网...");
    
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const contract = new ethers.Contract(contractAddress, abi, provider);

    console.log(`已连接到合约: ${await contract.getAddress()}`);
    
    try {
        // --- 核心逻辑：仅查询最近的 1000 个区块 ---
        // 这是一个折衷方案，在快速验证的同时，比10个区块有更大的概率捕获到事件。
        const latestBlockNumber = await provider.getBlockNumber();
        const startBlock = Math.max(0, latestBlockNumber - 999); 

        console.log(`当前最新区块: ${latestBlockNumber}`);
        console.log(`正在扫描最近的 1000 个区块 (${startBlock} -> ${latestBlockNumber}) 以查找 'Record' 事件...\n`);

        const events = await contract.queryFilter("Record", startBlock, "latest");

        if (events.length === 0) {
            console.log("✅ 在最近 1000 个区块中未找到任何 'Record' 事件。");
            return;
        }

        console.log(`🎉 成功在最近 1000 个区块中获取到 ${events.length} 条记录：\n`);

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