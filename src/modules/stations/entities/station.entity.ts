export class Station {
  id?: number;
  name: string;
  code: string;
  createdAt?: Date;

  constructor(name: string, code: string, id?: number, createdAt?: Date) {
    this.name = name;
    this.code = code;
    this.id = id;
    this.createdAt = createdAt ? new Date(createdAt) : new Date();
  }
}
