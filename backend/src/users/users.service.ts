import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  AddFriendsDto,
  BlockUserDto,
  UnblockUserDto,
  UpdateUserDto,
} from './dto';

const Achievements = {
  PERFECT_GAME:
    'Achieve a score of 11-0 in a single game against the computer or another player.',
  COMEBACK_KING: 'Win a game after being down by 5 or more points.',
  SHARP_SHOOTER: 'Score 10 or more points in a row without missing a shot.',
  IRON_PADDLE: 'Block 50 or more shots in a single game.',
  MARATHON_MATCH: 'Play a game that lasts more than 10 minutes.',
  MASTER_OF_SPIN: 'Score a point with a spin shot that confuses the opponent.',
  SPEED_DEMON: 'Score a point within 10 seconds of the start of a game.',
  TRICKSTER: 'Score a point by bouncing the ball off the wall or the paddle.',
  STREAKER:
    'Win 10 or more games in a row against the computer or other players.',
  First_Serve: 'Serve your first ball in a game.',
  Paddle_Master: 'Score 10 points using only your paddle.',
  Speed_Demon: 'Reach a ball speed of 100 mph.',
  Perfect_Aim: "Score five consecutive direct hits on your opponent's paddle.",
  Flawless_Victory: 'Win a game without your opponent scoring a single point.',
  Comeback_Kid: 'Win a game after being down by five points.',
  Sharp_Shooter:
    'Score a point with a precise shot that grazes the edge of the paddle.',
  Untouchable: 'Play for one minute without your opponent touching the ball.',
  Long_Rally:
    'Successfully rally the ball 20 times without anyone scoring a point.',
  Quick_Reflexes:
    'Score a point within three seconds of the ball being served.',
  Defensive_Prodigy:
    'Successfully block 10 consecutive shots from your opponent.',
  Master_of_Spin:
    "Apply spin to the ball and make it curve around your opponent's paddle.",
  Unstoppable_Streak: 'Win five games in a row without losing a single one.',
  Perfect_Defense:
    'Win a game without allowing your opponent to score a single point.',
  Precision_Shot:
    'Score a point by hitting the ball directly into one of the corners.',
  Doubles_Champion:
    'Win a doubles match with a teammate against two opponents.',
  Nail_Biter: 'Win a game by a margin of only one point.',
  Paddle_Acrobat:
    'Perform a successful trick shot by hitting the ball behind your back.',
  Mind_Reader:
    "Anticipate your opponent's shot and successfully block it five times in a row.",
  Crazy_Comeback: 'Win a game after being down by eight points.',
  Power_Serve:
    'Serve the ball with such force that your opponent cannot return it.',
  Pinpoint_Accuracy:
    "Score three consecutive points by hitting the ball to the exact same spot on your opponent's side.",
  Legendary_Rivalry: 'Play against a specific opponent 100 times.',
  Paddle_Wizard:
    'Win a game without moving your paddle from the center position.',
  Pong_Champion: 'Win 100 games in total.',
};

