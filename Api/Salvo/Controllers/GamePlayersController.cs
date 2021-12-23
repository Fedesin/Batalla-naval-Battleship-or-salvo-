using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Salvo.Models;
using Salvo.Models.DTO;
using Salvo.Repositories.Interface;
using System.Security.Claims;

namespace Salvo.Controllers
{

    [Route("gamePlayers")]
    [ApiController]
    [Authorize]
    public class GamePlayersController : ControllerBase
    {
        private readonly IGamePlayerRepository _repository;
        private readonly IGameRepository _gameRepository;

        public GamePlayersController(IGamePlayerRepository repository, IGameRepository gameRepository)
        {
            _repository = repository;
            _gameRepository = gameRepository;
        }

        [HttpGet("{id}", Name = "GetGameView")]
        public IActionResult GetGameView(long id)
        {
            try
            {
                string email = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Email).Value ?? "Guest";
                var gameplayer = _repository.GetGamePlayerView(id);

                if (gameplayer.Player.Email == email)
                {
                    var gameView = new GameViewDTO();
                    {
                        gameView.GameId = gameplayer.GameId;
                        gameView.Id = gameplayer.Id;
                        gameView.CreationDate = gameplayer.Game.CreationDate;
                        gameView.GamePlayers = new List<GamePlayerDTO>();
                        gameView.GameState = Enum.GetName(typeof(GameState), gameplayer.GetGameState());
                        //gameView.GameState = gameplayer.GetGameState();
                    }

                    foreach (var gp in gameplayer.Game.GamePlayers)
                    {
                        var gpDTO = new GamePlayerDTO
                        {
                            Id = gp.Id,
                            JoinDate = gp.JoinDate,
                            Player = new PlayerDTO { Id = gp.Player.Id, Email = gp.Player.Email, Name = gp.Player.Name, Avatar = gp.Player.Avatar }
                        };
                        gameView.GamePlayers.Add(gpDTO);
                    }

                    gameView.Ships = new List<ShipDTO>();
                    foreach (var ship in gameplayer.Ships)
                    {
                        var shipDTO = new ShipDTO
                        {
                            Id = ship.Id,
                            Type = ship.Type,
                            Locations = ship.Locations.Select(location => new ShipLocationDTO { Id = location.Id, Location = location.Location }).ToList()
                        };
                        gameView.Ships.Add(shipDTO);
                    };

                    gameView.Salvos = gameplayer.Game.GamePlayers.SelectMany(gps => gps.Salvos.Select(salvo => new SalvoDTO
                    {
                        Id = salvo.Id,
                        Turn = salvo.Turn,
                        Player = new PlayerDTO
                        {
                            Id = gps.Player.Id,
                            Email = gps.Player.Email,
                            Avatar = gps.Player.Avatar
                        },
                        Locations = salvo.Locations.Select(salvoLocation => new SalvoLocationDTO
                        {
                            Id = salvoLocation.Id,
                            Location = salvoLocation.Location
                        }).ToList()
                    })).ToList();

                    gameView.Hits = gameplayer.GetHits();

                    gameView.HitsOpponent = gameplayer.GetOpponent()?.GetHits();

                    gameView.Sunks = gameplayer.GetSunks();

                    gameView.SunksOpponent = gameplayer.GetOpponent()?.GetSunks();

                    gameView.AguasOpponent = gameplayer.GetOpponent()?.GetAguas();

                    gameView.GameState = Enum.GetName(typeof(GameState), gameplayer.GetGameState());

                    _repository.Save(gameplayer);

                    _gameRepository.UpdateGame(gameplayer.Game);

                    return Ok(gameView);
                }
                else
                {
                    return Forbid();
                }

            }
            catch (Exception ex)
            {

                return StatusCode(500, ex.Message);
            }
        }

        [HttpPost("{id}/ships")]
        public IActionResult Post(long id, [FromBody] List<ShipDTO> ships)
        {
            try
            {
                var gp = _repository.FindById(id);
                if (gp == null)
                {
                    return StatusCode(403, "No existe el juego");
                }
                else if (gp.Player.Email != User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Email).Value)
                {
                    return StatusCode(403, "El usuario no se encuentra en el juego");
                }
                else if (gp.Ships.Count == 5)
                {
                    return StatusCode(403, "Ya se han posicionado los barcos");
                }
                var shipList = new List<Ship>();
                foreach (var ship in ships)
                {
                    shipList.Add(
                        new Ship
                        {
                            Type = ship.Type,
                            Locations = ship.Locations.Select(ShipLocation =>
                            new ShipLocation
                            {
                                Location = ShipLocation.Location
                            }).ToList()
                        }
                        );
                }
                gp.Ships = shipList;
                _repository.Save(gp);
                return StatusCode(201, gp.Id);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpPost("{id}/salvos")]
        public IActionResult PostSalvo(long id, [FromBody] SalvoDTO salvosdto)
        {
            try
            {
                var gameplayer = _repository.FindById(id);
                if (gameplayer == null) return StatusCode(403, "No existe el juego");
                else if (gameplayer.Player.Email != User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Email).Value) return StatusCode(403, "El usuario no se encuentra en el juego.");
                else if (gameplayer.Game.GamePlayers.Count != 2) return StatusCode(403, "El juego no ha iniciado aun.");
                else if (gameplayer.Ships.Count == 0) return StatusCode(403, "El Usuario logueado no ha posicionado los barcos.");

                GameState? gameState = gameplayer.GetGameState();

                if (gameState == GameState.LOSS || gameState == GameState.WIN || gameState == GameState.TIE) return StatusCode(403, "El juego ha terminado");

                GamePlayer opponent = gameplayer.GetOpponent();

                if (opponent.Ships.Count == 0) return StatusCode(403, "El oponente no ha posicionado los barcos.");

                int playerTurn = gameplayer.Salvos != null ? gameplayer.Salvos.Count + 1 : 1;
                int opponentTurn = opponent.Salvos != null ? opponent.Salvos.Count : 0;

                if ((playerTurn - opponentTurn) < -1 || (playerTurn - opponentTurn) > 1) return StatusCode(403, "No se puede adelantar el turno.");
                gameplayer.Salvos.Add(new Models.Salvo
                {
                    GamePlayerId = gameplayer.Id,
                    Turn = playerTurn,
                    Locations = salvosdto.Locations.Select(location => new SalvoLocation { Location = location.Location }).ToList()
                });

                _repository.Save(gameplayer);


                return StatusCode(201, gameplayer.Id);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }
    }
}
