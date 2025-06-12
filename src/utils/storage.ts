type StorageType = "localStorage" | "sessionStorage";

class StorageUtils {
  private storage: Storage;

  constructor(type: StorageType = "localStorage") {
    this.storage = window[type];
  }

  /**
   * 存储数据 (自动序列化)
   * @param key 键名
   * @param value 值
   */
  setItem<T>(key: string, value: T): void {
    const serializedValue = JSON.stringify(value);
    this.storage.setItem(key, serializedValue);
  }

  /**
   * 获取数据 (自动反序列化)
   * @param key 键名
   * @returns 解析后的值或 null
   */
  getItem<T>(key: string): T | null {
    const serializedValue = this.storage.getItem(key);
    return serializedValue ? JSON.parse(serializedValue) : null;
  }

  /**
   * 删除指定键
   * @param key 键名
   */
  removeItem(key: string): void {
    this.storage.removeItem(key);
  }

  /**
   * 清空所有存储
   */
  clear(): void {
    this.storage.clear();
  }
}

const localStorageUtils = new StorageUtils("localStorage");
const sessionStorageUtils = new StorageUtils("sessionStorage");

export { localStorageUtils, sessionStorageUtils };
