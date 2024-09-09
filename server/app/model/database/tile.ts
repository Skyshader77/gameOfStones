import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document } from 'mongoose';

export type TileDocument = Tile & Document;

@Schema()
export class Tile {
    @ApiProperty()
    @Prop({ required: true })
    tileType: string;

    @ApiProperty()
    @Prop({ required: true })
    isStartingSpot: boolean;

    @ApiProperty()
    @Prop({ required: true })
    itemType: string;
}

export const tileSchema = SchemaFactory.createForClass(Tile);