const Achievements_with_img = [
  'PERFECT_GAME',
  'COMEBACK_KING',
  'SHARP_SHOOTER',
  'IRON_PADDLE',
  'MARATHON_MATCH',
  'MASTER_OF_SPIN',
  'SPEED_DEMON',
  'TRICKSTER',
  'STREAKER',
];

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async createAchievements() {
    try {
      const keys = Object.keys(Achievements);
      const values = Object.values(Achievements);

      keys.map((_, i) => {
        this.prisma.achievement.create({
          data: {
            name: keys[i],
            description: values[i],
            image: Achievements_with_img.includes(keys[i]) ? '' : 'default.png',
          },
        });
      });
    } catch (error) {
      return error;
    }
  }

  async getAllAchievements() {
    try {
      return await this.prisma.achievement.findMany();
    } catch (error) {}
  }

  async createUser(data: {
    login: string;
    avatar: string;
    tfaSecret: string;
    fullname: string;
    phone: string;
    email: string;
  }) {
    try {
      const user = await this.prisma.user.create({
        data: {
          login: data.login,
          avatar: data.avatar,
          username: data.login,
          tfaSecret: data.tfaSecret,
          fullname: data.fullname,
          phone: data.phone,
          email: data.email,
          country: 'none',
        },
      });

      return user;
    } catch (error) {
      return error;
    }
  }

  async findUserById(id: number) {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          id,
        },
        include: {
          sentRequests: true,
          receivedRequests: true,
        },
      });
      return user;
    } catch (error) {
      throw new NotFoundException(`user with ${id} does not exist.`);
    }
  }

  async findUserByLogin(login: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          login,
        },
      });
      return user;
    } catch (error) {
      throw new NotFoundException(`user with ${login} does not exist.`);
    }
  }

  async findAllUsers() {
    try {
      const users = await this.prisma.user.findMany();
      return users;
    } catch (error) {
      throw new NotFoundException(`no users found ? `);
    }
  }

  async updateUser(body: UpdateUserDto, id: number) {
    try {
      const user = await this.prisma.user.update({
        where: {
          id,
        },
        data: <User>body.user,
      });
      return {
        message: 'User updated successfully',
      };
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2016') {
          throw new NotFoundException(`User with ID ${body.user.id} not found`);
        } else if (error.code === 'P2025') {
          throw new BadRequestException('Invalid update data');
        }
      }
      throw error;
    }
  }

  async deleteUser(id: number) {
    try {
      const user = await this.prisma.user.delete({
        where: {
          id,
        },
      });
      return user;
    } catch (error) {
      throw new InternalServerErrorException('Failed to delete user');
    }
  }

  async sendFriendRequest(body: AddFriendsDto) {
    try {
      const { senderId, receiverId } = body;
      const request = await this.prisma.friend.create({
        data: {
          senderId,
          receiverId,
        },
      });
      return request;
    } catch (error) {
      throw new InternalServerErrorException('Failed to send friend request');
    }
  }

  async acceptFriendRequest(senderId: number) {
    try {
      const request = await this.prisma.friend.update({
        where: {
          id: senderId,
        },
        data: {
          status: 'ACCEPTED',
        },
      });
      return request;
    } catch (error) {
      throw new InternalServerErrorException('Failed to accept friend request');
    }
  }

  async declineFriendRequest(senderId: number) {
    try {
      const request = await this.prisma.friend.delete({
        where: {
          id: senderId,
        },
      });
      return request;
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to decline friend request',
      );
    }
  }

  async cancelFriendRequest(senderId: number) {
    try {
      const request = await this.prisma.friend.delete({
        where: {
          id: senderId,
        },
      });
      return request;
    } catch (error) {
      throw new InternalServerErrorException('Failed to cancel friend request');
    }
  }

  async getFriendRequests(id: number) {
    try {
      const requests = await this.prisma.friend.findMany({
        where: {
          receiverId: id,
          status: 'PENDING',
        },
        include: {
          sender: true,
        },
      });
      return requests;
    } catch (error) {
      throw new InternalServerErrorException('Failed to get friend requests');
    }
  }

  async getFriends(id: number) {
    try {
      const friends = await this.prisma.friend.findMany({
        where: {
          OR: [
            {
              senderId: id,
              status: 'ACCEPTED',
            },
            {
              receiverId: id,
              status: 'ACCEPTED',
            },
          ],
        },
        include: {
          sender: true,
          receiver: true,
        },
      });
      return friends;
    } catch (error) {
      throw new InternalServerErrorException('Failed to get friends');
    }
  }

  async blockUser(body: BlockUserDto) {
    try {
      const { blockerId, blockingId } = body;
      const block = await this.prisma.block.create({
        data: {
          blockerId,
          blockingId,
        },
      });
      return block;
    } catch (error) {
      throw new InternalServerErrorException('Failed to block user');
    }
  }

  async unblockUser(body: UnblockUserDto) {
    try {
      const { blockerId, blockingId } = body;
      const block = await this.prisma.block.delete({
        where: {
          blockerId_blockingId: {
            blockerId,
            blockingId,
          },
        },
      });
      return block;
    } catch (error) {
      throw new InternalServerErrorException('Failed to unblock user');
    }
  }

  async getBlockedUsers(id: number) {
    try {
      const blockedUsers = await this.prisma.block.findMany({
        where: {
          blockerId: id,
        },
        include: {
          blocking: true,
        },
      });
      return blockedUsers;
    } catch (error) {
      throw new InternalServerErrorException('Failed to get blocked users');
    }
  }

  async getBlockingUsers(id: number) {
    try {
      const blockingUsers = await this.prisma.block.findMany({
        where: {
          blockingId: id,
        },
        include: {
          blocker: true,
        },
      });
      return blockingUsers;
    } catch (error) {
      throw new InternalServerErrorException('Failed to get blocking users');
    }
  }
}
