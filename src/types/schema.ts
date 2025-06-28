/* eslint-disable @typescript-eslint/no-explicit-any */
type JSONSchema7Type =
  | "string"
  | "number"
  | "integer"
  | "boolean"
  | "array"
  | "object"
  | "null"
  | "any";

export interface JSONSchema7 {
  $schema?: string;
  $id?: string;
  $ref?: string;

  // 元数据
  title?: string;
  description?: string;
  default?: any;

  // 类型相关
  type?: JSONSchema7Type;
  enum?: any[];
  const?: any;

  // 数值校验
  multipleOf?: number;
  maximum?: number;
  exclusiveMaximum?: number;
  minimum?: number;
  exclusiveMinimum?: number;

  // 字符串校验
  maxLength?: number;
  minLength?: number;
  pattern?: string;

  // 数组校验
  items?: JSONSchema7 | JSONSchema7[];
  maxItems?: number;
  minItems?: number;
  uniqueItems?: boolean;
  additionalItems?: JSONSchema7;

  // 对象校验
  maxProperties?: number;
  minProperties?: number;
  required?: string[];
  properties?: { [key: string]: JSONSchema7 };
  patternProperties?: { [key: string]: JSONSchema7 };
  additionalProperties?: boolean | JSONSchema7;

  // 组合逻辑
  allOf?: JSONSchema7[];
  anyOf?: JSONSchema7[];
  oneOf?: JSONSchema7[];
  not?: JSONSchema7;

  // 条件逻辑
  if?: JSONSchema7;
  then?: JSONSchema7;
  else?: JSONSchema7;

  // 其他
  format?: string;
}
