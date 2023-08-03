import IAchievement from "./achievement";

export interface IFriend {
  id: number;
  senderId: number;
  receiverId: number;
  status: string;
}
export interface IBlock {
  blockingId: number;
  blockerId: number;
}
interface IUser {
  id: number;
  login: string;
  username: string;
  email: string;
  fullname: string;
  country: string;
  phone: string;
  avatar: string;
  twoFactorAuth: boolean;
  tfaSecret: string;
  status: string;
  ladder: string;
  rating: number;
  createdAt: Date;
  updatedAt: Date;
  wins: number;
  losses: number;
  totalGames: number;
  winStreak: number;
  blocking: IBlock[];
  blockers: IBlock[];
  achievements: IAchievement[];
  receivedRequests: any[];
}

export default IUser;
