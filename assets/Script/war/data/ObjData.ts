
// 物体的数据
export default class ObjData {

    protected _uid: number = 0;// 物体唯一标识
    protected _pos: cc.Vec2 = cc.v2(0, 0);// 初始位置

    constructor(uid: number, pos: cc.Vec2) {
        this._uid = uid;
        this._pos = pos;

    }

    get uid() { return this._uid; }
    get originPos() { return this._pos; }
}
