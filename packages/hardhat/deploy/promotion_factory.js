module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const libraryContract = await deployments.get("Promotion");
  await deploy("PromotionFactory", {
    from: deployer,
    args: [libraryContract.address],
    log: true,
  });
};

module.exports.tags = ["PromotionFactory"];
