import { TestBed } from '@angular/core/testing';

import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Room } from '@app/interfaces/room';
import { environment } from 'src/environments/environment';
import { RoomAPIService } from './room-api.service';

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
});
