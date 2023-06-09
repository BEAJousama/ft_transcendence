import IAchievement from "./achievement";

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
}

export default IUser;
