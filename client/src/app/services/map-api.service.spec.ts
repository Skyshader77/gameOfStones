import { HttpErrorResponse, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { mockMaps, mockNewMap } from '@app/constants/tests.constants';
import { CreationMap, Map } from 'src/app/interfaces/map';
import { environment } from 'src/environments/environment';
import { MapAPIService } from './map-api.service';
describe('MapAPIService', () => {
    let httpMock: HttpTestingController;
    let service: MapAPIService;
    let baseUrl: string;
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [],
            providers: [provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()],
        });
        service = TestBed.inject(MapAPIService);
        httpMock = TestBed.inject(HttpTestingController);
        baseUrl = `${environment.serverUrl}api/Map`;
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should retrieve all maps (getMaps)', () => {
        service.getMaps().subscribe((maps) => {
            expect(maps.length).toBe(mockMaps.length);
            expect(maps).toEqual(mockMaps);
        });

        const req = httpMock.expectOne(baseUrl);
        expect(req.request.method).toBe('GET');
        req.flush(mockMaps);
    });

    it('should retrieve a map by ID (getMapbyId)', () => {
        const mapId = 'Su27FLanker';
        service.getMapById(mapId).subscribe((map) => {
            expect(map).toEqual(mockMaps[0]);
        });

        const req = httpMock.expectOne(`${baseUrl}/${mapId}`);
        expect(req.request.method).toBe('GET');
        req.flush(mockMaps[0]);
    });

    it('should retrieve a map by name (getMapbyName)', () => {
        const mapName = 'Game of Drones';
        service.getMapByName(mapName).subscribe((map) => {
            expect(map).toEqual(mockMaps[0]);
        });

        const req = httpMock.expectOne(`${baseUrl}/name/${mapName}`);
        expect(req.request.method).toBe('GET');
        req.flush(mockMaps[0]);
    });

    it('should create a new map (createMap)', () => {
        const newMap: CreationMap = mockNewMap;

        service.createMap(newMap).subscribe((map) => {
            expect(map.id).toBeTruthy();
        });

        const req = httpMock.expectOne(baseUrl);
        expect(req.request.method).toBe('POST');
        req.flush({ id: 'ADE1231' });
    });

    it('should update an existing map (updateMap)', () => {
        const updatedMap: Map = mockNewMap;
        service.updateMap(updatedMap).subscribe((map) => {
            expect(map).toBe(mockNewMap);
        });
        const req = httpMock.expectOne(baseUrl);
        expect(req.request.method).toBe('PATCH');
        req.flush(mockNewMap);
    });

    it('should delete a map (deleteMap)', () => {
        const mapId = 'Su27FLanker';

        service.deleteMap(mapId).subscribe((response) => {
            expect(response.id).toBe(mapId);
        });

        const req = httpMock.expectOne(`${baseUrl}/${mapId}`);
        expect(req.request.method).toBe('DELETE');
        req.flush({ id: mapId });
    });

    it('should handle http error  for getMaps', () => {
        service.getMaps().subscribe({
            next: (response: Map[]) => {
                expect(response).toBeUndefined();
            },
            error: (error) => {
                expect(error).toBeTruthy();
            },
        });

        const req = httpMock.expectOne(`${baseUrl}`);
        expect(req.request.method).toBe('GET');
        req.error(new ProgressEvent('error'));
    });

    it('should handle error for getMapbyId', () => {
        const mapId = 'Su27FLanker';
        service.getMapById(mapId).subscribe({
            next: (response: Map) => {
                expect(response).toBeUndefined();
            },
            error: (error: Error) => {
                expect(error).toBeTruthy();
            },
        });

        const req = httpMock.expectOne(`${baseUrl}/${mapId}`);
        expect(req.request.method).toBe('GET');
        req.flush(null, { status: 404, statusText: 'Map not Found' });
    });

    it('should handle error for getMapbyName', () => {
        const mapName = 'Game of Drones';
        service.getMapByName(mapName).subscribe({
            next: (response: Map) => {
                expect(response).toBeUndefined();
            },
            error: (error: Error) => {
                expect(error).toBeTruthy();
            },
        });

        const req = httpMock.expectOne(`${baseUrl}/name/${mapName}`);
        expect(req.request.method).toBe('GET');
        req.flush(null, { status: 404, statusText: 'Map not Found' });
    });

    it('should handle error on createMap', () => {
        const newMap: CreationMap = mockNewMap;

        service.createMap(newMap).subscribe({
            next: () => fail('expected an error, not map'),
            error: (error: Error) => {
                expect(error).toBeTruthy();
            },
        });

        const req = httpMock.expectOne(service['baseUrl']);
        expect(req.request.method).toBe('POST');

        req.flush(null, { status: 500, statusText: 'Server Error' });
    });

    it('should handle error on updateMap', () => {
        const updatedMap: Map = mockNewMap;

        service.updateMap(updatedMap).subscribe({
            next: () => fail('expected an error, not map'),
            error: (error: Error) => {
                expect(error).toBeTruthy();
            },
        });

        const req = httpMock.expectOne(service['baseUrl']);
        expect(req.request.method).toBe('PATCH');

        req.flush(null, { status: 500, statusText: 'Server Error' });
    });

    it('should handle error on deleteMap', () => {
        const id = '1';
        service.deleteMap(id).subscribe({
            next: () => fail('expected an error, not null'),
            error: (error: Error) => {
                expect(error).toBeTruthy();
            },
        });

        const req = httpMock.expectOne(`${service['baseUrl']}/${id}`);
        expect(req.request.method).toBe('DELETE');

        req.flush(null, { status: 500, statusText: 'Server Error' });
    });

    it('should return client-side error message', () => {
        const errorEvent = new ErrorEvent('Network error', {
            message: 'Network not available',
        });
        const errorResponse = new HttpErrorResponse({
            error: errorEvent,
            status: 0,
            statusText: 'Unknown Error',
        });

        const handleError = service['handleError']();
        handleError(errorResponse).subscribe({
            error: (err) => {
                expect(err.message).toBe('Client-side error: Network not available');
            },
        });
    });

    it('should return backend error message if the error follows the error.error.error format', (done) => {
        const errorResponse = new HttpErrorResponse({
            error: { error: 'Internal Server Error' },
            status: 500,
            statusText: 'Internal Server Error',
        });

        const handleError = service['handleError']();
        handleError(errorResponse).subscribe({
            error: (err) => {
                expect(err.message).toBe('Internal Server Error');
                done();
            },
        });
    });

    it('should return error message from the HttpErrorResponse if the error follows the error.message format', () => {
        const errorResponse = new HttpErrorResponse({
            error: { message: 'Standard bad request' },
            status: 400,
            statusText: 'Bad Request',
        });

        const handleError = service['handleError']();
        handleError(errorResponse).subscribe({
            error: (err) => {
                expect(err.message).toBe('Standard bad request');
            },
        });
    });

    it('should return "Unknown Error" when the error does not match any formats encountered', () => {
        const errorResponse = new HttpErrorResponse({
            error: null,
            status: 0,
            statusText: 'Not connected to server',
        });

        const handleError = service['handleError']();
        handleError(errorResponse).subscribe({
            error: (err) => {
                expect(err.message).toBe('Not connected to server');
            },
        });
    });
});
