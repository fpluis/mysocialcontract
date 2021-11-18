# Mysocialcontract

A platform where users create requests for help promoting a product, brand or social channel. Creators and marketers can chat and sign a promotion contract where the marketer will be paid only if the contract's conditions (i.e. a minimum number of Youtube subscribers) are fulfilled. To make it possible, the contract uses Chainlink's ANY API Oracles.

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
