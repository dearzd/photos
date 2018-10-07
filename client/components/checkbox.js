import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Icon from './icon';
import 'style/checkbox.css';

class Checkbox extends Component {
  constructor(props) {
    super(props);

    this.state = {
      checked: props.checked
    };

    this.handleClick = this.handleClick.bind(this);
  }

  static getDerivedStateFromProps(props, state) {
    if (props.checked !== (state.prevProps && state.prevProps.checked)) {
      return {
        checked: props.checked,
        prevProps: props
      };
    } else {
      return null;
    }
  }

  handleClick(e) {
    e.stopPropagation();
    const { id, onClick } = this.props;
    let checked = !this.state.checked;
    this.setState({
      checked: checked
    });
    if (typeof onClick === 'function') {
      onClick(checked, id);
    }
  }

  render() {
    let classNames = ['checkbox'];
    if (this.state.checked) {
      classNames.push('checked');
    }
    if (this.props.className) {
      classNames.push(this.props.className);
    }
    return (
      <div className={classNames.join(' ')} onClick={this.handleClick}>
        <div className="checkbox-view">
          {
            this.state.checked ?
              <Icon name="ok" color='white' />
              : null
          }
        </div>
      </div>
    );
  }
}

Checkbox.propTypes = {
  id: PropTypes.string,
  checked: PropTypes.bool,
  onClick: PropTypes.func,
  className: PropTypes.string
};

export default Checkbox;