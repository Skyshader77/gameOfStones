import { GameMode } from '@app/interfaces/gamemode';
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
    sizeRow: MapSize;

    @ApiProperty()
    @IsEnum(GameMode)
    @IsNotEmpty()
    mode: GameMode;

    @ApiProperty({ type: [Tile] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => Tile)
    @ArrayMinSize(1)
    @IsNotEmpty()
    mapArray: Tile[];

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    mapDescription: string;
}
