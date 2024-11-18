import { Vec2Dto } from '@app/model/dto/vec2/vec2.dto';
import { ItemType } from '@common/enums/item-type.enum';
import { Item as ItemInterface } from '@common/interfaces/item';
import { Vec2 } from '@common/interfaces/vec2';
import { Type } from 'class-transformer';
import { IsEnum, IsNotEmpty, ValidateNested } from 'class-validator';
import { Server } from 'socket.io';
import 'reflect-metadata';
import { RoomGame } from './room-game';

export class Item implements ItemInterface {
    @ValidateNested()
    @Type(() => Vec2Dto)
    @IsNotEmpty()
    position: Vec2Dto;

    @IsEnum(ItemType)
    @IsNotEmpty()
    type: ItemType;
}

export interface ItemLostHandler {
    room: RoomGame;
    playerName: string;
    itemDropPosition: Vec2;
    itemType: ItemType;
    server: Server;
}
