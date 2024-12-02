import { TestBed } from '@angular/core/testing';
import { MY_FINAL_POSITION, OPPONENT_FINAL_POSITION } from '@app/constants/fight-rendering.constants';
import { MOCK_FIGHT, MOCK_PLAYERS } from '@app/constants/tests.constants';
import { FightState } from '@app/interfaces/fight-info';
import { Player } from '@app/interfaces/player';
import { FightSocketService } from '@app/services/communication-services/fight-socket/fight-socket.service';
import { SpriteService } from '@app/services/rendering-services/sprite/sprite.service';
import { FightStateService } from '@app/services/states/fight-state/fight-state.service';
import { MyPlayerService } from '@app/services/states/my-player/my-player.service';
import { RenderingStateService } from '@app/services/states/rendering-state/rendering-state.service';
import { FightRenderingService } from './fight-rendering.service';

describe('FightRenderingService', () => {
    let service: FightRenderingService;
    let spriteServiceSpy: jasmine.SpyObj<SpriteService>;
    let renderingStateServiceSpy: jasmine.SpyObj<RenderingStateService>;
    let myPlayerServiceSpy: jasmine.SpyObj<MyPlayerService>;
    let fightStateServiceSpy: jasmine.SpyObj<FightStateService>;
    let fightSocketServiceSpy: jasmine.SpyObj<FightSocketService>;
    let ctx: CanvasRenderingContext2D;

    beforeEach(() => {
        spriteServiceSpy = jasmine.createSpyObj('SpriteService', ['getBackgroundSpriteSheet', 'getPlayerFightSpriteSheet', 'isLoaded']);
        renderingStateServiceSpy = jasmine.createSpyObj('RenderingStateService', ['']);
        myPlayerServiceSpy = jasmine.createSpyObj('MyPlayerService', ['myPlayer']);
        fightStateServiceSpy = jasmine.createSpyObj('FightStateService', ['currentFight', 'fightState', 'isAIInFight']);
        fightSocketServiceSpy = jasmine.createSpyObj('FightSocketService', ['sendDesiredFightTimer', 'endFightAction']);

        const myPlayer: Player = JSON.parse(JSON.stringify(MOCK_PLAYERS[0]));
        myPlayerServiceSpy.myPlayer = myPlayer;

        fightStateServiceSpy.currentFight = MOCK_FIGHT;

        TestBed.configureTestingModule({
            providers: [
                FightRenderingService,
                { provide: SpriteService, useValue: spriteServiceSpy },
                { provide: RenderingStateService, useValue: renderingStateServiceSpy },
                { provide: MyPlayerService, useValue: myPlayerServiceSpy },
                { provide: FightStateService, useValue: fightStateServiceSpy },
                { provide: FightSocketService, useValue: fightSocketServiceSpy },
            ],
        });

        service = TestBed.inject(FightRenderingService);
        ctx = jasmine.createSpyObj('CanvasRenderingContext2D', ['fillRect', 'strokeRect', 'drawImage']);
        service.setContext(ctx);
        spyOn(service, 'renderIdleFight');
        spyOn(service, 'renderUI');
        service.setPlayers();
    });

    it('should render the initial fight when fight state is Start', () => {
        spyOn(service, 'renderInitialFight');
        fightStateServiceSpy.fightState = FightState.Start;
        service.renderFight();
        expect(service.renderIdleFight).toHaveBeenCalled();
        expect(service.renderInitialFight).toHaveBeenCalled();
        expect(service.renderUI).toHaveBeenCalled();
    });

    it('should render the attack animation when fight state is Attack', () => {
        spyOn(service, 'renderAttackAnimation');
        fightStateServiceSpy.fightState = FightState.Attack;
        service.renderFight();
        expect(service.renderAttackAnimation).toHaveBeenCalled();
    });

    it('should change opacity and call the fightSocketService when rendering evade', () => {
        myPlayerServiceSpy.isCurrentFighter = true;
        fightStateServiceSpy.fightState = FightState.Evade;
        service.renderFight();
        expect(fightSocketServiceSpy.endFightAction).toHaveBeenCalled();
        expect(ctx.fillStyle).toContain('rgba(0, 0, 0');
    });

    it('should reset positions after the attack animation finishes', () => {
        service.resetPositions();
        expect(service['myStartingPosition']).toEqual({ x: MY_FINAL_POSITION.x, y: MY_FINAL_POSITION.y });
        expect(service['opponentStartingPosition']).toEqual({ x: OPPONENT_FINAL_POSITION.x, y: OPPONENT_FINAL_POSITION.y });
    });
});
