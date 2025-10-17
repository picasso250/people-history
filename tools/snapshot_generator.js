import { ethers } from 'ethers';
import fs from 'fs/promises';
import path from 'path';
import abi from '../src/lib/abi.json' assert { type: 'json' };

// --- 配置 ---
const contractAddress = "0xC415e346Ebb297Cf849E2323702C97E6DC01bee7";
const rpcUrl = "https://arb1.arbitrum.io/rpc"; // 使用主网公共 RPC
const outputFile = path.resolve('./src/lib/history_snapshot.json');
const recordsToFind = 10;
const scanStep = 2000; // 每次向前扫描 2000 个区块以提高效率

async function main() {
    console.log("🚀 开始生成历史记录快照...");
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const contract = new ethers.Contract(contractAddress, abi, provider);

    let latestBlock;
    try {
        latestBlock = await provider.getBlockNumber();
        console.log(`📡 已连接到 Arbitrum One，当前最新区块: ${latestBlock}`);
    } catch (error) {
        console.error("❌ 无法连接到 RPC 节点，请检查 rpcUrl 配置。");
        return;
    }

    const foundRecords = [];
    const seenTxHashes = new Set();
    let currentBlock = latestBlock;

    console.log(`🔍 正在从区块 ${currentBlock} 向前扫描，目标是找到 ${recordsToFind} 条最新的记录...`);

    while (foundRecords.length < recordsToFind && currentBlock > 0) {
        const fromBlock = Math.max(0, currentBlock - scanStep + 1);
        const toBlock = currentBlock;
        
        process.stdout.write(`  扫描区块范围: ${fromBlock} -> ${toBlock} ... `);
        
        try {
            const events = await contract.queryFilter("Record", fromBlock, toBlock);
            
            // 从后往前遍历，以确保我们先处理最新的事件
            for (let i = events.length - 1; i >= 0; i--) {
                const event = events[i];
                const txHash = event.transactionHash;

                if (!seenTxHashes.has(txHash)) {
                    const { author, timestamp, content } = event.args;
                    foundRecords.push({
                        author,
                        timestamp: Number(timestamp),
                        content,
                        transactionHash: txHash
                    });
                    seenTxHashes.add(txHash);
                    
                    if (foundRecords.length >= recordsToFind) {
                        break; 
                    }
                }
            }
            
            console.log(`[已找到 ${foundRecords.length}/${recordsToFind} 条]`);

            if (foundRecords.length >= recordsToFind) {
                break;
            }

        } catch (error) {
            console.error(`\n❌ 在区块 ${fromBlock}-${toBlock} 扫描时出错:`, error.message);
            // 等待一段时间再重试，避免快速失败
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
        
        currentBlock -= scanStep;
    }

    if (foundRecords.length > 0) {
        console.log(`\n✅ 成功找到 ${foundRecords.length} 条记录。`);
        // 按时间戳降序排序
        foundRecords.sort((a, b) => b.timestamp - a.timestamp);
        
        await fs.writeFile(outputFile, JSON.stringify(foundRecords.slice(0, recordsToFind), null, 2));
        console.log(`📦 快照文件已成功写入: ${outputFile}`);
    } else {
        console.warn("⚠️ 未能在扫描范围内找到任何记录。");
    }
    
    console.log("✨ 任务完成。");
}

main();