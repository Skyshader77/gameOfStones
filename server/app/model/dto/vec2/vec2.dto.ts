import { Vec2 } from '@common/interfaces/vec2';
import { IsNumber } from 'class-validator';

export class Vec2Dto implements Vec2 {
    @IsNumber()
    x: number;

    @IsNumber()
    y: number;
}
