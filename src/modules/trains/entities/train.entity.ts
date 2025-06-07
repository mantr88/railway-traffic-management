export class Train {
  id?: number;
  trainNumber: string;
  wagons: string[];
  createdAt?: Date;
  updatedAt?: Date;

  constructor(
    trainNumber: string,
    wagons: string[] = [],
    id?: number,
    createdAt?: Date,
    updatedAt?: Date,
  ) {
    this.trainNumber = trainNumber;
    this.wagons = wagons;
    this.id = id;
    this.createdAt = createdAt ? new Date(createdAt) : new Date();
    this.updatedAt = updatedAt ? new Date(updatedAt) : new Date();
  }
}
