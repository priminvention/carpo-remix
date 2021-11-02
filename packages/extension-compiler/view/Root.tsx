import { sendMessage } from '@carpo-remix/common/webview/sendMessage';
import { RowItem } from '@carpo-remix/react-components';
import { Button, Select } from 'antd';
import React, { useCallback, useEffect, useState } from 'react';

const Root: React.FC = () => {
  const [contracts, setContracts] = useState<string[]>([]);
  const [selectedContract, setSelectedContract] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    sendMessage('contracts.files', null).then(setContracts).catch(console.error);
  }, []);

  const compile = useCallback((filenames: string[]) => {
    setLoading(true);

    return sendMessage('carpo-compiler.compile', filenames)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <RowItem label='Select File'>
        <Select
          allowClear
          mode='multiple'
          onChange={setSelectedContract}
          placeholder='Compile all'
          value={selectedContract}
        >
          {contracts.map((contract) => (
            <Select.Option key={contract} value={contract}>
              {contract}
            </Select.Option>
          ))}
        </Select>
      </RowItem>
      <Button
        loading={loading}
        onClick={() => compile(selectedContract.length === 0 ? contracts : selectedContract)}
        type='primary'
      >
        Compile {selectedContract.length === 0 ? 'All' : 'Selected'}
      </Button>
    </>
  );
};

export default Root;
