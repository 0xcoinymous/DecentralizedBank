const Utility = artifacts.require("Utility");
const Governance = artifacts.require("Governance");
const Bank = artifacts.require("Bank");


module.exports = async function (deployer) {

  await deployer.deploy(Utility);
  const utility = await Utility.deployed();

  await deployer.deploy(Governance);
  const governance = await Governance.deployed();

  await deployer.deploy( Bank , governance.address , utility.address );
  const bank = await Bank.deployed();

  await utility.transfer(bank.address ,'900000000000000000000000000000' );   // 9*(10 ** 11) * ( 10**18 )
  await governance.transfer(bank.address , '900000000000000000000000' );     // 9*(10 ** 5) * ( 10**18 )

  await utility.verifyBankContract(bank.address);
  await governance.verifyBankContract(bank.address);



};
