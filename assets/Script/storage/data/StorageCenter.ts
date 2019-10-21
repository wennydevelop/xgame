//import UserData from "./UserData";
import StorageBase from "../base/StorageBase";

export default class StorageCenter extends StorageBase {
    protected static _instance: StorageCenter


    static get instance() {
        if (this._instance == null) {
            this._instance = new StorageCenter();
        }
        return this._instance
    }

    //userData = new UserData
    
    constructor() {
        super()
    }

    reset() {
        //this.userData = new UserData
    }

    public applyServerReward(reward) {
        
    }

    fixData() {//修复数据  防止修改内存后直接杀游戏
        //this.userData.boxDatas.fixData();
        //this.farmSkinData.fixData();
    }

}