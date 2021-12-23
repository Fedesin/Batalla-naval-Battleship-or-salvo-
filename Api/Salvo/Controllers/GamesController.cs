using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Salvo.Models;
using Salvo.Models.DTO;
using Salvo.Models.Response;
using Salvo.Repositories.Interface;
using System.Security.Claims;

namespace Salvo.Controllers
{
    [Route("games")]
    [ApiController]
    [AllowAnonymous]
    public class GamesController : ControllerBase
    {
        private readonly IGameRepository _repository;
        private readonly IPlayerRepository _playerRepository;
        private readonly IGamePlayerRepository _gamePlayerRepository;
        public GamesController(IGameRepository repository,
            IPlayerRepository playerRepository,
            IGamePlayerRepository gamePlayerRepository)
        {
            _repository = repository;
            _playerRepository = playerRepository;
            _gamePlayerRepository = gamePlayerRepository;
        }


        [HttpGet]
        public IActionResult GetGames(int page = 1)
        {
            try
            {
                var email = User.Claims.Where(x => x.Type == ClaimTypes.Email).FirstOrDefault()?.Value != null ? User.Claims.Where(x => x.Type == ClaimTypes.Email).FirstOrDefault()?.Value : "Guest";
                var info = _repository.GetAllGamesWithPlayers(page, email);
                var gameList = new GameViewResponse
                {
                    TotalCount = info.totalCount,
                    ItemPerPage = info.itemPerPage,
                    TotalPage = info.totalPages,
                    Page = page,
                    Email = email,
                    Games = info.games
                     .Select(game => new GameDTO
                     {
                         Id = game.Id,
                         State = game.State,
                         CreationDate = game.CreationDate,
                         GamePlayers = game.GamePlayers.Select(gameplayer =>
                              new GamePlayerDTO
                              {
                                  Id = gameplayer.Id,
                                  JoinDate = gameplayer.JoinDate,
                                  Player = new PlayerDTO
                                  {
                                      Id = gameplayer.PlayerId,
                                      Email = gameplayer.Player.Email,
                                      Name = gameplayer.Player.Name,
                                      Avatar = gameplayer.Player.Avatar
                                  }

                              }).ToList()
                     }).ToList()
                };

                return Ok(gameList);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpGet("mygames")]
        [Authorize]
        public IActionResult GetMyGames(int page = 1)
        {
            try
            {
                var email = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Email).Value ?? "Guest";
                var info = _repository.GetMyGames(page, email);
                var gameList = new GameViewResponse
                {
                    TotalCount = info.totalCount,
                    ItemPerPage = info.itemPerPage,
                    TotalPage = info.totalPages,
                    Page = page,
                    Email = email,
                    Games = info.games
                     .Select(game => new GameDTO
                     {
                         Id = game.Id,
                         State = game.State,
                         CreationDate = game.CreationDate,
                         GamePlayers = game.GamePlayers.Select(gameplayer =>
                              new GamePlayerDTO
                              {
                                  Id = gameplayer.Id,
                                  JoinDate = gameplayer.JoinDate,
                                  State = gameplayer.State,
                                  Player = new PlayerDTO
                                  {
                                      Id = gameplayer.PlayerId,
                                      Email = gameplayer.Player.Email,
                                      Name = gameplayer.Player.Name,
                                      Avatar = gameplayer.Player.Avatar
                                  }
                              }).ToList()
                     }).ToList()
                };

                return Ok(gameList);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpGet("scores")]
        public IActionResult GetScores()
        {
            try
            {
                return StatusCode(200, _playerRepository.TopFive());
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpPost]
        [Authorize]
        public IActionResult Post()
        {
            try
            {
                string email = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Email).Value ?? "Guest";
                Player player = _playerRepository.FindByEmail(email);
                DateTime fechaActual = DateTime.Now;

                var gamePlayer = new GamePlayer
                {
                    Game = new Game
                    {
                        CreationDate = fechaActual
                    },
                    PlayerId = player.Id,
                    JoinDate = fechaActual
                };
                _gamePlayerRepository.Save(gamePlayer);
                return StatusCode(201, gamePlayer.Id);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpPost("{id}/players", Name = "Join")]
        [Authorize]
        public IActionResult Join(long id)
        {
            try
            {
                string email = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Email).Value ?? "Guest";
                Player player = _playerRepository.FindByEmail(email);
                Game game = _repository.FindById(id);
                if (game == null)
                    return StatusCode(403, "No existe el juego.");
                if (game.GamePlayers.Where(gp => gp.Player.Id == player.Id).FirstOrDefault() != null)
                    return StatusCode(403, "Ya se encuentra el jugador en el juego.");
                if (game.GamePlayers.Count > 1)
                    return StatusCode(403, "El juego esta lleno.");

                var gamePlayer = new GamePlayer
                {
                    GameId = game.Id,
                    PlayerId = player.Id,
                    JoinDate = DateTime.Now
                };

                _gamePlayerRepository.Save(gamePlayer);

                return StatusCode(201, gamePlayer.Id);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }


    }
}
