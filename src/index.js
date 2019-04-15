//libs
import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route, Switch, withRouter } from 'react-router-dom';
import 'semantic-ui-css/semantic.min.css'

import { createStore } from 'redux';
import { Provider, connect } from 'react-redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import rootReducer from './reducers';
import { setUser, clearUser } from './actions';

import firebase from './firebase';

//components
import App from './components/App';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Spinner from './Spinner';

const store = createStore(rootReducer, composeWithDevTools());

class Root extends React.Component {

  componentDidMount() {
    firebase.auth().onAuthStateChanged((user) => {
      const { history, setUser, clearUser } = this.props;
      if (user) {
        setUser(user);
        history.push('/');
      } else {
        history.push('/login');
        clearUser();
      }
    })
  }

  render() {
    return this.props.isLoading ? <Spinner /> : (
      <Switch>
        <Route exact path="/" component={ App } />
        <Route path="/login" component={ Login }/>
        <Route path="/register" component={ Register }/>
      </Switch>
    );
  }
};

const mapStateToProps = (state) => ({
  isLoading: state.user.isLoading
})

const RootWithAuth = withRouter(connect(mapStateToProps, { setUser, clearUser })(Root));

ReactDOM.render(
  <Provider store={store}>
    <Router>
      <RootWithAuth />
    </Router>
  </Provider>,
  document.getElementById('root')
);
