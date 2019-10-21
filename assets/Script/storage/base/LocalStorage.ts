import { XXTEA } from "../../utils/crypt/xxtea";
import Info from "../../Info";
import CV from './CV'
const cversion=CV.cversion

export default class LocalStorage{
    
    static defaultEncryptKey:string="^sdEF\n'r\r*@2\t!#~-+j;#$gnjl;csa`"
    static _encryptKey:string="^sdEF\n'r\r*@2\t!#~-+j;#$gnjl;csa`"
    
    static set encryptKey(v){
        this._encryptKey=v
    }
    static get encryptKey(){
        return this._encryptKey
    }

    static _setItem(key:string,value:string,encrypt:boolean=true,async:boolean=false){
        if(encrypt){
            value=XXTEA.encryptToBase64Ex1(value,LocalStorage.defaultEncryptKey)
        }
        if(window["wx"]){
            if(async){
                wx.setStorage({key:key,data:value,complete:()=>{}})
            }else{
                return wx.setStorageSync(key,value)
            }
        }else{
            return cc.sys.localStorage.setItem(key,value)
        }
    }
    static setItem(key:string,value:string,encrypt:boolean=true,async:boolean=false){
        LocalStorage._setItem('himini$z',cversion+Info.version,false,async)
        return LocalStorage._setItem(key,value,encrypt,async)
    }
    static getItem(key:string,encrypt:boolean=true){
        let value
        if(window["wx"]){
            value=wx.getStorageSync(key)
        }else{
            value= cc.sys.localStorage.getItem(key)
        }
        if(encrypt){
            let newValue:string
            newValue=XXTEA.decryptFromBase64Ex1(value,LocalStorage.defaultEncryptKey)
            return newValue
        }
        return value
    }
}