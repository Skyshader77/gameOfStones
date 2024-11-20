import { PlayerMovementService } from '@app/services/player-movement/player-movement.service';
import { Test, TestingModule } from '@nestjs/testing';
import { DoorOpeningService } from '../door-opening/door-opening.service';
import { ItemManagerService } from '../item-manager/item-manager.service';
import { RoomManagerService } from '../room-manager/room-manager.service';
import { SocketManagerService } from '../socket-manager/socket-manager.service';
import { VirtualPlayerBehaviorService } from './virtual-player-behavior.service';
import { FightManagerService } from '../fight/fight/fight-manager.service';

describe('VirtualPlayerBehaviorService', () => {
    let service: VirtualPlayerBehaviorService;
    let playerMovementService: PlayerMovementService;
    let roomManagerService: RoomManagerService;
    let socketManagerService: SocketManagerService;
    let itemManagerService: ItemManagerService;
    let doorManagerService: DoorOpeningService;
    let fightManagerService: FightManagerService;
    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                VirtualPlayerBehaviorService,
                { provide: PlayerMovementService, useValue: {} },
                { provide: RoomManagerService, useValue: {} },
                { provide: SocketManagerService, useValue: {} },
                { provide: ItemManagerService, useValue: {} },
                { provide: DoorOpeningService, useValue: {} },
                { provide: FightManagerService, useValue: {} }
            ],
        }).compile();

        service = module.get<VirtualPlayerBehaviorService>(VirtualPlayerBehaviorService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
