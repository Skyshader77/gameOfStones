import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document } from 'mongoose';

import { Room as RoomInterface } from '@common/interfaces/room';

export type RoomDocument = Room & Document;

@Schema()
export class Room implements RoomInterface {
    @ApiProperty()
    @Prop({ required: true })
    roomCode: string;

    @ApiProperty()
    @Prop({ required: true })
    isLocked: boolean;

    @ApiProperty()
    _id?: string;
}

export const roomSchema = SchemaFactory.createForClass(Room);
