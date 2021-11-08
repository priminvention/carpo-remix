import { provideReactWrapper } from '@microsoft/fast-react-wrapper';
import {
  vsCodeCheckbox,
  vsCodeDropdown,
  vsCodeOption,
  vsCodeButton,
  vsCodeTextField,
  vsCodeDataGrid,
  vsCodeDataGridRow,
  vsCodeDataGridCell,
  provideVSCodeDesignSystem
} from '@vscode/webview-ui-toolkit';
import React from 'react';

const { wrap } = provideReactWrapper(React, provideVSCodeDesignSystem());

export const VsCheckbox = wrap(vsCodeCheckbox());
export const VsDropdown = wrap(vsCodeDropdown());
export const VsOption = wrap(vsCodeOption());
export const VsButton = wrap(vsCodeButton());
export const VsTextField = wrap(vsCodeTextField());
export const VsDataGrid = wrap(vsCodeDataGrid());
export const VsDataGridRow = wrap(vsCodeDataGridRow());
export const VsDataGridCell = wrap(vsCodeDataGridCell());
