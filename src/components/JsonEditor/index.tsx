import Editor, { EditorProps, OnChange, OnMount } from "@monaco-editor/react";
import { editor } from "monaco-editor";
import { forwardRef, useCallback, useImperativeHandle, useRef } from "react";

import "./index.scss";

// Monaco Editor 实例类型
type MonacoEditor = editor.IStandaloneCodeEditor;

// JSON 编辑器配置接口
export interface JsonEditorConfig {
  /** 是否启用格式化 */
  formatOnPaste?: boolean;
  /** 是否启用折叠 */
  folding?: boolean;
  /** 是否启用括号匹配 */
  matchBrackets?: "always" | "near" | "never";
  /** 是否启用JSON验证 */
  validate?: boolean;
  /** 是否只读 */
  readOnly?: boolean;
  /** 是否显示行号 */
  lineNumbers?: "on" | "off" | "relative" | "interval";
  /** 缩进大小 */
  tabSize?: number;
  /** 是否使用空格替换tab */
  insertSpaces?: boolean;
  /** 主题 */
  theme?: "vs" | "vs-dark" | "hc-black" | "hc-light";
}

// JSON 编辑器属性接口
export interface JsonEditorProps
  extends Omit<EditorProps, "language" | "onChange"> {
  /** JSON 字符串值 */
  value?: string;
  /** 默认值 */
  defaultValue?: string;
  /** 值变化回调 */
  onChange?: (value: string | undefined, isValid: boolean) => void;
  /** 编辑器挂载完成回调 */
  onMount?: (
    editor: MonacoEditor,
    monaco: typeof import("monaco-editor")
  ) => void;
  /** JSON 配置 */
  config?: JsonEditorConfig;
  /** 错误回调 */
  onError?: (error: string) => void;
  /** 是否显示错误信息 */
  showError?: boolean;
  /** 自定义类名 */
  className?: string;
  /** 编辑器高度 */
  height?: string | number;
  /** 编辑器宽度 */
  width?: string | number;
}

// 暴露给外部的方法接口
export interface JsonEditorRef {
  /** 获取编辑器实例 */
  getEditor: () => MonacoEditor | null;
  /** 获取当前值 */
  getValue: () => string;
  /** 设置值 */
  setValue: (value: string) => void;
  /** 格式化JSON */
  format: () => Promise<void>;
  /** 验证JSON */
  validate: () => { isValid: boolean; error?: string };
  /** 聚焦编辑器 */
  focus: () => void;
  /** 插入文本 */
  insertText: (text: string) => void;
}

// JSON 编辑器组件
export const JsonEditor = forwardRef<JsonEditorRef, JsonEditorProps>(
  (
    {
      value,
      defaultValue = "{}",
      onChange,
      onMount,
      config = {},
      onError,
      className,
      height,
      width = "100%",
      ...editorProps
    },
    ref
  ) => {
    const editorRef = useRef<MonacoEditor | null>(null);
    const monacoRef = useRef<typeof import("monaco-editor") | null>(null);

    // 默认配置
    const defaultConfig: Required<JsonEditorConfig> = {
      formatOnPaste: true,
      folding: true,
      matchBrackets: "always",
      validate: true,
      readOnly: false,
      lineNumbers: "on",
      tabSize: 2,
      insertSpaces: true,
      theme: "vs",
    };

    const finalConfig = { ...defaultConfig, ...config };

    // 验证JSON
    const validateJson = useCallback(
      (jsonString: string): { isValid: boolean; error?: string } => {
        if (!jsonString.trim()) {
          return { isValid: true };
        }

        try {
          JSON.parse(jsonString);
          return { isValid: true };
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Invalid JSON";
          return { isValid: false, error: message };
        }
      },
      []
    );

    // 编辑器变化处理
    const handleEditorChange: OnChange = useCallback(
      (newValue) => {
        if (onChange) {
          const validation = validateJson(newValue || "");
          onChange(newValue, validation.isValid);

          if (!validation.isValid && validation.error && onError) {
            onError(validation.error);
          }
        }
      },
      [onChange, onError, validateJson]
    );

    // 编辑器挂载处理
    const handleEditorMount: OnMount = useCallback(
      (editor, monaco) => {
        editorRef.current = editor;
        monacoRef.current = monaco;

        // 配置JSON语言服务
        monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
          validate: finalConfig.validate,
          allowComments: false,
          schemas: [],
          enableSchemaRequest: true,
        });

        // 自定义编辑器配置
        editor.updateOptions({
          formatOnPaste: finalConfig.formatOnPaste,
          folding: finalConfig.folding,
          matchBrackets: finalConfig.matchBrackets,
          readOnly: finalConfig.readOnly,
          lineNumbers: finalConfig.lineNumbers,
          tabSize: finalConfig.tabSize,
          insertSpaces: finalConfig.insertSpaces,
          automaticLayout: true,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          wordWrap: "on",
          contextmenu: true,
          selectOnLineNumbers: true,
          roundedSelection: false,
          cursorStyle: "line",
          fontSize: 14,
          fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
        });

        // 调用外部挂载回调
        if (onMount) {
          onMount(editor, monaco);
        }
      },
      [finalConfig, onMount]
    );

    // 暴露方法给父组件
    useImperativeHandle(
      ref,
      () => ({
        getEditor: () => editorRef.current,

        getValue: () => {
          return editorRef.current?.getValue() || "";
        },

        setValue: (newValue: string) => {
          if (editorRef.current) {
            editorRef.current.setValue(newValue);
          }
        },

        format: async () => {
          if (editorRef.current && monacoRef.current) {
            await editorRef.current
              .getAction("editor.action.formatDocument")
              ?.run();
          }
        },

        validate: () => {
          const currentValue = editorRef.current?.getValue() || "";
          return validateJson(currentValue);
        },

        focus: () => {
          editorRef.current?.focus();
        },

        insertText: (text: string) => {
          if (editorRef.current) {
            const selection = editorRef.current.getSelection();
            const range = selection || new monacoRef.current!.Range(1, 1, 1, 1);
            const operation = {
              range,
              text,
              forceMoveMarkers: true,
            };
            editorRef.current.executeEdits("insert-text", [operation]);
          }
        },
      }),
      [validateJson]
    );

    return (
      <div className={`json-editor ${className || ""}`}>
        <Editor
          defaultValue={defaultValue}
          height={height}
          language="json"
          onChange={handleEditorChange}
          onMount={handleEditorMount}
          options={{
            selectOnLineNumbers: true,
            roundedSelection: false,
            readOnly: finalConfig.readOnly,
            cursorStyle: "line",
            automaticLayout: true,
          }}
          theme={finalConfig.theme}
          value={value}
          width={width}
          {...editorProps}
        />
      </div>
    );
  }
);

JsonEditor.displayName = "JsonEditor";

export default JsonEditor;
