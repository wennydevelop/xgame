const { ccclass, property } = cc._decorator;

// 物体的运动控制
@ccclass
export default class ObjMove {

    protected _acc: number = 0;// 加速度
    protected _speed: cc.Vec2 = cc.v2(0, 0);// 移动速度
    protected _accDecline: number = 0;// 加速度递减系数
    protected _position: cc.Vec2 = cc.v2(0, 0);// 位置

    // setting param
    protected _maxAcc: number = 10;     // 最大加速度
    protected _maxSpeed: number = 50;   // 最大速度
    protected _maxWidth: number = 375;  // 横向长度的一半
    protected _maxHeight: number = 667; // 纵向长度的一半
    protected _planeSize: cc.Size = cc.size(50, 50);// 物体的大小

    constructor(originPos: cc.Vec2, size: cc.Size) {
        this._position = originPos;
        this._planeSize = size;
    }
    set accSpeed(value: number) { this._acc = value; }
    get accSpeed() { return this._acc; }
    set speed(value: cc.Vec2) { this._speed = value; }
    get speed() { return this._speed; }
    set postion(value: cc.Vec2) { this._position = value; }
    get postion() { return this._position; }

    public update(dt: number) {
        this._checkAcceleration(dt);
        this._checkMoveSpeed();
        this._checkPositon(dt);
    }

    private _checkPositon(dt: number) {
        let posX: number = this._position.x + this._speed.x * dt;
        let posY: number = this._position.y + this._speed.y * dt;
        if (posX + this._planeSize.width / 2 >= this._maxWidth) { posX = this._position.x; }
        if (posY + this._planeSize.height / 2 >= this._maxHeight) { posY = this._position.y; }
        this._position = cc.v2(posX, posY);
    }
    private _checkAcceleration(dt: number) {
        this._acc += this._accDecline * dt;
        if (this._acc > this._maxAcc) { this._acc = this._maxAcc; }
        if (this._acc + this._maxAcc < 0) { this._acc = -this._maxAcc; }
    }
    private _checkMoveSpeed() {
        this._speed.x += this._acc;
        this._speed.y += this._acc;
        if (this._speed.x > this._maxSpeed) { this._speed.x = this._maxSpeed; }
        if (this._speed.y > this._maxSpeed) { this._speed.y = this._maxSpeed; }
        if (this._speed.x <= 0) { this._speed.x = 0; }
        if (this._speed.y <= 0) { this._speed.y = 0; }
    }
}
