import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import Title from 'components/title';
import Button from 'components/button';
import Toggle from 'components/toggle';
import Icon from 'components/icon';
import {saveSettings} from 'actions/appAction';
import {DIALOGTYPE, dialogHandler} from 'containers/dialog';
import 'style/settings.css';

class Account extends Component {
	constructor(props) {
		super(props);

		this.state = {
			whiteList: null,
			landingBg: null,
			autoCrop: null,
			bgFile: null,
			bgBase64: null
		};

		this.handleAddWhiteList = this.handleAddWhiteList.bind(this);
		this.confirmAddWhiteList = this.confirmAddWhiteList.bind(this);
		this.handlePhotoSelected = this.handlePhotoSelected.bind(this);
		this.handleBgToggle = this.handleBgToggle.bind(this);
		this.handleClearBg = this.handleClearBg.bind(this);
		this.handleCropToggle = this.handleCropToggle.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
		this.handleCancel = this.handleCancel.bind(this);
	}

	static getDerivedStateFromProps(props, state) {
		if (props !== state.prevProps) {
			let settings = props.settings || {};
			return {
				whiteList: settings.whiteList,
				landingBg: settings.landingBg,
				autoCrop: settings.autoCrop,
				prevProps: props
			};
		} else {
			return null;
		}
	}

	handleAddWhiteList() {
		dialogHandler.show({
			type: DIALOGTYPE.prompt,
			message: 'Add whiteList:',
			onConfirm: this.confirmAddWhiteList
		});
	}

	confirmAddWhiteList(url) {
		if (url) {
			let whiteList = this.state.whiteList || [];
			whiteList.push(url);
			this.setState({
				whiteList: whiteList
			});
		} else {
			dialogHandler.show({
				type: DIALOGTYPE.alert,
				message: 'Invalid url.'
			});
		}
	}

	removeWhiteList(index) {
		let {whiteList} = this.state;
		whiteList.splice(index, 1);
		this.setState({
			whiteList: whiteList
		});
	}

	handleBgToggle(open) {
		let bg = {
			enable: open,
			url: this.state.landingBg && this.state.landingBg.url
		};
		this.setState({
			landingBg: bg
		});
	}

	handleClearBg() {
		let bg = {
			enable: this.state.landingBg && this.state.landingBg.enable,
			url: ''
		};
		this.setState({
			landingBg: bg,
			bgFile: null,
			bgBase64: null
		});
	}

	handlePhotoSelected(e) {
		let file = e.target.files[0];
		if (file) {
			let me = this;
			let fileReader = new FileReader();
			fileReader.readAsDataURL(file);
			fileReader.onload = function () {
				me.setState({
					bgFile: file,
					bgBase64: this.result
				});
			};
		}
	}

	handleCropToggle(open) {
		this.setState({autoCrop: open});
	}

	handleSubmit() {
		const {saveSettings, history} = this.props;

		let settings = {
			whiteList: this.state.whiteList,
			landingBg: this.state.landingBg,
			autoCrop: this.state.autoCrop
		};
		let settingsData = {
			settings: settings,
			bgFile: this.state.bgFile
		};

		saveSettings(settingsData).then(() => {
			dialogHandler.show({
				type: 'alert',
				message: 'Settings saved successfully.',
				onConfirm: () => {
					history.push('/');
				}
			});
		});
	}

	handleCancel(e) {
		e.preventDefault();
		this.props.history.goBack();
	}

	render() {
		const {whiteList, landingBg, autoCrop, bgBase64} = this.state;

		let bg = null;
		if (landingBg && landingBg.enable) {
			if (bgBase64 || landingBg.url) {
				bg = 'url("' + (bgBase64 || landingBg.url) + '")';
			}
		}
		return (
			<Title title="Photos - Settings">
				<div id="settings" className="landing fixed-wrap" style={{backgroundImage: bg}}>
					<div className="landing-wrapper fixed-wrap center">
						<div className="setting-body">
							<h1 className="landing-title">Settings</h1>
							<div>
								<div className="setting-item">
									<div>White List:</div>
									<div className="white-list">
										{
											whiteList && whiteList.map((url, index) => {
												return (
													<div key={url}>
														{url}
														<span style={{cursor: 'pointer'}} onClick={this.removeWhiteList.bind(this, index)}>
                              <Icon name="close" color="#fff"/>
                            </span>
													</div>
												);
											})
										}
									</div>
									<Button text="Add" className="btn-landing" onClick={this.handleAddWhiteList}/>
								</div>
								<div className="setting-item">
									<div>
										Login & Settings Bg
										<Toggle
											open={landingBg && landingBg.enable}
											className="setting-toggle"
											onChange={this.handleBgToggle}/>
									</div>
									{
										landingBg && landingBg.enable ?
											<div className="landing-buttons" style={{textAlign: 'center'}}>
												<Button type="file" icon="add" text="Select Photo" className="btn-landing"
																onChange={this.handlePhotoSelected}/>
												<Button className="btn-landing btn-landing-cancel" text="Clear" onClick={this.handleClearBg}/>
											</div>
											: null
									}
								</div>
								<div className="setting-item">
									<div>
										Auto Crop:
										<Toggle open={autoCrop} className="setting-toggle" onChange={this.handleCropToggle}/>
									</div>
								</div>
								<div className="landing-buttons">
									<Button text="Ok" icon="ok" className="btn-landing" onClick={this.handleSubmit}/>
									<Button text="Cancel" className="btn-landing btn-landing-cancel" onClick={this.handleCancel}/>
								</div>
							</div>
						</div>
					</div>
				</div>
			</Title>
		);
	}
}

Account.propTypes = {
	saveSettings: PropTypes.func,
	settings: PropTypes.object,
	history: PropTypes.object
};

const mapStateToProps = state => {
	return {
		settings: state.settings
	};
};

const mapDispatchToProps = {saveSettings};

export default connect(mapStateToProps, mapDispatchToProps)(Account);
