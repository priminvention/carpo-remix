import {
  AccountType,
  ContractCallReqTypes,
  ContractDeployReqType,
  ContractDeployResType
} from '@carpo-remix/common/webview/types';
import { getNamedArtifact } from '@carpo-remix/helper';
import { Artifact } from '@carpo-remix/helper/types';
import { toast } from '@carpo-remix/utils';
import { getWorkspacePath } from '@carpo-remix/utils/workspace';
import { ethers } from 'ethers';
import * as fs from 'fs-extra';
import path from 'path';

interface Deployment extends Artifact {
  address: string;
  transactionHash: string;
  receipt: any;
  chainId: number;
}

async function writeDeployedResult(name: string, contract: ethers.Contract) {
  const workspacePath = getWorkspacePath();
  const { address, deployTransaction } = contract;
  const { chainId, hash, wait } = deployTransaction;
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
    const { abi, bytecode, contractName } = JSON.parse(artifact);
    const provider = await InnerProvider.getProviderInstance();
    const signer = provider.getSigner(account);
    const factory = new ethers.ContractFactory(abi, bytecode, signer);
    const contract = await factory.deploy(...constractParams.map((i: any) => i.value));

    InnerProvider.contracts[contract.address] = contract;
    InnerProvider.deployedRes.push({
      contractAddr: contract.address,
      abi,
      fnFragment: Object.values(contract.interface.functions)
    });
    writeDeployedResult(contractName, contract);

    return InnerProvider.deployedRes;
  }

  public static async call(params: ContractCallReqTypes): Promise<any> {
    const { abi, addr, contractAddr, fragmentName, inputArgs } = params;
    const provider = await InnerProvider.getProviderInstance();
    const signer = provider.getSigner(addr);
    const contract = new ethers.Contract(contractAddr, abi, signer);

    const signedContract = contract.connect(signer);
    const frg = signedContract.interface.fragments.find((frg) => frg.name === fragmentName);

    try {
      if (frg?.inputs.length && frg?.inputs.length > 0) {
        for (let i = 0; i < frg.inputs.length; i++) {
          if (frg.inputs[i].type === 'string' && !inputArgs[i]) {
            inputArgs[i] = '';
          }
        }

        const res = await signedContract[fragmentName].call(null, ...inputArgs);

        toast.info(JSON.stringify(res));

        return;
      }

      const res = await signedContract[fragmentName].call(null);

      toast.info(JSON.stringify(res));
    } catch (error) {
      console.log('error', JSON.stringify(error));

      toast.error(JSON.stringify(error));
    }
  }
}
