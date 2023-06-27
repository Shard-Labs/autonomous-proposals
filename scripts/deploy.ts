import hre from "hardhat";
import { BigNumberish } from "ethers";
import fs from "fs";

export type Proposal = [
  string[], // targets
  BigNumberish[], // values
  string[], // signatures
  string[], // calldatas
  string // description
];

async function main() {
  const eth_governor = "0xc0Da02939E1441F497fd74F78cE7Decb17B66529";
  const eth_comp = "0xc00e94Cb662C3520282E6f5717214004A7f26888";

  const calldata = JSON.parse(
    fs.readFileSync("./stmatic-proposal-data.json", "utf-8")
  ) as Proposal;
  const signer = (await hre.ethers.getSigners())[0];

  const crowdProposalFactory = await hre.ethers.getContractFactory(
    "CrowdProposal"
  );
  const tx = await crowdProposalFactory.deploy(
    signer.address,
    calldata[0],
    calldata[1],
    calldata[2],
    calldata[3],
    calldata[4],
    eth_comp,
    eth_governor
  );

  const cap = await tx.waitForDeployment();
  console.log(
    "CrowdProposal contract was deployed at:",
    await cap.getAddress()
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
