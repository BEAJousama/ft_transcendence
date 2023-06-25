import { Ball } from './ball';
import { Player } from './player';

class Game {
  public playerA: Player;
  public playerB: Player;
  public ball: Ball;

  constructor(playerA: Player, playerB: Player) {
    this.playerA = playerA;
    this.playerB = playerB;
    this.ball = new Ball(playerA.canvas);
  }
}

export { Game };
