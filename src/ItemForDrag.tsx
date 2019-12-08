import React from 'react';
import {DragItemParam} from './EnumInfo'

export default class ItemForMapping extends React.Component<DragItemParam> {
    allowDrop = (ev: React.DragEvent) => {
		ev.preventDefault();
    }

    render() {
        let itemInfo = this.props.itemInfo;
        return <div className={itemInfo.selected ? "From-item-SEL" : "From-item"} 
            onClick={(e)=>this.props.itemClick(e, this.props.itemInfo.idx)} 
            draggable="true" 
            onDragStart={(e)=>this.props.dragStart(e, this.props.itemInfo.idx)}>
            {itemInfo.display}</div>;
    }
}