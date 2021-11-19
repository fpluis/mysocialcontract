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
        uint256 initialDeposit,
        uint256 thresholdETH,
        uint256 startDate,
        uint256 endDate,
        uint256 share,
        string calldata ytChannelId,
        uint256 ytMinViewCount,
        uint256 ytMinSubscriberCount
    ) external payable returns (address payable clone) {
        clone = payable(createClone(contractLibraryAddress));
        Promotion(clone).initialize(
            owner,
            provider,
            initialDeposit,
            thresholdETH,
            startDate,
            endDate,
            share,
            ytChannelId,
            ytMinViewCount,
            ytMinSubscriberCount,
            msg.value
        );
        if (msg.value > 0) {
            clone.transfer(msg.value);
        }

        emit PromotionCreated(clone);
    }
}
