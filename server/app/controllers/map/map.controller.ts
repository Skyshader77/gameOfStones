import { Map } from '@app/model/database/map';
import { CreateMapDto } from '@app/model/dto/map/create-map.dto';
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
            response.status(HttpStatus.NOT_FOUND).send({ error: error.message });
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
                response.status(HttpStatus.NOT_FOUND).send({ error: 'Map not found' });
            } else {
                response.status(HttpStatus.OK).json(map);
            }
        } catch (error) {
            response.status(HttpStatus.INTERNAL_SERVER_ERROR).send(error.message);
        }
    }

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
            const doesMapExist = (await this.mapsService.getMapByName(mapDto.name)) !== null;

            if (doesMapExist) {
                response.status(HttpStatus.CONFLICT).send({ error: 'Map already exists' });
                return;
            }

            if (lengthOfRequest !== Constants.CREATEMAP_NB_FIELDS) {
                response.status(HttpStatus.BAD_REQUEST).send({ error: 'Invalid JSON format' });
                return;
            }

            for (const row of mapDto.mapArray) {
                for (const tile of row) {
                    if (Object.keys(tile).length !== Constants.TILE_NB_FIELDS) {
                        response.status(HttpStatus.BAD_REQUEST).send({ error: 'Invalid Tiles format' });
                        return;
                    }
                }
            }

            const id = await this.mapsService.addMap(mapDto);
            response.status(HttpStatus.CREATED).send({ id });
        } catch (error) {
            response.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ error: error.message });
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
    async modifyMap(@Body() map: Map, @Res() response: Response) {
        try {
            await this.mapsService.modifyMap(map);
            response.status(HttpStatus.OK).send({ id: map._id });
        } catch (error) {
            response.status(HttpStatus.NOT_FOUND).send({ error: error.message });
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
            response.status(HttpStatus.OK).send({ id: mapID });
        } catch (error) {
            response.status(HttpStatus.NOT_FOUND).send({ error: error.message });
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
                response.status(HttpStatus.NOT_FOUND).send({ error: 'Map not found' });
                return;
            }
            response.status(HttpStatus.OK).json(map);
        } catch (error) {
            response.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ error: error.message });
        }
    }
}
