import { MemberStatus, Role, User } from "@prisma/client";
import { ChannelI } from "./channel.interface";

export interface channelmembersI
{
    user : User;
    channel: ChannelI;
    role : Role;
    status: MemberStatus;
    banStartTime?: Date;
    banDuration?: Date;
}
