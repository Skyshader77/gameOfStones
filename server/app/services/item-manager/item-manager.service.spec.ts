import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { createStubInstance, SinonStubbedInstance } from 'sinon';
import { RoomManagerService } from '../room-manager/room-manager.service';
import { ItemManagerService } from './item-manager.service';

describe('GameTurnService', () => {
    let service: ItemManagerService;
    let roomManagerService: SinonStubbedInstance<RoomManagerService>;
    beforeEach(async () => {
        roomManagerService = createStubInstance<RoomManagerService>(RoomManagerService);
        const module: TestingModule = await Test.createTestingModule({
            providers: [ItemManagerService, Logger,
                { provide: RoomManagerService, useValue: roomManagerService }],
        }).compile();
        service = module.get<ItemManagerService>(ItemManagerService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
