import { Ball } from './ball';
import { Player } from './player';

class Game {
  public playerA: Player;
  public playerB: Player;
  public ball: Ball;
  public startedAt: number;
  public consecutiveHits: number;

  constructor(playerA: Player, playerB: Player) {
    this.playerA = playerA;
    this.playerB = playerB;
    this.startedAt = new Date().getTime();
    this.consecutiveHits = 0;
    this.ball = new Ball(playerA.canvas);
  }

  getGameDuration() {
    const currentTime = new Date().getTime();
    const durationInSeconds = Math.floor((currentTime - this.startedAt) / 1000);
    return durationInSeconds;
  }
}

export { Game };
