// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";

contract Promotion is ChainlinkClient {
    using Chainlink for Chainlink.Request;

    event OnFulfill(uint256 _ytViews, uint256 _ytSubs);
    event OnSuccess();
    event Withdraw(uint256 amount);

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
    bool public isOwnerPaid;

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
        isOwnerPaid = false;
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
        uint256 balance = address(this).balance;
        uint256 gracePeriodEnd = endDate + 24 * 60 * 60 seconds;
        uint256 userShare = share;
        if (msg.sender == owner) {
            userShare = 100 - share;
            if (isSuccessful == false) {
                require(
                    block.timestamp > gracePeriodEnd,
                    "Owners can only withdraw from failed contracts after the grace period is over"
                );
                // If the contract fails, the owner gets all the funds
                userShare = 100;
            }
            require(
                isOwnerPaid == false,
                "Owners can only withdraw their share once"
            );
            if (isProviderPaid == true) {
                userShare = 100;
            }
            isOwnerPaid = true;
        } else {
            require(
                isSuccessful == true,
                "Providers can only withdraw if the contract is successful"
            );
            require(
                isProviderPaid == false,
                "Providers can only withdraw their share once"
            );
            if (isOwnerPaid == true) {
                userShare = 100;
            }
            isProviderPaid = true;
        }

        // If the operation userShare / 100 is in parentheses,
        // the result will be a float, cast to uint256 and thus become 0
        uint256 amount = (balance * userShare) / 100;
        emit Withdraw(amount);
        payable(provider).transfer(amount);
    }

    function checkConditions() external {
        if (
            keccak256(abi.encodePacked(ytChannelId)) !=
            keccak256(abi.encodePacked("-"))
        ) {
            Chainlink.Request memory req = buildChainlinkRequest(
                "7ab68903a4bd49168f67a1bdb727c1f0",
                address(this),
                this.fulfill.selector
            );
            req.add("ytChannelId", ytChannelId);
            requestOracleData(req, 1 * LINK_DIVISIBILITY);
        } else {
            checkIsSuccessful();
        }
    }

    function checkIsSuccessful() internal {
        uint256 balance = address(this).balance;
        if (
            (balance >= thresholdETH &&
                (ytMinViewCount == 0 || ytViews > ytMinViewCount)) ||
            (ytMinSubscriberCount == 0 || ytSubs > ytMinSubscriberCount)
        ) {
            isSuccessful = true;
            emit OnSuccess();
        }
    }

    function fulfill(
        bytes32 _requestId,
        uint256 _ytViews,
        uint256 _ytSubs
    ) public recordChainlinkFulfillment(_requestId) {
        emit OnFulfill(_ytViews, _ytSubs);
        ytViews = _ytViews;
        ytSubs = _ytSubs;
        checkIsSuccessful();
    }
}
