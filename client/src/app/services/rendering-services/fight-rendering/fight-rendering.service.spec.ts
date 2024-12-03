import { TestBed } from '@angular/core/testing';
import {
    ATTACK_FIGHT_FRAMES,
    BLACK_OPACITY_DECREMENT,
    BLACK_OPACITY_INCREMENT,
    END_BLACK_OPACITY,
    FLIP_VECTOR,
    MY_FINAL_POSITION,
    MY_STARTING_POSITION,
    MY_STARTING_POSITION_Y,
    OPPONENT_FINAL_POSITION,
    OPPONENT_STARTING_POSITION,
    OPPONENT_STARTING_POSITION_Y,
    PIXEL_MOVEMENT,
    PLAYER_FIGHT_SPRITE_PIXEL,
} from '@app/constants/fight-rendering.constants';
import { MAP_PIXEL_DIMENSION } from '@app/constants/rendering.constants';
import { MOCK_FIGHT, MOCK_PLAYERS } from '@app/constants/tests.constants';
import { FightState } from '@app/interfaces/fight-info';
import { Player } from '@app/interfaces/player';
import { FightSocketService } from '@app/services/communication-services/fight-socket/fight-socket.service';
import { SpriteService } from '@app/services/rendering-services/sprite/sprite.service';
import { FightStateService } from '@app/services/states/fight-state/fight-state.service';
import { MyPlayerService } from '@app/services/states/my-player/my-player.service';
import { RenderingStateService } from '@app/services/states/rendering-state/rendering-state.service';
import { Avatar } from '@common/enums/avatar.enum';
import { FightRenderingService } from './fight-rendering.service';

