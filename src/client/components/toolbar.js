import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import Icon from './icon';
import {logout} from 'actions/appAction';
import 'style/toolbar.css';

class Toolbar extends Component {
	constructor(props) {
		super(props);

		this.state = {
			showMore: false
		};

		this.goToHome = this.goToHome.bind(this);
		this.handleMoreClick = this.handleMoreClick.bind(this);
		this.goToAccount = this.goToAccount.bind(this);
		this.goToSettings = this.goToSettings.bind(this);
		this.logout = this.logout.bind(this);
	}

	goToHome() {
		this.props.history.push('/');
	}

	handleMoreClick() {
		this.setState({
			showMore: !this.state.showMore
		});
	}

	goToAccount() {
		this.props.history.push('/account');
	}

	goToSettings() {
		this.props.history.push('/settings');
	}

	logout() {
		this.props.logout().then(() => {
			this.props.history.push('/login');
		});
	}

	renderButton(btnInfo) {
		const {id, icon, text, onClick, className, disabled} = btnInfo;
		let btnClass = ['toolbar-btn'];
		if (className) {
			btnClass.push(className);
		}
		return (
			<button key={id || icon} onClick={onClick} className={btnClass.join(' ')} disabled={disabled}>
				<Icon name={icon} color={disabled ? 'graytext' : null}/>
				{text ? <span className="btn-text">{text}</span> : null}
			</button>
		);
	}

	render() {
		let {buttons} = this.props;
		buttons = buttons || [];
		let moreButton = {
			icon: 'more',
			onClick: this.handleMoreClick
		};
		let btnOut = buttons.filter(btnInfo => btnInfo.inMore !== true);
		let btnInMore = buttons.filter(btnInfo => btnInfo.inMore === true);
		btnInMore.push({
			icon: 'account',
			text: 'Account',
			onClick: this.goToAccount
		});
		btnInMore.push({
			icon: 'setting',
			text: 'Settings',
			onClick: this.goToSettings
		});
		btnInMore.push({
			icon: 'logout',
			text: 'Logout',
			onClick: this.logout
		});

		return (
			<div id="toolbar">
				<div className="buttons-left">
					<button onClick={this.goToHome} className="toolbar-btn">
						<Icon name="home"/>
						<span className="btn-text">Home</span>
					</button>
				</div>
				<div className="buttons-right">
					{btnOut.map(this.renderButton)}
					{this.renderButton(moreButton)}
					<div className="buttons-in-more">
						{this.state.showMore ? btnInMore.map(this.renderButton) : null}
					</div>
				</div>
			</div>
		);
	}
}

Toolbar.propTypes = {
	buttons: PropTypes.array,
	history: PropTypes.object,
	logout: PropTypes.func
};

const mapDispatchToProps = {
	logout
};

export default connect(null, mapDispatchToProps)(Toolbar);
