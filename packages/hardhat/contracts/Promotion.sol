// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";

contract Promotion is ChainlinkClient {
    using Chainlink for Chainlink.Request;

    event OnFulfill(uint256 _ytViews, uint256 _ytSubs);

    address private oracle;
    bytes32 private jobId;
    uint256 private fee;

    uint256 public initialDeposit;
    uint256 public thresholdETH;
    uint256 public startDate;
    uint256 public endDate;
    uint256 public share;
    uint256 public ytViews;
    uint256 public ytSubs;
    uint256 public ytMinViewCount;
    uint256 public ytMinSubscriberCount;
    address public provider;
    address public owner;
    string public ytChannelId;
    bool public isSuccessful;
    bool public isProviderPaid;

    function initialize(
        address _owner,
        address _provider,
        uint256 _initialDeposit,
        uint256 _thresholdETH,
        uint256 _startDate,
        uint256 _endDate,
        uint256 _share,
        string calldata _ytChannelId,
        uint256 _ytMinViewCount,
        uint256 _ytMinSubscriberCount,
        uint256 paidAmount
    ) public payable {
        require(
            _initialDeposit == 0 || paidAmount >= _initialDeposit,
            "If the initial deposit is set, the minimum funds must be also present in the transaction"
        );
        setPublicChainlinkToken();
        jobId = "7ab68903a4bd49168f67a1bdb727c1f0";
        setChainlinkToken(0xa36085F69e2889c224210F603D836748e7dC0088);
        setChainlinkOracle(0x22217862db8312c7aEA9150a52662E74756bc744);
        fee = 0.1 * 10**18;

        owner = _owner;
        provider = _provider;
        initialDeposit = _initialDeposit;
        thresholdETH = _thresholdETH;
        startDate = _startDate;
        endDate = _endDate * 1 seconds;
        share = _share;
        isProviderPaid = false;
        isSuccessful = false;
        ytChannelId = _ytChannelId;
        ytViews = 0;
        ytSubs = 0;
        ytMinViewCount = _ytMinViewCount;
        ytMinSubscriberCount = _ytMinSubscriberCount;
    }

    receive() external payable {}

    function withdraw() external {
        require(
            msg.sender == provider || msg.sender == owner,
            "Only owner and provider can access the funds"
        );
        require(
            msg.sender == owner || isProviderPaid == false,
            "Provider has already withdrawn their cut."
        );
        require(block.timestamp > endDate, "Deadline has not passed yet.");
        uint256 balance = address(this).balance;
        require(balance > thresholdETH, "Not enough funds have been deposited");
        uint256 amount = balance * (share / 100);
        payable(msg.sender).transfer(amount);
        balance = balance - amount;
        if (msg.sender == provider) {
            isProviderPaid = true;
        }
    }

    function stringToBytes32(string memory source)
        private
        pure
        returns (bytes32 result)
    {
        bytes memory tempEmptyStringTest = bytes(source);
        if (tempEmptyStringTest.length == 0) {
            return 0x0;
        }

        assembly {
            // solhint-disable-line no-inline-assembly
            result := mload(add(source, 32))
        }
    }

    function checkConditions() external {
        require(
            msg.sender == provider || msg.sender == owner,
            "Only owner and provider can make this check"
        );
        // require(block.timestamp > endDate, "Deadline has not passed yet.");

        Chainlink.Request memory req = buildChainlinkRequest(
            "7ab68903a4bd49168f67a1bdb727c1f0",
            address(this),
            this.fulfill.selector
        );
        req.add("ytChannelId", "UCfpnY5NnBl-8L7SvICuYkYQ");
        requestOracleData(req, 1 * LINK_DIVISIBILITY);
        // setPublicChainlinkToken();
        // Chainlink.Request memory req = buildChainlinkRequest(
        //     stringToBytes32("7ab68903a4bd49168f67a1bdb727c1f0"),
        //     address(this),
        //     this.fulfill.selector
        // );
        // req.add("ytChannelId", "UCfpnY5NnBl-8L7SvICuYkYQ");
        // sendChainlinkRequestTo(
        //     0x2Db11F9E1d0a1cDc4e3F4C75B4c14f4a4a1a3518,
        //     req,
        //     1 * LINK_DIVISIBILITY
        // );
    }

    function fulfill(
        bytes32 _requestId,
        uint256 _ytViews,
        uint256 _ytSubs
    ) public recordChainlinkFulfillment(_requestId) {
        emit OnFulfill(_ytViews, _ytSubs);
        ytViews = _ytViews;
        ytSubs = _ytSubs;
    }

    function checkIsSuccessful() external returns (bool allChecksPass) {
        allChecksPass = true;
        if (ytMinViewCount > 0 && ytViews < ytMinViewCount) {
            allChecksPass = false;
        }

        if (ytMinSubscriberCount > 0 && ytSubs < ytMinSubscriberCount) {
            allChecksPass = false;
        }

        isSuccessful = allChecksPass;
        return allChecksPass;
    }
}
