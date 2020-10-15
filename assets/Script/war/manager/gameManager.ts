import Player from "../data/Player";
import Core from "../../core/Core";
import warPanel from "../warPanel";
import BaseObj from "../comp/BaseObj";

// 
export class GameManager {

    public playerSelf: Player = null;
    protected _allObj: { [key: number]: cc.Node } = {};
    protected _id: number = 0;
    protected _layer: cc.Node = null;
    protected _running: boolean = false;
    public getUid() {
        this._id += 1;
        return this._id;
    }
    public isRunning() { return this._running; }
    public gameStart() {
        this._running = true;
    }

    public gameUpdate(dt: number) {
        if (!this._running) { return; }
        for (let i = 0; i < this._id; i++) {
            let uid: number = i + 1;
            let node = this._allObj[uid];
            if (node) {
                let comp = node.getComponent(BaseObj);
                if (comp) { comp.onUpdate(dt); }
            }
        }
    }

    public gameOver() {
        this._running = false;
        this.reset();
    }

    public createPlayer(id: number, pos: cc.Vec2, self: boolean = false): Player {
        let comp = this._getComp(this._getGameLayer());
        if (!comp) { return; }
        let node = comp.createPlane(id, pos);
        this._allObj[id] = node;

        let user = new Player(id, node);
        if (self) { this.playerSelf = user; }
        let objComp = node.getComponent(BaseObj);
        if (objComp) { objComp.setPlayer(user); }
        return user;
    }

    protected reset() {
        this._id = 0;
        this._allObj = {};
        this.playerSelf = null;
        this._layer = null;
    }

    protected _getGameLayer() {
        if (this._layer) { return this._layer; }
        let data = Core.instance.getLayerList();
        for (let i = 0; i < data.length; i++) {
            let tmp = data[i];
            if (tmp.url == 'prefabs/warPanel') {
                this._layer = tmp.node;
                break;
            }
        }
        return this._layer;
    }

    protected _getComp(node: cc.Node) {
        return node ? node.getComponent(warPanel) : null;
    }
}
let gm = new GameManager;
export default gm;
