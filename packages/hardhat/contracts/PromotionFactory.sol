// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.6.0;

import "./Promotion.sol";
import "./CloneFactory.sol";

contract PromotionFactory is CloneFactory {
    address public contractLibraryAddress;

    event PromotionCreated(address payable newPromotionAddress);

    constructor(address _contractLibraryAddress) {
        contractLibraryAddress = _contractLibraryAddress;
    }

    function createPromotion(
        address owner,
        address provider,
        uint256[4] calldata config,
        // uint256 initialDeposit,
        // uint256 thresholdETH,
        // uint256 endDate,
        // uint256 share,

        // uint256 startDate,
        // Promotion.Period calldata period,

        string calldata ytChannelId,
        uint256 ytMinViewCount,
        uint256 ytMinSubscriberCount,
        string calldata twitterUsername,
        uint256 twitterMinFollowers
    ) external payable returns (address payable clone) {
        clone = payable(createClone(contractLibraryAddress));
        // Promotion.YtParams memory ytParams;
        // ytParams.ytChannelId = ytChannelId;
        // ytParams.ytMinViewCount = ytMinViewCount;
        // ytParams.ytMinSubscriberCount = ytMinSubscriberCount;

        Promotion(clone).initialize(
            owner,
            provider,
            config,
            // ytParams,
            ytChannelId,
            ytMinViewCount,
            ytMinSubscriberCount,
            twitterUsername,
            twitterMinFollowers,
            msg.value
        );
        if (msg.value > 0) {
            clone.transfer(msg.value);
        }

        emit PromotionCreated(clone);
    }
}
