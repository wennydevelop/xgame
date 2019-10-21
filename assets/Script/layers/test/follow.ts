

const {ccclass, property} = cc._decorator;

@ccclass
export default class follow extends cc.Component{

    @property(cc.Node)
    target:cc.Node = null

    // use this for initialization
    onLoad() {
       
    }

    start(){
        // 由于需要键盘操作所以只能在 PC 才可用
        this.node.active = !cc.sys.isMobile || CC_PREVIEW;

        if (!this.target) {
            return;
        }
        let follow = cc.follow(this.target, cc.rect(0,0, 4000,750));
        this.node.runAction(follow);
    }
}
