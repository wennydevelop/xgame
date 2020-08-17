import Dialog from '../core/Dialog';
import GlobalEmit from '../core/GlobalEmit';
import Core from '../core/Core';
import loadUtil from '../utils/loadUtils';

const { ccclass, property } = cc._decorator;

@ccclass
export default class spineTest extends Dialog {
    @property(cc.Node)
    root: cc.Node = null;

    @property(cc.Node)
    sample: cc.Node = null;

    private _animationsName: string[] = [];
    private _animationIndex: number = 0;
    onInit(data: any) {

    }

    async onCilckStart() {
        let skeleton = this.sample.getComponent(sp.Skeleton);
        let nowAnimation: string = skeleton.animation;
        if (nowAnimation != "idle") { return; }
        if (this._animationsName.length <= 0) { return; }

        // play
        let playAnimation: string = this._animationsName[this._animationIndex];
        skeleton.animation = playAnimation;
        skeleton.setCompleteListener(() => {
            skeleton.animation = "idle";
            skeleton.setCompleteListener(null);
        });
        console.log("play animation " + playAnimation);
        // next
        let len: number = this._animationsName.length;
        if (this._animationIndex >= (len - 1)) {
            this._animationIndex = 0;
        } else {
            this._animationIndex += 1;
        }
    }

    onload() {

    }

    async start() {
        // aersasi
        await this.loadSpine(this.sample, "spine/feijijiangshi");
    }

    update(dt) {
        // 
    }

    onDestroy() {

    }

    async loadSpine(node: cc.Node, url: string, animation?: string) {
        if (!node || !node.getComponent(sp.Skeleton)) { return; }
        node.active = false;
        let skeletonData = await loadUtil.loadRes(url, sp.SkeletonData) as sp.SkeletonData;
        let skeleton = node.getComponent(sp.Skeleton);
        if (skeleton && cc.isValid(skeleton) && skeleton.node && cc.isValid(skeleton.node)) {
            skeleton.skeletonData = skeletonData;
            skeleton.node.active = true;
            (skeleton as any)._updateSkeletonData();
            skeleton.animation = animation ? animation : "idle";
            skeleton.loop = true;

            let json = skeleton.skeletonData.skeletonJson;
            this._animationsName = Object.keys(json.animations)
        }
    }

    onClickClose() {
        GlobalEmit.instance.messageEmit.emit("CloseLayer", "spineTest");
        this.close();
    }
}
