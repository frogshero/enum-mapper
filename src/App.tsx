import React from 'react';
import './App.css';
import { EnumGrid } from './EnumGrid';
import { GridParam, EnumItemInfo, EnumItemMapping, EnumInfoData, MappingState } from './EnumInfo';

const App: React.FC = () => {
  return (
    <div className="App">
	    Enum Mapper
        <EnumMapper />
    </div>
  );
}

class EnumMapper extends React.Component<{}, MappingState> {
  enumValues: EnumInfoData;

  sortByName(arr: EnumItemInfo[]) {
		arr.sort((x, y)=>{
			 if (x.name < y.name) {
				return 1;
			 } else if (x > y) {
				return -1;
			 } else {
				return 0;
			 }
		});
  }
  
  constructor() {
		super({});
		this.enumValues = require('./data.json');
		
		let defaultMappings: EnumItemMapping = {};
		this.sortByName(this.enumValues.from);
		this.enumValues.from = this.enumValues.from.map((val, idx) => { return {name: val.name, desc: val.desc, idx: idx, selected: false, display: val.name.concat(" " + val.desc)}});
		this.sortByName(this.enumValues.to); 
		this.enumValues.to = this.enumValues.to.map((val, idx) => { return {name: val.name, desc: val.desc, idx: idx, selected: false, display: val.name.concat(" " + val.desc)}});
		
		let fromNotMatched = this.enumValues.from.slice();
		this.enumValues.to.forEach((toItem) => {
			var matched = false;
			this.enumValues.from.forEach((fromItem, fromIndex) => {
				if (fromItem.name.toUpperCase() === toItem.name.toUpperCase() || fromItem.desc.toUpperCase() === toItem.desc.toUpperCase()) {
					matched = true;
					defaultMappings[toItem.name] = [fromItem];
					fromNotMatched.splice(fromNotMatched.findIndex((e) => e.name === fromItem.name), 1);
				}
			});
			if (!matched) {
				defaultMappings[toItem.name] = [];
			}
		});

		this.state = {
			mappings: defaultMappings,
			fromNotMatched: fromNotMatched,
			switchStr: ""
			//Array(enumValues.to.length).fill(null)
		};
  }
  
  btnClick() {
		var result = "";
		Object.keys(this.state.mappings).forEach((key) => {
			let arr = this.state.mappings[key];
			if (arr.length > 0) {
				arr.forEach((item) => {
					result = result.concat("      case ", item.name, ":\n");
				});
				result = result.concat("        return ", key, ";\n");
			}
		});
		
		this.setState({switchStr: result})
  }
  
  dropped(fromCol: string, toCol: string, fromIndex: number, startToIndex: number, endToIndex: number) {
		let stateMappings = this.state.mappings;
		let stateNotMatched = this.state.fromNotMatched.slice(); //浅复制
		//var {mappings: stateMappings, fromNotMatched: stateNotMatched} = this.state;
		this.moveItem(stateMappings, stateNotMatched, fromCol, toCol, fromIndex, startToIndex, endToIndex);
		this.setState({mappings: stateMappings, fromNotMatched: stateNotMatched});
  }
  
  private moveItem(stateMappings: EnumItemMapping, stateNotMatched: EnumItemInfo[], fromCol: string, toCol: string, fromIndex: number, startToIndex: number, endToIndex: number) {
		let originalTo = this.enumValues.to;
		let dragItem = this.enumValues.from[fromIndex];
		if (fromCol === "to") {
			//清除原来的mapping
			let key = originalTo[startToIndex].name;
			let matchedArr = stateMappings[key];
			if (matchedArr !== null) {
				matchedArr.splice(matchedArr.findIndex((i) => i.idx === fromIndex), 1);
			}
		} else {
			stateNotMatched.splice(stateNotMatched.findIndex((i) => i.idx === fromIndex), 1);
		}
		
		if (toCol === "to") {
			var key = originalTo[endToIndex].name;
			if (key === null) {
				return;
			}
			var mapArr = stateMappings[key];
			dragItem.selected = false;
			if (mapArr == null) {
				stateMappings[key] = [dragItem]
			} else {
				mapArr.push(dragItem);
			}
	    } else {
			stateNotMatched.push(dragItem);
		}
  }
  
  itemClick(e: React.MouseEvent) {
		if (!e.ctrlKey) return;

		let clickNode = e.currentTarget as HTMLElement;
		if (clickNode.getAttribute("col") === null) {
			if (clickNode.parentNode === null) {
				throw new Error("click element has not container");
			} else {
				clickNode = clickNode.parentNode as HTMLElement;
			}
		}
		let toCol = clickNode.getAttribute("col");
		if (!e.shiftKey) {
			//选取
			if (toCol === "to") return;
			let fromIdx = e.currentTarget.getAttribute("index");
			if (isNaN(Number(fromIdx))) {
				throw new Error("click node has no index");
			}
			let fromIndex = Number(fromIdx);
			let notMatchedArr = this.state.fromNotMatched;
			let clickItem = notMatchedArr.find((e) => e.idx === fromIndex);
			clickItem!.selected = !clickItem!.selected;
			this.setState({fromNotMatched: notMatchedArr});
		} else {
			//释放
			if (toCol === "from") return;
			let toIdx = clickNode.getAttribute("index");
			if (isNaN(Number(toIdx))) {
				throw new Error("click move node has no index");
			}
			//from -> to
			var {mappings: stateMappings, fromNotMatched: stateNotMatched} = this.state;
			let selectedItem = this.state.fromNotMatched.filter((e)=> e.selected === true);
			selectedItem.forEach((val) => {
				if (val.selected) {
					this.moveItem(stateMappings, stateNotMatched, "from", "to", val.idx, -1, Number(toIdx));
				}
			});
			this.setState({mappings: stateMappings, fromNotMatched: stateNotMatched});
		}

	}
	
	render() {
		let gridParam: GridParam = {
			fromNotMatched: this.state.fromNotMatched,
			to: this.enumValues.to,
			mappings: this.state.mappings,
			dropped: (fromCol: string, toCol: string, fromIndex: number, startToIndex: number, endToIndex: number) => this.dropped(fromCol, toCol, fromIndex, startToIndex, endToIndex),
			itemClick: (e: any) => this.itemClick(e)
		}
	
		return (<div>
			<div className="DDContainer"><div className="To-item">ToEnum</div><div className="To-item">Matched</div><div className="To-item">FromEnum</div></div>
			<EnumGrid fromNotMatched = {gridParam.fromNotMatched} to={gridParam.to} mappings={gridParam.mappings} dropped={gridParam.dropped} itemClick={gridParam.itemClick}/>
			<button className="button" onClick={()=>this.btnClick()}>PRINT</button>
			<div />
			<textarea id="result" cols={80} rows={15} value={this.state.switchStr} readOnly></textarea>
		</div>);
	}
}


export default App;