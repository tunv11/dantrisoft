import React, { Component, Fragment } from "react";
import {
    Text,
    View,
    TouchableOpacity,
    ActivityIndicator,
    StyleSheet,
    Platform,
    ScrollView,
    DeviceEventEmitter,
    NativeEventEmitter,
    ToastAndroid
} from "react-native";
import Utils from './Utils';
import PopupDialog, { SlideAnimation, } from 'react-native-popup-dialog';
import { BluetoothEscposPrinter, BluetoothManager } from "react-native-bluetooth-escpos-printer";
import * as Constants from './Constants';

const slideAnimation = new SlideAnimation({ slideFrom: 'bottom' });

export default class DialogDevice extends Component {

    showSlideAnimationDialog = () => {
        this.slideAnimationDialog.show();
        this.setState({
            devices: null,
            pairedDs: [],
            foundDs: [],
            bleOpend: false,
            loading: true,
            boundAddress: '',
            debugMsg: ''
        }, () => {
            this._scan()
        });

    }

    dismissSlideAnimationDialog = () => {
        this.slideAnimationDialog.dismiss();
    }
    _listeners = [];

    constructor(props) {
        super(props);
        this.onPress = props.onPress;
        this.state = {
            devices: null,
            pairedDs: [],
            foundDs: [],
            bleOpend: false,
            loading: true,
            boundAddress: '',
            debugMsg: ''
        };
    }

    componentDidMount() {
        BluetoothManager.isBluetoothEnabled().then((enabled) => {
            this.setState({
                bleOpend: Boolean(enabled),
                loading: false
            })
        }, (err) => {
            err
        });

        if (Platform.OS === 'ios') {
            let bluetoothManagerEmitter = new NativeEventEmitter(BluetoothManager);
            this._listeners.push(bluetoothManagerEmitter.addListener(BluetoothManager.EVENT_DEVICE_ALREADY_PAIRED,
                (rsp) => {
                    this._deviceAlreadPaired(rsp)
                }));
            this._listeners.push(bluetoothManagerEmitter.addListener(BluetoothManager.EVENT_DEVICE_FOUND, (rsp) => {
                this._deviceFoundEvent(rsp)
            }));
            this._listeners.push(bluetoothManagerEmitter.addListener(BluetoothManager.EVENT_CONNECTION_LOST, () => {
                this.setState({
                    name: '',
                    boundAddress: ''
                });
            }));
        } else if (Platform.OS === 'android') {
            this._listeners.push(DeviceEventEmitter.addListener(
                BluetoothManager.EVENT_DEVICE_ALREADY_PAIRED, (rsp) => {
                    this._deviceAlreadPaired(rsp)
                }));
            this._listeners.push(DeviceEventEmitter.addListener(
                BluetoothManager.EVENT_DEVICE_FOUND, (rsp) => {
                    this._deviceFoundEvent(rsp)
                }));
            this._listeners.push(DeviceEventEmitter.addListener(
                BluetoothManager.EVENT_CONNECTION_LOST, () => {
                    this.setState({
                        name: '',
                        boundAddress: ''
                    });
                }
            ));
            this._listeners.push(DeviceEventEmitter.addListener(
                BluetoothManager.EVENT_BLUETOOTH_NOT_SUPPORT, () => {
                    ToastAndroid.show("Device Not Support Bluetooth !", ToastAndroid.LONG);
                }
            ))
        }
        this._scan();
    }

    _deviceAlreadPaired(rsp) {
        var ds = null;
        if (typeof (rsp.devices) == 'object') {
            ds = rsp.devices;
        } else {
            try {
                ds = JSON.parse(rsp.devices);
            } catch (e) {
            }
        }
        if (ds && ds.length) {
            let pared = this.state.pairedDs;
            pared = pared.concat(ds || []);
            this.setState({
                pairedDs: pared
            });
        }
    }

    _deviceFoundEvent(rsp) {//alert(JSON.stringify(rsp))
        var r = null;
        try {
            if (typeof (rsp.device) == "object") {
                r = rsp.device;
            } else {
                r = JSON.parse(rsp.device);
            }
        } catch (e) {//alert(e.message);
            //ignore
        }
        //alert('f')
        if (r) {
            let found = this.state.foundDs || [];
            if (found.findIndex) {
                let duplicated = found.findIndex(function (x) {
                    return x.address == r.address
                });
                //CHECK DEPLICATED HERE...
                if (duplicated == -1) {
                    found.push(r);
                    this.setState({
                        foundDs: found
                    });
                }
            }
        }
    }

