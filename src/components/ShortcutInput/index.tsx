import { Input, InputProps, InputRef, Tooltip } from "antd";
import React, { useEffect, useRef, useState } from "react";

import "./index.scss";
import { keyIcons, keyMap } from "./constants";

interface ShortcutInputProps
  extends Omit<InputProps, "onChange" | "onKeyDown"> {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
}

const ShortcutInput: React.FC<ShortcutInputProps> = ({
  value = "",
  onChange,
  placeholder = "点击后按键设置快捷键",
  ...props
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [currentShortcut, setCurrentShortcut] = useState(value);
  const [currentKeys, setCurrentKeys] = useState<string[]>([]);
  const inputRef = useRef<InputRef>(null);

  useEffect(() => {
    setCurrentShortcut(value);
  }, [value]);

  const finishRecording = (shortcut: string) => {
    setCurrentShortcut(shortcut);
    onChange?.(shortcut);
    setIsRecording(false);
    setCurrentKeys([]);
    inputRef.current?.input?.blur();
  };

  const updateCurrentKeys = (keys: string[]) => {
    setCurrentKeys(keys);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isRecording) return;

    e.preventDefault();
    e.stopPropagation();

    const keys: string[] = [];

    if (e.metaKey) keys.push("Command");
    if (e.ctrlKey) keys.push("Control");
    if (e.altKey) keys.push("Alt");
    if (e.shiftKey) keys.push("Shift");

    updateCurrentKeys(keys);

    if (e.key.startsWith("F") && /^F([1-9]|1[0-2])$/.test(e.key)) {
      finishRecording(e.key);
      return;
    }

    const isModifierKey = ["Meta", "Control", "Alt", "Shift"].includes(e.key);

    if (
      keys.length > 0 &&
      !isModifierKey
    ) {
      const mainKey = keyMap[e.key] ?? e.key;
      keys.push(mainKey);
      const shortcut = keys.join("+");
      finishRecording(shortcut);
      return;
    }

  };

  const handleKeyUp = (e: React.KeyboardEvent) => {
    if (!isRecording) return;

    const keys: string[] = [];
    if (e.metaKey) keys.push("Command");
    if (e.ctrlKey) keys.push("Control");
    if (e.altKey) keys.push("Alt");
    if (e.shiftKey) keys.push("Shift");

    updateCurrentKeys(keys);

    const hasModifiers = e.metaKey || e.ctrlKey || e.altKey || e.shiftKey;

    if (!hasModifiers) {
      updateCurrentKeys([]);
    }
  };

  const handleFocus = () => {
    setIsRecording(true);
    setCurrentKeys([]);
  };

  const handleBlur = () => {
    setIsRecording(false);
    setCurrentKeys([]);
  };

  const renderKey = (key: string, index: number) => (
    <span className="keyboard-key" key={index}>
      <span className="key-icon">{keyIcons[key] ?? ""}</span>
      <span className="key-text">{key}</span>
    </span>
  );

  const renderPlus = (index: number) => (
    <span className="key-separator" key={`plus-${index}`}>
      +
    </span>
  );

  const displayShortcut = (shortcut: string) => {
    const keys = shortcut.replace(/Alt/g, "Option").split("+");
    return (
      <div className="shortcut-display">
        {keys.map((key, index) => (
          <React.Fragment key={index}>
            {renderKey(key.trim(), index)}
            {index < keys.length - 1 && renderPlus(index)}
          </React.Fragment>
        ))}
      </div>
    );
  };

  const displayRecordingKeys = () => {
    if (currentKeys.length === 0) {
      return <span className="recording-hint">按下快捷键...</span>;
    }

    return (
      <div className="shortcut-display recording">
        {currentKeys.map((key, index) => (
          <React.Fragment key={index}>
            {renderKey(key.replace(/Alt/g, "Option"), index)}
            {index < currentKeys.length - 1 && renderPlus(index)}
          </React.Fragment>
        ))}
      </div>
    );
  };

  const tooltipContent = (
    <div>
      <div>快捷键设置说明：</div>
      <div>
        1. 先按功能键（Control、Option、Command、Shift），再按其他普通键
      </div>
      <div>2. 按 F1-F12 单键</div>
    </div>
  );

  const inputContent = isRecording
    ? displayRecordingKeys()
    : displayShortcut(currentShortcut);

  return (
    <div className="shortcut-input-container">
      <Tooltip placement="top" title={tooltipContent}>
        <div
          className={`shortcut-input ${isRecording ? "recording" : ""} ${
            currentShortcut ? "has-value" : ""
          }`}
          onClick={() => inputRef.current?.focus()}
        >
          {inputContent || <span className="placeholder">{placeholder}</span>}
          <Input
            className="hidden-input"
            onBlur={handleBlur}
            onFocus={handleFocus}
            onKeyDown={handleKeyDown}
            onKeyUp={handleKeyUp}
            ref={inputRef}
            style={{ position: "absolute", left: "-9999px", opacity: 0 }}
            {...props}
          />
        </div>
      </Tooltip>
    </div>
  );
};

export default ShortcutInput;