describe('FightRenderingService', () => {
    let myPlayer: Player;
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

        myPlayer = JSON.parse(JSON.stringify(MOCK_PLAYERS[0]));
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
        ctx = jasmine.createSpyObj('CanvasRenderingContext2D', ['fillRect', 'strokeRect', 'drawImage', 'save', 'restore', 'scale']);
        service.setContext(ctx);
        service.setPlayers();
    });

    it('should render the initial fight when fight state is Start', () => {
        spyOn(service, 'renderInitialFight');
        spyOn(service, 'renderUI');
        spyOn(service, 'renderIdleFight');
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

    it('should reset positions and send desired fight timer when the first condition in renderInitialFight is met', () => {
        service['opponentStartingPosition'] = { x: MY_STARTING_POSITION_Y, y: 0 };
        service['myStartingPosition'] = { x: OPPONENT_STARTING_POSITION_Y, y: 0 };
        service['blackOpacity'] = 1.0;

        myPlayerServiceSpy.isCurrentFighter = false;
        fightStateServiceSpy.isAIInFight.and.returnValue(true);

        spyOn(service, 'resetPositions');

        service.renderInitialFight();

        expect(fightStateServiceSpy.fightState).toBe(FightState.Idle);
        expect(service.resetPositions).toHaveBeenCalled();
        expect(fightSocketServiceSpy.sendDesiredFightTimer).toHaveBeenCalled();
        expect(service['blackOpacity']).toBe(END_BLACK_OPACITY);
    });

    it('should enter the last if when blackOpacity > END_BLACK_OPACITY but not the first if', () => {
        service['opponentStartingPosition'] = { x: MY_STARTING_POSITION_Y - 10, y: 0 };
        service['myStartingPosition'] = { x: OPPONENT_STARTING_POSITION_Y + 10, y: 0 };
        service['blackOpacity'] = 1.1;

        myPlayerServiceSpy.isCurrentFighter = false;
        fightStateServiceSpy.isAIInFight.and.returnValue(true);

        spyOn(service, 'resetPositions');

        service.renderInitialFight();

        expect(fightStateServiceSpy.fightState).not.toBe(FightState.Idle);
        expect(service['blackOpacity']).toBe(1.1 - BLACK_OPACITY_DECREMENT);
        expect(service.resetPositions).not.toHaveBeenCalled();
        expect(fightSocketServiceSpy.sendDesiredFightTimer).not.toHaveBeenCalled();
    });

    it('should render the idle fight with background and both players', () => {
        const mockBackground = { width: 256, height: 256 } as HTMLImageElement;

        spriteServiceSpy.getBackgroundSpriteSheet.and.returnValue(mockBackground);
        spyOn(service, 'renderPlayerFight');

        service.renderIdleFight();

        expect(spriteServiceSpy.getBackgroundSpriteSheet).toHaveBeenCalledWith(1);
        expect(service.renderPlayerFight).toHaveBeenCalledWith(MOCK_PLAYERS[0].playerInfo.avatar, MY_STARTING_POSITION, true);
        expect(service.renderPlayerFight).toHaveBeenCalledWith(MOCK_PLAYERS[1].playerInfo.avatar, OPPONENT_STARTING_POSITION, true);
    });

    it('should render the player fight sprite with the correct parameters', () => {
        const mockPlayerImage = { width: 128, height: 128 } as HTMLImageElement;

        const flip = true;

        spyOn(service as any, 'renderFighter');
        spriteServiceSpy.isLoaded.and.returnValue(true);
        spriteServiceSpy.getPlayerFightSpriteSheet.and.returnValue(mockPlayerImage);

        service.renderPlayerFight(MOCK_PLAYERS[0].playerInfo.avatar, MY_STARTING_POSITION, flip);

        expect(spriteServiceSpy.isLoaded).toHaveBeenCalled();
        expect(spriteServiceSpy.getPlayerFightSpriteSheet).toHaveBeenCalledWith(MOCK_PLAYERS[0].playerInfo.avatar);
        expect(ctx.save).toHaveBeenCalled();
        expect(service['renderFighter']).toHaveBeenCalledWith(flip, mockPlayerImage, MY_STARTING_POSITION);
        expect(ctx.restore).toHaveBeenCalled();
    });

    it('should not render if the player sprite sheet is not found', () => {
        const flip = false;

        spriteServiceSpy.isLoaded.and.returnValue(true);
        spriteServiceSpy.getPlayerFightSpriteSheet.and.returnValue(null as unknown as HTMLImageElement);

        service.renderPlayerFight(MOCK_PLAYERS[0].playerInfo.avatar, MY_STARTING_POSITION, flip);

        expect(spriteServiceSpy.isLoaded).toHaveBeenCalled();
        expect(spriteServiceSpy.getPlayerFightSpriteSheet).toHaveBeenCalledWith(MOCK_PLAYERS[0].playerInfo.avatar);
        expect(ctx.save).not.toHaveBeenCalled();
    });

    it('should update my player position and increment attackFrameCounter when isAttackingFoward and myPlayer is current fighter', () => {
        myPlayerServiceSpy.isCurrentFighter = true;
        service['isAttackingForward'] = true;
        service['myStartingPosition'] = { x: 0, y: 0 };
        service['attackFrameCounter'] = 0;

        service.renderAttackAnimation();

        expect(service['myStartingPosition']).toEqual({ x: PIXEL_MOVEMENT * 2, y: -PIXEL_MOVEMENT * 2 });
        expect(service['attackFrameCounter']).toBe(1);
    });

    it('should update my player position and decrement attackFrameCounter when not attacking forward and myPlayer is current fighter', () => {
        myPlayerServiceSpy.isCurrentFighter = true;
        service['isAttackingForward'] = false;
        service['myStartingPosition'] = { x: 10, y: 10 };
        service['attackFrameCounter'] = 2;

        service.renderAttackAnimation();

        expect(service['myStartingPosition']).toEqual({ x: 10 - PIXEL_MOVEMENT * 2, y: 10 + PIXEL_MOVEMENT * 2 });
        expect(service['attackFrameCounter']).toBe(1);
    });

    it('should update opponent position and increment attackFrameCounter when isAttackingFoward and myPlayer is not the current fighter', () => {
        myPlayerServiceSpy.isCurrentFighter = false;
        service['isAttackingForward'] = true;
        service['opponentStartingPosition'] = { x: 0, y: 0 };
        service['attackFrameCounter'] = 0;

        service.renderAttackAnimation();

        expect(service['opponentStartingPosition']).toEqual({ x: -PIXEL_MOVEMENT * 2, y: PIXEL_MOVEMENT * 2 });
        expect(service['attackFrameCounter']).toBe(1);
    });

    it('should update opponent position and decrement attackFrameCounter when not attacking forward and myPlayer is not the current fighter', () => {
        myPlayerServiceSpy.isCurrentFighter = false;
        service['isAttackingForward'] = false;
        service['opponentStartingPosition'] = { x: 10, y: 10 };
        service['attackFrameCounter'] = 2;

        service.renderAttackAnimation();

        expect(service['opponentStartingPosition']).toEqual({ x: 10 + PIXEL_MOVEMENT * 2, y: 10 - PIXEL_MOVEMENT * 2 });
        expect(service['attackFrameCounter']).toBe(1);
    });

    it('should toggle isAttackingFoward when attackFrameCounter equals ATTACK_FIGHT_FRAMES', () => {
        myPlayerServiceSpy.isCurrentFighter = true;
        service['isAttackingForward'] = true;
        service['attackFrameCounter'] = ATTACK_FIGHT_FRAMES;

        service.renderAttackAnimation();

        expect(service['isAttackingForward']).toBe(false);
    });

    it('should toggle isAttackingFoward and reset positions when attackFrameCounter is 0', () => {
        myPlayerServiceSpy.isCurrentFighter = true;
        service['isAttackingForward'] = false;
        service['attackFrameCounter'] = 1;

        spyOn(service, 'resetPositions');
        service.renderAttackAnimation();

        expect(service['isAttackingForward']).toBe(true);
        expect(service.resetPositions).toHaveBeenCalled();
    });

    it('should set fightState to Idle and call endFightAction if AI is in fight and attackFrameCounter is 0', () => {
        myPlayerServiceSpy.isCurrentFighter = false;
        service['attackFrameCounter'] = 1;
        service['isAttackingForward'] = false;

        fightStateServiceSpy.isAIInFight.and.returnValue(true);

        service.renderAttackAnimation();

        expect(fightStateServiceSpy.fightState).toBe(FightState.Idle);
        expect(fightSocketServiceSpy.endFightAction).toHaveBeenCalled();
    });

    it('should not call endFightAction if AI is not in fight and myPlayer is not current fighter when attackFrameCounter is 0', () => {
        myPlayerServiceSpy.isCurrentFighter = false;
        service['attackFrameCounter'] = 0;

        fightStateServiceSpy.isAIInFight.and.returnValue(false);

        service.renderAttackAnimation();

        expect(fightSocketServiceSpy.endFightAction).not.toHaveBeenCalled();
    });

    it('should update opponent position, fill the canvas, increment blackOpacity, and handle state when myPlayer is not the current fighter and player is AI', () => {
        myPlayerServiceSpy.isCurrentFighter = false;
        service['opponentStartingPosition'] = { x: 100, y: 0 };
        service['blackOpacity'] = 0.5;

        fightStateServiceSpy.isAIInFight.and.returnValue(true);

        service.renderEvade();

        expect(service['opponentStartingPosition']).toEqual({ x: 100 + PIXEL_MOVEMENT, y: 0 });
        expect(service['ctx'].fillStyle).toBe('rgba(0, 0, 0, 0.5)');
        expect(service['ctx'].fillRect).toHaveBeenCalledWith(0, 0, MAP_PIXEL_DIMENSION, MAP_PIXEL_DIMENSION);
        expect(service['blackOpacity']).toBe(0.5 + BLACK_OPACITY_INCREMENT);

        expect(fightStateServiceSpy.fightState).not.toBe(FightState.Idle);
        expect(renderingStateServiceSpy.fightStarted).toBeUndefined();
        expect(fightSocketServiceSpy.endFightAction).not.toHaveBeenCalled();
    });

    it('should update opponent position, fill the canvas, increment blackOpacity, and handle state when myPlayer is the current fighter', () => {
        myPlayerServiceSpy.isCurrentFighter = true;
        service['opponentStartingPosition'] = { x: 100, y: 0 };
        service['blackOpacity'] = 1.5;

        fightStateServiceSpy.isAIInFight.and.returnValue(false);

        service.renderEvade();

        expect(service['opponentStartingPosition']).toEqual({ x: 100, y: 0 });
        expect(service['ctx'].fillStyle).toBe('rgba(0, 0, 0, 1.5)');
        expect(service['ctx'].fillRect).toHaveBeenCalledWith(0, 0, MAP_PIXEL_DIMENSION, MAP_PIXEL_DIMENSION);
        expect(service['blackOpacity']).toBe(1.5 + BLACK_OPACITY_INCREMENT);

        expect(fightStateServiceSpy.fightState).toBe(FightState.Idle);
        expect(renderingStateServiceSpy.fightStarted).toBe(false);
        expect(fightSocketServiceSpy.endFightAction).toHaveBeenCalled();
    });

    it('should update opponent position, fill the canvas, increment blackOpacity, and handle state when AI is in fight', () => {
        myPlayerServiceSpy.isCurrentFighter = false;
        service['opponentStartingPosition'] = { x: 100, y: 0 };
        service['blackOpacity'] = 1.5;

        fightStateServiceSpy.isAIInFight.and.returnValue(true);

        service.renderEvade();

        expect(service['opponentStartingPosition']).toEqual({ x: 100 + PIXEL_MOVEMENT, y: 0 });
        expect(service['ctx'].fillStyle).toBe('rgba(0, 0, 0, 1.5)');
        expect(service['ctx'].fillRect).toHaveBeenCalledWith(0, 0, MAP_PIXEL_DIMENSION, MAP_PIXEL_DIMENSION);
        expect(service['blackOpacity']).toBe(1.5 + BLACK_OPACITY_INCREMENT);

        expect(fightStateServiceSpy.fightState).toBe(FightState.Idle);
        expect(renderingStateServiceSpy.fightStarted).toBe(false);
        expect(fightSocketServiceSpy.endFightAction).toHaveBeenCalled();
    });

    it('should scale and draw the flipped fighter image when flip is true', () => {
        const mockImage = { width: 128, height: 128 } as HTMLImageElement;
        const position = { x: 50, y: 100 };

        service['renderFighter'](true, mockImage, position);

        expect(ctx.scale).toHaveBeenCalledWith(FLIP_VECTOR.x, FLIP_VECTOR.y);
        expect((ctx as any).drawImage).toHaveBeenCalledWith(
            mockImage,
            -position.x - PLAYER_FIGHT_SPRITE_PIXEL, // target x
            position.y, // target y
            PLAYER_FIGHT_SPRITE_PIXEL, // target width
            PLAYER_FIGHT_SPRITE_PIXEL, // target height
        );
    });

    it('should draw the fighter image without scaling when flip is false', () => {
        const mockImage = { width: 128, height: 128 } as HTMLImageElement;
        const position = { x: 50, y: 100 };

        service['renderFighter'](false, mockImage, position);

        expect(ctx.scale).not.toHaveBeenCalled();
        expect((ctx as any).drawImage).toHaveBeenCalledWith(
            mockImage,
            position.x, // target x
            position.y, // target y
            PLAYER_FIGHT_SPRITE_PIXEL, // target width
            PLAYER_FIGHT_SPRITE_PIXEL, // target height
        );
    });

    it('should use the default value for flip (false) if not provided', () => {
        const mockPlayerImage = { width: 128, height: 128 } as HTMLImageElement;
        const mockPlayerType = Avatar.FemaleHealer;
        const mockPosition = { x: 50, y: 100 };

        spyOn(service as any, 'renderFighter');
        spriteServiceSpy.isLoaded.and.returnValue(true);
        spriteServiceSpy.getPlayerFightSpriteSheet.and.returnValue(mockPlayerImage);

        service.renderPlayerFight(mockPlayerType, mockPosition);

        expect(spriteServiceSpy.isLoaded).toHaveBeenCalled();
        expect(spriteServiceSpy.getPlayerFightSpriteSheet).toHaveBeenCalledWith(mockPlayerType);
        expect(ctx.save).toHaveBeenCalled();
        expect(service['renderFighter']).toHaveBeenCalledWith(false, mockPlayerImage, mockPosition);
        expect(ctx.restore).toHaveBeenCalled();
    });
});
