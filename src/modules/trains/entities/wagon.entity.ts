export class Wagon {
  id?: number;
  trainId: number;
  position: number;
  wagonNumber: string;
  createdAt?: Date;

  constructor(
    trainId: number,
    position: number,
    wagonNumber: string,
    id?: number,
    createdAt?: Date,
  ) {
    this.trainId = trainId;
    this.position = position;
    this.wagonNumber = wagonNumber;
    this.id = id;
    this.createdAt = createdAt ? new Date(createdAt) : new Date();
  }
}
