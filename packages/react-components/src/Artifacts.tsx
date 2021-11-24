import type { Artifact } from '@carpo-remix/helper/types';

import { Space, Table, TableColumnType, Typography } from 'antd';
import React, { useMemo } from 'react';

import useArtifacts from './useArtifacts';

const { Text } = Typography;

const Artifacts: React.FC = () => {
  const artifacts = useArtifacts();

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
    <Table
      bordered={false}
      columns={columns}
      dataSource={artifacts}
      pagination={false}
      rowKey={(record) => record.bytecode}
      size='small'
      style={{ backgroundColor: 'transparent' }}
    />
  );
};

export default React.memo(Artifacts);
