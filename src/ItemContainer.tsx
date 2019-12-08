import React from 'react';
import {ContainerParam, DragStartInfo, FromToColumn} from './EnumInfo'
import ItemForDrag from './ItemForDrag'

export default class ItemContaner extends React.Component<ContainerParam> {
	allowDrop = (ev: React.DragEvent) => {
		ev.preventDefault();
    }
    
    dragStart = (e: React.DragEvent, fromIdx: number) => {
        let dragStartInfo: DragStartInfo = {fromArrIdx: fromIdx, rowIdx: this.props.rowIdx, col: this.props.col};
		e.dataTransfer.setData("text/plain", JSON.stringify(dragStartInfo));
    }

    containerClick = (e: React.MouseEvent) => {
        if (this.props.col == FromToColumn.from) return;
        this.props.containerClick(this.props.col, this.props.rowIdx);
    }

    containerDrop = (e: React.DragEvent) => {
        //利用事件冒泡，只在container处理
        e.preventDefault();

        let data = e.dataTransfer.getData("text/plain");
        let dragStartInfo = JSON.parse(data) as DragStartInfo;
        this.props.containerDrop(dragStartInfo, this.props.col, this.props.rowIdx);
    }


    itemClick = (e: React.MouseEvent, fromArrIdx: number) => {
        e.stopPropagation(); //阻止事件冒泡

        if (!e.ctrlKey) return;

		if (!e.shiftKey) {
			//选取
			if (this.props.col === FromToColumn.to) return;
			this.props.setItemSelected(fromArrIdx);
		} else {
            //释放
			this.containerClick(e);
		}
    }

    render() {
        return (<div className="To-item" onDrop={this.containerDrop} onClick={this.containerClick} draggable="false" onDragOver={this.allowDrop}>
            {
                this.props.items.map((item) => 
                    <ItemForDrag 
                        key={this.props.col + this.props.rowIdx} 
                        itemInfo={item} 
                        dragStart={this.dragStart} 
                        itemClick={this.itemClick}
                    />)
            }
        </div>);
    }
}
    
