# Mysocialcontract

Mysocialcontract is a platform where people who need marketing advice and marketers meet. Anyone can make a request for help to make one of their social media accounts more popular. Marketers can browse the requests, chat with the requester, and sign a contract with targets like "minimum number of subscribers on Youtube" and an expiry date.

At the end of the contract period, the contract uses Chainlink's oracles to check that all the conditions are met. If so, the marketer can withdaw the funds. Otherwise, the person requesting help gets to keep the money.

This project offers an alternative to upfront payment for services, which leaves the payer vulnerable to scams, while also providing a measurable metric of the service provider's success.

## Running the project

First you will need to install the dependencies:

`yarn install`

You'll have three terminals up for:

`yarn start` (react app frontend)

`yarn chain` (hardhat backend)

`yarn deploy` (to compile, deploy, and publish your contracts to the frontend)

The frontend is available at http://localhost:3000/

> 👩‍💻 Rerun `yarn deploy` whenever you want to deploy new contracts to the frontend.

## Additional infrastructure

This projects depends on the following:

- An active Moralis server.
- A Chainlink node running a bridge for the [mysocialcontract external adapter](https://github.com/fpluis/external-adapters-js).
