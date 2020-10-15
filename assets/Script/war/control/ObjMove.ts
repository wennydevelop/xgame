
// 物体的运动控制
export default class ObjMove {
    // 
    protected _position: cc.Vec2 = cc.v2(0, 0);// 位置
    protected _rotation: number = 0;

    // setting param
    protected _maxWidth: number = 375;  // 横向长度的一半
    protected _maxHeight: number = 667; // 纵向长度的一半
    protected _planeSize: cc.Size = cc.size(50, 50);// 物体的大小

    constructor(originPos: cc.Vec2, size: cc.Size) {
        this._position = originPos;
        this._planeSize = size;
    }

    get postion() { return this._position; }
    get rotation() { return this._rotation; }
    public add(x: number, y: number) {
        let posX: number = this._position.x + x;
        let posY: number = this._position.y + y;
        if (posX + this._planeSize.width / 2 >= this._maxWidth) { posX = this._position.x; }
        if (posY + this._planeSize.height / 2 >= this._maxHeight) { posY = this._position.y; }
        this._position = cc.v2(posX, posY);

        let value = Math.atan2(y, x);
        if (value) { this._rotation = (value * 180) / Math.PI; }
    }

}
