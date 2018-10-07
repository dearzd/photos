import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Button from 'components/button';
import { DIALOGTYPE, dialogHandler } from 'containers/dialog';

class ChangePassword extends Component {
  constructor(props) {
    super(props);

    this.state = {
      oldPassword: '',
      newPassword: '',
      confirmPassword: ''
    };

    this.inputRef = null;

    this.handleOldChange = this.handleOldChange.bind(this);
    this.handleNewChange = this.handleNewChange.bind(this);
    this.handleConfirmChange = this.handleConfirmChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
    this.focusInput = this.focusInput.bind(this);
  }

  handleOldChange(e) {
    this.setState({oldPassword: e.target.value});
  }

  handleNewChange(e) {
    this.setState({newPassword: e.target.value});
  }

  handleConfirmChange(e) {
    this.setState({confirmPassword: e.target.value});
  }

  handleSubmit(e) {
    e.preventDefault();
    const { changePassword, history } = this.props;
    const { oldPassword, newPassword, confirmPassword } = this.state;
    if (!newPassword) {
      // empty
      dialogHandler.show({
        type: DIALOGTYPE.alert,
        message: 'New password cannot be empty.',
        onConfirm: this.focusInput
      });
    } else if (newPassword !== confirmPassword) {
      // confirm not same with new
      dialogHandler.show({
        type: DIALOGTYPE.alert,
        message: 'The password you entered did not match.',
        onConfirm: this.focusInput
      });
    } else {
      changePassword(oldPassword, newPassword).then((res) => {
        if (!res.data.success) {
          // old password not correct
          dialogHandler.show({
            type: DIALOGTYPE.alert,
            message: res.data.errorText,
            onConfirm: this.focusInput
          });
        } else {
          // success
          dialogHandler.show({
            type: DIALOGTYPE.alert,
            message: 'Password changed successfully.',
            onConfirm: () => {
              history.goBack();
            }
          });
        }
      });
    }
  }

  handleCancel(e) {
    e.preventDefault();
    this.props.onCancel();
  }

  focusInput() {
    this.inputRef.focus();
  }

  render() {
    const { userProfile } = this.props;
    return (
      <div className="landing-body">
        <div className="avatar" style={{backgroundImage: userProfile.avatar ? 'url("' + userProfile.avatar + '")' : null}} />
        <h1>Change password</h1>
        <form onSubmit={this.handleSubmit}>

          <div className="input-wrapper">
            <input type="password" placeholder="Old password" value={this.state.oldPassword} onChange={this.handleOldChange} autoFocus={true} ref={i => this.inputRef = i} />
          </div>

          <div className="input-wrapper">
            <input type="password" placeholder="New password" value={this.state.newPassword} onChange={this.handleNewChange} />
          </div>

          <div className="input-wrapper confirm">
            <input type="password" placeholder="Confirm password" value={this.state.confirmPassword} onChange={this.handleConfirmChange} />
            <Button id="btn-input-confirm" className="btn-landing" icon="ok" />
          </div>

          <div className="landing-buttons">
            <Button className="btn-landing" text="Cancel" onClick={this.handleCancel} />
          </div>

        </form>
      </div>
    );
  }
}

ChangePassword.propTypes = {
  userProfile: PropTypes.object,
  changePassword: PropTypes.func,
  onCancel: PropTypes.func,
  history: PropTypes.object
};

export default ChangePassword;