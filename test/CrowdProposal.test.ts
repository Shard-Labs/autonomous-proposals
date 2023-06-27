import { expect } from "chai";
import hre, { ethers } from "hardhat";
import fs from "fs";
import { Proposal } from "../scripts/deploy";
import { CrowdProposal, IERC20 } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

const getImpersonateAccount = async (
  whaleAddress: string
): Promise<SignerWithAddress> => {
  {
    await hre.network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [whaleAddress],
    });

    await hre.network.provider.send("hardhat_setBalance", [
      whaleAddress,
      "0x1000000000000000000000000000000000",
    ]);

    return await ethers.getSigner(whaleAddress);
  }
};

const eth_governor = "0xc0Da02939E1441F497fd74F78cE7Decb17B66529";
const eth_comp = "0xc00e94Cb662C3520282E6f5717214004A7f26888";

let cap: CrowdProposal;
let signer: SignerWithAddress;
let compToken: IERC20;

describe("CrowdProposal", function () {
  beforeEach(async function () {
    const signer = await getImpersonateAccount(
      "0x73AF3bcf944a6559933396c1577B257e2054D935"
    );

    compToken = (await ethers.getContractAt("IERC20", eth_comp)) as IERC20;

    const calldata = JSON.parse(
      fs.readFileSync("./stmatic-proposal-data.json", "utf-8")
    ) as Proposal;

    const crowdProposalFactory = await hre.ethers.getContractFactory(
      "CrowdProposal",
      signer
    );
    cap = (await crowdProposalFactory
      .connect(signer)
      .deploy(
        signer.address,
        calldata[0],
        calldata[1],
        calldata[2],
        calldata[3],
        calldata[4],
        eth_comp,
        eth_governor
      )) as CrowdProposal;
    expect(await cap.author()).equal(signer.address);
    let amount = ethers.parseEther("100");
    await compToken.connect(signer).approve(await cap.getAddress(), amount);
    await cap.connect(signer).initDelegate(amount);
    expect(await compToken.balanceOf(await cap.getAddress())).equal(amount);

    amount = ethers.parseEther("25000");
    await compToken.connect(signer).approve(await cap.getAddress(), amount);
    await cap.connect(signer).initDelegate(amount);

    await cap.connect(signer).propose();
    console.log(await cap.govProposalId());
  });
  describe("Deployment", function () {
    it("Should delegate", async function () {
      console.log("DONE");
    });
  });
});
