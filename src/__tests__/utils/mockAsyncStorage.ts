/**
 * Mock AsyncStorage for testing
 * Provides in-memory storage that mimics AsyncStorage behavior
 */

type StorageData = { [key: string]: string };

export class MockAsyncStorage {
  private storage: StorageData = {};

  setItem = jest.fn((key: string, value: string): Promise<void> => {
    this.storage[key] = value;
    return Promise.resolve();
  });

  getItem = jest.fn((key: string): Promise<string | null> => {
    return Promise.resolve(this.storage[key] || null);
  });

  removeItem = jest.fn((key: string): Promise<void> => {
    delete this.storage[key];
    return Promise.resolve();
  });

  clear = jest.fn((): Promise<void> => {
    this.storage = {};
    return Promise.resolve();
  });

  getAllKeys = jest.fn((): Promise<string[]> => {
    return Promise.resolve(Object.keys(this.storage));
  });

  multiGet = jest.fn((keys: string[]): Promise<[string, string | null][]> => {
    const result = keys.map(key => [key, this.storage[key] || null] as [string, string | null]);
    return Promise.resolve(result);
  });

  multiSet = jest.fn((keyValuePairs: [string, string][]): Promise<void> => {
    keyValuePairs.forEach(([key, value]) => {
      this.storage[key] = value;
    });
    return Promise.resolve();
  });

  multiRemove = jest.fn((keys: string[]): Promise<void> => {
    keys.forEach(key => {
      delete this.storage[key];
    });
    return Promise.resolve();
  });

  // Helper methods for testing
  __getStorage() {
    return { ...this.storage };
  }

  __setStorage(data: StorageData) {
    this.storage = { ...data };
  }

  __reset() {
    this.storage = {};
    jest.clearAllMocks();
  }
}

export const mockAsyncStorage = new MockAsyncStorage();
