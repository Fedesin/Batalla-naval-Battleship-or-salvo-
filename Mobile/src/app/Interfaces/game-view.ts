import { GamePlayer } from "./game-player";
import { Salvo } from "./salvo";
import { SalvoHit } from "./salvo-hit";
import { Ship } from "./ship";

export interface GameView {
    id: number;
    gameId: number;
    creationDate: string | null;
    gamePlayers: GamePlayer[];
    ships: Ship[];
    salvos: Salvo[];
    hits: SalvoHit[];
    hitsOpponent: SalvoHit[];
    sunks: string[];
    sunksOpponent: string[];
    aguasOpponent: string[];
    gameState: string | null;
}