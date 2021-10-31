// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.6.0;

import "./Promotion.sol";
import "./CloneFactory.sol";

// import "@openzeppelin/contracts/access/Ownable.sol";

contract PromotionFactory is CloneFactory {
    address public contractLibraryAddress;

    event PromotionCreated(address newPromotionAddress);

    constructor(address _contractLibraryAddress) {
        contractLibraryAddress = _contractLibraryAddress;
    }

    // function setLibraryAddress(address _contractLibraryAddress) external {
    //     contractLibraryAddress = _contractLibraryAddress;
    // }

    function createPromotion(
        address ownerAddress,
        address mentorAddress,
        uint256 thresholdEth,
        uint256 startDate,
        uint256 secondsAfter,
        uint256 mentorCutAsPercentage
    ) external {
        address clone = createClone(contractLibraryAddress);
        Promotion(clone).initialize(
            ownerAddress,
            mentorAddress,
            thresholdEth,
            startDate,
            secondsAfter,
            mentorCutAsPercentage
        );
        emit PromotionCreated(clone);
    }
}
