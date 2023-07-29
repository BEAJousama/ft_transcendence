import { User } from '@prisma/client';
import { Game, Player } from '../classes';
import { Inject, Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';

enum Achievements {
  PERFECT_GAME = 'PERFECT_GAME',
  COMEBACK_KING = 'COMEBACK_KING',
  SHARP_SHOOTER = 'SHARP_SHOOTER',
  IRON_PADDLE = 'IRON_PADDLE',
  MARATHON_MATCH = 'MARATHON_MATCH',
  SPEED_DEMON = 'SPEED_DEMON',
  TRICKSTER = 'TRICKSTER',
  FIRST_SERVE = 'FIRST_SERVE',
  PERFECT_AIM = 'PERFECT_AIM',
  COMEBACK_KID = 'COMEBACK_KID',
  UNSTOPPABLE_STREAK = 'UNSTOPPABLE_STREAK',
  PERFECT_DEFENSE = 'PERFECT_DEFENSE',
  MIND_READER = 'MIND_READER',
  CRAZY_COMEBACK = 'CRAZY_COMEBACK',
  LEGENDARY_RIVALRY = 'LEGENDARY_RIVALRY',
  PADDLE_WIZARD = 'PADDLE_WIZARD',
  PONG_CHAMPION = 'PONG_CHAMPION',
  LONG_RALLY = 'LONG_RALLY',
  QUICK_REFLEXES = 'QUICK_REFLEXES',
  POWER_SERVE = 'POWER_SERVE',
  DEFENSIVE_PRODIGY = 'DEFENSIVE_PRODIGY',
  NAIL_BITER = 'NAIL_BITER',
}

@Injectable()
class AchievementsWatcher {
  private achievedAchievements: Set<Achievements>;
  private toWatchAchievements: Set<Achievements>;
  public toAssignAchievements: Set<Achievements>;
  // private player: Player;

  constructor(player: Player, achievedAchievements: Set<Achievements>) {
    // this.player = player;
    this.achievedAchievements = new Set(achievedAchievements);
    this.toWatchAchievements = new Set<Achievements>(
      Object.values(Achievements),
    );
    console.log(this.toWatchAchievements);
    this.toAssignAchievements = new Set<Achievements>();
    for (const achievement of this.achievedAchievements) {
      this.toWatchAchievements.delete(achievement);
    }
    this.achieveAchievement(Achievements.FIRST_SERVE);
  }

  async checkAchievementsWhenGameIDone(
    // player: Player,
    playerA: Player,
    playerB: Player,
    user: User,
  ) {
    if (playerA.score === 7 && playerB.score === 0) {
      this.achieveAchievement(Achievements.PERFECT_GAME);
      this.achieveAchievement(Achievements.PERFECT_DEFENSE);
    }

    // win a game by margin of one point
    if (playerA.score === 7 && playerB.score === 6) {
      this.achieveAchievement(Achievements.NAIL_BITER);
    }

    const scoreDifference = playerB.score - playerA.score;

    if (scoreDifference >= 5 && playerA.score === 7) {
      this.achieveAchievement(Achievements.COMEBACK_KING);
    }

    // Check for CRAZY_COMEBACK achievement
    if (playerB.score == 6 && playerA.score === 7) {
      this.achieveAchievement(Achievements.CRAZY_COMEBACK);
    }

    const comebackThreshold = 5;
    if (
      playerA.score - playerB.score >= comebackThreshold ||
      playerB.score - playerA.score >= comebackThreshold
    ) {
      this.achieveAchievement(Achievements.COMEBACK_KING);
    }
    // Score 6 or more points in a row without missing a shot.
    const consecutivePointsThreshold = 7;
    if (playerA.consecutivePoints >= consecutivePointsThreshold) {
      this.achieveAchievement(Achievements.SHARP_SHOOTER);
    }

    // Win a game without moving your paddle from the center position.
    if (playerB.paddleWizard) {
      this.achieveAchievement(Achievements.PADDLE_WIZARD);
    }

    if (user.wins >= 100) {
      this.achieveAchievement(Achievements.PONG_CHAMPION);
    }
    // Win 10 or more games in a row against the computer or other players. needs update in the db to be able to track this
    if (user.wins >= 50) {
      this.achieveAchievement(Achievements.UNSTOPPABLE_STREAK);
    }

    // Block 50 or more shots in a single game.
    if (playerB.AllBlockedShots >= 50) {
      this.achieveAchievement(Achievements.IRON_PADDLE);
    }
  }

  checkAchievementsWhenHitPaddle(player: Player) {
    // Successfully block 10 consecutive shots from your opponent.
    if (player.consecutiveBlockedShots >= 10) {
      this.achieveAchievement(Achievements.DEFENSIVE_PRODIGY);
    }

    // Anticipate your opponent's shot and successfully block it five times in a row.
    if (player.consecutiveBlockedShots >= 5) {
      this.achieveAchievement(Achievements.MIND_READER);
    }
  }

  checkAchievementsWhenPlayerScores(player: Player, game: Game) {
    if (game.ball.speed >= 8) {
      this.achieveAchievement(Achievements.POWER_SERVE);
    }
    // Score a point within 10 seconds of the start of a game.
    if (game.getGameDuration() <= 10) {
      this.achieveAchievement(Achievements.SPEED_DEMON);
    }

    // play a game that lasts more than 5 minutes.
    if (game.getGameDuration() >= 300) {
      this.achieveAchievement(Achievements.MARATHON_MATCH);
    }

    // Score a point within three seconds of the ball being served.
    if (game.ball.getDuration() <= 3) {
      this.achieveAchievement(Achievements.QUICK_REFLEXES);
    }

    // Score a point by bouncing the ball off the wall or the paddle.
    if (player.score) {
      this.achieveAchievement(Achievements.TRICKSTER);
    }

    // Score five consecutive direct hits on your opponent's paddle
    if (player.score >= 5) {
      this.achieveAchievement(Achievements.PERFECT_AIM);
    }

    // // Successfully rally the ball 20 times without anyone scoring a point.
    if (game.consecutiveHits >= 20) {
      this.achieveAchievement(Achievements.LONG_RALLY);
    }
  }

  private achieveAchievement(achievement: Achievements) {
    if (!this.achievedAchievements.has(achievement)) {
      this.achievedAchievements.add(achievement);
      this.toAssignAchievements.add(achievement);
    }
    this.toWatchAchievements.delete(achievement);
  }
}

export { AchievementsWatcher };
