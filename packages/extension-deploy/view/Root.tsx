import React, { useState, useEffect, useRef } from 'react';
import { Button, Form, Select, Input, Row, Col, Collapse } from 'antd';
import { ethers } from 'ethers';
import useArtifacts from '@carpo-remix/react-components/useArtifacts';
import { sendMessage } from '@carpo-remix/common/webview/sendMessage';
import connectToProvider, { ProviderType, AccountType, NetworkType } from './utils/provider';
import { ContractDeployResType } from '@carpo-remix/common/webview/types';

type AbiInput = {
  name: string;
  type: string;
};

const networkTypes: NetworkType[] = ['local', 'wallet'];

function trimAddress(addr: string | undefined) {
  if (!addr) return '';
  return addr.slice(0, 6) + '...' + addr.slice(-6);
}

const Root: React.FC = () => {
  const [currentNetworkType, setcurrentNetworkType] = useState<NetworkType>('local');
  const [custNodeUrl, setCustNodeUrl] = useState('http://localhost:8545');
  const [currentAccount, setCurrentAccount] = useState<string>();
  const [accountList, setAccountList] = useState<AccountType[]>([]);
  const [constractParams, setConstractParams] = useState<(AbiInput & { value: string })[]>([]);
  const [currentArtifact, setCurrentArtifact] = useState('');
  const [deployedRes, setDeployedRes] = useState<ContractDeployResType>([]);
  const artifacts = useArtifacts();
  let curProvider = useRef<ProviderType>();
  let fnFragmentsArgs = useRef<{ [conAddr: string]: { [key: string]: unknown[] } }>({});

  /**
   * Initializing the connection
   * Currently only wallets and custom nodes are supported
   * @todo custom
   */
  useEffect(() => {
    if (currentNetworkType === 'local') {
      sendMessage('carpo-deploy.accounts').then((accounts) => {
        setAccountList(accounts);
        setCurrentAccount(accounts[0].address);
      });
    }
  }, [currentNetworkType]);

  const handleChangeNetwork = (networkType: NetworkType) => {
    setcurrentNetworkType(networkType);
  };

  const handleChangeContract = (val: string) => {
    setCurrentArtifact(val);
    const { abi } = JSON.parse(val);
    const constructorInputs = abi.find((i: any) => i.type === 'constructor');
    if (constructorInputs) {
      const enhancedInput = constructorInputs.inputs.map((i: AbiInput) => ({ ...i, value: '' }));
      setConstractParams(enhancedInput);
    } else {
      setConstractParams([]);
    }
  };

  /**
   * after send Tx, update the balance of current account
   */
  const updateAccountList = () => {
    sendMessage('carpo-deploy.accounts').then((accounts) => {
      setAccountList(accounts);
    });
  };

  /**
   * deploy the contract
   * & update the singer's balance
   */
  const deploy = async () => {
    const deployedRes = await sendMessage('carpo-deploy.run', {
      artifact: currentArtifact,
      account: currentAccount!,
      constractParams
    });
    setDeployedRes(deployedRes);
    updateAccountList();
  };

  const handleContractFn = async (addr: string, fragmentName: string) => {
    const inputArgs = fnFragmentsArgs.current[addr] ? fnFragmentsArgs.current[addr][fragmentName] : [];
    try {
      await sendMessage('carpo-deploy.call', { addr, fragmentName, inputArgs: inputArgs });
      updateAccountList();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <Form>
        <Form.Item label='Environment'>
          <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
            <Col span={24}>
              <Select defaultValue='local' onChange={handleChangeNetwork}>
                {networkTypes.map((type) => (
                  <Select.Option value={type} key={type}>
                    {type}
                  </Select.Option>
                ))}
              </Select>
            </Col>
          </Row>
        </Form.Item>
        <Form.Item label='Account'>
          <Select
            value={currentAccount}
            onChange={(address) => {
              setCurrentAccount(address);
            }}
          >
            {accountList.map((account) => (
              <Select.Option key={account.address} value={account.address}>
                {`${trimAddress(account.address)}   (${account.balance} eth)`}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item label='Contract'>
          <Select
            defaultValue={''}
            onChange={(val) => {
              handleChangeContract(val);
            }}
          >
            {artifacts?.map((artifact) => (
              <Select.Option key={artifact.contractName} value={JSON.stringify(artifact)}>
                {artifact.contractName}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item label='Deploy'>
          {constractParams.map((item, index) => (
            <Input
              key={index}
              className='deployed-ipt-field'
              addonBefore={item.name}
              onChange={(e) => {
                item.value = e.target.value;
                setConstractParams([...constractParams]);
              }}
              placeholder={item.type}
            />
          ))}
          <Button onClick={deploy} className='deployed-btn' disabled={!currentAccount || !currentArtifact}>
            Deploy
          </Button>
        </Form.Item>
      </Form>
      <div className='deployed'>
        <div className='deployed-title'>Deployed Contracts</div>
        <div className='deployed-result'>
          {deployedRes.length > 0 ? (
            <Collapse>
              {deployedRes.map((info, contractIdx) => (
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
                            placeholder={ipt.baseType}
                            onChange={(e) => {
                              if (!fnFragmentsArgs.current[info.addr]) {
                                fnFragmentsArgs.current[info.addr] = {};
                              }
                              if (!fnFragmentsArgs.current[info.addr][fragment.name]) {
                                fnFragmentsArgs.current[info.addr][fragment.name] = [];
                              }
                              fnFragmentsArgs.current[info.addr][fragment.name][innerIndex] = e.target.value;
                            }}
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
        </div>
      </div>
    </>
  );
};

export default Root;
