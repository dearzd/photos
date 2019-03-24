import React, {Component} from 'react';
import PropTypes from 'prop-types';
import 'style/loading.css';
import {connect} from 'react-redux';

class Loading extends Component {
	render() {
		if (!this.props.show) {
			return null;
		}

		return (
			<div id="loading" className="fixed-wrap center">
				loading...
			</div>
		);
	}
}

Loading.propTypes = {
	show: PropTypes.number
};

const mapStateToProps = state => {
	return {
		show: state.loading
	};
};

export default connect(mapStateToProps)(Loading);
