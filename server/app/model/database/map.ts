import { GameMode } from '@app/interfaces/gamemode';
import { Item } from '@app/interfaces/item';
import { MapSize } from '@app/interfaces/mapSize';
import { TileTerrain } from '@app/interfaces/tileTerrain';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document, Types } from 'mongoose';

export type MapDocument = Map & Document;

@Schema()
export class Map {
    @ApiProperty()
    @Prop({ required: true })
    name: string;

    @ApiProperty()
    @Prop({ required: true, enum: MapSize })
    size: MapSize;

    @ApiProperty()
    @Prop({ required: true, default: false })
    isVisible: boolean;

    @ApiProperty()
    @Prop({ required: true, enum: GameMode })
    mode: GameMode;

    @ApiProperty()
    @Prop({
        type: [[String]],
        required: true,
        enum: TileTerrain,
    })
    mapArray: TileTerrain[][];

    @ApiProperty()
    @Prop({ required: true })
    placedItems: Item[];

    @ApiProperty()
    @Prop({ required: true, default: Date.now })
    dateOfLastModification: Date;

    @ApiProperty()
    @Prop({ required: true })
    description: string;

    @ApiProperty()
    @Prop({ required: true })
    imageData: string;

    @ApiProperty()
    _id?: string | Types.ObjectId;
}

export const mapSchema = SchemaFactory.createForClass(Map);
