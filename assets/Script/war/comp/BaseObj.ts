import ObjMove from "../control/ObjMove";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BaseObj extends cc.Component {

    @property(cc.Node)
    realSize: cc.Node = null;

    protected _moveControl: ObjMove = null;
    start() {
        this._moveControl = new ObjMove(cc.v2(0, 0), this.realSize.getContentSize());
    }

    onLoad() { }

    onDestroy() { }

    public update(dt: number) {
        this._checkMove(dt);
    }

    protected _checkMove(dt: number) {
        if (!this._moveControl) { return; }
        this._moveControl.update(dt);
        this.node.position = this._moveControl.postion;
    }
}
