export interface Ball {
  x: number;
  y: number;
  radius: number;
}

export interface Player {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  score: number;
}

export interface Game {
  playerA: Player;
  playerB: Player;
  ball: Ball;
}
