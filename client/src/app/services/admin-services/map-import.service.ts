import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MapImportService {

  constructor() { }

  importMap() {
    console.log("Map imported");
  }
}
