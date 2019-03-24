import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import Button from 'components/button';
import {showDialog, hideDialog} from 'actions/appAction';
import 'style/dialog.css';

export const DIALOGTYPE = {
	alert: 'alert',
	confirm: 'confirm',
	prompt: 'prompt',
	link: 'link'
};

export const dialogHandler = {
	dispatch: null,
	setDispatch: function (dispatch) {
		this.dispatch = dispatch;
	},
	show: function (dialogInfo) {
		this.dispatch(showDialog(dialogInfo));
	},
	hide: function () {
		this.dispatch(hideDialog());
	}
};

class Dialog extends Component {
	constructor(props) {
		super(props);

		this.state = {
			promptText: undefined
		};

		this.changePromptText = this.changePromptText.bind(this);

		dialogHandler.setDispatch(props.dispatch);
	}

	changePromptText(e) {
		this.setState({
			promptText: e.target.value
		});
	}

	handleConfirm(e) {
		e.preventDefault();
		const {onConfirm} = this.props.dialogInfo;
		dialogHandler.hide();
		if (typeof onConfirm === 'function') {
			onConfirm(this.state.promptText);
		}
	}

	handleCancel(e) {
		e.preventDefault();
		const {onCancel} = this.props.dialogInfo;
		dialogHandler.hide();
		if (typeof onCancel === 'function') {
			onCancel();
		}
	}

	render() {
		const {dialogInfo} = this.props;
		if (!dialogInfo) {
			return null;
		}

		let {type, message} = dialogInfo;

		let classNames = ['dialog', 'fixed-wrap', 'center'];
		switch (type) {
			case DIALOGTYPE.alert:
				classNames.push('alert');
				break;
			case DIALOGTYPE.confirm:
				classNames.push('confirm');
				break;
			case DIALOGTYPE.prompt:
				classNames.push('prompt');
				break;
			case DIALOGTYPE.link:
				classNames.push('link');
				break;
		}

		return (
			<div className={classNames.join(' ')}>
				<form className="dialog-body">
					<div className="dialog-content">
						<h2 className="dialog-message">{message}</h2>
						{
							type === DIALOGTYPE.prompt ?
								<input type="text" onChange={this.changePromptText} autoFocus={true}/>
								: null
						}
					</div>

					{
						type === DIALOGTYPE.link ?
							<textarea defaultValue={dialogInfo.links.join('\n')} autoFocus={true}/>
							: null
					}

					<div className="dialog-buttons">
						<Button
							text="Ok"
							onClick={this.handleConfirm.bind(this)}
							className="dialog-btn"
							autoFocus={type !== DIALOGTYPE.prompt && type !== DIALOGTYPE.link}/>
						{
							type === DIALOGTYPE.confirm || type === DIALOGTYPE.prompt ?
								<Button text="Cancel" onClick={this.handleCancel.bind(this)} className="dialog-btn"/>
								: null
						}
					</div>
				</form>
			</div>
		);
	}
}

Dialog.propTypes = {
	dialogInfo: PropTypes.shape({
		type: PropTypes.oneOf([DIALOGTYPE.alert, DIALOGTYPE.confirm, DIALOGTYPE.prompt, DIALOGTYPE.link]),
		message: PropTypes.string,
		links: PropTypes.array,
		onConfirm: PropTypes.func,
		onCancel: PropTypes.func
	}),
	dispatch: PropTypes.func
};

const mapStateToProps = state => {
	return {
		dialogInfo: state.dialogInfo
	};
};

export default connect(mapStateToProps)(Dialog);
