import { WarCmd } from "../DefineUtil";

// 
export default class Player {
    protected _uid: number = 0;
    protected _active: boolean = false;

    protected _cmd: WarCmd[] = [];
    protected _plane: cc.Node = null;
    protected _isSelf: boolean = false;
    constructor(uid: number, node: cc.Node) {
        this._uid = uid;
        this._plane = node;
    }

    set active(value: boolean) { this._active = value; }
    get active() { return this._active; }
    set isSelf(value: boolean) { this._isSelf = value; }
    get isSelf() { return this._isSelf; }

    public onControlCmd(cmd: WarCmd) {
        if (cmd) { this._cmd.push(cmd); }
    }
    public getCmd() {
        if (this._cmd.length <= 0) { return null; }
        return this._cmd.shift();
    }
}
