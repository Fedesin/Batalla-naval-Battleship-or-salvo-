import { ShipHit } from "./ship-hit";

export interface SalvoHit {
    turn: number;
    hits: ShipHit[];
}