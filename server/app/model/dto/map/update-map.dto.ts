import { Tile } from '@app/model/database/tile';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsBoolean, IsDate, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Types } from 'mongoose';

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

    @ApiProperty()
    @IsOptional()
    @IsString()
    mapDescription?: string;

    @ApiProperty()
    @IsOptional()
    _id?: string | Types.ObjectId;
}
