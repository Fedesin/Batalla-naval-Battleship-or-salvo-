import { GameState } from "./game-state";
import { Player } from "./player";

export interface GamePlayer {
    id: number;
    joinDate: string;
    playerId: number;
    player: Player;
    point: number | null;
    state: GameState | null;
}