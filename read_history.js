import { ethers } from "ethers";
import abi from "./ABI.json" assert { type: "json" };

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
    console.log("正在从创世区块开始，获取所有的 'Record' 事件...\n");

    try {
        // 查询从区块 0 到最新区块的所有 'Record' 事件
        const events = await contract.queryFilter("Record", 0, "latest");

        if (events.length === 0) {
            console.log("✅ 在此合约中未找到任何 'Record' 事件。");
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