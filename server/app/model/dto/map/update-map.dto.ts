import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsDate, ArrayMinSize, IsArray, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { Tile } from '../../database/tile';

export class UpdateMapDto {
    @ApiProperty()
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @ArrayMinSize(1)
    @Type(() => Tile)
    mapArray?: Tile[];

    @ApiProperty()
    @IsOptional()
    @IsString()
    mapID: string;

    @ApiProperty()
    @IsOptional()
    @IsNumber()
    sizeRow: number;

    @ApiProperty()
    @IsOptional()
    @IsString()
    mode?: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    name?: string;

    @ApiProperty()
    @IsOptional()
    @IsDate()
    dateOfLastModification: Date;
}
