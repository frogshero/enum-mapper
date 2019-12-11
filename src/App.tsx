import React from 'react';
import './App.css';
import EnumMapper from './EnumMapper';
import {
	BrowserRouter as Router,
	Route,
	Switch
  } from 'react-router-dom';

const App: React.FC = () => {
	return (
		<div className="App">
			<Router>
			<div>
			<Switch>
				<Route path="/data.json">
					<Users />
				</Route>
				<Route path="/">
					<EnumMapper />
				</Route>
			</Switch>
			</div>
			</Router>
		</div>
	);
}

function Users() {
	return <h2>Users</h2>;
}

export default App;
