import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document, Types } from 'mongoose';
import { Tile } from './tile';

export type MapDocument = Map & Document;

@Schema()
export class Map {
    @ApiProperty()
    @Prop({ required: true })
    name: string;

    @ApiProperty()
    @Prop({ required: true })
    sizeRow: number;

    @ApiProperty()
    @Prop({ required: true, default: false })
    isVisible: boolean;

    @ApiProperty()
    @Prop({ required: true })
    mode: string;

    @ApiProperty()
    @Prop({ required: true })
    mapArray: Tile[];

    @ApiProperty()
    @Prop({ required: true, default: Date.now })
    dateOfLastModification: Date;

    @ApiProperty()
    @Prop({ required: true })
    mapDescription: string;

    @ApiProperty()
    _id?: string | Types.ObjectId;
}

export const mapSchema = SchemaFactory.createForClass(Map);
