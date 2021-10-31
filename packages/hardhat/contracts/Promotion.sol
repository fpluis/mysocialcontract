// SPDX-License-Identifier: UNLICENSED

pragma solidity >=0.6.0;

contract Promotion {
    uint256 public threshold;
    uint256 public balance;
    uint256 public deadline;
    uint256 public mentorCut;
    address public mentor;
    address public owner;
    bool private hasMentorWithdrawn;

    function initialize(
        address ownerAddress,
        address mentorAddress,
        uint256 thresholdEth,
        uint256 startDate,
        uint256 secondsAfter,
        uint256 mentorCutAsPercentage
    ) public {
        owner = ownerAddress;
        mentor = mentorAddress;
        threshold = thresholdEth;
        deadline = startDate + secondsAfter * 1 seconds;
        mentorCut = mentorCutAsPercentage;
        hasMentorWithdrawn = false;
    }

    function deposit() external payable {
        balance += msg.value;
    }

    function withdraw() external {
        require(
            msg.sender == mentor || msg.sender == owner,
            "Only owner and mentor can access the funds"
        );
        require(
            msg.sender == owner || hasMentorWithdrawn == false,
            "Mentor has already withdrawn his cut."
        );
        require(block.timestamp > deadline, "Deadline has not passed yet.");
        require(balance > threshold, "Not enough funds have been deposited");
        uint256 amount = balance * (mentorCut / 100);
        payable(msg.sender).transfer(amount);
        balance = balance - amount;
        if (msg.sender == mentor) {
            hasMentorWithdrawn = true;
        }
    }
}
