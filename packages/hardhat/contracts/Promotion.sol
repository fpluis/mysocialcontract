// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";

contract Promotion is ChainlinkClient {
    using Chainlink for Chainlink.Request;

    struct Period {
        uint256 start;
        uint256 end;
    }

    // struct YtParams {
    //     uint256 ytMinViewCount;
    //     uint256 ytMinSubscriberCount;
    //     string ytChannelId;
    // }

    event OnFulfill(
        uint256 _ytViews,
        uint256 _ytSubs,
        uint256 _twitterFollowers
    );
    event OnSuccess();
    event Withdraw(uint256 amount, address withdrawer);

    address private oracle;
    bytes32 private jobId;
    uint256 private fee;

    uint256 public initialDeposit;
    uint256 public thresholdETH;
    // uint256 public startDate;
    uint256 public endDate;
    // Period public period;
    uint256 public share;
    uint256 public ytViews;
    uint256 public ytSubs;
    uint256 public twitterFollowers;
    uint256 public ytMinViewCount;
    uint256 public ytMinSubscriberCount;
    // YtParams public youtubeParams;
    uint256 public twitterMinFollowers;
    address public provider;
    address public owner;
    string public ytChannelId;
    string public twitterUsername;
    bool public isSuccessful;
    bool public isProviderPaid;
    bool public isOwnerPaid;

    function initialize(
        address _owner,
        address _provider,
        uint256[4] calldata config,
        // uint256 _initialDeposit,
        // uint256 _thresholdETH,
        // uint256 _startDate,
        // uint256 _endDate,
        // Period calldata _period,
        // uint256 _share,
        string calldata _ytChannelId,
        uint256 _ytMinViewCount,
        uint256 _ytMinSubscriberCount,
        // YtParams calldata _youtubeParams,
        string calldata _twitterUsername,
        uint256 _twitterMinFollowers,
        uint256 paidAmount
    ) public payable {
        initialDeposit = config[0];
        thresholdETH = config[1];
        endDate = config[2];
        share = config[3];
        require(
            initialDeposit == 0 || paidAmount >= initialDeposit,
            "If the initial deposit is set, the minimum funds must be also present in the transaction"
        );
        jobId = "7ab68903a4bd49168f67a1bdb727c1f0";
        setChainlinkToken(0xa36085F69e2889c224210F603D836748e7dC0088);
        setChainlinkOracle(0x22217862db8312c7aEA9150a52662E74756bc744);
        fee = 0.1 * 10**18;

        owner = _owner;
        provider = _provider;
        // initialDeposit = _initialDeposit;
        // thresholdETH = _thresholdETH;
        // startDate = _startDate;
        // endDate = _endDate * 1 seconds;
        // period = _period;
        // share = _share;
        isProviderPaid = false;
        isOwnerPaid = false;
        isSuccessful = false;
        // youtubeParams = _youtubeParams;
        // ytChannelId = youtubeParams.ytChannelId;
        // ytMinViewCount = youtubeParams.ytMinViewCount;
        // ytMinSubscriberCount = youtubeParams.ytMinSubscriberCount;
        ytChannelId = _ytChannelId;
        ytMinViewCount = _ytMinViewCount;
        ytMinSubscriberCount = _ytMinSubscriberCount;
        ytViews = 0;
        ytSubs = 0;
        twitterUsername = _twitterUsername;
        twitterMinFollowers = _twitterMinFollowers;
        // twitterUsername = "-";
        // twitterMinFollowers = 0;
        twitterFollowers = 0;
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
        emit Withdraw(amount, msg.sender);
        payable(provider).transfer(amount);
    }

    function checkConditions() external {
        bool requestYoutube = keccak256(abi.encodePacked(ytChannelId)) !=
            keccak256(abi.encodePacked("-"));
        bool requestTwitter = keccak256(abi.encodePacked(twitterUsername)) !=
            keccak256(abi.encodePacked("-"));
        if (requestYoutube || requestTwitter) {
            Chainlink.Request memory req = buildChainlinkRequest(
                jobId,
                address(this),
                this.fulfill.selector
            );

            req.add("ytChannelId", ytChannelId);
            req.add("twitterUsername", twitterUsername);
            requestOracleData(req, fee);
        } else {
            checkIsSuccessful();
        }
    }

    function checkIsSuccessful() internal {
        uint256 balance = address(this).balance;
        if (
            balance >= thresholdETH &&
            (ytMinViewCount == 0 || ytViews > ytMinViewCount) &&
            (ytMinSubscriberCount == 0 || ytSubs > ytMinSubscriberCount) &&
            (twitterMinFollowers == 0 || twitterFollowers > twitterMinFollowers)
        ) {
            isSuccessful = true;
            emit OnSuccess();
        }
    }

    function fulfill(
        bytes32 _requestId,
        uint256 _ytViews,
        uint256 _ytSubs,
        uint256 _twitterFollowers
    ) public recordChainlinkFulfillment(_requestId) {
        emit OnFulfill(_ytViews, _ytSubs, _twitterFollowers);
        ytViews = _ytViews;
        ytSubs = _ytSubs;
        twitterFollowers = _twitterFollowers;
        checkIsSuccessful();
    }
}
