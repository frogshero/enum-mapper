import React from 'react';
import './App.css';


function App() {
  
  return (
    <div className="App">
	    Enum Mapper
        <EnumMapper />
    </div>
  );
}

class EnumMapper extends React.Component {
	
	constructor(props) {
		super(props);
		this.enumValues = require('./data.json');
		
		var defaultMappings = new Map();
		this.sortByName(this.enumValues.from);
		this.enumValues.from = this.enumValues.from.map((val, idx) => { return {name: val.name, desc: val.desc, idx: idx, selected: false, display: val.name.concat(" " + val.desc)}});
		this.sortByName(this.enumValues.to); 
		this.enumValues.to = this.enumValues.to.map((val, idx) => { return {name: val.name, desc: val.desc, idx: idx, display: val.name.concat(" " + val.desc)}});
		
		let fromNotMatched = this.enumValues.from.slice();
		this.enumValues.to.forEach((toItem) => {
			var matched = false;
			this.enumValues.from.forEach((fromItem, fromIndex) => {
				if (fromItem.name.toUpperCase() === toItem.name.toUpperCase() || fromItem.desc.toUpperCase() === toItem.desc.toUpperCase()) {
					matched = true;
					defaultMappings.set(toItem.name, [fromItem]);
					fromNotMatched.splice(fromNotMatched.findIndex((e) => e.name === fromItem.name), 1);
				}
			});
			if (!matched) {
				defaultMappings.set(toItem.name, []);
			}
		});

		this.state = {
			mappings: defaultMappings,
			fromNotMatched: fromNotMatched,
			switchStr: ""
			//Array(enumValues.to.length).fill(null)
		};
	}
	
	sortByName(arr) {
		arr.sort((x, y)=>{
			 if (x < y) {
				return 1;
			 } else if (x > y) {
				return -1;
			 } else {
				return 0;
			 }
		});
	}
	
	selectFromItem(fromText) {
		
	}
	
	btnClick() {
		var result = "";
		this.state.mappings.forEach(function(val, key){
			if (val.length > 0) {
				val.forEach((item) => {
					result = result.concat("      case ", item.name, ":\n");
				});
				result = result.concat("        return ", key, ";\n");
			}
		});
		
		this.setState({switchStr: result})
	}
	
	dropped(fromCol, toCol, fromIndex, startToIndex, endToIndex) {
		var {mappings: stateMappings, fromNotMatched: stateNotMatched} = this.state;
		this.moveItem(stateMappings, stateNotMatched, fromCol, toCol, fromIndex, startToIndex, endToIndex);
		this.setState({mappings: stateMappings, fromNotMatched: stateNotMatched});
	}
	
	moveItem(stateMappings, stateNotMatched, fromCol, toCol, fromIndex, startToIndex, endToIndex) {
		let originalTo = this.enumValues.to;
		let dragItem = this.enumValues.from[fromIndex];
		if (fromCol === "to") {
			//清除原来的mapping
			let key = originalTo[startToIndex].name;
			let matchedArr = stateMappings.get(key);
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
			var mapArr = stateMappings.get(key);
			dragItem.selected = false;
			if (mapArr == null) {
				stateMappings.set(key, [dragItem]);
			} else {
				mapArr.push(dragItem);
			}
	    } else {
			stateNotMatched.push(dragItem);
		}
	}
	
	itemClick(e) {
		if (!e.ctrlKey) return;

		let clickNode = e.target;
		if (clickNode.getAttribute("col") === null) {
			clickNode = clickNode.parentNode;
		}
		let toCol = clickNode.getAttribute("col");
		if (!e.shiftKey) {
			//选取
			if (toCol === "to") return;
			let fromIndex = Number(e.target.getAttribute("idx"));
			let notMatchedArr = this.state.fromNotMatched;
			let clickItem = notMatchedArr.find((e) => e.idx === fromIndex);
			clickItem.selected = !clickItem.selected;
			this.setState({fromNotMatched: notMatchedArr});
		} else {
			//释放
			if (toCol === "from") return;
			let toIdx = clickNode.getAttribute("index");
			//from -> to
			var {mappings: stateMappings, fromNotMatched: stateNotMatched} = this.state;
			let selectedItem = this.state.fromNotMatched.filter((e)=> e.selected === true);
			selectedItem.forEach((val) => {
				if (val.selected) {
					this.moveItem(stateMappings, stateNotMatched, "from", "to", val.idx, -1, toIdx);
				}
			});
			this.setState({mappings: stateMappings, fromNotMatched: stateNotMatched});
		}

	}
	
