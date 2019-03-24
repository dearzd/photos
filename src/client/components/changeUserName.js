import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Button from 'components/button';
import {DIALOGTYPE, dialogHandler} from 'containers/dialog';

class ChangeUserName extends Component {
	constructor(props) {
		super(props);

		this.state = {
			name: props.userProfile.name
		};

		this.inputRef = null;

		this.handleChange = this.handleChange.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
		this.handleCancel = this.handleCancel.bind(this);
		this.focusInput = this.focusInput.bind(this);
	}

	handleChange(e) {
		this.setState({name: e.target.value});
	}

	handleSubmit(e) {
		e.preventDefault();
		const {changeUserName, history} = this.props;
		const {name} = this.state;
		if (!name) {
			// empty
			dialogHandler.show({
				type: DIALOGTYPE.alert,
				message: 'Name cannot be empty.',
				onConfirm: this.focusInput
			});
		} else {
			changeUserName(name).then(() => {
				// success
				dialogHandler.show({
					type: DIALOGTYPE.alert,
					message: 'Username changed successfully.',
					onConfirm: () => {
						history.goBack();
					}
				});
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
		const {userProfile} = this.props;
		return (
			<div className="landing-body">
				<div
					className="avatar"
					style={{backgroundImage: userProfile.avatar ? 'url("' + userProfile.avatar + '")' : null}}
				/>
				<h1>Change name</h1>
				<form onSubmit={this.handleSubmit}>
					<div className="input-wrapper confirm">
						<input
							type="text"
							placeholder="New name"
							value={this.state.name}
							onChange={this.handleChange}
							autoFocus={true} ref={i => this.inputRef = i}
						/>
						<Button id="btn-input-confirm" className="btn-landing" icon="ok"/>
					</div>
					<div className="landing-buttons">
						<Button className="btn-landing" text="Cancel" onClick={this.handleCancel}/>
					</div>
				</form>
			</div>
		);
	}
}

ChangeUserName.propTypes = {
	userProfile: PropTypes.object,
	changeUserName: PropTypes.func,
	onCancel: PropTypes.func,
	history: PropTypes.object
};

export default ChangeUserName;
