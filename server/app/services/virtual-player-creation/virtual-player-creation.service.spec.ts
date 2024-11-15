import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AvatarManagerService } from '../avatar-manager/avatar-manager.service';
import { RoomManagerService } from '../room-manager/room-manager.service';
import { VirtualPlayerCreationService } from './virtual-player-creation.service';

describe('VirtualPlayerBehaviorService', () => {
    let service: VirtualPlayerCreationService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                VirtualPlayerCreationService,
                { provide: RoomManagerService, useValue: {} },
                { provide: AvatarManagerService, useValue: {} },
                { provide: Logger, useValue: {} },
            ],
        }).compile();

        service = module.get<VirtualPlayerCreationService>(VirtualPlayerCreationService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
