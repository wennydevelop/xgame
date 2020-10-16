import Player from "../data/Player";
import ObjMove from "../control/ObjMove";
import { WarCmd, CmdType } from "../DefineUtil";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BaseObj extends cc.Component {

    @property(cc.Node)
    realObj: cc.Node = null;

    protected _uid: number = 0;
    protected _originPos: cc.Vec2 = cc.v2(0, 0);
    protected _player: Player = null;
    protected _moveControl: ObjMove = null;
    start() {
        this._initMoveCtrl();
    }

    onLoad() { }
    onDestroy() { }
    update(dt: number) { }

    public setPlayer(data: Player) { this._player = data; }
    set uid(value: number) { this._uid = value; }
    get uid() { return this._uid; }
    set pos(value: cc.Vec2) { this._originPos = value; }

    public onUpdate(dt: number) {
        if (this._player) {
            let cmd = this._player.getCmd()
            while (cmd) {
                this.onCmd(cmd);
                cmd = this._player.getCmd();
            }
        }

        if (this._moveControl) {
            this.node.position = this._moveControl.postion;
            this.realObj.rotation = this._moveControl.rotation;
        }
    }

    protected onCmd(cmd: WarCmd) {
        switch (cmd.t) {
            case CmdType.move:
                if (this._moveControl) { this._moveControl.add(cmd.p1, cmd.p2); }
                break;
            default:
                break;
        }
    }

    protected _initMoveCtrl() {
        this._moveControl = new ObjMove(this._originPos, this.realObj.getContentSize());
    }
}
