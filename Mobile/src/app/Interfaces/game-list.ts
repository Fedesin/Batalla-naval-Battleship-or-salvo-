import { Game } from "./game";

export interface GameList {

    email: string;
    games: Game[];
    name: string;
}

export interface GameListResponse {
    totalCount: number;
    itemPerPage: number;
    totalPage: number;
    page: number;
    email: string;
    games: Game[];
}