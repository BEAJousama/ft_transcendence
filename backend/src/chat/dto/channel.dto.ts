import { ChannelType, User, Visiblity } from "@prisma/client";
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, Length, MaxLength, isNotEmpty, isString } from "class-validator";
import { channelmembersI } from "../models/channelMembers.interface";
import { MessageI } from "../models/message.interface";

export class ChannelDto
{
    @IsNumber()
    @IsNotEmpty()
    id? : number;
    @IsString()
    @IsNotEmpty()
    name : string;
    @IsString()
    @IsNotEmpty()
    avatar : string;
    @IsString()
    @IsNotEmpty()
    visibility : string;
    @IsString()
    password? : string;
    @IsString()
    access_pass? : string;
    @IsArray()
    @IsNumber({}, {each: true})
    members? : number[] ;
    @IsString()
    // @IsNotEmpty()
    type? : string; 
}