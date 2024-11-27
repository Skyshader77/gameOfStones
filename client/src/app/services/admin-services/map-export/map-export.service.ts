import { Injectable } from '@angular/core';
import { Map } from '@common/interfaces/map';
import {
    EXCLUSION_FIELDS,
    DOWNLOAD_BLOB_TYPE,
    DOWNLOAD_ANCHOR,
    DOWNLOAD_MAP_PREFIX,
    DOWNLOAD_MAP_SUFFIX,
    JSON_INDENTATION,
    REGEX_ARRAY_PATTERN,
    REGEX_NEWLINE_PATTERN,
    REGEX_WHITESPACE_PATTERN,
} from '@app/constants/admin.constants';

@Injectable({
    providedIn: 'root',
})
export class MapExportService {
    exportMap(map: Map) {
        const mapObject = this.convertMapToJson(map);
        this.triggerDownload(mapObject, map.name);
    }

    private convertMapToJson(map: Map): string {
        const json = JSON.stringify(map, this.replacer, JSON_INDENTATION);
        return json.replace(REGEX_ARRAY_PATTERN, (match) => match.replace(REGEX_NEWLINE_PATTERN, '').replace(REGEX_WHITESPACE_PATTERN, ''));
    }

    private replacer(key: string, value: unknown) {
        if (EXCLUSION_FIELDS.includes(key)) {
            return undefined;
        }
        return value;
    }

    private triggerDownload(content: string, mapName: string) {
        const blob = new Blob([content], { type: DOWNLOAD_BLOB_TYPE });
        const link = document.createElement(DOWNLOAD_ANCHOR);
        link.href = URL.createObjectURL(blob);
        link.download = `${DOWNLOAD_MAP_PREFIX}${mapName}${DOWNLOAD_MAP_SUFFIX}`;
        link.click();
        URL.revokeObjectURL(link.href);
    }
}
