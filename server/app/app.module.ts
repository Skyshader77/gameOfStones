import { DateController } from '@app/controllers/date/date.controller';
import { ExampleController } from '@app/controllers/example/example.controller';
import { MapController } from '@app/controllers/map/map.controller';
import { ChatGateway } from '@app/gateways/chat/chat.gateway';
import { Map, mapSchema } from '@app/model/database/map';
import { Room, roomSchema } from '@app/model/database/room';
import { DateService } from '@app/services/date/date.service';
import { ExampleService } from '@app/services/example/example.service';
import { MapService } from '@app/services/map/map.service';
import { RoomService } from '@app/services/room/room.service';
import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { RoomController } from './controllers/room/room.controller';
import { RoomGateway } from './gateways/room/room.gateway';
import { RoomManagerService } from './services/room-manager/room-manager.service';
import { SocketManagerService } from './services/socket-manager/socket-manager.service';
import { GameGateway } from './gateways/game/game.gateway';
import { GameTimeService } from './services/game-time/game-time.service';
import { PlayerMovementService } from './services/player-movement/player-movement.service';
import { DoorOpeningService } from './services/door-opening/door-opening.service';
import { DijkstraService } from './services/dijkstra/dijkstra.service';
import { GameTurnService } from './services/game-turn/game-turn.service';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        MongooseModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (config: ConfigService) => ({
                uri: config.get<string>('DATABASE_CONNECTION_STRING'), // Loaded from .env
            }),
        }),
        MongooseModule.forFeature([
            { name: Map.name, schema: mapSchema },
            { name: Room.name, schema: roomSchema },
        ]),
    ],
    controllers: [MapController, DateController, RoomController, ExampleController],
    providers: [
        SocketManagerService,
        RoomManagerService,
        ChatGateway,
        GameGateway,
        GameTimeService,
        PlayerMovementService,
        DoorOpeningService,
        DijkstraService,
        RoomGateway,
        MapService,
        RoomService,
        DateService,
        ExampleService,
        Logger,
        RoomManagerService,
        SocketManagerService,
        PlayerMovementService,
        GameTurnService,
    ],
})
export class AppModule {}
