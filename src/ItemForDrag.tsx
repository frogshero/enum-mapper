import React from 'react';
import {DragItemParam} from './EnumInfo'

const ItemForMapping = (props: DragItemParam) => {
        let itemInfo = props.itemInfo;
        return <div className={itemInfo.selected ? "From-item From-item-selected" : "From-item"} 
              onClick={(e)=> props.itemClick(e, itemInfo.idx)} 
              draggable="true" 
              onDragStart={(e)=>props.dragStart(e, itemInfo.idx)}>
              {itemInfo.display}
            </div>;
}

export default ItemForMapping;