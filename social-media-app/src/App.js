import './App.css';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import { ThemeProvider as MuiThemeProvider } from '@material-ui/core/styles';
import createMuiTheme from '@material-ui/core/styles/createMuiTheme';
import { Provider } from 'react-redux';
import store from './redux/store';
//pages
import home from "./pages/home"
import login from "./pages/login"
import signup from "./pages/signup"

//componente
import Navbar from './components/Navbar';
import themeFile from './util/theme';
import AuthRoute from './util/AuthRoute';

import jwtDecode from 'jwt-decode';
import { Component } from 'react';
import { Redirect } from "react-router-dom";

import { SET_AUTHENTICATED } from './redux/types';
import { logoutUser, getUserData } from './redux/actions/userActions';
import axios from 'axios';

const theme = createMuiTheme(themeFile);
const token = localStorage.FBIdToken;
if (token) {
  const decodedToken = jwtDecode(token);

  if (decodedToken.exp * 1000 < Date.now()) {
    if (!window.location.href.includes('/login')) {
      store.dispatch(logoutUser())
      window.location.href = '/login';
    }
  }
  else {
    store.dispatch({ type: SET_AUTHENTICATED });
    axios.defaults.headers.common['Authorization'] = token;
    store.dispatch(getUserData());
  }
}

class App extends Component {
  render() {
    return (
      <MuiThemeProvider theme={theme}>
        <Provider store={store}>
          <Router>
            <Navbar />
            <div className="container">
              <Switch>
                <Route exact path="/" component={home} />
                <AuthRoute exact path="/login" component={login} />
                <AuthRoute exact path="/signup" component={signup} />
              </Switch>
            </div>
          </Router>
        </Provider>
      </MuiThemeProvider>
    );
  }
}

export default App;
