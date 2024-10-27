import { IsEnum, IsNotEmpty, ValidateNested } from 'class-validator';
import { Vec2Dto } from '@app/model/dto/vec2/vec2.dto';
import { Type } from 'class-transformer';
import 'reflect-metadata';

export enum ItemType {
    BOOST1,
    BOOST2,
    BOOST3,
    BOOST4,
    BOOST5,
    BOOST6,
    RANDOM,
    START,
    FLAG,
    NONE,
}

export class Item {
    @ValidateNested()
    @Type(() => Vec2Dto)
    @IsNotEmpty()
    position: Vec2Dto;

    @IsEnum(ItemType)
    @IsNotEmpty()
    type: ItemType;
}
