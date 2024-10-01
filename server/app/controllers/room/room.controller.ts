import { Room } from '@app/model/database/room';
import { RoomService } from '@app/services/room/room.service';
import { Controller, Delete, Get, HttpStatus, Param, Post, Res } from '@nestjs/common';
import { ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import * as Utils from './room.controller.utils';

@ApiTags('Rooms')
@Controller('Room')
export class RoomController {
    constructor(private readonly roomsService: RoomService) { }

    @ApiOkResponse({
        description: 'Returns all Rooms',
        type: Room,
        isArray: true,
    })
    @ApiNotFoundResponse({
        description: 'Return INTERNAL_SERVER_ERROR http status when request fails',
    })
    @Get('/')
    async getAllRooms(@Res() response: Response) {
        try {
            const allRooms = await this.roomsService.getAllRooms();
            response.status(HttpStatus.OK).json(allRooms);
        } catch (error) {
            response.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ error: error.message });
        }
    }

    @ApiOkResponse({
        description: 'Get Room by room id',
        type: Room,
    })
    @ApiNotFoundResponse({
        description: 'Return NOT_FOUND http status when request fails',
    })
    @Get('/:roomID')
    async getRoomID(@Param('roomID') roomID: string, @Res() response: Response) {
        try {
            const room = await this.roomsService.getRoom(roomID);
            if (!room) {
                response.status(HttpStatus.NOT_FOUND).send({ error: `La salle n'a pas été trouvée` });
            } else {
                response.status(HttpStatus.OK).json(room);
            }
        } catch (error) {
            response.status(HttpStatus.INTERNAL_SERVER_ERROR).send(error.message);
        }
    }

    @ApiCreatedResponse({
        description: 'Add new Room',
    })
    @ApiNotFoundResponse({
        description: 'Return NOT_FOUND http status when request fails',
    })
    @Post('/')
    async addRoom(@Res() response: Response) {
        try {
            let doesRoomIDExist = true;
            let code: string;
            while (doesRoomIDExist) {
                code = Utils.generateRoomCode();

                doesRoomIDExist = (await this.roomsService.getRoomByCode(code)) !== null;
            }
            const room = new Room();
            room.roomCode = code;

            await this.roomsService.addRoom(room);
            response.status(HttpStatus.CREATED).send({ roomCode: code });
        } catch (error) {
            response.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ error: error.message });
        }
    }

    @ApiOkResponse({
        description: 'Delete a Room',
    })
    @ApiNotFoundResponse({
        description: 'Return NOT_FOUND http status when request fails',
    })
    @Delete('/:roomID')
    async deleteRoom(@Param('roomID') roomID: string, @Res() response: Response) {
        try {
            const doesRoomExist = await this.roomsService.getRoom(roomID);
            if (!doesRoomExist) {
                response.status(HttpStatus.NOT_FOUND).send({ error: `La salle n'a pas été trouvée` });
                return;
            }

            await this.roomsService.deleteRoom(roomID);
            response.status(HttpStatus.OK).send({ id: roomID });
        } catch (error) {
            response.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ error: error.message });
        }
    }

    @ApiOkResponse({
        description: 'Get specific room by code',
        type: Room,
    })
    @ApiNotFoundResponse({
        description: 'Return NOT_FOUND http status when request fails',
    })
    @Get('/code/:code')
    async getRoomByCode(@Param('code') code: string, @Res() response: Response) {
        try {
            const room = await this.roomsService.getRoomByCode(code);
            if (!room) {
                response.status(HttpStatus.NOT_FOUND).send({ error: `La salle n'a pas été trouvée` });
                return;
            }
            response.status(HttpStatus.OK).json(room);
        } catch (error) {
            response.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ error: error.message });
        }
    }
}
