import { ethers } from 'ethers';
import fs from 'fs/promises';
import path from 'path';
import abi from '../src/lib/abi.json' with { type: 'json' };

// --- 配置 ---
const contractAddress = "0xC415e346Ebb297Cf849E2323702C97E6DC01bee7";
const rpcUrl = "https://arb1.arbitrum.io/rpc"; // 使用主网公共 RPC
const outputFile = path.resolve('./src/lib/history_snapshot.json');
const scanStep = 2000; // 每次向前扫描 2000 个区块以提高效率
const snapshotSize = 10; // 快照文件最终保留的记录数量

// --- 辅助函数：合并、排序、截断并写入快照 ---
async function updateSnapshot(existingRecords, newRecords) {
    const allRecords = [...newRecords, ...existingRecords];
    
    // 使用 Map 去重，确保每个 transactionHash 只存在一次
    const uniqueRecordsMap = new Map();
    allRecords.forEach(record => uniqueRecordsMap.set(record.transactionHash, record));
    const uniqueRecords = Array.from(uniqueRecordsMap.values());

    // 按时间戳降序排序
    uniqueRecords.sort((a, b) => b.timestamp - a.timestamp);

    // 核心修改：只保留最新的 N 条记录
    const finalSnapshot = uniqueRecords.slice(0, snapshotSize);
    
    await fs.writeFile(outputFile, JSON.stringify(finalSnapshot, null, 2));
    return finalSnapshot.length; // 返回实际写入的记录数
}

async function main() {
    console.log(`🚀 开始更新历史记录快照 (上限 ${snapshotSize} 条)...`);
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const contract = new ethers.Contract(contractAddress, abi, provider);

    // 1. 读取现有快照并建立哈希集合
    let existingRecords = [];
    let existingTxHashes = new Set();
    try {
        const fileContent = await fs.readFile(outputFile, 'utf-8');
        existingRecords = JSON.parse(fileContent);
        existingRecords.forEach(rec => existingTxHashes.add(rec.transactionHash));
        console.log(`- 已加载 ${existingRecords.length} 条现有记录。`);
    } catch (error) {
        console.log("- 未找到或无法解析现有快照文件，将创建新文件。");
    }

    const genesisDate = new Date('2025-10-16T00:00:00Z');
    const genesisTimestamp = Math.floor(genesisDate.getTime() / 1000);

    let latestBlock;
    try {
        latestBlock = await provider.getBlockNumber();
        console.log(`📡 已连接到 Arbitrum One，当前最新区块: ${latestBlock}`);
    } catch (error) {
        console.error("❌ 无法连接到 RPC 节点，请检查 rpcUrl 配置。");
        return;
    }

    const newRecords = [];
    const seenInThisRun = new Set();
    let currentBlock = latestBlock;
    let connectionPointFound = false;

    console.log(`🔍 正在从区块 ${currentBlock} 向前扫描，直到找到与现有记录的连接点...`);
    console.log("(每批扫描结束后都会更新文件，可随时按 Ctrl+C 中断)");

    while (!connectionPointFound && currentBlock > 0) {
        const fromBlock = Math.max(0, currentBlock - scanStep + 1);
        const toBlock = currentBlock;

        try {
            const fromBlockDetails = await provider.getBlock(fromBlock);
            if (fromBlockDetails && fromBlockDetails.timestamp < genesisTimestamp) {
                console.log(`\n- 扫描到达创世日期 (${genesisDate.toISOString()})，停止搜索。`);
                break;
            }
            
            process.stdout.write(`  扫描区块范围: ${fromBlock} -> ${toBlock} ... `);
            
            const events = await contract.queryFilter("Record", fromBlock, toBlock);
            let foundInBatch = 0;

            for (let i = events.length - 1; i >= 0; i--) {
                const event = events[i];
                const txHash = event.transactionHash;

                if (existingTxHashes.has(txHash)) {
                    connectionPointFound = true;
                    console.log(`\n🔗 找到连接点: ${txHash.slice(0, 12)}...`);
                    break; 
                }

                if (!seenInThisRun.has(txHash)) {
                    const { author, timestamp, content } = event.args;
                    newRecords.push({
                        author,
                        timestamp: Number(timestamp),
                        content,
                        transactionHash: txHash
                    });
                    seenInThisRun.add(txHash);
                    foundInBatch++;
                }
            }
            
            if (foundInBatch > 0) {
                 console.log(`[发现 ${foundInBatch} 条新记录]`);
            } else if (!connectionPointFound) {
                 console.log(`[未发现新记录]`);
            }
            
            // 每扫描完一个批次，如果发现了新记录，就立即更新文件
            if (foundInBatch > 0) {
                const writtenCount = await updateSnapshot(existingRecords, newRecords);
                process.stdout.write(`  📦 文件已更新，快照保持 ${writtenCount} 条最新记录。\n`);
            }

            if (connectionPointFound) {
                break;
            }

        } catch (error) {
            console.error(`\n❌ 在区块 ${fromBlock}-${toBlock} 扫描时出错:`, error.message);
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
        
        currentBlock -= scanStep;
    }

    if (newRecords.length > 0) {
        console.log(`\n✅ 成功同步了 ${newRecords.length} 条新记录。`);
        console.log(`📦 快照文件已更新为最新的 ${snapshotSize} 条记录: ${outputFile}`);
    } else {
        console.warn("✅ 快照已经是最新，无需更新。");
    }
    
    console.log("✨ 任务完成。");
}

main();