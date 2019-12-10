import React from 'react';
import {ContainerParam, DragStartInfo, FromToColumn} from './EnumInfo'
import ItemForDrag from './ItemForDrag'

const ItemContaner = (props: ContainerParam) => {
    let dragStart = (e: React.DragEvent, fromIdx: number) => {
        let dragStartInfo: DragStartInfo = {fromArrIdx: fromIdx, rowIdx: props.rowIdx, col: props.col};
		e.dataTransfer.setData("text/plain", JSON.stringify(dragStartInfo));
    }

    let containerClick = (e: React.MouseEvent) => {
        if (props.col === FromToColumn.from) return;
        props.containerClick(props.col, props.rowIdx);
    }

    let containerDrop = (e: React.DragEvent) => {
        //利用事件冒泡，只在container处理
        e.preventDefault();

        let data = e.dataTransfer.getData("text/plain");
        let dragStartInfo = JSON.parse(data) as DragStartInfo;
        props.containerDrop(dragStartInfo, props.col, props.rowIdx);
    }


    let itemClick = (e: React.MouseEvent, fromArrIdx: number) => {
        e.stopPropagation(); //阻止事件冒泡

        if (!e.ctrlKey) return;

		if (!e.shiftKey) {
			//选取
			if (props.col === FromToColumn.to) return;
			props.setItemSelected(fromArrIdx);
		} else {
            //释放
			containerClick(e);
		}
    }

    return (<div className="To-item" onDrop={containerDrop} onClick={containerClick} draggable="false" onDragOver={(e)=>e.preventDefault()}>
        {
            props.items.map((item) => 
                <ItemForDrag 
                    key={props.col + props.rowIdx} 
                    itemInfo={item} 
                    dragStart={dragStart} 
                    itemClick={itemClick}
                />)
        }
    </div>);
}
    
export default ItemContaner;
