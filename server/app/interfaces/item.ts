import { Vec2Dto } from '@app/model/dto/vec2/vec2.dto';
import { ItemType } from '@common/enums/item-type.enum';
import { Item as ItemInterface } from '@common/interfaces/item';
import { Type } from 'class-transformer';
import { IsEnum, IsNotEmpty, ValidateNested } from 'class-validator';
import 'reflect-metadata';

export class Item implements ItemInterface {
    @ValidateNested()
    @Type(() => Vec2Dto)
    @IsNotEmpty()
    position: Vec2Dto;

    @IsEnum(ItemType)
    @IsNotEmpty()
    type: ItemType;
}