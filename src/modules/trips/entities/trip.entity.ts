export class Trip {
  id?: number;
  trainNumber: string;
  departureStationCode: number;
  arrivalStationCode: number;
  departureTime: Date;
  arrivalTime: Date;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(
    trainNumber: string,
    departureStationCode: number,
    arrivalStationCode: number,
    departureTime: Date,
    arrivalTime: Date,
    id?: number,
    createdAt?: Date,
    updatedAt?: Date,
  ) {
    this.trainNumber = trainNumber;
    this.departureStationCode = departureStationCode;
    this.arrivalStationCode = arrivalStationCode;
    this.departureTime = new Date(departureTime);
    this.arrivalTime = new Date(arrivalTime);
    this.id = id;
    this.createdAt = createdAt ? new Date(createdAt) : new Date();
    this.updatedAt = updatedAt ? new Date(updatedAt) : new Date();
  }
}
