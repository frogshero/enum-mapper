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
    cname = "EnumMapper";
	originalFrom;
	originalTo;
	
	constructor(props) {
		super(props);
		this.enumValues = require('./data.json');
		
		var defaultMappings = new Map();
		this.originalFrom = this.enumValues.from.map(item => item.name.concat(" " + item.desc)).sort();
		this.originalTo = this.enumValues.to.map(item => item.name.concat(" " + item.desc)).sort();
		let fromNotMatched = this.originalFrom.slice();
		this.originalTo.forEach((item) => {
			var matched = false;
			this.originalFrom.forEach((fromItem) => {
				if (fromItem.split(' ')[0].toUpperCase() === item.split(' ')[0].toUpperCase()) {
					matched = true;
					defaultMappings.set(item, [fromItem]);
					fromNotMatched.splice(fromNotMatched.indexOf(fromItem), 1);
				}
			});
			if (!matched) {
				defaultMappings.set(item, []);
			}
		});

		this.state = {
			mappings: defaultMappings,
			fromNotMatched: fromNotMatched,
			switchStr: ""
			//Array(enumValues.to.length).fill(null)
		};
	}
	
	click() {
		var result = "";
		this.state.mappings.forEach(function(val, key, map){
			if (val.length > 0) {
				val.forEach((item, idx, arr) => {
					result = result.concat("      case ", item.split(' ')[0], ":\n");
				});
				result = result.concat("        return ", key.split(' ')[0], ";\n");
			}
		});
		
		this.setState({switchStr: result})
	}
	
	dropped(fromCol, toCol, dragText, startToIndex, endToIndex) {
		let newMappings = this.state.mappings; //浅复制
		let fromNotMatched = this.state.fromNotMatched;
		if (fromCol === "to") {
			//清除原来的mapping
			let key = this.originalTo[startToIndex];
			let matchedArr = newMappings.get(key);
			if (matchedArr !== null) {
				matchedArr.splice(matchedArr.indexOf(dragText), 1);
			}
		} else {
			fromNotMatched.splice(this.state.fromNotMatched.indexOf(dragText), 1);
		}
		
		if (toCol === "to") {
			var key = this.originalTo[endToIndex];
			if (key === null) {
				return;
			}
			var mapArr = newMappings.get(key);
			if (mapArr == null) {
				newMappings.set(key, [dragText]);
			} else {
				mapArr.push(dragText);
			}
	    } else {
			if (fromNotMatched.indexOf(dragText) < 0) {
			    fromNotMatched.push(dragText);
			}
		}
		
		this.setState({
			mappings: newMappings,
			fromNotMatched: fromNotMatched,
		});
	}
	
	render() {
		return (<div>
			<div className="DDContainer"><div className="To-item">ToEnum</div><div className="To-item">Matched</div><div className="To-item">FromEnum</div></div>
			<EnumGrid fromNotMatched={this.state.fromNotMatched} to={this.originalTo} mappings={this.state.mappings} dropped={(fromCol, toCol, dragText, startToIndex, endToIndex) => this.dropped(fromCol, toCol, dragText, startToIndex, endToIndex)} />
			<button className="button" onClick={(e)=>this.click(e)}>PRINT</button>
			<div />
			<textarea id="result" cols="80" rows="15" value={this.state.switchStr} readOnly></textarea>
		</div>);
	}
}
	
class EnumGrid extends React.Component {
	
	cname = "EnumGrid";
	
	componentDidMount() {
		/*
		let fromEnumName = "com.dianrong.loanapp.common.enums.EducationLevelEnum";
		fetch("http://localhost:9081/v1/enums/" + fromEnumName + "/infoList")
			.then(res=>res.json)
			.then((result) => this.setState({fromValues: result}));
			*/
	}
	
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
		let dragText = dragNode.getAttribute("val");
		var fromNode = dragNode.parentNode;
		var targetNode = ev.target;
		if (targetNode.getAttribute("col") === null) {
			targetNode = targetNode.parentNode;
		}
		if (targetNode.id === dragNode.id || fromNode.id === targetNode.id) {
			return;
		}

        //to列移动到to列，from列移动到from列，from列移动到to列，to列移动到from列 4种情况
		let toCol = targetNode.getAttribute("col");
		let fromCol = fromNode.getAttribute("col");
		//从to列移动出来，to列的索引
		let startToIndex = fromCol === "to" ? fromNode.getAttribute("index") : -1;
		//移动到to列的index
		let endToIndex = toCol === "to" ? targetNode.getAttribute("index") : -1;
		//fromCol, toCol, fromIndex, toStartIndex, toEndIndex
		this.props.dropped(fromCol, toCol, dragText, startToIndex, endToIndex); //
	}
	
	render() {
		var list = [];
		var maxLen = Math.max(this.props.fromNotMatched.length, this.props.to.length);
		for (var i=0; i<maxLen; i++) {
			var fromText = i >= this.props.fromNotMatched.length ? "" : this.props.fromNotMatched[i];
			var toText = i >= this.props.to.length ? "" : this.props.to[i];
			var matchedArr = i >= this.props.to.length ? [] : this.props.mappings.get(this.props.to[i]);
			//list中的元素都得有key, key不能通过getAttribute读取
			list.push(
				<div className="DDContainer" key={"DD" + i}>
					<div className="To-item">{toText}</div>
					<div className="To-item" id={"to" + i} index={i} col="to" onDrop={(e) => this.drop(e)} draggable="false" onDragOver={(e) => this.allowDrop(e)}>
						{
							matchedArr.map((item) => <div className="From-item" id={"from_" + item} key={item} val={item} draggable="true" onDragStart={(e) => this.drag(e)}>{item}</div>)
						}
					</div>
					<div className="From-container" id={"from" + i} col="from" onDrop={(e) => this.drop(e)} onDragOver={(e) => this.allowDrop(e)}>
						<div className="From-item" id={"from_" + fromText} val={fromText} draggable="true" onDragStart={(e) => this.drag(e)}>{fromText}</div>
					</div>
				</div>);
		}
		

		return list;
	}

}



export default App;
