import React, { Component } from 'react';
import PropTypes from 'prop-types';

class Toggle extends Component {
  constructor(props) {
    super(props);

    this.state = {
      prevProps: props,
      open: props.open
    };

    this.toggleOpen = this.toggleOpen.bind(this);
  }

  static getDerivedStateFromProps(props, state) {
    if (props.open !== state.prevProps.open) {
      return {
        open: props.open,
        prevProps: props
      };
    } else {
      return null;
    }
  }

  toggleOpen() {
    this.setState({open: !this.state.open});
    if (typeof this.props.onChange === 'function') {
      this.props.onChange(!this.state.open);
    }
  }

  render() {
    const { id, className, disabled }= this.props;
    let classNames = ['toggle'];
    if (this.state.open) {
      classNames.push('open');
    }
    if (className) {
      classNames.push(className);
    }
    if (disabled) {
      classNames.push('disabled');
    }

    return (
      <div id={id} className={classNames.join(' ')} onClick={this.toggleOpen}>
        <div className="toggle-circle" />
      </div>
    );
  }
}

Toggle.propTypes = {
  id: PropTypes.string,
  open: PropTypes.bool,
  onChange: PropTypes.func,
  className: PropTypes.string,
  disabled: PropTypes.bool
};

export default Toggle;