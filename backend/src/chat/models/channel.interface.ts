import { User, ChannelType, Visiblity } from "@prisma/client";
import { channelmembersI } from "./channelMembers.interface";
import { MessageI } from "./message.interface";

export interface ChannelI
{
    id: string;
    name : string;
    avatarUrl : string;
    visibility : Visiblity;
    password? : string;
    owner: User;
    type : ChannelType;
    channelMembers : channelmembersI[] ;
    createdAt: Date;
    messages: MessageI[];
}