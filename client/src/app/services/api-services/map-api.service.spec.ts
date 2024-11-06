import { HttpErrorResponse, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MOCK_MAPS, MOCK_NEW_MAP } from '@app/constants/tests.constants';
import { CreationMap, Map } from '@common/interfaces/map';
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
            expect(maps.length).toBe(MOCK_MAPS.length);
            expect(maps).toEqual(MOCK_MAPS);
        });

        const req = httpMock.expectOne(baseUrl);
        expect(req.request.method).toEqual('GET');
        req.flush(MOCK_MAPS);
    });

    it('should retrieve a map by ID (getMapbyId)', () => {
        const mapId = 'Su27FLanker';
        service.getMapById(mapId).subscribe((map) => {
            expect(map).toEqual(MOCK_MAPS[0]);
        });

        const req = httpMock.expectOne(`${baseUrl}/${mapId}`);
        expect(req.request.method).toEqual('GET');
        req.flush(MOCK_MAPS[0]);
    });

    it('should retrieve a map by name (getMapbyName)', () => {
        const mapName = 'Game of Drones';
        service.getMapByName(mapName).subscribe((map) => {
            expect(map).toEqual(MOCK_MAPS[0]);
        });

        const req = httpMock.expectOne(`${baseUrl}/name/${mapName}`);
        expect(req.request.method).toEqual('GET');
        req.flush(MOCK_MAPS[0]);
    });

    it('should create a new map (createMap)', () => {
        const newMap: CreationMap = MOCK_NEW_MAP;

        service.createMap(newMap).subscribe((map) => {
            expect(map.id).toBeTruthy();
        });

        const req = httpMock.expectOne(baseUrl);
        expect(req.request.method).toEqual('POST');
        req.flush({ id: 'ADE1231' });
    });

    it('should update an existing map (updateMap)', () => {
        const updatedMap: Map = MOCK_NEW_MAP;

        service.updateMap(true, updatedMap).subscribe((map) => {
            expect(map).toBe(MOCK_NEW_MAP);
        });
        const req = httpMock.expectOne(baseUrl);
        expect(req.request.method).toEqual('PATCH');
        req.flush(MOCK_NEW_MAP);
    });

    it('should delete a map (deleteMap)', () => {
        const mapId = 'Su27FLanker';

        service.deleteMap(mapId).subscribe((response) => {
            expect(response.id).toBe(mapId);
        });

        const req = httpMock.expectOne(`${baseUrl}/${mapId}`);
        expect(req.request.method).toEqual('DELETE');
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
        expect(req.request.method).toEqual('GET');
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
        expect(req.request.method).toEqual('GET');
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
        expect(req.request.method).toEqual('GET');
        req.flush(null, { status: 404, statusText: 'Map not Found' });
    });

    it('should handle error on createMap', () => {
        const newMap: CreationMap = MOCK_NEW_MAP;

        service.createMap(newMap).subscribe({
            next: () => fail('expected an error, not map'),
            error: (error: Error) => {
                expect(error).toBeTruthy();
            },
        });

        const req = httpMock.expectOne(service['baseUrl']);
        expect(req.request.method).toEqual('POST');

        req.flush(null, { status: 500, statusText: 'Server Error' });
    });

    it('should handle error on updateMap', () => {
        const updatedMap: Map = MOCK_NEW_MAP;

        service.updateMap(true, updatedMap).subscribe({
            next: () => fail('expected an error, not map'),
            error: (error: Error) => {
                expect(error).toBeTruthy();
            },
        });

        const req = httpMock.expectOne(service['baseUrl']);
        expect(req.request.method).toEqual('PATCH');

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
        expect(req.request.method).toEqual('DELETE');

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
                expect(err.message).toEqual('Erreur du client: Network not available');
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
                expect(err.message).toEqual('Erreur du serveur: 500 - Internal Server Error');
                done();
            },
        });
    });

    it('should return error message from the HttpErrorResponse if the error follows the error.message format', () => {
        const errorResponse = new HttpErrorResponse({
            error: { message: ['Standard bad request'] },
            status: 400,
            statusText: 'Bad Request',
        });

        const handleError = service['handleError']();
        handleError(errorResponse).subscribe({
            error: (err) => {
                expect(err.message).toEqual('Standard bad request');
            },
        });
    });

    it('should return "Unknown Error" when the error does not match any formats encountered', () => {
        const errorResponse = new ProgressEvent('error', {});

        const error = new HttpErrorResponse({ error: errorResponse });

        const handleError = service['handleError']();
        handleError(error).subscribe({
            error: (err) => {
                expect(err.toString()).toEqual("Error: Le serveur n'est pas connecté");
            },
        });
    });
});
