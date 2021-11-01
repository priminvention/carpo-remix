import { sendMessage } from '@carpo-remix/common/webview/sendMessage';
import { RowItem } from '@carpo-remix/react-components';
import { Button, Select } from 'antd';
import React, { useCallback, useEffect, useState } from 'react';

const Root: React.FC = () => {
  const [contracts, setContracts] = useState<string[]>([]);
  const [selectedContract, setSelectedContract] = useState<string>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    sendMessage('solidity.contracts', null).then(setContracts).catch(console.error);
  }, []);

  const compile = useCallback((filenames: string[]) => {
    setLoading(true);

    return sendMessage('carpo-compiler.compile', filenames)
      .then(console.log)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <RowItem label='Select File'>
        <Select onChange={setSelectedContract} placeholder='Compile all' value={selectedContract}>
          {contracts.map((contract) => (
            <Select.Option key={contract} value={contract}>
              {contract}
            </Select.Option>
          ))}
        </Select>
      </RowItem>
      <Button loading={loading} onClick={() => compile(contracts)} type='primary'>
        Compile All
      </Button>
    </>
  );
};

export default Root;
