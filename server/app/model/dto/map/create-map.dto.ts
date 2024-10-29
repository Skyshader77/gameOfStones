import { GameMode } from '@common/enums/game-mode.enum';
import { Item } from '@app/interfaces/item';
import { is2dEnum } from '@app/validators/is2dEnum';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsEnum, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { TileTerrain } from '@common/enums/tile-terrain.enum';
import { MapSize } from '@common/enums/map-size.enum';
import { CreationMap as CreateMapInterface } from '@common/interfaces/map';

export class CreateMapDto implements CreateMapInterface {
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
