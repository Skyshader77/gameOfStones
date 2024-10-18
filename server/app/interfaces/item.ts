import { IsEnum, ValidateNested } from 'class-validator';
import { Vec2Dto } from './vec2';
import { Type } from 'class-transformer';

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
    position: Vec2Dto;

    @IsEnum(ItemType)
    type: ItemType;
}
