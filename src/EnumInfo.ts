export interface EnumItemInfo {name: string, desc: string, idx: number, selected: boolean, display: string}
export interface EnumInfoData {from: EnumItemInfo[], to: EnumItemInfo[]}
export interface EnumItemMapping {[key: string]: EnumItemInfo[]}
export interface MappingState {mappings: EnumItemMapping, fromNotMatched: EnumItemInfo[], switchStr: string}
export interface GridParam {
    fromNotMatched: EnumItemInfo[],
    to: EnumItemInfo[],
    mappings: EnumItemMapping,
    dropped: (fromCol: string, toCol: string, fromIndex: number, startToIndex: number, endToIndex: number) => void,
    itemClick: (e: any) => void
}
export interface ContainerProps { index: number }

// interface EnumItem {name: string, desc: string}
// interface MoveFunc {(fromCol: string, toCol: string, fromIndex: number, startToIndex: number, endToIndex: number): void}