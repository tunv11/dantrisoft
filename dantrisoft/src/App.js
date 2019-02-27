/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 * @lint-ignore-every XPLATJSCOPYRIGHT1
 */

import React, { Component } from 'react';
import { Platform, StyleSheet, Text, View, WebView } from 'react-native';
// import { WebView } from "react-native-webview";

const instructions = Platform.select({
  ios: 'Press Cmd+R to reload,\n' + 'Cmd+D or shake for dev menu',
  android:
    'Double tap R on your keyboard to reload,\n' +
    'Shake or press menu button for dev menu',
});

export default class App extends Component {
  render() {
    const PolicyHTML = require('./test_callback.html');
    return (
      // <View style={styles.container}>
      <WebView
        // source={{ uri: "https://dantrisoft.vn/test.html" }}
        source={{ uri: "http://orderblu.dantrisoft.vn/#/login" }}
        // source={{ uri: "http://orderblu.dantrisoft.vn/test_callback.html" }}
        // source={{ uri: 'file:///android_asset/test_callback.html' }}
        // style={{ marginTop: 20 }}
        onMessage={data => this.onMessage(data)}
        originWhitelist={['*']}
        javaScriptEnabled={true}
        allowFileAccess={true}
        originWhitelist={['*']}
        useWebKit={true}
      />
      // </View>
    );
  }

  onMessage(data) {
    //Prints out data that was passed.
    alert(data.nativeEvent.data);
    // console.log(`kkkkkkkkkkkkkkkkkkkkkkk` + JSON.stringify(data));
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});
