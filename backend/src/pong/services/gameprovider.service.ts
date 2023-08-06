import { Canvas, Game, Player } from '../classes';

class GameProvider {
  public id: number;
  public game: Game;
  public gameStarted = false;
  public ballChangedDirection = false;
  public ballDirection = -1;
  public intervalId: NodeJS.Timeout;
  public paused = false;
  public powerups: string;
  public bet: string;
  public old_ball_speed: number;
  constructor(powerUps?: string, bet?: string) {
    this.powerups = powerUps;
    this.bet = bet;
    const id = setTimeout(() => {
      this.gameStarted = true;
      clearTimeout(id);
    }, 5000);
  }

  init(playerA: Player, playerB: Player) {
    this.game = new Game(playerA, playerB);
    playerB.x = playerB.canvas.width - playerB.width;
    return this.game;
  }

  paddleCol(player: Player) {
    const ball = this.game.ball;
    const paddleRight = player.x + player.width;
    const paddleLeft = player.x;
    const paddleTop = player.y;
    const paddleBottom = player.y + player.height;
    const col =
      ball.x - ball.radius < paddleRight &&
      ball.x + ball.radius > paddleLeft &&
      ball.y - ball.radius < paddleBottom &&
      ball.y + ball.radius > paddleTop;
    if (col) {
      player.AllBlockedShots++;
      player.consecutiveBlockedShots++;
    } else {
      player.consecutiveBlockedShots = 0;
    }

    return col;
  }

  update(info: { userId: number; playerCanvas: Canvas }) {
    if (!this.gameStarted) return;
    const { userId, playerCanvas } = info;
    const playerA = this.game.playerA;
    const playerB = this.game.playerB;
    const ball = this.game.ball;
    const { width, height } = playerCanvas;

    if (!this.game || !playerB) return;

    // this.game.acheivementsWatcher.checkAchievementsWhenPlayerScores(playerA);

    const player = userId === playerA.id ? playerA : playerB;

    if (playerA.keyState['ArrowUp'] && playerA.y > 5) {
      playerA.y -= 5;
    } else if (
      playerA.keyState['ArrowDown'] &&
      playerA.y < height - playerA.height - 5
    ) {
      playerA.y += 5;
    }

    if (playerB.keyState['ArrowUp'] && playerB.y > 5) {
      playerB.y -= 5;
    } else if (
      playerB.keyState['ArrowDown'] &&
      playerB.y < height - playerB.height - 5
    ) {
      playerB.y += 5;
    }

    if (playerA.keyState['ArrowUp']) {
    }

    ball.x += (ball.velocity.x * ball.speed) / 10;
    ball.y += (ball.velocity.y * ball.speed) / 10;

    // Check if ball hits top or bottom wall
    if (ball.y + ball.radius > height - 10 || ball.y - ball.radius < 10) {
      ball.velocity.y = -ball.velocity.y;
    }

    // Check if ball hits player A or B
    if (
      (this.paddleCol(this.game.playerA) ||
        this.paddleCol(this.game.playerB)) &&
      !this.ballChangedDirection
    ) {
      this.game.consecutiveHits++;
      playerA.acheivementsWatcher.checkAchievementsWhenHitPaddle(playerA);
      playerB.acheivementsWatcher.checkAchievementsWhenHitPaddle(playerB);
      this.ballChangedDirection = true;
      ball.velocity.x = 2 * -Math.sign(ball.velocity.x);
      ball.velocity.y = Math.random() * 4 - 2;
      ball.velocity.x +=
        Math.sign(ball.velocity.x) * (2 - Math.abs(ball.velocity.y));
      ball.speed++;
      if (!playerA.powerup && !playerB.powerup) {
        this.old_ball_speed = ball.speed;
      }
      const timeoutId = setTimeout(() => {
        this.ballChangedDirection = false;
        clearTimeout(timeoutId);
      }, 500);
    }

    // add powerups here
    if (playerA.keyState[' '] && !playerA.powerup) {
      playerA.powerup = true;
      const timeoutId = setTimeout(() => {
        playerA.powerup = false;
        console.log('deactivate powerup');
        clearTimeout(timeoutId);
      }, 5000);
    }

    if (playerB.keyState[' '] && !playerB.powerup) {
      playerB.powerup = true;
      const timeoutId = setTimeout(() => {
        playerB.powerup = false;
        clearTimeout(timeoutId);
      }, 5000);
    }

    if (
      playerA.powerup &&
      this.powerups === 'Power Shot' &&
      this.paddleCol(playerA)
    ) {
      ball.speed = 40;
    }

    if (
      playerA.powerup &&
      this.powerups === 'Power Shot' &&
      this.paddleCol(playerB)
    ) {
      ball.speed = this.old_ball_speed;
    }

    if (
      playerB.powerup &&
      this.powerups === 'Power Shot' &&
      this.paddleCol(playerB)
    ) {
      ball.speed = 40;
    }

    if (
      playerB.powerup &&
      this.powerups === 'Power Shot' &&
      this.paddleCol(playerA)
    ) {
      ball.speed = this.old_ball_speed;
    }

    console.log('powerup', this.powerups);
    if (playerA.powerup && this.powerups === 'ShrinkingPaddle') {
      playerA.height = 200;
    }

    if (!playerA.powerup && this.powerups === 'ShrinkingPaddle') {
      playerA.height = 96;
    }

    if (playerB.powerup && this.powerups === 'ShrinkingPaddle') {
      playerB.height = 200;
    }

    if (!playerB.powerup && this.powerups === 'ShrinkingPaddle') {
      playerB.height = 96;
    }

    // Check if ball goes out of bounds (player A scores)
    if (ball.x > width) {
      playerA.score++;
      // this.game.acheivementsWatcher.checkAchievementsWhenPlayerScores(playerA);
      playerA.acheivementsWatcher.checkAchievementsWhenPlayerScores(
        playerA,
        this.game,
      );
      ball.reset(playerA.canvas);
      ball.velocity.x = Math.abs(ball.velocity.x) * this.ballDirection;
      this.ballDirection = -this.ballDirection;
      this.game.consecutiveHits = 0;
    }

    // Check if ball goes out of bounds (player B scores)
    if (ball.x < 0) {
      playerB.score++;
      playerB.acheivementsWatcher.checkAchievementsWhenPlayerScores(
        playerB,
        this.game,
      );
      this.game.consecutiveHits = 0;
      ball.reset(playerB.canvas);
      ball.velocity.x = Math.abs(ball.velocity.x) * this.ballDirection;
      this.ballDirection = -this.ballDirection;
    }

    return this.game;
  }

  keyPressed(info: { key: string; userId: number }) {
    const player =
      info.userId === this.game.playerA.id
        ? this.game.playerA
        : this.game.playerB;
    player.keyState[info.key] = true;
    console.log(player.keyState);
    return this.game;
  }

  keyReleased(info: { key: string; userId: number }) {
    const player =
      info.userId === this.game.playerA.id
        ? this.game.playerA
        : this.game.playerB;
    player.keyState[info.key] = false;
    return this.game;
  }
}

export { GameProvider };
