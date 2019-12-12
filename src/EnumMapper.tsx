import React from 'react';
import EnumGrid from './EnumGrid';
import { EnumItemInfo, EnumInfoData, MappingState, FromToColumn, DragStartInfo } from './EnumInfo';
import get from './RequestHelper';
// this.enumValues = require('./data.json');
// import EnumSource from './data.json';

export default class EnumMapper extends React.Component<{}, MappingState> {
	loadedValues: EnumInfoData = {from: [], to: []};

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

		this.state = {
			fromEnumClz: "com.dianrong.loanapp.common.enums.EducationLevelEnum",
			toEnumClz: "com.dianrong.loanapp.app.domain.enums.assist.AssistEducationDegreeEnum",
			enumValues: {from: [], to: []},
			mappings: [],
			fromNotMatched: [],
			switchStr: ""
			//Array(enumValues.to.length).fill(null)
		};
	}

	componentDidMount = () => {
		let getFromUri = `enums/${this.state.fromEnumClz}/itemList`;
		let getToUri = `enums/${this.state.toEnumClz}/itemList`;

		this.loadedValues = {from: [], to: []};
		get(getFromUri).then((data: any) => {
			if (data) {
				this.loadedValues.from = data;
				this.updateEnum(this.loadedValues);
			}
		});
		get(getToUri).then((data: any) => {
			if (data) {
				this.loadedValues.to = data;
				this.updateEnum(this.loadedValues);
			}
		});
	}
    
    updateEnum(loadedValues: EnumInfoData) {
		//this.enumValues = require('./data.json');
		if (loadedValues.from.length === 0 || loadedValues.to.length === 0) return;

		loadedValues.from = loadedValues.from.map((val, idx) => { return { name: val.name, desc: val.desc, idx: idx, selected: false, display: val.name.concat(" " + val.desc) } });
		this.sortByName(loadedValues.from);
		loadedValues.to = loadedValues.to.map((val, idx) => { return { name: val.name, desc: val.desc, idx: idx, selected: false, display: val.name.concat(" " + val.desc) } });
		this.sortByName(loadedValues.to);

		let defaultMappings: EnumItemInfo[][] = new Array(loadedValues.to.length).fill([]);
		let fromNotMatched = loadedValues.from.slice();
		loadedValues.to.forEach((toItem) => {
			var matched = false;
			loadedValues.from.forEach((fromItem, fromIndex) => {
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

		this.setState({
			enumValues: loadedValues,
			mappings: defaultMappings,
			fromNotMatched: fromNotMatched,
			switchStr: ""
			//Array(enumValues.to.length).fill(null)
		});
	}

	btnClick() {
		var result = "";
		// Object.keys(this.state.mappings).forEach((key) => {
		this.state.mappings.forEach((matchedArr, idx) => {
			if (matchedArr.length > 0) {
				matchedArr.forEach((item) => {
					result = result.concat("      case ", item.name, ":\n");
				});
				result = result.concat("        return ", this.state.enumValues.to[idx].name, ";\n");
			}
		});

		this.setState({ switchStr: result })
	}

	containerDrop = (dragStartInfo: DragStartInfo, targetCol: FromToColumn, targetRowIdx: number) => {
		if ((dragStartInfo.col === targetCol && dragStartInfo.rowIdx === targetRowIdx)  //实际没动
			|| (targetCol === FromToColumn.from && dragStartInfo.col === FromToColumn.from)  //from => from 
			|| (targetCol === FromToColumn.to && targetRowIdx >= this.state.enumValues.to.length) //超过了To列的最大长度，不能移动
			) {
			return;
		}

		let stateMappings = this.state.mappings;
		let stateNotMatched = this.state.fromNotMatched.slice(); //浅复制
		//var {mappings: stateMappings, fromNotMatched: stateNotMatched} = this.state;
		this.moveItem(stateMappings, stateNotMatched, dragStartInfo.col, targetCol, dragStartInfo.fromArrIdx, dragStartInfo.rowIdx, targetRowIdx);
		this.setState({ mappings: stateMappings, fromNotMatched: stateNotMatched });
	}

	private moveItem(stateMappings: EnumItemInfo[][], stateNotMatched: EnumItemInfo[], fromCol: FromToColumn, toCol: FromToColumn, fromIndex: number, startToIndex: number, endToIndex: number) {
		let dragItem = this.state.enumValues.from[fromIndex];
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
		if (rowIdx >= this.state.enumValues.to.length) {
			return;
		}
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

	enumChange = () => {}

	render() {
		return (
		<div className = "Main-Grid">
			Enum Mapper
			<div>&nbsp;</div>
			<div className="DDContainer"><input className="Input-Item" onChange={this.enumChange} value={this.state.fromEnumClz}/></div>
			<div className="DDContainer"><input className="Input-Item" onChange={this.enumChange} value={this.state.toEnumClz}/></div>
			<div>&nbsp;</div>
			<div className="DDContainer"><div className="To-item">ToEnum</div><div className="To-item">Matched</div><div className="To-item">FromEnum</div></div>
			<EnumGrid fromNotMatched={this.state.fromNotMatched} to={this.state.enumValues.to} mappings={this.state.mappings}
				containerDrop={this.containerDrop}
				containerClick={this.containerClick}
				setItemSelected={this.setItemSelected} 
				/>
			<button className="button" onClick={() => this.btnClick()}>PRINT</button>
			<div />
			<textarea id="result" cols={80} rows={15} value={this.state.switchStr} readOnly></textarea>
		</div>
		);
	}
}
