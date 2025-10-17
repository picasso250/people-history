import { ethers } from 'ethers';
import fs from 'fs/promises';
import path from 'path';
import abi from '../src/lib/abi.json' with { type: 'json' };

// --- 配置 ---
const contractAddress = "0xC415e346Ebb297Cf849E2323702C97E6DC01bee7";
const rpcUrl = "https://arb1.arbitrum.io/rpc"; // 使用主网公共 RPC
const outputFile = path.resolve('./src/lib/history_snapshot.json');
const recordsToFind = 10;
const scanStep = 2000; // 每次向前扫描 2000 个区块以提高效率

// --- 辅助函数：用于实时写入文件 ---
async function writeSnapshot(records) {
    // 按时间戳降序排序
    records.sort((a, b) => b.timestamp - a.timestamp);
    await fs.writeFile(outputFile, JSON.stringify(records, null, 2));
}

async function main() {
    console.log("🚀 开始生成历史记录快照...");
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const contract = new ethers.Contract(contractAddress, abi, provider);

    const genesisDate = new Date('2025-10-16T00:00:00Z');
    const genesisTimestamp = Math.floor(genesisDate.getTime() / 1000);
    console.log(`- 创世日期设置为: ${genesisDate.toISOString()}`);

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
    console.log("(每找到一条记录都会立即更新文件，可随时按 Ctrl+C 中断)");

    while (foundRecords.length < recordsToFind && currentBlock > 0) {
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

                if (!seenTxHashes.has(txHash)) {
                    const { author, timestamp, content } = event.args;
                    foundRecords.push({
                        author,
                        timestamp: Number(timestamp),
                        content,
                        transactionHash: txHash
                    });
                    seenTxHashes.add(txHash);
                    foundInBatch++;

                    // --- 核心修改：立即写入文件 ---
                    await writeSnapshot(foundRecords);
                    // ---------------------------
                    
                    if (foundRecords.length >= recordsToFind) {
                        break; 
                    }
                }
            }
            
            if (foundInBatch > 0) {
                 console.log(`[发现 ${foundInBatch} 条，总计 ${foundRecords.length}/${recordsToFind} 条]`);
            } else {
                 console.log(`[未发现新记录]`);
            }

            if (foundRecords.length >= recordsToFind) {
                break;
            }

        } catch (error) {
            console.error(`\n❌ 在区块 ${fromBlock}-${toBlock} 扫描时出错:`, error.message);
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
        
        currentBlock -= scanStep;
    }

    if (foundRecords.length > 0) {
        console.log(`\n✅ 成功找到 ${foundRecords.length} 条记录。`);
        console.log(`📦 快照文件已实时更新: ${outputFile}`);
    } else {
        console.warn("⚠️ 未能在扫描范围内找到任何记录。");
    }
    
    console.log("✨ 任务完成。");
}

main();