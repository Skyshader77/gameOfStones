import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document, Types } from 'mongoose';

export type RoomDocument = Room & Document;

@Schema()
export class Room {
    @ApiProperty()
    @Prop({ required: true })
    roomCode: string;

    @ApiProperty()
    @Prop({ required: true })
    isLocked: boolean;

    @ApiProperty()
    _id?: string | Types.ObjectId;
}

export const roomSchema = SchemaFactory.createForClass(Room);
