import { MapController } from '@app/controllers/map/map.controller';
import { MessagingGateway } from '@app/gateways/messaging/messaging.gateway';
import { Map, mapSchema } from '@app/model/database/map';
import { Room, roomSchema } from '@app/model/database/room';
import { DateService } from '@app/services/date/date.service';
import { MapService } from '@app/services/map/map.service';
import { RoomService } from '@app/services/room/room.service';
import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { RoomController } from './controllers/room/room.controller';
import { GameGateway } from './gateways/game/game.gateway';
import { RoomGateway } from './gateways/room/room.gateway';
import { ChatManagerService } from './services/chat-manager/chat-manager.service';
import { PathfindingService } from './services/dijkstra/dijkstra.service';
import { DoorOpeningService } from './services/door-opening/door-opening.service';
import { GameStartService } from './services/game-start/game-start.service';
import { GameTimeService } from './services/game-time/game-time.service';
import { GameTurnService } from './services/game-turn/game-turn.service';
import { PlayerAbandonService } from './services/player-abandon/player-abandon.service';
import { PlayerMovementService } from './services/player-movement/player-movement.service';
import { RoomManagerService } from './services/room-manager/room-manager.service';
import { SocketManagerService } from './services/socket-manager/socket-manager.service';
import { JournalManagerService } from './services/journal-manager/journal-manager.service';

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
    controllers: [MapController, RoomController],
    providers: [
        SocketManagerService,
        RoomManagerService,
        MessagingGateway,
        GameGateway,
        GameTimeService,
        PlayerMovementService,
        DoorOpeningService,
        PathfindingService,
        RoomGateway,
        MapService,
        RoomService,
        DateService,
        Logger,
        RoomManagerService,
        SocketManagerService,
        PlayerMovementService,
        PlayerAbandonService,
        GameTurnService,
        GameStartService,
        ChatManagerService,
        JournalManagerService,
    ],
})
export class AppModule {}
