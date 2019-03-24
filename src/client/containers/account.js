import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import Title from 'components/title';
import Button from 'components/button';
import ChangeUserName from 'components/changeUserName';
import ChangeAvatar from 'components/changeAvatar';
import ChangePassword from 'components/changePassword';
import {changeUserName, changeAvatar, changePassword} from 'actions/appAction';
import 'style/landing.css';

class Account extends Component {
	constructor(props) {
		super(props);

		this.state = {
			action: ''
		};

		this.handleCancel = this.handleCancel.bind(this);
	}

	switchAction(action) {
		this.setState({
			action: action
		});
	}

	handleCancel(e) {
		e.preventDefault();
		this.props.history.goBack();
	}

	getLandingBody() {
		const {userProfile, changeUserName, changeAvatar, changePassword, history} = this.props;
		switch (this.state.action) {
			case 'changeUserName':
				return (
					<ChangeUserName
						changeUserName={changeUserName}
						history={history}
						userProfile={userProfile}
						onCancel={this.switchAction.bind(this, '')}
					/>
				);
			case 'changeAvatar':
				return (
					<ChangeAvatar
						changeAvatar={changeAvatar}
						history={history}
						userProfile={userProfile}
						onCancel={this.switchAction.bind(this, '')}
					/>
				);
			case 'changePassword':
				return (
					<ChangePassword
						changePassword={changePassword}
						history={history}
						userProfile={userProfile}
						onCancel={this.switchAction.bind(this, '')}
					/>
				);
			default:
				return (
					<div className="landing-body account-actions">
						<h1 className="landing-title">Account</h1>
						<div onClick={this.switchAction.bind(this, 'changeUserName')}>Change name</div>
						<div onClick={this.switchAction.bind(this, 'changeAvatar')}>Change avatar</div>
						<div onClick={this.switchAction.bind(this, 'changePassword')}>Change password</div>
						<div className="landing-buttons">
							<Button className="btn-landing btn-landing-cancel" text="Cancel" onClick={this.handleCancel}/>
						</div>
					</div>
				);
		}
	}

	render() {
		// todo, not login, return null and go to login
		const {userProfile, settings} = this.props;
		if (!(userProfile && settings)) {
			return null;
		}

		let bg = null;
		if (settings.landingBg.enable && settings.landingBg.url) {
			bg = 'url("' + settings.landingBg.url + '")';
		}

		return (
			<Title title="Photos - Account">
				<div id="account" className="landing fixed-wrap" style={{backgroundImage: bg}}>
					<div className="landing-wrapper fixed-wrap center">
						{this.getLandingBody()}
					</div>
				</div>
			</Title>
		);
	}
}

Account.propTypes = {
	userProfile: PropTypes.object,
	settings: PropTypes.object,
	changeUserName: PropTypes.func,
	changeAvatar: PropTypes.func,
	changePassword: PropTypes.func,
	history: PropTypes.object
};

const mapStateToProps = state => {
	return {
		userProfile: state.userProfile,
		settings: state.settings
	};
};

const mapDispatchToProps = {changeUserName, changeAvatar, changePassword};

export default connect(mapStateToProps, mapDispatchToProps)(Account);
