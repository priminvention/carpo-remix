import React, { useState, useEffect, useRef } from 'react';
import { Button, Form, Select, Input, Space, Row, Col, Collapse } from 'antd';
import { ethers } from 'ethers';
import useArtifacts from '@carpo-remix/react-components/useArtifacts';
import { sendMessage } from '@carpo-remix/common/webview/sendMessage';
import connectToProvider, { ProviderType, AccountType, NetworkType } from './utils/provider';

type AbiInput = {
  name: string;
  type: string;
};

const networkTypes: NetworkType[] = ['local', 'wallet'];

function trimAddress(addr: string) {
  return addr.slice(0, 6) + '...' + addr.slice(-6);
}

const Root: React.FC = () => {
  const [currentNetworkType, setcurrentNetworkType] = useState<NetworkType>('local');
  const [custNodeUrl, setCustNodeUrl] = useState('http://127.0.0.1:8545');
  const [currentAccount, setCurrentAccount] = useState<string>();
  const [accountList, setAccountList] = useState<AccountType[]>([]);
  const [constractParams, setConstractParams] = useState<(AbiInput & { value: string })[]>([]);
  const [currentArtifact, setCurrentArtifact] = useState('');
  const [deployedRes, setDeployedRes] = useState<
    [ethers.Contract, (ethers.utils.FunctionFragment & { inputArgs?: any })[]][]
  >([]);
  const artifacts = useArtifacts();
  let curProvider = useRef<ProviderType>();
  let fnFragmentsArgs = useRef<{ [conAddr: string]: any[] }>({});

  /**
   * Initializing the connection
   * Currently only wallets and custom nodes are supported
   * @todo custom
   */
  useEffect(() => {
    connectToProvider(currentNetworkType, custNodeUrl).then(({ provider, accounts }) => {
      curProvider.current = provider;
      setAccountList(accounts);
      setCurrentAccount(accounts[0].address);
    });
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
  const updateAccountList = async (currentAccount: string) => {
    const signer = curProvider.current!.getSigner(currentAccount);
    const balance = await signer?.getBalance();
    console.log('updateAccountList: ', ethers.utils.formatEther(balance ?? 0));
    const accountLists = accountList.map((accountInfo) =>
      accountInfo.address === currentAccount
        ? { address: accountInfo.address, balance: ethers.utils.formatEther(balance ?? 0) }
        : accountInfo
    );
    setAccountList(accountLists);
  };

  /**
   * deploy the contract
   * & update the singer's balance
   */
  const deploy = async () => {
    const { abi, bytecode } = JSON.parse(currentArtifact);
    const signer = curProvider.current?.getSigner(currentAccount);
    const factory = new ethers.ContractFactory(abi, bytecode, signer);
    const contract = await factory.deploy(...constractParams.map((i) => i.value));

    // update account balance

    updateAccountList(currentAccount!);

    fnFragmentsArgs.current[contract.address] = [];

    deployedRes.push([contract, Object.values(contract.interface.functions)]);
    setDeployedRes(deployedRes.slice());

    sendMessage('workspace.toast', `Deployed success at ${contract.address}`);
  };

  const handleContractFn = async (contractIdx: number, fragmentIdx: number) => {
    const [contract, fragments] = deployedRes[contractIdx];
    const { name, inputs } = fragments[fragmentIdx];
    const inputArgs = fnFragmentsArgs.current[contract.address][fragmentIdx];

    try {
      const res = inputs.length > 0 ? await contract[name](...inputArgs) : await contract[name]();
      if (res.wait) {
        res.wait().then((confirm: any) => {
          console.log('confirm:', ethers.utils.formatEther(confirm.gasUsed));
        });
        updateAccountList(currentAccount!);
      }
    } catch (error) {
      console.log('handle ', error);
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
      </Form>
      <Space direction='vertical'>
        {constractParams.map((item, index) => (
          <Input
            key={index}
            addonBefore={item.name}
            onChange={(e) => {
              item.value = e.target.value;
              setConstractParams([...constractParams]);
            }}
            placeholder={item.type}
          />
        ))}
        <Button onClick={deploy} disabled={!currentAccount || !currentArtifact}>
          Deploy
        </Button>
      </Space>
      <div className='deployed'>
        <div className='deployed-title'>Deployed Contracts</div>
        <div className='deployed-result'>
          {deployedRes.length > 0 ? (
            <Collapse>
              {deployedRes.map((info, contractIdx) => (
                <>
                  <Collapse.Panel
                    className='deployed-panel'
                    header={<span className='head'>{info[0].address}</span>}
                    key={info[0].address}
                  >
                    {info[1].map((fragment, fragmentIndex) => {
                      return (
                        <>
                          <div className='frag'>
                            {fragment.inputs.map((ipt, innerIndex) => (
                              <Input
                                key={ipt.name}
                                placeholder={ipt.baseType}
                                onChange={(e) => {
                                  if (!fnFragmentsArgs.current[info[0].address][fragmentIndex]) {
                                    fnFragmentsArgs.current[info[0].address][fragmentIndex] = [];
                                  }

                                  fnFragmentsArgs.current[info[0].address][fragmentIndex][innerIndex] = e.target.value;
                                  console.log(fnFragmentsArgs.current[info[0].address][fragmentIndex]);
                                }}
                              />
                            ))}
                            <Button onClick={() => handleContractFn(contractIdx, fragmentIndex)}>
                              {fragment.name}
                            </Button>
                          </div>
                        </>
                      );
                    })}
                  </Collapse.Panel>
                </>
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
