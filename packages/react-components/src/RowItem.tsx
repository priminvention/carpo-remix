import { Col, Row } from 'antd';
import React from 'react';
import styled from 'styled-components';

interface Props {
  label: string;
}

const Wrapper = styled(Row)`
  padding: 4px 0;

  .ant-select {
    width: 100%;
  }
`;

const RowItem: React.FC<Props> = ({ children, label }) => {
  return (
    <Wrapper align='middle'>
      <Col span={6}>{label}</Col>
      <Col offset={1} span={17}>
        {children}
      </Col>
    </Wrapper>
  );
};

export default React.memo<typeof RowItem>(RowItem);
