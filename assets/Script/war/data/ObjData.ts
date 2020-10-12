const { ccclass, property } = cc._decorator;

// 物体的数据
@ccclass
export default class ObjData {

    protected _uid: number = 0;// 物体唯一标识
    protected _acc: number = 0;// 加速度
    protected _speed: cc.Vec2 = cc.v2(0, 0);// 移动速度


}
