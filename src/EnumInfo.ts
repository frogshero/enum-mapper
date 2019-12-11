export interface EnumItemInfo {name: string, desc: string, idx: number, selected: boolean, display: string}
export interface EnumInfoData {from: EnumItemInfo[], to: EnumItemInfo[]}
// export interface EnumItemMapping {[key: number]: EnumItemInfo[]}
export interface MappingState {	
    fromEnumClz: string,
    toEnumClz: string,
    enumValues: EnumInfoData, 
    mappings: EnumItemInfo[][], 
    fromNotMatched: EnumItemInfo[], 
    switchStr: string}
export interface GridParam {
    fromNotMatched: EnumItemInfo[],
    to: EnumItemInfo[],
    mappings: EnumItemInfo[][],
    containerDrop(dragStartInfo: DragStartInfo, targetCol: FromToColumn, targetRowIdx: number): void,
    setItemSelected(item: number): void,
    containerClick(col: FromToColumn, rowIdx: number): void
}
export interface ContainerProps { index: number }

export interface MoveColInfo {col: FromToColumn, index: number}
export interface MoveParam {itemIndex: number, fromColInfo: MoveColInfo, toColInfo: MoveColInfo};

export enum FromToColumn { from = "from", to = "to"}

export interface DragStartInfo {fromArrIdx: number, rowIdx: number, col: FromToColumn}

export interface ContainerParam {
    rowIdx: number, 
    col: FromToColumn, 
    items: EnumItemInfo[],
    setItemSelected(idx: number): void,
    containerDrop(dragStartInfo: DragStartInfo, targetCol: FromToColumn, targetRowIdx: number): void,
    containerClick(col: FromToColumn, rowIdx: number): void}

export interface DragItemParam {
    itemInfo: EnumItemInfo,
    dragStart(e: React.DragEvent, fromIdx: number): void
    // dropAtItem(e: React.DragEvent): void,
    itemClick(e: React.MouseEvent, fromIdx: number): void
}
