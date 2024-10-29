import { IsNumber } from 'class-validator';

export class Vec2Dto {
    @IsNumber()
    x: number;

    @IsNumber()
    y: number;
}
