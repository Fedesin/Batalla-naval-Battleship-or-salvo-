using Salvo.Models.DTO;

namespace Salvo.Models
{
    public class GamePlayer
    {
        public long Id { get; set; }
        public DateTime JoinDate { get; set; }
        public long GameId { get; set; }
        public Game Game { get; set; }
        public long PlayerId { get; set; }
        public Player Player { get; set; }
        public ICollection<Ship> Ships { get; set; }
        public ICollection<Salvo> Salvos { get; set; }
        public GameState? State { get; set; }


        /*
            public Score GetScore()
            {
                return Player.GetScore(Game);
            }
        */

        public GamePlayer GetOpponent()
        {
            return Game.GamePlayers.FirstOrDefault(gp => gp.Id != Id);
        }

        public ICollection<SalvoHitDTO> GetHits()
        {
            return Salvos.Select(salvo => new SalvoHitDTO
            {
                Turn = salvo.Turn,
                Hits = GetOpponent()?.Ships.Select(ship => new ShipHitDTO
                {
                    Type = ship.Type,
                    Hits = salvo.Locations
                    .Where(salvoLocation => ship.Locations.Any(shipLocation => shipLocation.Location == salvoLocation.Location))
                    .Select(salvoLocation => salvoLocation.Location).ToList()
                }).ToList()
            }).ToList();
        }

        public ICollection<string> GetSunks()
        {
            int lastTurn = Salvos.Count;
            List<string> salvoLocations = GetOpponent()?.Salvos
                .Where(salvo => salvo.Turn <= lastTurn)
                .SelectMany(salvo => salvo.Locations.Select(location => location.Location))
                .ToList();

            return Ships?.Where(ship => ship.Locations.Select(shipLocation => shipLocation.Location)
            .All(salvoLocation => salvoLocations != null ? salvoLocations.Any(shipLocation => shipLocation == salvoLocation) : false))
                .Select(ship => ship.Type)
                .ToList();
        }



        public GameState? GetGameState()
        {
            if (this.Game.State != GameState.FINISH)
            {
                this.State = GameState.ENTER_SALVO;
                this.Game.State = GameState.WAIT;
                if (Ships == null || Ships?.Count == 0)
                {
                    State = GameState.PLACE_SHIPS;
                }
                else if (GetOpponent() == null)
                {
                    State = GameState.WAIT_PLAYER;
                }
                else
                {
                    GamePlayer opponent = GetOpponent();
                    this.Game.State = GameState.PLAYING;

                    if (opponent.Ships.Count == null || opponent.Ships.Count == 0)
                    {
                        State = GameState.WAIT_PLAYER_SHIPS;
                    }
                    else
                    {

                        int turn = Salvos != null ? Salvos.Count : 0;
                        int opponentTurn = opponent.Salvos != null ? opponent.Salvos.Count : 0;

                        if (turn > opponentTurn)
                        {
                            State = GameState.WAIT;
                        }
                        else if (turn == opponentTurn && turn != 0)
                        {
                            int playerSunks = GetSunks().Count;
                            int opponenSunks = opponent.GetSunks().Count;

                            if (playerSunks == Ships.Count && opponenSunks == opponent.Ships.Count)
                            {
                                State = GameState.TIE;
                                this.Game.State = GameState.FINISH;
                                Player.Jugadas++;
                                Player.Empatadas++;
                                Player.Points += 0.5;
                                //actualizar al opponent
                                opponent.Player.Jugadas++;
                                opponent.Player.Empatadas++;
                                opponent.State = GameState.TIE;
                                opponent.Player.Points += 0.5;


                            }
                            else if (playerSunks == Ships.Count)
                            {
                                State = GameState.LOSS;
                                this.Game.State = GameState.FINISH;
                                Player.Jugadas++;
                                //actualizar al opponent
                                opponent.Player.Jugadas++;
                                opponent.Player.Ganadas++;
                                opponent.State = GameState.WIN;
                                opponent.Player.Points += 1;
                            }
                            else if (opponenSunks == opponent.Ships.Count)
                            {
                                State = GameState.WIN;
                                this.Game.State = GameState.FINISH;
                                Player.Jugadas++;
                                Player.Ganadas++;
                                Player.Points += 1;
                                //actualizar al opponent
                                opponent.State = GameState.LOSS;
                                opponent.Player.Jugadas++;
                            }
                        }
                    }
                }
            }

            return State;
        }


        /*
        public GameState GetGameState()
        {
            GameState gameState = GameState.ENTER_SALVO;

            if (Ships == null || Ships?.Count == 0)
            {
                gameState = GameState.PLACE_SHIPS;
            }
            else if (GetOpponent() == null)
            {
                gameState = GameState.WAIT_PLAYER;
                /*if (Salvos != null && Salvos?.Count > 0)
                gameState = GameState.WAIT;
            }
            else
            {
                GamePlayer opponent = GetOpponent();
                int turn = Salvos != null ? Salvos.Count : 0;
                int opponentTurn = opponent.Salvos != null ? opponent.Salvos.Count : 0;

                if (turn > opponentTurn)
                    gameState = GameState.WAIT;
                else if (turn == opponentTurn && turn != 0)
                {
                    int playerSunks = GetSunks().Count;
                    int opponenSunks = opponent.GetSunks().Count;

                    if (playerSunks == Ships.Count && opponenSunks == opponent.Ships.Count) gameState = GameState.TIE;
                    else if (playerSunks == Ships.Count) gameState = GameState.LOSS;
                    else if (opponenSunks == opponent.Ships.Count) gameState = GameState.WIN;
                }
            }

            return gameState;
        }
        */
        public ICollection<string> GetAguas()
        {
            var salvosOponnent = Salvos;

            var todosLosShips = GetOpponent()?.Ships.SelectMany(ShipLocation => ShipLocation.Locations).Select(location => location.Location).ToList();

            var fallos = new List<string>();

            foreach (var salvos in salvosOponnent)
            {
                var locations = salvos.Locations;
                foreach (var location in locations)
                {
                    var esta = todosLosShips?.FirstOrDefault(p => p == location.Location);
                    if (esta is null)
                    {
                        if (!fallos.Exists(p => p == location.Location))
                        {
                            fallos.Add(location.Location);
                        }

                    }
                }
            }

            return fallos;
        }
    }
}
