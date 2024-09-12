import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document } from 'mongoose';
import { Tile } from './tile';

export type MapDocument = Map & Document;

@Schema()
export class Map {
    @ApiProperty()
    @Prop({ required: true })
    mapID: string;

    @ApiProperty()
    @Prop({ required: true })
    name: string;

    @ApiProperty()
    @Prop({ required: true })
    sizeRow: number;

    @ApiProperty()
    @Prop({ required: true })
    isVisible: boolean;

    @ApiProperty()
    @Prop({ required: true })
    mode: string;

    @ApiProperty()
    @Prop({ required: true })
    mapArray: Tile[];

    @ApiProperty()
    @Prop({ required: true })
    dateOfLastModification: Date;

    @ApiProperty()
    _id?: string;
}

export const mapSchema = SchemaFactory.createForClass(Map);
