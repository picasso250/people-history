// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title People's History (众语史书)
 * @author Your Name/Team
 * @notice 这是一个极简的、用于在区块链上永久记录文本的铭刻合约。
 *         它遵循“无依赖生存模型”，合约一旦部署并放弃所有权，将成为一个无需任何人维护的永久公共设施。
 *         它的唯一功能是接收文本数据，并将其作为Event（事件）记录下来。
 *         数据存储在事件日志中，是链上成本最低的永久记录方式。
 */
contract PeoplesHistory is Ownable {
    /**
     * @notice 当有新的记录被铭刻时触发的事件。
     * @param author 铭刻者的地址，被索引以便快速查询。
     * @param timestamp 铭刻发生时的区块时间戳，被索引以便按时间排序。
     * @param content 用户铭刻的文本内容。
     */
    event Record(
        address indexed author,
        uint256 indexed timestamp,
        string content
    );

    /**
     * @notice 构造函数，在部署时将合约所有权赋予部署者。
     */
    constructor() Ownable(msg.sender) {}

    /**
     * @notice 核心铭刻函数。
     *         任何人都可以调用此函数来记录一段文本。
     * @param _content 需要被永久记录的字符串内容。
     */
    function inscribe(string memory _content) public {
        emit Record(msg.sender, block.timestamp, _content);
    }

    /**
     * @notice 合约所有者可以调用此函数来永久放弃合约的控制权。
     *         这是实现“无依赖生存”和“无需信任”的关键步骤。
     *         一旦调用，合约将再也没有管理员。
     */
    function renounceOwnership() public override onlyOwner {
        super.renounceOwnership();
    }
}