
const { ccclass, property, menu } = cc._decorator;
// 控制杆
@ccclass
@menu("view/component/Joystick")
export default class Joystick extends cc.Component {
    @property(cc.Node)
    disk: cc.Node = null;

    @property(cc.Node)
    stick: cc.Node = null;

    protected _touchPos: cc.Vec2 = cc.v2(0, 0);
    protected _radius: number = 100;
    protected _move: cc.Vec2 = cc.v2(0, 0);
    start() {
        this._adaptUI();
        this._registerTouch();
    }

    public getMove(): cc.Vec2 { return this._move; }

    protected _adaptUI() {
        for (let i = 0; i < this.node.children.length; i++) {
            let child = this.node.children[i];
            let comp = child.getComponent(cc.Widget);
            if (comp) { comp.updateAlignment(); }
        }
    }

    protected _registerTouch() {
        if (!this.disk || !this.stick) { return; }
        this.disk.on(cc.Node.EventType.TOUCH_START, function (e: cc.Event.EventTouch) {
            this.stick.scale = 1.1;
            this._touchPos = this.disk.convertTouchToNodeSpaceAR(e);
            this.stick.position = this._touchPos;
        }, this)
        this.disk.on(cc.Node.EventType.TOUCH_MOVE, function (e: cc.Event.EventTouch) {
            let pos: cc.Vec2 = this.disk.convertTouchToNodeSpaceAR(e);
            if (this._canStickMoveTo(pos)) {
                this.stick.position = pos;
                this._move = this._calculateMoveDis(pos);
            }
        }, this)
        this.disk.on(cc.Node.EventType.TOUCH_END, function (e: cc.Event.EventTouch) {
            this._stickHome();
        }, this)
        this.disk.on(cc.Node.EventType.TOUCH_CANCEL, function (e: cc.Event.EventTouch) {
            this._stickHome();
        }, this)
    }

    protected _stickHome() {
        this.stick.scale = 1;
        this.stick.position = cc.v2(0, 0);
        this._move = cc.v2(0, 0);
    }

    protected _canStickMoveTo(pos: cc.Vec2): boolean {
        return Math.sqrt((Math.pow(pos.x, 2) + Math.pow(pos.y, 2))) <= this._radius;
    }

    protected _calculateMoveDis(pos: cc.Vec2): cc.Vec2 {
        if (pos.x == 0) { return cc.v2(0, pos.y / this._radius); }
        let y = pos.y / Math.abs(pos.x);
        y = y > 1 ? 1 : y;
        y = y < -1 ? -1 : y;
        return cc.v2(pos.x / this._radius, y);
    }
}