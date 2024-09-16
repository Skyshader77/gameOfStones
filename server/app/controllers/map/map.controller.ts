import { Map } from '@app/model/database/map';
import { CreateMapDto } from '@app/model/dto/map/create-map.dto';
import { UpdateMapDto } from '@app/model/dto/map/update-map.dto';
import { MapService } from '@app/services/map/map.service';
import { Body, Controller, Delete, Get, HttpStatus, Param, Patch, Post, Res } from '@nestjs/common';
import { ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import * as Constants from './map.controller.constants';

@ApiTags('Maps')
@Controller('Map')
export class MapController {
    constructor(private readonly mapsService: MapService) {}

    @ApiOkResponse({
        description: 'Returns all Maps',
        type: Map,
        isArray: true,
    })
    @ApiNotFoundResponse({
        description: 'Return NOT_FOUND http status when request fails',
    })
    @Get('/')
    async allMaps(@Res() response: Response) {
        try {
            const allMaps = await this.mapsService.getAllMaps();
            response.status(HttpStatus.OK).json(allMaps);
        } catch (error) {
            response.status(HttpStatus.NOT_FOUND).send(error.message);
        }
    }

    @ApiOkResponse({
        description: 'Get Map by map id',
        type: Map,
    })
    @ApiNotFoundResponse({
        description: 'Return NOT_FOUND http status when request fails',
    })
    @Get('/:mapID')
    async mapID(@Param('mapID') mapID: string, @Res() response: Response) {
        try {
            const map = await this.mapsService.getMap(mapID);
            if (!map) {
                throw new Error('Map not found');
            } else {
                response.status(HttpStatus.OK).json(map);
            }
        } catch (error) {
            response.status(HttpStatus.NOT_FOUND).send(error.message);
        }
    }

    //TODO: ADD EDGE CASES AND VERIFICATION
    @ApiCreatedResponse({
        description: 'Add new Map',
    })
    @ApiNotFoundResponse({
        description: 'Return NOT_FOUND http status when request fails',
    })
    @Post('/')
    async addMap(@Body() mapDto: CreateMapDto, @Res() response: Response) {
        try {
            const lengthOfRequest = Object.keys(mapDto).length;
            const doesMapExist = (await this.mapsService.getMapByName(mapDto.name)) ? true : false;

            if (doesMapExist) {
                response.status(HttpStatus.CONFLICT).send('Map already exists');
            }

            if (lengthOfRequest !== Constants.CREATEMAPNBFIELDS) {
                response.status(HttpStatus.NOT_FOUND).send('Invalid request');
            }
            await this.mapsService.addMap(mapDto);
            response.status(HttpStatus.CREATED).send();
        } catch (error) {
            response.status(HttpStatus.CONFLICT).send(error.message);
        }
    }

    @ApiOkResponse({
        description: 'Modify a Map',
        type: Map,
    })
    @ApiNotFoundResponse({
        description: 'Return NOT_FOUND http status when request fails',
    })
    @Patch('/')
    async modifyMap(@Body() mapDto: UpdateMapDto, @Res() response: Response) {
        try {
            await this.mapsService.modifyMap(mapDto);
            response.status(HttpStatus.OK).send();
        } catch (error) {
            response.status(HttpStatus.NOT_FOUND).send(error.message);
        }
    }

    @ApiOkResponse({
        description: 'Delete a Map',
    })
    @ApiNotFoundResponse({
        description: 'Return NOT_FOUND http status when request fails',
    })
    @Delete('/:mapID')
    async deleteMap(@Param('mapID') mapID: string, @Res() response: Response) {
        try {
            await this.mapsService.deleteMap(mapID);
            response.status(HttpStatus.OK).send();
        } catch (error) {
            response.status(HttpStatus.NOT_FOUND).send(error.message);
        }
    }

    @ApiOkResponse({
        description: 'Get specific maps by name',
        type: Map,
        isArray: true,
    })
    @ApiNotFoundResponse({
        description: 'Return NOT_FOUND http status when request fails',
    })
    @Get('/name/:name')
    async getMapByName(@Param('name') name: string, @Res() response: Response) {
        try {
            const map = await this.mapsService.getMapByName(name);
            if (!map) {
                response.status(HttpStatus.NOT_FOUND).send('Map not found');
            }
            response.status(HttpStatus.OK).json(map);
        } catch (error) {
            response.status(HttpStatus.NOT_FOUND).send(error.message);
        }
    }
}
