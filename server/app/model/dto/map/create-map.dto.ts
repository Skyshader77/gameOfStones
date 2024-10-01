import { GameMode } from '@app/interfaces/gamemode';
import { Item } from '@app/interfaces/item';
import { MapSize } from '@app/interfaces/mapSize';
import { Tile } from '@app/interfaces/tile';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsEnum, IsNotEmpty, IsString, ValidateNested } from 'class-validator';

export class CreateMapDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty()
    @IsEnum(MapSize)
    @IsNotEmpty()
    size: MapSize;

    @ApiProperty()
    @IsEnum(GameMode)
    @IsNotEmpty()
    mode: GameMode;

    @ApiProperty()
    @IsArray()
    @ValidateNested({ each: true })
    @ArrayMinSize(1)
    @IsNotEmpty()
    @Type(() => Tile)
    mapArray: Tile[][];

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    description: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    imageData: string;

    @ApiProperty()
    @IsArray()
    @IsNotEmpty()
    placedItems: Item[];
}
