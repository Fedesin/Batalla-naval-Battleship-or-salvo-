import { GamePlayer } from "./game-player";
import { GameState } from "./game-state";

export interface Game {
    id: number;
    creationDate: string | null;
    gamePlayers: GamePlayer[];
    state: GameState;
}