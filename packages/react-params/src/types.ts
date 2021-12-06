import type { ParamType } from '@ethersproject/abi';

export interface ParamProps<V = unknown> {
  paramType: ParamType;
  name?: string;
  placeholder?: string;
  value?: V;
  onChange?: (value: V) => void;
}

export type ArrayParamProps = ParamProps<any[]>;

export type StringParamProps = ParamProps<string>;

export type TupleParamProps = ParamProps<Record<string, any>>;

export type UintParamProps = ParamProps<string>;

export type IntParamProps = ParamProps<string>;

export type BytesParamProps = ParamProps<string>;
