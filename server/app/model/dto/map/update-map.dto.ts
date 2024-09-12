import { Tile } from '@app/model/database/tile';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsBoolean, IsDate, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';

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
    @IsBoolean()
    isVisible: boolean;

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
