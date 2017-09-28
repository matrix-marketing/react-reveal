/*
 * Reveal React Component
 *
 * Copyright © Roman Nosov 2016, 2017
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */
import React from 'react';
import PropTypes from 'prop-types';

const
  propTypes = {
    effect: PropTypes.oneOfType([ PropTypes.string, PropTypes.object ]),
    transition: PropTypes.string,
    className: PropTypes.string,
    style: PropTypes.object,
    ssr: PropTypes.bool,
    fraction: PropTypes.number,
    throttleTimeout: PropTypes.number,
    onReveal: PropTypes.func,
  },
  defaultProps = {
    transition: 'all 1s ease 0s',
    fraction: 0.2,
    throttleTimeout: 66,
    ssr: false,
  };

class Reveal extends React.Component {

  revealTimeout = void 0;

  state = {
    isHidden: false,
    isMounted: false,
  };

  static getAbsoluteOffsetTop({ offsetTop, offsetParent }) {
    return offsetTop + (offsetParent && Reveal.getAbsoluteOffsetTop(offsetParent));
  }

  handleReveal = () => {
    this.revealTimeout = void 0;
    if (window.pageYOffset + window.innerHeight - this.refs.el.offsetHeight*this.props.fraction > Reveal.getAbsoluteOffsetTop(this.refs.el)) {
      this.setState({ isHidden: false });
      this.componentWillUnmount();
      if (typeof this.props.onReveal === 'function')
        this.props.onReveal();
    }
  };

  revealThrottler = () => {
    // ignore reveal events as long as an handleReveal execution is in the queue
    if (!this.revealTimeout)
      this.revealTimeout = window.setTimeout(this.handleReveal, this.props.throttleTimeout);
  };

  componentWillUnmount() {
    window.removeEventListener('scroll', this.revealThrottler);
    window.removeEventListener('resize', this.revealThrottler, false);
  }

  componentDidMount() {
    if (this.props.ssr)
      if (window.pageYOffset + window.innerHeight > Reveal.getAbsoluteOffsetTop(this.refs.el))
      {
        this.setState({ isHidden: false, isMounted: false });
        return;
      }
    this.setState({ isHidden: true, isMounted: true });
    this.revealThrottler();
    window.addEventListener('scroll', this.revealThrottler);
    window.addEventListener('resize', this.revealThrottler, false);
  }

  render() {
    const { transition, effect, style, className, ssr, onReveal, fraction, throttleTimeout, ...props } = this.props;
    if (!props.children) {
      let lorem = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. ';
      for (let i=0; i<4; i++)
        lorem += lorem;
      props.children = <p>{lorem}</p>;
    }
    let s = {}, cls = className, isInline = !(typeof effect === 'string' || effect instanceof String);
    let o = isInline ? effect : {};
    if (this.state.isHidden)
      s = { opacity: 0, ...o };
    else if (this.state.isMounted)
    {
      if (isInline)
        s = { opacity: 1, transition };
      else
        cls = className ? className + ' ' + this.props.effect : this.props.effect;
    }
    return (
      <div { ...props } style={{ ...style, ...s }} className={cls} ref="el" />
    );
  }

}

Reveal.propTypes = propTypes;
Reveal.defaultProps = defaultProps;
export default Reveal;