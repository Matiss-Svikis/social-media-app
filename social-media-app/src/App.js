import './App.css';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
//pages
import home from "./pages/home"
import login from "./pages/login"
import signup from "./pages/signup"

//componente
import Navbar from './components/Navbar';


function App() {
  return (
    <div className="App">
      <Router>
        <Navbar />
        <div className="container">
          <Switch>
            <Route exact path="/" component={home} />
            <Route exact path="/login" component={login} />
            <Route exact path="/signup" component={signup} />
          </Switch>
        </div>
      </Router>
    </div>
  );
}

export default App;
