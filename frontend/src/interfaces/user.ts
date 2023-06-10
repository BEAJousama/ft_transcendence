import IAchievement from "./achievement";

export interface IFriend {
  id: number;
  senderId: number;
  receiverId: number;
  status: string;
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
  achievements: IAchievement[];
  receivedRequests: any[];
}

export default IUser;
