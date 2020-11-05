
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

    testCos() {

        let output = (x: number, y: number) => {

            let value = Math.atan2(y, x);
            let angle = (value * 180) / Math.PI;
            let tx = Math.cos(value);
            let ty = Math.sin(value);

            console.log(`x:${Math.floor(x * 100) / 100} y:${Math.floor(y * 100) / 100}`);
            console.log(`角度:${angle} tx:${Math.floor(tx * 100) / 100} ty:${Math.floor(ty * 100) / 100}`);
        }

        let a: number = 1 / (Math.sqrt(2));
        let arr: number[][] = [
            [1, 0], [a, a], [0, 1], [-a, a], [-1, 0],
            [a, -a], [0, -1], [-a, -a]
        ]

        for (let i = 0; i < arr.length; i++) {
            output(arr[i][0], arr[i][1]);
        }
    }

    // 
    getSystemTime() {
        return new Date()
    }

    test() {

    }
}