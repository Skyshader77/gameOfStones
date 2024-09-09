import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsDate, ArrayMinSize, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { Tile } from '../../database/tile';

export class CreateMapDto {
    @ApiProperty()
    @IsString()
    mapID: string;

    @ApiProperty()
    @IsString()
    name: string;

    @ApiProperty()
    @IsNumber()
    sizeRow: number;

    @ApiProperty()
    @IsString()
    mode: string;

    @ApiProperty()
    @IsArray()
    @ValidateNested({ each: true })
    @ArrayMinSize(1)
    @Type(() => Tile)
    mapArray: Tile[];

    @ApiProperty()
    @IsDate()
    dateOfLastModification: Date;

}