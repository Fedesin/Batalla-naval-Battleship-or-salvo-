import { ShipLocationDTO } from "./ship-location";

export interface Ship{
    id: number;
    type: string;
    locations: ShipLocationDTO[];
}