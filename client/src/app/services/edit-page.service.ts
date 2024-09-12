import { Injectable } from '@angular/core';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Map, Tile, TileTerrain, Item, GameMode } from '@app/interfaces/map';

@Injectable({
  providedIn: 'root'
})
export class EditPageService {

  // ajouter les elements de la carte reçu du backend
  constructor() {
    
  }
  
  currentMap: Map = {
    mapId: "id",
    name: "mapName",
    description: "",
    rowSize: 20,
    mode: GameMode.NORMAL,
    mapArray: [],
    // TODO players in map?

    // TODO get date from backend
    lastModification: new Date,
  };

  tileSize: number = 900 / this.currentMap.rowSize;
  isLeftClick: boolean = false;
  isRightClick: boolean = false;
  wasItemDeleted: boolean = false;
  
  selectedTileType: TileTerrain | null;

  selectedTileTypeChange = new EventEmitter<TileTerrain>();
  itemPlaced = new EventEmitter<Item>();
  itemRemoved = new EventEmitter<Item>();

  //mapGrid: Tile[][] = [];
  
  ngOnInit() {
    this.initializeMap();
  }

  initializeMap() {
    this.currentMap.mapArray = Array.from({ length: this.currentMap.rowSize }, () => Array.from({ length: this.currentMap.rowSize }, () => ({ terrain: TileTerrain.GRASS, item: Item.NONE })));
  }

  hasItemPlaced(item: Item | undefined): boolean {
    return this.currentMap.mapArray.some((row) => row.some((tile) => tile.item === item));
  }

  onMouseDown(event: MouseEvent, rowIndex: number, colIndex: number): void {
    event.preventDefault();
    this.isRightClick = event.button === 2;
    this.isLeftClick = event.button === 0;
    if (this.currentMap.mapArray[rowIndex][colIndex].item && this.isRightClick) {
        this.wasItemDeleted = true; // Mark that an item was deleted
        this.itemRemoved.emit(this.currentMap.mapArray[rowIndex][colIndex].item || Item);
        this.removeItem(rowIndex, colIndex);
    } else if (this.isRightClick && !this.wasItemDeleted) {
        this.revertTileToGrass(rowIndex, colIndex);
    } else if (this.isLeftClick) {
        this.changeTile(rowIndex, colIndex);
    }
  }

  preventRightClick(event: MouseEvent): void {
    event.preventDefault(); // Prevent the context menu from appearing
  }

  onDragOver(event: DragEvent) {
    event.preventDefault(); // Necessary to allow dropping
  }

  // onDrop(event: DragEvent, rowIndex: number, colIndex: number) {
  //   const itemType = event.dataTransfer?.getData(Item);

  //       if (itemType && !this.hasItemPlaced(itemType)) {
  //           this.currentMap.mapArray[rowIndex][colIndex].item = itemType;
  //           this.itemPlaced.emit(itemType);
  //       }
  // }

  onMouseUp(event: MouseEvent, rowIndex: number, colIndex: number): void {
    this.isLeftClick = false;
    this.isRightClick = false;
    this.wasItemDeleted = false;
}

onMouseOver(rowIndex: number, colIndex: number): void {
  console.log(this.isLeftClick);
  if (this.isLeftClick && this.selectedTileType) {
      this.changeTile(rowIndex, colIndex); // Add tile type while mouse is held down
  } else if (this.isRightClick && !this.wasItemDeleted) {
      this.revertTileToGrass(rowIndex, colIndex);
  }
}

changeTile(rowIndex: number, colIndex: number) {
  if (this.selectedTileType) {
      this.currentMap.mapArray[rowIndex][colIndex].terrain = this.selectedTileType; // Update the tile with the selected type
  }

}

removeItem(rowIndex: number, colIndex: number) {
  this.currentMap.mapArray[rowIndex][colIndex].item = Item.NONE;

}

revertTileToGrass(rowIndex: number, colIndex: number): void {
  this.currentMap.mapArray[rowIndex][colIndex].terrain = TileTerrain.GRASS; // Assuming 'grass' is the default type
}
}