	render() {
		let gridParam = {
			fromNotMatched: this.state.fromNotMatched,
			to: this.enumValues.to,
			mappings: this.state.mappings,
			dropped: (fromCol, toCol, fromIndex, startToIndex, endToIndex) => this.dropped(fromCol, toCol, fromIndex, startToIndex, endToIndex),
			itemClick: (e) => this.itemClick(e)
		}
	
		return (<div>
			<div className="DDContainer"><div className="To-item">ToEnum</div><div className="To-item">Matched</div><div className="To-item">FromEnum</div></div>
			<EnumGrid gridParam = {gridParam} />
			<button className="button" onClick={(e)=>this.btnClick(e)}>PRINT</button>
			<div />
			<textarea id="result" cols="80" rows="15" value={this.state.switchStr} readOnly></textarea>
		</div>);
	}
}
	
class EnumGrid extends React.Component {
	
	componentDidMount() {}
	
	allowDrop(ev) {
		ev.preventDefault();
	}
	
	drag(ev) {
		ev.dataTransfer.setData("text/plain", ev.target.id);
	}
	
	drop(ev) {
		ev.preventDefault();
		var dragElementId = ev.dataTransfer.getData("text");
		var dragNode = document.getElementById(dragElementId); 
		let fromIndex = Number(dragNode.getAttribute("idx"));
		var fromNode = dragNode.parentNode;
		var targetNode = ev.target;
		if (targetNode.getAttribute("col") === null) {
			targetNode = targetNode.parentNode;
		}
		if (targetNode.id === dragNode.id || fromNode.id === targetNode.id || (targetNode.getAttribute("col") === "from" && dragNode.parentNode.getAttribute("col") === "from")) {
			return;
		}

        //to列移动到to，from列移动到to列，to列移动到from列 3种情况, from列移动到from列不需要处理
		let toCol = targetNode.getAttribute("col");
		let fromCol = fromNode.getAttribute("col");
		//从to列移动出来，to列的索引
		let startToIndex = fromCol === "to" ? fromNode.getAttribute("index") : -1;
		//移动到to列的index
		let endToIndex = toCol === "to" ? targetNode.getAttribute("index") : -1;
		//fromCol, toCol, fromIndex, toStartIndex, toEndIndex
		this.props.gridParam.dropped(fromCol, toCol, fromIndex, startToIndex, endToIndex); //
	}
	
	render() {
		var list = [];
		let {fromNotMatched: notMatchedArr, to: toArr, mappings: matchedMappings, itemClick: fromItemClick} = this.props.gridParam;
		var maxLen = Math.max(notMatchedArr.length, toArr.length);
		for (var i=0; i<maxLen; i++) {
			let fromItem = i >= notMatchedArr[i] ? null : notMatchedArr[i];
			let toText = i >= toArr.length ? "" : toArr[i].display;
			
			var matchedArr = i >= toArr.length ? [] : matchedMappings.get(toArr[i].name);
			//list中的元素都得有key, key不能通过getAttribute读取
			list.push(
				<div className="DDContainer" key={"DD" + i}>
					<div className="To-item">{toText}</div>
					<div className="To-item" id={"to" + i} index={i} col="to" onDrop={(e) => this.drop(e)} onClick={fromItemClick} draggable="false" onDragOver={(e) => this.allowDrop(e)}>
						{
							matchedArr.map((item) => <div className={item.selected ? "From-item-SEL" : "From-item"} key={"from_" + item.name} id={"from_" + item.name} idx={item.idx} onClick={fromItemClick} draggable="true" onDragStart={(e) => this.drag(e)}>{item.display}</div>)
						}
					</div>
					<div className="From-container" id={"from" + i} col="from" onDrop={(e) => this.drop(e)} onDragOver={(e) => this.allowDrop(e)}>
						{fromItem != null &&
							<div className={fromItem.selected ? "From-item-SEL" : "From-item"} id={"from_" + fromItem.name} idx={fromItem.idx} onClick={fromItemClick} draggable="true" onDragStart={(e) => this.drag(e)}>{fromItem.display}</div>
						}
					</div>
				</div>);
		}
		

		return list;
	}

}


export default App;
