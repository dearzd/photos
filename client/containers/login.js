import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import Title from 'components/title';
import Button from 'components/button';
import { DIALOGTYPE, dialogHandler } from 'containers/dialog';
import 'style/landing.css';
import { login } from 'actions/appAction'; // change show dialog method, not directly import from action. white an const function

class Login extends Component {
  constructor(props) {
    super(props);

    this.state = {
      password: ''
    };

    this.inputRef = null;

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.focusInput = this.focusInput.bind(this);
  }

  handleChange(e) {
    this.setState({password: e.target.value});
  }

  handleSubmit(e) {
    e.preventDefault();
    this.props.login(this.state.password).then((res) => {
      if (!res.data.success) {
        dialogHandler.show({
          type: DIALOGTYPE.alert,
          message: res.data.errorText,
          onConfirm: this.focusInput
        });
      } else {
        this.props.history.goBack();
      }
    });
  }

  focusInput() {
    this.inputRef.focus();
  }

  render() {
    const { userProfile, settings } = this.props;
    if (!(userProfile && settings)) {
      return null;
    }

    let bg = null;
    if (settings.landingBg.enable && settings.landingBg.url) {
      bg = 'url("' + settings.landingBg.url + '")';
    }

    return (
      <Title title="Photos - Login">
        <div id="login" className="landing fixed-wrap center" style={{backgroundImage: bg}}>
          <div className="landing-body">
            <div className="avatar" style={{backgroundImage: userProfile.avatar ? 'url("' + userProfile.avatar + '")' : null}} />
            <h1>{userProfile.name}</h1>
            <form onSubmit={this.handleSubmit}>
              <div className="input-wrapper confirm">
                <input type="password" placeholder="Password" value={this.state.password} onChange={this.handleChange} autoFocus={true} ref={i => this.inputRef = i} />
                <Button id="btn-input-confirm" className="btn-landing" icon="ok" />
              </div>
            </form>
          </div>
        </div>
      </Title>
    );
  }
}

Login.propTypes = {
  history: PropTypes.object,
  login: PropTypes.func,
  userProfile: PropTypes.object,
  settings: PropTypes.object
};

const mapStateToProps = state => {
  return {
    userProfile: state.userProfile,
    settings: state.settings
  };
};

const mapDispatchToProps = { login };

export default connect(mapStateToProps, mapDispatchToProps)(Login);