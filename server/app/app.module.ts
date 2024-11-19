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
import { FightGateway } from './gateways/fight/fight.gateway';
import { GameGateway } from './gateways/game/game.gateway';
import { RoomGateway } from './gateways/room/room.gateway';
import { AvatarManagerService } from './services/avatar-manager/avatar-manager.service';
import { ChatManagerService } from './services/chat-manager/chat-manager.service';
import { PathfindingService } from './services/dijkstra/dijkstra.service';
import { DoorOpeningService } from './services/door-opening/door-opening.service';
import { FightLogicService } from './services/fight/fight/fight-logic.service';
import { FightManagerService } from './services/fight/fight/fight-manager.service';
import { GameEndService } from './services/game-end/game-end.service';
import { GameStartService } from './services/game-start/game-start.service';
import { GameStatsService } from './services/game-stats/game-stats.service';
import { GameTimeService } from './services/game-time/game-time.service';
import { GameTurnService } from './services/game-turn/game-turn.service';
import { ItemManagerService } from './services/item-manager/item-manager.service';
import { JournalManagerService } from './services/journal-manager/journal-manager.service';
import { PlayerAbandonService } from './services/player-abandon/player-abandon.service';
import { PlayerMovementService } from './services/player-movement/player-movement.service';
import { RoomManagerService } from './services/room-manager/room-manager.service';
import { SocketManagerService } from './services/socket-manager/socket-manager.service';
import { VirtualPlayerBehaviorService } from './services/virtual-player-behavior/virtual-player-behavior.service';
import { VirtualPlayerCreationService } from './services/virtual-player-creation/virtual-player-creation.service';
import { VirtualPlayerLogicService } from './services/virtual-player-logic/virtual-player-logic.service';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        MongooseModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (config: ConfigService) => ({
                uri: config.get<string>('DATABASE_CONNECTION_STRING'),
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
        GameEndService,
        FightLogicService,
        ChatManagerService,
        AvatarManagerService,
        JournalManagerService,
        FightManagerService,
        GameStatsService,
        ItemManagerService,
        VirtualPlayerCreationService,
        VirtualPlayerBehaviorService,
        VirtualPlayerLogicService,
        FightGateway,
    ],
})
export class AppModule {}
