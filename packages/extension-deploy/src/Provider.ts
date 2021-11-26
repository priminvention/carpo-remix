import {
  AccountType,
  ContractCallReqTypes,
  ContractDeployReqType,
  ContractDeployResType
} from '@carpo-remix/common/webview/types';
import { ethers } from 'ethers';
import { Artifact } from '@carpo-remix/helper/types';
import * as fs from 'fs-extra';
import path from 'path';
import { getWorkspacePath } from '@carpo-remix/utils/workspace';
import { getNamedArtifact } from '@carpo-remix/helper';

interface Deployment extends Artifact {
  address: string;
  transactionHash: string;
  receipt: any;
  chainId: number;
}

async function writeDeployedResult(name: string, contract: ethers.Contract) {
  const workspacePath = getWorkspacePath();
  const { address, deployTransaction } = contract;
  const { hash, chainId, wait } = deployTransaction;
  const receipt = await wait();
  const contractArtifact = (await getNamedArtifact(name, workspacePath)) as Artifact;

  const jsonData: Deployment = {
    ...contractArtifact,
    address: address,
    transactionHash: hash,
    receipt: receipt,
    chainId: chainId
  };
  const artifactsDir = path.resolve(workspacePath, 'deployments', `chainId_${chainId.toString()}`, `${name}.json`);
  fs.ensureFileSync(artifactsDir);
  fs.writeJsonSync(artifactsDir, jsonData, {
    spaces: 2
  });
}

export default class InnerProvider {
  static providerInstance: ethers.providers.JsonRpcProvider;
  private static list: string[] = [];
  private static contracts: { [addr: string]: ethers.Contract } = {};
  private static deployedRes: ContractDeployResType = [];

  private static async getProviderInstance() {
    if (!InnerProvider.providerInstance) {
      const provider = new ethers.providers.JsonRpcProvider('http://127.0.0.1:8545');

      await provider.ready;
      InnerProvider.providerInstance = provider;
    }

    return InnerProvider.providerInstance;
  }

  public static async getAccountList(): Promise<AccountType[]> {
    const provider = await InnerProvider.getProviderInstance();

    InnerProvider.list = await provider.listAccounts();

    return Promise.all(
      InnerProvider.list.map(async (account) => {
        const unFormatBalance = await provider.getBalance(account);

        return { address: account, balance: ethers.utils.formatEther(unFormatBalance ?? 0) };
      })
    );
  }

  public static async deploy(params: ContractDeployReqType): Promise<ContractDeployResType> {
    const { account, artifact, constractParams } = params;
    const { contractName, abi, bytecode } = JSON.parse(artifact);
    const provider = await InnerProvider.getProviderInstance();
    const signer = provider.getSigner(account);
    const factory = new ethers.ContractFactory(abi, bytecode, signer);
    const contract = await factory.deploy(...constractParams.map((i: any) => i.value));

    InnerProvider.contracts[contract.address] = contract;
    InnerProvider.deployedRes.push({ addr: contract.address, fnFragment: Object.values(contract.interface.functions) });
    writeDeployedResult(contractName, contract);

    return InnerProvider.deployedRes;
  }

  public static async call(params: ContractCallReqTypes) {
    const { addr, fragmentName, inputArgs } = params;
    const frg = InnerProvider.contracts[addr].interface.fragments.find((frg) => frg.name === fragmentName);

    if (frg?.inputs.length && frg?.inputs.length > 0) {
      return await InnerProvider.contracts[addr][fragmentName](...inputArgs);
    }

    return InnerProvider.contracts[addr][fragmentName](...inputArgs);
  }
}
