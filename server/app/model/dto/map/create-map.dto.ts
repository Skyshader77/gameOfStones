import { Tile } from '@app/model/database/tile';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsNotEmpty, IsNumber, IsString, ValidateNested } from 'class-validator';

export class CreateMapDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    sizeRow: number;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    mode: string;

    @ApiProperty()
    @IsArray()
    @ValidateNested({ each: true })
    @ArrayMinSize(1)
    @Type(() => Tile)
    @IsNotEmpty()
    mapArray: Tile[];

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    mapDescription: string;
}
