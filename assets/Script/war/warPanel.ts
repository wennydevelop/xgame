import Dialog from '../core/Dialog';
import GlobalEmit from '../core/GlobalEmit';
import BaseObj from './comp/BaseObj';
import gm from './manager/gameManager';
import Joystick from '../comp/Joystick';

const { ccclass, property } = cc._decorator;

@ccclass
export default class warPanel extends Dialog {
    @property(cc.Node)
    gameNode: cc.Node = null;

    @property(cc.Node)
    JoysNode: cc.Node = null;

    @property(cc.Node)
    plane: cc.Prefab = null;

    @property(cc.Node)
    joystick: cc.Prefab = null;

    protected _joys: cc.Node = null;
    onInit(data: any) {
    }

    onload() { }

    start() {
        let tmp = cc.instantiate(this.joystick);
        tmp.parent = this.JoysNode;
        let comp = tmp.getComponent(Joystick);
    }

    update(dt) { }

    onDestroy() { }

    public createPlane(uid: number, pos: cc.Vec2): cc.Node {
        let tmp = cc.instantiate(this.plane);
        let comp = tmp.getComponent(BaseObj);
        if (comp) { comp.uid = uid; comp.pos = pos; }
        tmp.parent = this.gameNode;
        return tmp;
    }

    protected onClickStart() {
        this.gameNode.removeAllChildren();
        gm.createPlayer(gm.getUid(), cc.v2(0, 0), true);
        gm.gameStart();
    }

    protected onClickEnd() {
        gm.gameOver();
        this.gameNode.removeAllChildren();
    }

    protected onClickClose() {
        GlobalEmit.instance.messageEmit.emit("CloseLayer", "warPanel");
        this.close();
    }

}
