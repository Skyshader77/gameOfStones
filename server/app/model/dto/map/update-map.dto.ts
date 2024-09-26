import { GameMode } from '@app/interfaces/gamemode';
import { MapSize } from '@app/interfaces/mapSize';
import { Tile } from '@app/interfaces/tile';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsBoolean, IsDate, IsEnum, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Types } from 'mongoose';

export class UpdateMapDto {
    @ApiProperty({ type: [Tile] }) // Describe the array of Tile objects
    @IsArray()
    @ValidateNested({ each: true }) // Validate each item in the array
    @Type(() => Tile) // Apply transformation and validation for each Tile object
    @ArrayMinSize(1)
    @IsNotEmpty()
    mapArray: Tile[];

    @ApiProperty()
    @IsOptional()
    @IsEnum(MapSize)
    sizeRow: MapSize;

    @ApiProperty()
    @IsBoolean()
    isVisible: boolean;

    @ApiProperty()
    @IsOptional()
    @IsEnum(GameMode)
    mode?: GameMode;

    @ApiProperty()
    @IsOptional()
    @IsString()
    name?: string;

    @ApiProperty()
    @IsOptional()
    @IsDate()
    @Type(() => Date)
    dateOfLastModification: Date;

    @ApiProperty()
    @IsOptional()
    @IsString()
    mapDescription?: string;

    @ApiProperty()
    @IsOptional()
    _id?: string | Types.ObjectId;
}
