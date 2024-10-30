import { Test, TestingModule } from '@nestjs/testing';
import { ChatManagerService } from './chat-manager.service';
import { RoomManagerService } from '@app/services/room-manager/room-manager.service';

describe('RoomManagerService', () => {
    let service: ChatManagerService;
    let roomManagerSpy: RoomManagerService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [ChatManagerService, { provide: RoomManagerService, useValue: roomManagerSpy }],
        }).compile();

        service = module.get<ChatManagerService>(ChatManagerService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
