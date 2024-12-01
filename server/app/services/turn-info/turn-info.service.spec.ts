import { ActionService } from '@app/services/action/action.service';
import { ConditionalItemService } from '@app/services/item/conditional-item/conditional-item.service';
import { SimpleItemService } from '@app/services/item/simple-item/simple-item.service';
import { SpecialItemService } from '@app/services/item/special-item/special-item.service';
import { PlayerMovementService } from '@app/services/player-movement/player-movement.service';
import { RoomManagerService } from '@app/services/room-manager/room-manager.service';
import { SocketManagerService } from '@app/services/socket-manager/socket-manager.service';
import { Test, TestingModule } from '@nestjs/testing';
import { SinonStubbedInstance, createStubInstance } from 'sinon';
import { TurnInfoService } from './turn-info.service';

describe('TurnInfoService', () => {
    let service: TurnInfoService;
    let actionService: SinonStubbedInstance<ActionService>;
    let specialItemService: SinonStubbedInstance<SpecialItemService>;

    beforeEach(async () => {
        actionService = createStubInstance(ActionService);
        specialItemService = createStubInstance(SpecialItemService);
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                TurnInfoService,
                {
                    provide: SocketManagerService,
                    useValue: {},
                },
                { provide: SpecialItemService, useValue: specialItemService },
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
