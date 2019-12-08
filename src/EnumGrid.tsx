import React from 'react';
import {GridParam, FromToColumn} from './EnumInfo';
import ItemContainer from './ItemContainer';
// declare module 'react' {
//     interface HTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {
//       dataIndex?: number;
//       dataCol?: "from" | "to";
//     }
// }

export default function EnumGrid(props: GridParam) {
	var list = [];
	let {fromNotMatched: notMatchedArr, to: toArr, mappings: matchedMappings} = props;
	var maxLen = Math.max(notMatchedArr.length, toArr.length);
	for (var i=0; i<maxLen; i++) {
		let fromItem = i >= notMatchedArr.length ? [] : [notMatchedArr[i]];
		let toText = i >= toArr.length ? "" : toArr[i].display;
		
		var matchedArr = i >= toArr.length ? [] : matchedMappings[toArr[i].name];
		//list中的元素都得有key, key不能通过getAttribute读取
		list.push(
			<div className="DDContainer" key={"DD" + i}>
				<div className="To-item">{toText}</div>

				<ItemContainer rowIdx={i} 
					col={FromToColumn.to} 
					items={matchedArr} 
					setItemSelected={props.setItemSelected} 
					containerDrop={props.containerDrop} 
					containerClick={props.containerClick}/>

				<ItemContainer rowIdx={i} 
					col={FromToColumn.from} 
					items={fromItem} 
					setItemSelected={props.setItemSelected} 
					containerDrop={props.containerDrop} 
					containerClick={props.containerClick}/>
			</div>);
	}
	return <div>{list}</div>;

}
