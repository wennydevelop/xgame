import GlobalEmit from '../core/GlobalEmit';
import BaseObj from './comp/BaseObj';
import gm from './manager/gameManager';
import Joystick from '../comp/Joystick';
import { CmdType } from './DefineUtil';
import BasePanel from '../core/BasePanel';

const { ccclass, property } = cc._decorator;

@ccclass
export default class warPanel extends BasePanel {
    @property(cc.Node)
    gameNode: cc.Node = null;

    @property(cc.Node)
    JoysNode: cc.Node = null;

    @property(cc.Prefab)
    plane: cc.Prefab = null;

    @property(cc.Prefab)
    joystick: cc.Prefab = null;

    protected _joys: cc.Node = null;
    onInit(data: any) {
    }

    onload() { }

    start() {
        this._joys = cc.instantiate(this.joystick);
        this._joys.parent = this.JoysNode;
        let comp = this._joys.getComponent(Joystick);
    }

    update(dt: number) {
        if (gm.isRunning()) {
            let comp = this._joys.getComponent(Joystick);
            if (comp) {
                let move = comp.getMove();
                if (move.x != 0 && move.y != 0) {
                    //console.log(`move cmd x:${move.x} y:${move.y}`);
                    gm.playerSelf.onControlCmd({ t: CmdType.move, p1: move.x, p2: move.y })
                }
            }
        }

        gm.gameUpdate(dt);
    }

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
