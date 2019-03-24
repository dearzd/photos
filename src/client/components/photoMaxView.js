import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Icon from './icon';
import commonUtil from 'utils/commonUtil';

class PhotoMaxView extends Component {
	constructor(props) {
		super(props);

		this.state = {
			currentIndex: props.currentIndex
		};

		this.handleKeyDown = this.handleKeyDown.bind(this);
		this.navPrev = this.navPrev.bind(this);
		this.navNext = this.navNext.bind(this);
		this.outMaxView = this.outMaxView.bind(this);
		this.handleMouseWheel = this.handleMouseWheel.bind(this);
	}

	componentDidMount() {
		document.body.classList.add('oh');
		document.body.addEventListener('keydown', this.handleKeyDown);
		document.body.addEventListener('wheel', this.handleMouseWheel);
	}

	componentWillUnmount() {
		document.body.classList.remove('oh');
		document.body.removeEventListener('keydown', this.handleKeyDown);
		document.body.removeEventListener('wheel', this.handleMouseWheel);
	}

	handleKeyDown(e) {
		let code = e.keyCode;
		switch (code) {
			case 37:
				// left
				this.navPrev();
				break;
			case 39:
				// right
				this.navNext();
				break;
			case 27:
				this.outMaxView();
				// esc
				break;
		}
	}

	handleMouseWheel(e) {
		//console.log(e.deltaX, e.deltaY);
		if (e.deltaX < 0 || e.deltaY < 0) {
			this.navPrev();
		} else {
			this.navNext();
		}
	}

	navPrev() {
		let {currentIndex} = this.state;
		if (currentIndex > 0) {
			this.setState({
				currentIndex: --currentIndex
			});
		}
	}

	navNext() {
		let {currentIndex} = this.state;
		if (currentIndex < this.props.images.length - 1) {
			this.setState({
				currentIndex: ++currentIndex
			});
		}
	}

	outMaxView() {
		this.props.onExit();
	}

	render() {
		const {albumId, images} = this.props;
		const {currentIndex} = this.state;
		return (
			<div className="photo-max-view fixed-wrap center">
				{
					currentIndex > 0 ?
						<button className="max-view-btn nav-left" onClick={this.navPrev}>
							<Icon name="prev" size={48} color="white"/>
						</button>
						: null
				}
				<img src={commonUtil.getPhotoUrl(albumId, images[currentIndex].name)}/>
				{
					currentIndex < images.length - 1 ?
						<button className="max-view-btn nav-right" onClick={this.navNext}>
							<Icon name="next" size={48} color="white"/>
						</button>
						: null
				}
				<button className="max-view-btn close-max-view" onClick={this.outMaxView}>
					<Icon name="close" size={48} color="white"/>
				</button>
			</div>
		);
	}
}

PhotoMaxView.propTypes = {
	albumId: PropTypes.string,
	images: PropTypes.array,
	currentIndex: PropTypes.number,
	onExit: PropTypes.func
};

export default PhotoMaxView;
