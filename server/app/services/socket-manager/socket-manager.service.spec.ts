import { Test, TestingModule } from '@nestjs/testing';
import { SocketManagerService } from './socket-manager.service';
import { RoomManagerService } from '@app/services/room-manager/room-manager.service';

const roomManagerMock = {
    getRoom: jest.fn().mockReturnValue('ABCD'),
};

describe('SocketManagerService', () => {
    let service: SocketManagerService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [SocketManagerService, { provide: RoomManagerService, useValue: roomManagerMock }],
        }).compile();

        service = module.get<SocketManagerService>(SocketManagerService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
