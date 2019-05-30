import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Icon from './icon';

class Button extends Component {
	render() {
		const {type, id, text, icon, onClick, onChange, className, disabled, autoFocus, multiple} = this.props;
		let classNames = ['btn'];
		if (className) {
			classNames.push(className);
		}
		if (type === 'file') {
			classNames.push('btn-file');
			let accept = ['image/jpeg', 'image/png', 'image/gif', 'image/bmp', 'image/x-icon', 'image/svg+xml'];
			return (
				<div id={id} className={classNames.join(' ')}>
					<label>
						{icon ? <Icon name={icon}/> : null}
						<span className="btn-text">{text}</span>
						<input
							type="file"
							onChange={onChange}
							multiple={multiple ? 'multiple' : null}
							accept={accept.join(',')}
							style={{'display': 'none'}}/>
					</label>
				</div>
			);
		} else {
			return (
				<button
					id={id}
					className={classNames.join(' ')}
					onClick={onClick}
					disabled={disabled}
					autoFocus={autoFocus}
				>
					{icon ? <Icon name={icon}/> : null}
					{text}
				</button>
			);
		}
	}
}

Button.propTypes = {
	type: PropTypes.string,
	id: PropTypes.string,
	text: PropTypes.string,
	icon: PropTypes.string,
	onClick: PropTypes.func,
	onChange: PropTypes.func,
	className: PropTypes.string,
	disabled: PropTypes.bool,
	autoFocus: PropTypes.bool,
	multiple: PropTypes.bool
};

export default Button;
