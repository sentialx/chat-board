export interface JsonSerializable {
  toJson(): string;
}

export interface JsonDeserializable<T> {
  fromJson(json: string): T;
}
