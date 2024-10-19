import { GameMode } from '@app/interfaces/gamemode';
import { Item } from '@app/interfaces/item';
import { MapSize } from '@app/interfaces/mapSize';
import { TileTerrain } from '@app/interfaces/tileTerrain';
import { is2dEnum } from '@app/validators/is2dEnum';
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
    @ArrayMinSize(1)
    @is2dEnum(TileTerrain, 'TileTerrain')
    mapArray: TileTerrain[][];

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
    @ValidateNested({ each: true })
    @Type(() => Item)
    placedItems: Item[];
}
