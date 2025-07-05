import AsyncStorage from '@react-native-async-storage/async-storage';
import uuid from 'react-native-uuid';

const parseJson = async <T = unknown>(
  value: string | null,
): Promise<T | null> => {
  if (!value) {
    return null;
  }
  try {
    return JSON.parse(value) as T;
  } catch (error) {
    console.error('Error parsing JSON:', error);
    return null;
  }
};

interface IBaseModel {
  _id?: string;
}

export abstract class BaseRepository<T extends IBaseModel> {
  protected storageKey: string;
  protected model: new (...args: any[]) => T;

  constructor(model: new (...args: any[]) => T, storageKey: string) {
    this.model = model;
    this.storageKey = storageKey;
  }

  public async findOne(): Promise<T | null> {
    const data = await AsyncStorage.getItem(this.storageKey);
    let parsedData = await parseJson<T[]>(data);
    if (!parsedData || parsedData.length === 0) {
      return null;
    }
    return new this.model(parsedData[0] as Record<string, unknown>);
  }

  public async list(): Promise<T[]> {
    const data = await AsyncStorage.getItem(this.storageKey);
    let parsedData = await parseJson<T[]>(data);
    if (!parsedData || parsedData.length === 0) {
      return [];
    }
    return parsedData.map(
      item => new this.model(item as Record<string, unknown>),
    );
  }

  public async create(item: T): Promise<T> {
    if (item._id) {
      throw new Error('Item should not have an _id when creating a new item');
    }
    const data = await AsyncStorage.getItem(this.storageKey);
    let parsedData: T[] = (await parseJson(data)) || [];
    const newItem = new this.model(item as Record<string, unknown>);
    newItem._id = uuid.v4();
    parsedData = [...parsedData, newItem];
    console.log(
      `Creating new item in ${this.storageKey}: ${JSON.stringify(newItem)}`,
    );
    await AsyncStorage.setItem(this.storageKey, JSON.stringify(parsedData));
    return newItem;
  }

  public async deleteAll(): Promise<void> {
    await AsyncStorage.removeItem(this.storageKey);
    console.log(`All ${this.storageKey} cleared`);
  }

  public async deleteById(id: string): Promise<void> {
    const data = await AsyncStorage.getItem(this.storageKey);
    let parsedData = await parseJson<T[]>(data);
    if (!parsedData) {
      throw new Error(`Item with id ${id} not found`);
    }
    parsedData = parsedData.filter(item => item._id !== id);
    if (parsedData.length === 0) {
      await AsyncStorage.removeItem(this.storageKey);
      return;
    }
    await AsyncStorage.setItem(this.storageKey, JSON.stringify(parsedData));
  }

  public async findById(id: string): Promise<T | null> {
    const data = await AsyncStorage.getItem(this.storageKey);
    let parsedData = await parseJson<T[]>(data);
    if (!parsedData) {
      return null;
    }
    const item = parsedData.find(x => x._id === id);
    if (!item) {
      return null;
    }
    return new this.model(item as Record<string, unknown>);
  }

  public async update(item: T): Promise<T> {
    if (!item._id) {
      throw new Error('Item must have an _id to update');
    }
    const data = await AsyncStorage.getItem(this.storageKey);
    let parsedData = (await parseJson<T[]>(data)) || [];
    const index = parsedData.findIndex(x => x._id === item._id);
    if (index === -1) {
      throw new Error(`Item with id ${item._id} not found`);
    }
    parsedData = parsedData.map(x =>
      x._id === item._id ? { ...x, ...item } : x,
    );
    await AsyncStorage.setItem(this.storageKey, JSON.stringify(parsedData));
    return new this.model(item as Record<string, unknown>);
  }
}
