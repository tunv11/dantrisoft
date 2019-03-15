import { Dimensions, AsyncStorage, Alert, Platform, Keyboard } from 'react-native';

export default class Utils {
    
    static appSize = () => {
        let size = {};
        let obj = Dimensions.get('window');
        size["height"] = obj.height;
        size["width"] = obj.width;
        return size;
    }

    static isNull = (object) => {
        if (object == null || typeof object == undefined || object == undefined) {
            return true;
        }
        return false;
    }

    static isValidString(text) {
        if (this.isNull(text)) {
            return false;
        }
        if (typeof text != 'string') {
            return false;
        }
        if (text.toLowerCase() == "null") {
            return false;
        }
        let flag = text.length != 0;

        return flag;
    }

    static isEmptyString(variable) {
        if (variable === null || variable === '' || typeof variable === "undefined") {
            return true
        }
        else {
            return false
        }
    }

    static async  saveDataWithKey(key, data) {
        let type = typeof data;
        if (type == "number" || type == "boolean") {
            data = "" + data;
        }

        let string;
        if (typeof data == "object") {
            string = JSON.stringify(data);
        } else {
            string = data;
        }

        console.log('saveDataWithKey ' + string);
        await AsyncStorage.setItem(key, string);
    }

    static async  getDataWithKey(key) {
        let json = await AsyncStorage.getItem(key);
        console.log('getDataWithKey ' + json);
        let data;
        let errorParsing = false;
        if (this.isValidString(json)) {
            try {
                data = JSON.parse(json);
                console.log('getDataWithKey data' + JSON.stringify(data));
            } catch (ex) {
                errorParsing = true;
            }

        }
        if (errorParsing) {
            data = json;
        }

        // if (data != null && _class != null) {
        //     data = _class.instanceFromJSONObject(data, _class);
        // }
        return data;
    }

    static dismissKeyboard() {
        Keyboard.dismiss();
    }

    static isIOS() {
        return Platform.OS === 'ios';
    }

    static isAndroid() {
        return Platform.OS === 'android';
    }

    static decimalValue = (decimal, number) => {
        if (decimal == null || typeof decimal == undefined || decimal == undefined) {
            return 0;
        }
        return parseFloat(decimal).toFixed(number);
    }

}