import type { Artifact } from '@carpo-remix/common/solidity';

import { sendMessage } from '@carpo-remix/common/webview/sendMessage';
import { Space, Table, TableColumnType, Typography } from 'antd';
import React, { useEffect, useMemo, useState } from 'react';
import { VsDataGrid, VsDataGridRow, VsDataGridCell } from './VscodeBaseComponents';

const { Text } = Typography;

const Artifacts: React.FC = () => {
  const [artifacts, setArtifacts] = useState<Artifact[]>();

  useEffect(() => {
    sendMessage('artifacts.all', null).then(setArtifacts).catch(console.error);
  }, []);

  const columns = useMemo(
    (): TableColumnType<Artifact>[] => [
      {
        title: 'Contract',
        dataIndex: 'contract',
        ellipsis: true,
        render: (_, record) => record.contractName
      },
      {
        title: '',
        align: 'right',
        dataIndex: 'action',
        render: (_, record) => (
          <Space size='small'>
            <Text
              copyable={{
                text: JSON.stringify(record.abi, null, 2)
              }}
            >
              ABI
            </Text>
            {record.bytecode && (
              <Text
                copyable={{
                  text: record.bytecode
                }}
              >
                Bytecode
              </Text>
            )}
          </Space>
        )
      }
    ],
    []
  );

  return (
    // <Table
    //   bordered={false}
    //   columns={columns}
    //   dataSource={artifacts}
    //   pagination={false}
    //   size='small'
    //   style={{ backgroundColor: 'transparent' }}
    // />
    <VsDataGrid id='basic-grid' aria-label='Custom Column Widths'>
      <VsDataGridRow row-type='header'>
        <VsDataGridCell cell-type='columnheader' grid-column='1'>
          Header 1
        </VsDataGridCell>
        <VsDataGridCell cell-type='columnheader' grid-column='2'>
          Header 2
        </VsDataGridCell>
        <VsDataGridCell cell-type='columnheader' grid-column='3'>
          Header 3
        </VsDataGridCell>
        <VsDataGridCell cell-type='columnheader' grid-column='3'>
          Header 4
        </VsDataGridCell>
      </VsDataGridRow>
    </VsDataGrid>
  );
};

export default React.memo(Artifacts);
