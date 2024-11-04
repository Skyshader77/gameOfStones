import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Room } from '@common/interfaces/room';
import { environment } from 'src/environments/environment';
import { RoomAPIService } from './room-api.service';
import { MOCK_ROOM } from '@app/constants/tests.constants';

describe('RoomAPIService', () => {
    let service: RoomAPIService;
    let httpMock: HttpTestingController;
    let baseUrl: string;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()],
        });
        service = TestBed.inject(RoomAPIService);

        service = TestBed.inject(RoomAPIService);
        httpMock = TestBed.inject(HttpTestingController);
        // eslint-disable-next-line dot-notation -- baseUrl is private and we need access for the tet
        baseUrl = `${environment.serverUrl}api/Room`;
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should create a room', () => {
        service.createRoom().subscribe((room: Room) => {
            expect(room.roomCode).toBeTruthy();
        });

        const req = httpMock.expectOne(baseUrl);
        expect(req.request.method).toBe('POST');
    });

    it('should check if room exists', () => {
        service.checkRoomExists(MOCK_ROOM.roomCode).subscribe((exists: boolean) => {
            expect(exists).toBe(true);
        });

        const req = httpMock.expectOne(`${baseUrl}/code/${MOCK_ROOM.roomCode}`);
        expect(req.request.method).toBe('GET');
        req.flush(MOCK_ROOM.roomCode);
    });

    it('should return false if room does not exist', () => {
        const roomCode = 'invalidCode';

        service.checkRoomExists(roomCode).subscribe((exists: boolean) => {
            expect(exists).toBe(false);
        });

        const req = httpMock.expectOne(`${baseUrl}/code/${roomCode}`);
        expect(req.request.method).toBe('GET');
        req.error(new ErrorEvent('Room not found'));
    });
});
