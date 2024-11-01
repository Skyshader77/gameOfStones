import { GameMode } from '@common/enums/game-mode.enum';
import { Item } from '@app/interfaces/item';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document } from 'mongoose';
import { TileTerrain } from '@common/enums/tile-terrain.enum';
import { MapSize } from '@common/enums/map-size.enum';
import { Map as MapInterface } from '@common/interfaces/map';

export type MapDocument = Map & Document;

@Schema()
export class Map implements MapInterface {
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
        type: [[Number]],
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
    _id: string;
}

export const mapSchema = SchemaFactory.createForClass(Map);
