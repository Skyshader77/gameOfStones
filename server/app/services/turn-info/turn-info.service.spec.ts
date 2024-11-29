import { Test, TestingModule } from '@nestjs/testing';
import { TurnInfoService } from './turn-info.service';
import { SocketManagerService } from '@app/services/socket-manager/socket-manager.service';
import { PlayerMovementService } from '@app/services/player-movement/player-movement.service';
import { RoomManagerService } from '@app/services/room-manager/room-manager.service';
import { SimpleItemService } from '@app/services/simple-item/simple-item.service';
import { ConditionalItemService } from '@app/services/conditional-item/conditional-item.service';
import { SinonStubbedInstance, createStubInstance } from 'sinon';
import { ActionService } from '@app/services/action/action.service';

describe('TurnInfoService', () => {
    let service: TurnInfoService;
    let actionService: SinonStubbedInstance<ActionService>;

    beforeEach(async () => {
        actionService = createStubInstance(ActionService);
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                TurnInfoService,
                {
                    provide: SocketManagerService,
                    useValue: {},
                },
                {
                    provide: PlayerMovementService,
                    useValue: {},
                },
                {
                    provide: RoomManagerService,
                    useValue: {},
                },
                {
                    provide: SimpleItemService,
                    useValue: {},
                },
                {
                    provide: ConditionalItemService,
                    useValue: {},
                },
                {
                    provide: ActionService,
                    useValue: actionService,
                },
            ],
        }).compile();

        service = module.get<TurnInfoService>(TurnInfoService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
