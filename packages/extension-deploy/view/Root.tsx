import type { AccountType, Deployment } from '@carpo-remix/common/webview/types';
import type { Artifact } from '@carpo-remix/helper/types';

import { sendMessage } from '@carpo-remix/common/webview/sendMessage';
import useArtifacts from '@carpo-remix/react-components/useArtifacts';
import { Fragment } from '@carpo-remix/react-params';
import { Button, Col, Form, Row, Select } from 'antd';
import { ethers } from 'ethers';
import React, { useCallback, useEffect, useState } from 'react';

import { PostMessageProvider } from './PostMessageProvider';

type NetworkType = 'local' | 'wallet';

const networkTypes: NetworkType[] = ['local', 'wallet'];

function trimAddress(addr: string | undefined) {
  if (!addr) return '';

  return addr.slice(0, 6) + '...' + addr.slice(-6);
}

const Root: React.FC = () => {
  const [currentNetworkType, setcurrentNetworkType] = useState<NetworkType>('local');
  const [currentAccount, setCurrentAccount] = useState<string>();
  const [accountList, setAccountList] = useState<AccountType[]>([]);
  const [constructorFragment, setConstructorFragment] = useState<ethers.utils.Fragment>();
  const [currentArtifact, setCurrentArtifact] = useState<Artifact>();
  const artifacts = useArtifacts();
  const [provider, setProvider] = useState<PostMessageProvider>();
  const [deployParams, setDeployParams] = useState<any[]>([]);

  const getAccounts = useCallback(() => {
    return provider
      ? provider
          .listAccounts()
          .then((accounts) =>
            accounts.map(async (account) => ({
              address: account,
              balance: await provider.getBalance(account)
            }))
          )
          .then((data) => {
            return Promise.all(data.map((d) => d));
          })
      : Promise.resolve([]);
  }, [provider]);

  useEffect(() => {
    if (currentNetworkType === 'local') {
      setProvider(new PostMessageProvider('development'));
    }

    return () => {
      provider?.removeAllListeners();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentNetworkType]);

  /**
   * Initializing the connection
   * Currently only wallets and custom nodes are supported
   * @todo custom
   */
  useEffect(() => {
    getAccounts().then((accounts) => {
      setAccountList(accounts);
      setCurrentAccount(accounts[0].address);
    });
  }, [getAccounts]);

  const handleChangeNetwork = (networkType: NetworkType) => {
    setcurrentNetworkType(networkType);
  };

  const handleChangeContract = (index: number) => {
    const artifact = artifacts?.[index];

    if (!artifact) return;
    setCurrentArtifact(artifact);
    const { abi } = artifact;
    const constructor = new ethers.utils.Interface(abi).fragments.find((i: any) => i.type === 'constructor');

    setConstructorFragment(constructor);
  };

  /**
   * after send Tx, update the balance of current account
   */
  const updateAccountList = useCallback(() => {
    getAccounts().then(setAccountList);
  }, [getAccounts]);

  /**
   * deploy the contract
   * & update the singer's balance
   */
  const deploy = useCallback(async () => {
    if (!provider || !currentArtifact) return;

    const { abi, bytecode } = currentArtifact;
    const signer = provider.getSigner();
    const factory = new ethers.ContractFactory(abi, bytecode, signer);

    const contract = await factory.deploy(...deployParams);

    await contract.deployed();

    const deployment: Deployment = {
      address: contract.address,
      transactionHash: contract.deployTransaction.hash,
      chainId: provider.network.chainId,
      ...currentArtifact
    };

    await sendMessage('carpo-deploy.saveDeployment', deployment);

    updateAccountList();
  }, [currentArtifact, deployParams, provider, updateAccountList]);

  return (
    <>
      <Form>
        <Form.Item label='Environment'>
          <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
            <Col span={24}>
              <Select defaultValue='local' onChange={handleChangeNetwork}>
                {networkTypes.map((type) => (
                  <Select.Option key={type} value={type}>
                    {type}
                  </Select.Option>
                ))}
              </Select>
            </Col>
          </Row>
        </Form.Item>
        <Form.Item label='Account'>
          <Select
            onChange={(address) => {
              setCurrentAccount(address);
            }}
            value={currentAccount}
          >
            {accountList.map((account) => (
              <Select.Option key={account.address} value={account.address}>
                {`${trimAddress(account.address)}   (${ethers.utils.formatEther(account.balance)} eth)`}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item label='Contract'>
          <Select<number>
            onChange={(val) => {
              handleChangeContract(val);
            }}
          >
            {artifacts?.map((artifact, index) => (
              <Select.Option key={artifact.contractName} value={index}>
                {artifact.contractName}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item label='Deploy'>
          {constructorFragment && <Fragment fragmentValue={constructorFragment} onChange={setDeployParams} />}
          <Button className='deployed-btn' onClick={deploy}>
            Deploy
          </Button>
        </Form.Item>
      </Form>
      <div className='deployed'>
        <div className='deployed-title'>Deployed Contracts</div>
        {/* <div className='deployed-result'>
          {deployedRes.length > 0 ? (
            <Collapse>
              {deployedRes.map((info) => (
                <Collapse.Panel
                  className='deployed-panel'
                  header={<span className='head'>{info.addr}</span>}
                  key={info.addr}
                >
                  {info.fnFragment.map((fragment, fragmentIndex) => {
                    return (
                      <div className='frag' key={fragmentIndex}>
                        {fragment.inputs.map((ipt, innerIndex) => (
                          <Input
                            key={ipt.name}
                            onChange={(e) => {
                              if (!fnFragmentsArgs.current[info.addr]) {
                                fnFragmentsArgs.current[info.addr] = {};
                              }

                              if (!fnFragmentsArgs.current[info.addr][fragment.name]) {
                                fnFragmentsArgs.current[info.addr][fragment.name] = [];
                              }

                              fnFragmentsArgs.current[info.addr][fragment.name][innerIndex] = e.target.value;
                            }}
                            placeholder={ipt.baseType}
                          />
                        ))}
                        <Button onClick={() => handleContractFn(info.addr, fragment.name)}>{fragment.name}</Button>
                      </div>
                    );
                  })}
                </Collapse.Panel>
              ))}
            </Collapse>
          ) : (
            <div>No deployed contracts !</div>
          )}
        </div> */}
      </div>
    </>
  );
};

export default Root;
