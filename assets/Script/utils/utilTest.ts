
import xxtea from "../utils/crypt/xxtea"
import { Md5 } from "../utils/crypt/md5"

import LocalStorage from "../storage/base/LocalStorage"
import cropconfig from "../config/cfg/cropconfig"

export default class utilTest {
    protected static _instance: utilTest
    public static get instance(): utilTest {
        if (!this._instance) {
            this._instance = new utilTest();
        }
        return this._instance;
    }

    testCfg() {
        let ids = cropconfig.map((v, i, arr) => {
            return v.cropid;
        });
        console.log(ids);
    }

    // 
    testEncryption() {

        let str = "BBBBBBB";
        let key = "glee"

        let testXXtea = () => {
            let enStr = xxtea.XXTEA.encrypt(str, key);
            console.log("xxtea enStr: " + enStr)

            let deStr = xxtea.XXTEA.decrypt(enStr, key);
            console.log("xxtea deStr: " + deStr)

            let bStr = xxtea.XXTEA.encryptToBase64(str, key);
            console.log("xxtea base64 enStr: " + bStr)

            let dStr = xxtea.XXTEA.decryptFromBase64(bStr, key);
            console.log("xxtea base64 deStr: " + dStr)
        }

        let testMd5 = () => {
            let enStr = Md5.hashStr(str);
            console.log("md5 enStr: " + enStr)
        }

        let testBase64 = () => {
            let enStr = Base64.encode(str);
            console.log("base64 enStr: " + enStr)

            let deStr = Base64.decode(enStr);
            console.log("base64 deStr: " + deStr)
        }

        testXXtea();
        testMd5();
        testBase64();
    }

    testStorage() {
        let testValue: string = "18682237863";

        // base
        let key: string = "base_20190110";
        let testStr: string = LocalStorage.getItem(key);
        if (testStr) {

        } else {
            LocalStorage.setItem(key, testValue);
        }
        testStr = LocalStorage.getItem(key);

        // center
    }

    // 
    getSystemTime() {
        return new Date()
    }

    test() {

    }
}