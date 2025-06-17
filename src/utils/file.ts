import mammoth from "mammoth";
import * as XLSX from "xlsx";

export enum FileType {
  TXT = "txt",
  MD = "md",
  DOCX = "docx",
  XLS = "xls",
  XLSX = "xlsx",
  CSV = "csv",
  JSON = "json",
}

export interface FileProcessResult {
  content: string;
  error?: string;
  fileName: string;
  fileType: string;
  success: boolean;
}

/**
 * 获取文件扩展名
 */
function getFileExtension(file: File): string {
  const fileName = file.name.toLowerCase();
  const lastDotIndex = fileName.lastIndexOf(".");
  return lastDotIndex !== -1 ? fileName.substring(lastDotIndex + 1) : "";
}

/**
 * 读取文本文件
 */
function readTextFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      resolve((event.target?.result as string) || "");
    };
    reader.onerror = () => {
      reject(new Error("文件读取失败"));
    };
    reader.readAsText(file, "UTF-8");
  });
}

/**
 * 处理 Word 文档 (.docx)
 */
async function processDocxFile(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  } catch (error) {
    throw new Error(`处理 DOCX 文件失败: ${error}`);
  }
}

/**
 * 处理 Excel 文件 (.xlsx, .xls)
 */
async function processExcelFile(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: "array" });

    let result = "";

    // 遍历所有工作表
    workbook.SheetNames.forEach((sheetName, index) => {
      const worksheet = workbook.Sheets[sheetName];
      const csvData = XLSX.utils.sheet_to_csv(worksheet);

      result += `=== 工作表 ${index + 1}: ${sheetName} ===\n`;
      result += csvData;
      result += "\n\n";
    });

    return result;
  } catch (error) {
    throw new Error(`处理 Excel 文件失败: ${error}`);
  }
}

/**
 * 主要的文件处理函数
 * @param file 要处理的文件
 * @returns Promise<FileProcessResult> 处理结果
 */
export async function processFile(file: File): Promise<FileProcessResult> {
  const fileExtension = getFileExtension(file);
  const fileName = file.name;

  try {
    let content = "";

    switch (fileExtension) {
      case FileType.TXT:
      case FileType.MD:
      case FileType.CSV:
      case FileType.JSON:
        content = await readTextFile(file);
        break;

      case FileType.DOCX:
        content = await processDocxFile(file);
        break;

      case FileType.XLSX:
      case FileType.XLS:
        content = await processExcelFile(file);
        break;

      default:
        try {
          content = await readTextFile(file);
        } catch {
          throw new Error(`不支持的文件格式: ${fileExtension}`);
        }
    }

    return {
      content,
      fileName,
      fileType: fileExtension,
      success: true,
    };
  } catch (error) {
    return {
      content: "",
      error: error instanceof Error ? error.message : "未知错误",
      fileName,
      fileType: fileExtension,
      success: false,
    };
  }
}

/**
 * 批量处理多个文件
 * @param files 文件列表
 * @returns Promise<FileProcessResult[]> 处理结果列表
 */
export async function processFiles(
  files: File[]
): Promise<FileProcessResult[]> {
  const results = await Promise.allSettled(
    files.map((file) => processFile(file))
  );

  return results.map((result) => {
    if (result.status === "fulfilled") {
      return result.value;
    } else {
      return {
        content: "",
        error: result.reason?.message || "处理失败",
        fileName: "unknown",
        fileType: "unknown",
        success: false,
      };
    }
  });
}

/**
 * 检查文件类型是否支持
 * @param file 文件对象
 * @returns boolean 是否支持
 */
export function isFileTypeSupported(file: File): boolean {
  const extension = getFileExtension(file);
  return Object.values(FileType).includes(extension as FileType);
}

/**
 * 获取支持的文件类型列表
 * @returns string[] 支持的文件扩展名列表
 */
export function getSupportedFileTypes(): string[] {
  return Object.values(FileType);
}
