'use strict';

import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Animated,
  Easing,
} from 'react-native';
import _ from 'lodash';
import PropTypes from 'prop-types';

class Marquee extends Component {
    until(test, iterator, callback) {
      if (!test()) {
        iterator((err)=>{
          if (err) {
            return callback(err);
          }
          this.until(test, iterator, callback);
        });
      } else {
        callback();
      }
    }
    constructor(props) {
      super(props);
      this.state = {
        list: this.props.children.split(''),
      };
      this.left1 = new Animated.Value(0),
      this.left2 = new Animated.Value(0),
      this.alpha = {};
    }
    componentWillReceiveProps(nextProps) {
      if (this.props.children != nextProps.children) {
        this.animateEnable = false;
        this.width = 0;
        this.left1.stopAnimation(()=>{
          this.left2.stopAnimation(()=>{
            Animated.timing(this.left1, {
              toValue: 0,
              duration: 0,
              useNativeDriver: this.props.useNativeDriver,
            }).start(()=>{
              Animated.timing(this.left2, {
                  toValue: this.width,
                  duration: 0,
                  useNativeDriver: this.props.useNativeDriver,
              }).start(()=>{
                  this.setState({list: nextProps.children.split('')});
              })
            })
          });
        });
      }
    }
    onLayout = (i, e) => {
      this.alpha[i] = e.nativeEvent.layout.width;
      if (_.size(this.alpha) === this.state.list.length) {
        this.twidth = _.sum(_.values(this.alpha));
        this.alpha = {};
        if (!this.animateEnable) {
          this.animateEnable = true;
          this.until(
            ()=>this.width > 0,
            (cb)=>setTimeout(cb, 100),
            ()=>this.startMoveFirstLabelHead()
          );
        }
      }
    }
    onLayoutContainer = (e) => {
      if (!this.width) {
        this.width = e.nativeEvent.layout.width;
        this.spaceWidth = this.props.spaceRatio * this.width;
        this.left1.setValue(0);
        this.left2.setValue(this.width);
      }
    }
    startMoveFirstLabelHead() {
      const {width, twidth, props, left1} = this;
      const {speed} = props;
      Animated.timing(left1, {
        toValue: -twidth+this.spaceWidth,
        duration: (twidth-this.spaceWidth)*speed,
        easing: Easing.linear,
        delay: 500,
        useNativeDriver: props.useNativeDriver,
      }).start(()=>{
        this.animateEnable && Animated.parallel(
          this.moveFirstLabelTail(),
          this.moveSecondLabelHead(),
        )
      });
    }
    moveFirstLabelHead() {
      const {width, twidth, props, left1} = this;
      const {speed} = props;
      Animated.timing(left1, {
        toValue: -twidth+this.spaceWidth,
        duration: (twidth+this.spaceWidth)*speed,
        easing: Easing.linear,
        useNativeDriver: props.useNativeDriver,
      }).start(()=>{
        this.animateEnable &&  Animated.parallel(
          this.moveFirstLabelTail(),
          this.moveSecondLabelHead(),
        )
      });
    }
    moveFirstLabelTail() {
      const {width, twidth, props, left1} = this;
      const {speed} = props;
      Animated.timing(left1, {
        toValue: -twidth,
        duration: this.spaceWidth*speed,
        easing: Easing.linear,
        useNativeDriver: props.useNativeDriver,
      }).start(()=>{
        this.animateEnable && left1.setValue(width);
      });
    }
    moveSecondLabelHead() {
      const {width, twidth, props, left2} = this;
      const {speed} = props;
      Animated.timing(left2, {
        toValue: -twidth+this.spaceWidth,
        duration: (twidth+this.spaceWidth)*speed,
        easing: Easing.linear,
        useNativeDriver: props.useNativeDriver,
      }).start(()=>{
        this.animateEnable && Animated.parallel(
          this.moveFirstLabelHead(),
          this.moveSecondLabelTail(),
        )
      });
    }
    moveSecondLabelTail() {
      const {width, twidth, props, left2} = this;
      const {speed} = props;
      Animated.timing(left2, {
        toValue: -twidth,
        duration: this.spaceWidth*speed,
        easing: Easing.linear,
        useNativeDriver: props.useNativeDriver,
      }).start(()=>{
        this.animateEnable && left2.setValue(twidth);
      });
    }
    render() {
      const { list } = this.state;
      const s = StyleSheet.flatten(this.props.style);
      const textStyleKeys = ['color', 'fontSize', 'fontWeight', 'letterSpacing', 'fontStyle', 'lineHeight', 'fontFamily', 'textDecorationLine'];
      const textStyle = _.pick(s, textStyleKeys);
      const containerStyle = _.omit(s, textStyleKeys);
      return (
        <View style={[containerStyle, {flexDirection: 'row'}]} onLayout={this.onLayoutContainer}>
          <Animated.View style={{flexDirection: 'row', transform: [{ translateX: this.left1 }], width: null }}>
            {list.map((o, i)=>(<Text key={i} onLayout={ (e) => this.onLayout(i, e)} style={textStyle}>{o}</Text>))}
          </Animated.View>
          <Animated.View style={{flexDirection: 'row', position: 'absolute', transform: [{ translateX: this.left2 }], width: null}}>
            {list.map((o, i)=>(<Text key={i} style={textStyle}>{o}</Text>))}
          </Animated.View>
        </View>
      )
    }
};
Marquee.propTypes = {
  children: PropTypes.string.isRequired,
  speed: PropTypes.number,
  spaceRatio: PropTypes.number,
  useNativeDriver: PropTypes.bool,
};
Marquee.defaultProps = {
  speed: 30,
  spaceRatio: 0.5,
  useNativeDriver: true,
};

export default Marquee;
