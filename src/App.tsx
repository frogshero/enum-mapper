import React from 'react';
import './App.css';
import EnumGrid from './EnumGrid';
import { EnumItemInfo, EnumInfoData, MappingState, FromToColumn, DragStartInfo } from './EnumInfo';
// this.enumValues = require('./data.json');
import EnumSource from './data.json';

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
		arr.sort((x, y) => {
			if (x.name < y.name) {
				return 1;
			} else if (x > y) {
				return -1;
			} else {
				return 0;
			}
		});
	}

	constructor(props: any) {
		super(props);
		//this.enumValues = require('./data.json');
		this.enumValues = { from: [], to: [] };
		this.enumValues.from = EnumSource.from.map((val, idx) => { return { name: val.name, desc: val.desc, idx: idx, selected: false, display: val.name.concat(" " + val.desc) } });
		this.sortByName(this.enumValues.from);
		this.enumValues.to = EnumSource.to.map((val, idx) => { return { name: val.name, desc: val.desc, idx: idx, selected: false, display: val.name.concat(" " + val.desc) } });
		this.sortByName(this.enumValues.to);

		let defaultMappings: EnumItemInfo[][] = new Array(this.enumValues.to.length).fill([]);
		let fromNotMatched = this.enumValues.from.slice();
		this.enumValues.to.forEach((toItem) => {
			var matched = false;
			this.enumValues.from.forEach((fromItem, fromIndex) => {
				if (fromItem.name.toUpperCase() === toItem.name.toUpperCase() || fromItem.desc.toUpperCase() === toItem.desc.toUpperCase()) {
					matched = true;
					defaultMappings[toItem.idx] = [fromItem];
					fromNotMatched.splice(fromNotMatched.findIndex((e) => e.name === fromItem.name), 1);
				}
			});
			if (!matched) {
				defaultMappings[toItem.idx] = [];
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
		// Object.keys(this.state.mappings).forEach((key) => {
		this.state.mappings.forEach((matchedArr, idx) => {
			if (matchedArr.length > 0) {
				matchedArr.forEach((item) => {
					result = result.concat("      case ", item.name, ":\n");
				});
				result = result.concat("        return ", this.enumValues.to[idx].name, ";\n");
			}
		});

		this.setState({ switchStr: result })
	}

	containerDrop = (dragStartInfo: DragStartInfo, targetCol: FromToColumn, targetRowIdx: number) => {
		if ((dragStartInfo.col === targetCol && dragStartInfo.rowIdx === targetRowIdx)  //实际没动
			|| (targetCol === FromToColumn.from && dragStartInfo.col === FromToColumn.from)  //from => from 
			|| (targetCol === FromToColumn.to && targetRowIdx >= this.enumValues.to.length) //超过了To列的最大长度，不能移动
			)
		{
			return;
		}

		let stateMappings = this.state.mappings;
		let stateNotMatched = this.state.fromNotMatched.slice(); //浅复制
		//var {mappings: stateMappings, fromNotMatched: stateNotMatched} = this.state;
		this.moveItem(stateMappings, stateNotMatched, dragStartInfo.col, targetCol, dragStartInfo.fromArrIdx, dragStartInfo.rowIdx, targetRowIdx);
		this.setState({ mappings: stateMappings, fromNotMatched: stateNotMatched });
	}

	private moveItem(stateMappings: EnumItemInfo[][], stateNotMatched: EnumItemInfo[], fromCol: FromToColumn, toCol: FromToColumn, fromIndex: number, startToIndex: number, endToIndex: number) {
		let dragItem = this.enumValues.from[fromIndex];
		if (fromCol === FromToColumn.to) {
			//清除原来的mapping
			let matchedArr = stateMappings[startToIndex];
			matchedArr.splice(matchedArr.findIndex((i) => i.idx === fromIndex), 1);
		} else {
			stateNotMatched.splice(stateNotMatched.findIndex((i) => i.idx === fromIndex), 1);
		}

		if (toCol === FromToColumn.to) {
			dragItem.selected = false;
			stateMappings[endToIndex].push(dragItem);
		} else {
			stateNotMatched.push(dragItem);
		}
	}

	setItemSelected = (idx: number) => {
		let notMatchedArr = this.state.fromNotMatched;
		let clickItem = notMatchedArr.find((e) => e.idx === idx);
		clickItem!.selected = !clickItem!.selected;
		this.setState({ fromNotMatched: notMatchedArr });
	}

	containerClick = (col: FromToColumn, rowIdx: number) => {
		//多选只能这样移动：from -> to
		var { mappings: stateMappings, fromNotMatched: stateNotMatched } = this.state;
		let selectedItem = this.state.fromNotMatched.filter((e) => e.selected === true);
		selectedItem.forEach((val) => {
			if (val.selected) {
				this.moveItem(stateMappings, stateNotMatched, FromToColumn.from, FromToColumn.to, val.idx, -1, rowIdx);
			}
		});
		this.setState({ mappings: stateMappings, fromNotMatched: stateNotMatched });
	}

	render() {
		return (<div>
			<div className="DDContainer"><div className="To-item">ToEnum</div><div className="To-item">Matched</div><div className="To-item">FromEnum</div></div>
			<EnumGrid fromNotMatched={this.state.fromNotMatched} to={this.enumValues.to} mappings={this.state.mappings}
				containerDrop={this.containerDrop}
				containerClick={this.containerClick}
				setItemSelected={this.setItemSelected} 
				/>
			<button className="button" onClick={() => this.btnClick()}>PRINT</button>
			<div />
			<textarea id="result" cols={80} rows={15} value={this.state.switchStr} readOnly></textarea>
		</div>);
	}
}


export default App;
