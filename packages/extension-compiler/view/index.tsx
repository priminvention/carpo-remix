import { Button } from 'antd';
import React from 'react';
import ReactDOM from 'react-dom';

const rootId = 'root';
const rootElement = document.getElementById(rootId);

if (!rootElement) {
  throw new Error(`Unable to find element with id '${rootId}'`);
}

ReactDOM.render(<Button type='primary'>Compiler</Button>, rootElement);