    _renderRow(rows) {
        let items = [];
        for (let i in rows) {
            let row = rows[i];
            if (row.address && row.name) {
                items.push(
                    <TouchableOpacity key={new Date().getTime() + i} stlye={styles.wtf} onPress={() => {
                        this.setState({
                            loading: true
                        });
                        BluetoothManager.connect(row.address)
                            .then(() => {
                                this.setState({
                                    loading: false,
                                    boundAddress: row.address,
                                    name: row.name || "UNKNOWN"
                                }, async () => {
                                    await Utils.saveDataWithKey(Constants.KEY_DEVICE, row.address)
                                    this.dismissSlideAnimationDialog()
                                    this.onPress(row.address)
                                })
                            }, (e) => {
                                this.setState({
                                    loading: false
                                })
                                alert(e);
                            })

                    }}><Text style={styles.name}>{row.name || "UNKNOWN"}</Text><Text
                        style={styles.address}>{row.address}</Text></TouchableOpacity>
                );
            }
        }
        return items;
    }



    render() {
        return (
            <PopupDialog
                dialogStyle={styles.background_dialog}
                width={Utils.appSize().width - 50}
                ref={(popupDialog) => {
                    this.slideAnimationDialog = popupDialog;
                }}
                dialogAnimation={slideAnimation}
                onDismissed={() => Utils.dismissKeyboard()}>
                <View style={styles.container}>
                    <Text style={styles.text}>Vui lòng chọn máy in</Text>
                    {
                        this.state.loading ?
                            <Fragment>
                                <ActivityIndicator size="large" color="#337AB7" />
                                <Text style={styles.text}>kết nối ...</Text>
                            </Fragment>
                            :
                            <ScrollView style={{ width: (Utils.appSize().width - 60), flex: 1, flexDirection: "column", }}>
                                {
                                    this._renderRow(this.state.foundDs)

                                }{
                                    this._renderRow(this.state.pairedDs)
                                }
                            </ScrollView>
                    }
                </View>
            </PopupDialog>
        )
    }

    _scan() {
        this.setState({
            loading: true
        })
        BluetoothManager.scanDevices()
            .then((s) => {
                var ss = s;
                var found = ss.found;
                try {
                    found = JSON.parse(found);//@FIX_it: the parse action too weired..
                } catch (e) {
                    //ignore
                }
                var fds = this.state.foundDs;
                if (found && found.length) {
                    fds = found;
                }
                this.setState({
                    foundDs: fds,
                    loading: false
                });
            }, (er) => {
                this.setState({
                    loading: false
                })
                alert('error' + JSON.stringify(er));
            });
    }


}

const styles = StyleSheet.create({
    background_dialog: {
        backgroundColor: 'transparent',
    },
    container: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "white"
    },
    button: {
        alignSelf: "stretch",
        padding: 5,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#337AB7",
        height: 45,
        borderColor: "transparent",
        borderWidth: 0,
        marginLeft: 20,
        marginRight: 20,
        marginBottom: 20
    },
    greenButton: {
        backgroundColor: "green"
    },
    redButton: {
        backgroundColor: "red"
    },
    buttonText: {
        color: "white"
    },
    greenText: {
        fontSize: 12,
        color: "green"
    },
    listContainer: {
        flex: 1,
        alignSelf: "stretch",
        marginBottom: 20
    },
    listItem: {
        flex: 1,
        padding: 20,
        alignSelf: "stretch",
        borderBottomWidth: 1,
        borderColor: "#D8D8D8",
        backgroundColor: "white"
    },
    deviceName: {
        fontSize: 18,
        color: "#4A90E2"
    },
    text: {
        fontSize: 12,
        color: "#BBBBBB",
        marginTop: 10,
        marginBottom: 10
    },
    wtf: {
        // flex: 1,
        // flexDirection: "row",
        // justifyContent: "space-between",
        // alignItems: "center"
        width: Utils.appSize().width - 60,
        padding: 20,
        alignSelf: "stretch",
        borderBottomWidth: 1,
        borderColor: "#D8D8D8",
        backgroundColor: "white"
    },
    name: {
        fontSize: 18,
        color: "#4A90E2"
    },
    address: {
        // flex: 1,
        textAlign: "right"
    },
    title: {
        width: Utils.appSize().width,
        backgroundColor: "#eee",
        color: "#232323",
        paddingLeft: 8,
        paddingVertical: 4,
        textAlign: "left"
    }
});
