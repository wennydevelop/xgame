import { SafeClass } from "../base/SafeData";
import DataBase from "../base/DataBase";

@SafeClass("UserData")
export default class UserData extends DataBase {
    constructor() {
        super()
    }

    userLv: number = 1                    //用户等级  
    _ap: number = 0                   //体力

    get ap() {
        return this._ap;
    }
    set ap(value) {
        this._ap = value;
        //GlobalEmit.instance.messsgeEmit.emit("UpdateAp");
    }

}