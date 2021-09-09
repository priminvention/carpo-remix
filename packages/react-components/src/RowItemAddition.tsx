import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Input } from 'antd';
import React, { FC, useCallback, useState, useEffect } from 'react';

import RowItem from './RowItem';

const RowItemAddition: FC<{
  label: string;
  buttonTxt: string;
  data: string[];
  handleChange: (data: string[]) => void;
}> = (props) => {
  const { buttonTxt, data, handleChange, label } = props;
  const [sourceData, setSourceData] = useState(data);

  useEffect(() => {
    setSourceData(data);
  }, [data]);

  const handleChangeSourceData = useCallback(
    (newSourceData: string[]) => {
      setSourceData(newSourceData);
      handleChange(newSourceData);
    },
    [handleChange]
  );

  const changeItem = useCallback(
    (value: string, index: number) => {
      const newSourceData = sourceData.map((source, i) => (i === index ? value : source));

      handleChangeSourceData(newSourceData);
    },
    [handleChangeSourceData, sourceData]
  );

  const deleteItem = useCallback(
    (index: number) => {
      sourceData.splice(index, 1);
      const newSourceData = sourceData.slice();
      handleChangeSourceData(newSourceData);
    },
    [handleChangeSourceData, sourceData]
  );

  return (
    <RowItem label={label}>
      {sourceData.map((source, index) => (
        <div key={index}>
          <Input
            onChange={(e) => {
              changeItem(e.target.value, index);
            }}
            suffix={<MinusCircleOutlined onClick={() => deleteItem(index)} />}
            value={source}
          />
        </div>
      ))}
      <Button
        block
        icon={<PlusOutlined />}
        onClick={() => {
          const newSourceData = [...sourceData, ''];

          handleChangeSourceData(newSourceData);
        }}
        type='dashed'
      >
        {buttonTxt}
      </Button>
    </RowItem>
  );
};

export default RowItemAddition;
