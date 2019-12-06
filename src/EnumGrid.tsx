import React from 'react';
import {GridParam} from './EnumInfo';
  
declare module 'react' {
    interface HTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {
      index?: number;
      col?: string;
    }
}

export class EnumGrid extends React.Component<GridParam> {
	
	componentDidMount() {}
	
	allowDrop(ev: any) {
		ev.preventDefault();
	}
	
	drag(ev: any) {
		ev.dataTransfer.setData("text/plain", ev.target.id);
	}
	
	drop(ev: any) {
		ev.preventDefault();
		let dragElementId: string = ev.dataTransfer.getData("text");
    	let dragNode = document.getElementById(dragElementId); 
    	if (dragNode === null) throw new Error(`Cannot find drag node '${dragNode}'.`);

        let fromIndex = dragNode.getAttribute("index");
        if (!fromIndex) {
            console.error(dragNode);
            throw new Error("dragNode has no index");
        }
    	var fromNode = dragNode.parentNode as HTMLElement;
    	if (fromNode === null) throw new Error(`Dragged Node should have parent node!`)

		var targetNode = ev.target;
		if (targetNode.getAttribute("col") === null) {
			targetNode = targetNode.parentNode;
    	}
    
		if (targetNode.id === dragNode.id || fromNode.id === targetNode.id || (targetNode.getAttribute("col") === "from" && fromNode.getAttribute("col") === "from")) {
			return;
		}

        //to列移动到to，from列移动到to列，to列移动到from列 3种情况, from列移动到from列不需要处理
		let toCol = targetNode.getAttribute("col");
		let fromCol = fromNode.getAttribute("col");
		if (!fromCol || !toCol) {
			console.error(fromCol);
			console.error(toCol);
			throw new Error("col not correct!");
		}
		//从to列移动出来，to列的索引
		let fromIdx: any = fromNode.getAttribute("index");
		let toIdx: any = targetNode.getAttribute("index");
		let startToIndex = -1;
		let endToIndex = -1;
		if (fromCol === "to") {
			if (!fromIdx) {
				console.error(fromNode);
				throw new Error("fromIdx not correct!");
			} else {
				startToIndex = fromIdx;
			}
		}
		if (toCol === "to") {
			if (!toIdx) {
				console.error(targetNode);
				throw new Error("toIdx not correct!");
			} else {
				endToIndex = toIdx;
			}
		}

		this.props.dropped(fromCol, toCol, Number(fromIndex), startToIndex, endToIndex); //
	}
	
	render() {
		var list = [];
		let {fromNotMatched: notMatchedArr, to: toArr, mappings: matchedMappings, itemClick: fromItemClick} = this.props;
		var maxLen = Math.max(notMatchedArr.length, toArr.length);
		for (var i=0; i<maxLen; i++) {
			let fromItem = i >= notMatchedArr.length ? null : notMatchedArr[i];
			let toText = i >= toArr.length ? "" : toArr[i].display;
			
			var matchedArr = i >= toArr.length ? [] : matchedMappings[toArr[i].name];
			//list中的元素都得有key, key不能通过getAttribute读取
			list.push(
				<div className="DDContainer" key={"DD" + i}>
					<div className="To-item">{toText}</div>
					<div className="To-item" id={"to" + i} index={i} col="to" onDrop={(e) => this.drop(e)} onClick={fromItemClick} draggable="false" onDragOver={(e) => this.allowDrop(e)}>
						{
							matchedArr.map((item) => <div className={item.selected ? "From-item-SEL" : "From-item"} key={"from_" + item.name} id={"from_" + item.name} index={item.idx} onClick={fromItemClick} draggable="true" onDragStart={(e) => this.drag(e)}>{item.display}</div>)
						}
					</div>
					<div className="From-container" id={"from" + i} col="from" onDrop={(e) => this.drop(e)} onDragOver={(e) => this.allowDrop(e)}>
						{fromItem != null &&
							<div className={fromItem.selected ? "From-item-SEL" : "From-item"} id={"from_" + fromItem.name} index={fromItem.idx} onClick={fromItemClick} draggable="true" onDragStart={(e) => this.drag(e)}>{fromItem.display}</div>
						}
					</div>
				</div>);
		}
		

		return list;
	}

}
