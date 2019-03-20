/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 * @lint-ignore-every XPLATJSCOPYRIGHT1
 */

import React, { Component } from 'react';
import { Platform, StyleSheet, Text, View, WebView, Button } from 'react-native';
import { BluetoothEscposPrinter, BluetoothManager, BluetoothTscPrinter } from "react-native-bluetooth-escpos-printer";
import DialogDevice from './DialogDevice';
import Utils from './Utils';
import RNFetchBlob from "react-native-fetch-blob";
import * as Constants from './Constants';

export default class App extends Component {

  constructor() {
    super();
    this.state = {
      base64PDF: null,
      isConnect: false
    }
  }

  async componentDidMount() {
    // BluetoothManager.enableBluetooth().then(async (r) => {
    //   //   BluetoothManager.scanDevices().then(async (s) => {
    //   let deviceName = await Utils.getDataWithKey(Constants.KEY_DEVICE)
    // if (!Utils.isEmptyString(deviceName)) {
    //   BluetoothManager.connect(deviceName).then(() => {
    //     this.setState({ isConnect: true })
    //   }, (e) => {
    //   })
    // }
    //   //   }, (er) => {
    //   //   });
    //   // }, (err) => {
    // });
  }

  render() {
    return (
      <View style={styles.content}>
        <WebView
          style={styles.container}
          source={{ uri: "http://orderblu.dantrisoft.vn/#/login" }}
          onMessage={data => this.onMessage(data)}
          originWhitelist={['*']}
          javaScriptEnabled={true}
          allowFileAccess={true}
          originWhitelist={['*']}
          useWebKit={true}
        />
        <DialogDevice
          ref={(popupDialog) => { this.popupDialog = popupDialog; }}
          onPress={(address) => this._handlerConnectedDevice(address)}
        />
      </View>
    );
  }

  onMessage(data) {
    console.log("url : " + data.nativeEvent.data)
    //Prints out data that was passed.
    if (!this.state.isConnect) {
      this.popupDialog.showSlideAnimationDialog()
    }
    this.setState({ isConnect: true })
    const fs = RNFetchBlob.fs;
    RNFetchBlob.config({
      fileCache: true
    })
      // .fetch("GET", data.nativeEvent.data)
      .fetch("GET", "https://www.upsieutoc.com/images/2019/03/19/hoadon.png")
      // the image is now dowloaded to device's storage
      .then(resp => {
        // the image path you can use it directly with Image component
        imagePath = resp.path();
        return resp.readFile("base64");
      })
      .then(base64Data => {
        // here's base64 encoded image
        console.log('test -----\n' + base64Data);
        this.setState({ base64PDF: base64Data }, async () => {
          // let deviceName = await Utils.getDataWithKey(Constants.KEY_DEVICE)
          // if (!Utils.isEmptyString(deviceName)) {
          //   this._handlerConnectedDevice()
          // }
        })
        // remove the file from storage
        return fs.unlink(imagePath);
      });
  }

  _handlerConnectedDevice = async () => {
    try {
      await BluetoothEscposPrinter.printPic(this.state.base64PDF, { width: 500, left: 0 });
      await BluetoothEscposPrinter.printText("\r\n\r\n\r\n", {});
    } catch (e) {
      alert(e.message || "ERROR")
    }
  }
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
  },
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
