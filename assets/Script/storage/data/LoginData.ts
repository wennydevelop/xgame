import DataBase from "../base/DataBase";
import { SafeClass } from "../base/SafeData";

@SafeClass("LoginData")
export default class LoginData extends DataBase {
    constructor() {
        super();
    }
    id: number | string = 0;
    avatarUrl: string = null;
    nickName: string = null;
    isNew: boolean = false;
    version: string = "1.0.0";//游戏版本号
    wxAccount: string = "";//微信号
    openWa: number = 0;//是否公开微信号
}