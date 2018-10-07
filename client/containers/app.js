import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Switch, Route } from 'react-router-dom';
import AlbumList from './albumList';
import AlbumDetail from './albumDetail';
import UploadPhoto from './uploadPhoto';
import Login from './login';
import Loading from './loading';
import Account from './account';
import Settings from './settings';
import Dialog from './dialog';
import restAPI from 'utils/restAPI';
import { getUserProfile, getSettings } from 'actions/appAction';
import 'style/common.css';

class App extends Component {
  constructor(props) {
    super(props);

    restAPI.setup(this.props.dispatch, this.props.history);
  }

  componentDidMount() {
    this.props.getUserProfile();
    this.props.getSettings();
  }

  render() {
    console.log('app render');
    return (
      <div id="app">
        <Switch>
          {/* home page */}
          <Route path="/" exact component={AlbumList} />

          {/* album detail page */}
          <Route path="/album/:id" component={AlbumDetail} />

          {/* upload photo page */}
          <Route path="/uploadPhoto/:id" component={UploadPhoto} />

          {/* login page */}
          <Route path="/login" component={Login} />

          {/* account page */}
          <Route path="/account" component={Account} />

          {/* settings page */}
          <Route path="/settings" component={Settings} />
        </Switch>

        {/* app global loading */}
        <Loading />

        {/* app dialog */}
        <Dialog />
      </div>
    );
  }
}

App.propTypes = {
  getUserProfile: PropTypes.func,
  getSettings: PropTypes.func,
  dispatch: PropTypes.func,
  history: PropTypes.object
};

export default connect(null, { getUserProfile, getSettings })(App);