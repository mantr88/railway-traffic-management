export class Station {
  id?: number;
  name: string;
  code: string;
  createdAt?: Date;

  constructor(name: string, code: string, id?: number, createdAt?: Date) {}
}
