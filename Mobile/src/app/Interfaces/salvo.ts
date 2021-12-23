import { Player } from "./player";
import { SalvoLocation } from "./salvo-location";

export interface Salvo {
    id: number;
    turn: number;
    player: Player | null;
    locations: SalvoLocation[];
}