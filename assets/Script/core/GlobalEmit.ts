export default class GlobalEmit {
    protected static _instance: GlobalEmit
    public static get instance(): GlobalEmit {
        if (!this._instance)
            this._instance = new GlobalEmit();
        return this._instance;
    }
    public messageEmit = new cc.EventTarget();
}