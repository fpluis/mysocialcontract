module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  await deploy("Promotion", {
    from: deployer,
    // args: [
    //   deployer,
    //   web3.utils.toWei("0.1"),
    //   Math.floor(new Date().getTime() / 1000),
    //   60,
    //   30,
    // ],
    log: true,
  });
};

module.exports.tags = ["Promotion"];
