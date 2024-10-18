import { MOCK_MOVE_DATA, MOCK_MOVE_RESULT, MOCK_MOVE_RESULT_TRIPPED } from '@app/constants/player.movement.test.constants';
import { GameTimeService } from '@app/services/game-time/game-time.service';
import { PlayerMovementService } from '@app/services/player-movement/player-movement.service';
import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as sinon from 'sinon';
import { createStubInstance, SinonStubbedInstance, stub } from 'sinon';
import { Server, Socket } from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { GameGateway } from './game.gateway';
import { GameEvents } from './game.gateway.events';

describe('GameGateway', () => {
    let gateway: GameGateway;
    let movementService: SinonStubbedInstance<PlayerMovementService>;
    let gameTimeService: SinonStubbedInstance<GameTimeService>;
    let socket: SinonStubbedInstance<Socket>;
    let server: SinonStubbedInstance<Server>;
    let logger: SinonStubbedInstance<Logger>;
    beforeEach(async () => {
        socket = createStubInstance<Socket>(Socket);
        movementService = createStubInstance<PlayerMovementService>(PlayerMovementService);
        gameTimeService = createStubInstance<GameTimeService>(GameTimeService);
        server = {
            to: sinon.stub().returnsThis(),
            emit: sinon.stub(),
        } as SinonStubbedInstance<Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, unknown>>;
        stub(socket, 'rooms').value(new Set(['room1', '1234']));
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GameGateway,
                { provide: PlayerMovementService, useValue: movementService },
                { provide: GameTimeService, useValue: gameTimeService },
                {
                    provide: Logger,
                    useValue: logger,
                },
            ],
        }).compile();
        gateway = module.get<GameGateway>(GameGateway);
        gateway['server'] = server;
    });

    it('should be defined', () => {
        expect(gateway).toBeDefined();
    });

    it('should process player movement and emit PlayerMove event', () => {
        movementService.processPlayerMovement.returns(MOCK_MOVE_RESULT);

        gateway.processDesiredMove(socket, MOCK_MOVE_DATA);
        expect(server.to.called).toBeTruthy();
        expect(server.emit.calledWith(GameEvents.PlayerMove, MOCK_MOVE_RESULT)).toBeTruthy();
    });

    it('should emit PlayerSlipped event if the player has tripped', () => {
        movementService.processPlayerMovement.returns(MOCK_MOVE_RESULT_TRIPPED);

        gateway.processDesiredMove(socket, MOCK_MOVE_DATA);
        expect(server.to.called).toBeTruthy();
        expect(server.emit.calledWith(GameEvents.PlayerSlipped, MOCK_MOVE_DATA.playerId)).toBeTruthy();
    });

    it('should not emit PlayerSlipped event if the player has not tripped', () => {
        movementService.processPlayerMovement.returns(MOCK_MOVE_RESULT);
        gateway.processDesiredMove(socket, MOCK_MOVE_DATA);
        expect(server.emit.neverCalledWith(GameEvents.PlayerSlipped, MOCK_MOVE_DATA.playerId)).toBeTruthy();
    });
});
