import Dialog from '../core/Dialog';
import GlobalEmit from '../core/GlobalEmit';

const { ccclass, property } = cc._decorator;

@ccclass
export default class gameLayer extends Dialog {
    @property(cc.Node)
    root: cc.Node = null;



    onInit(data: any) {

    }

    onload() {

    }

    start() {

    }

    update(dt) {
        // 
    }

    onDestroy() {

    }

    onClickClose() {
        GlobalEmit.instance.messageEmit.emit("CloseLayer", "gameLayer");
        this.close();
    }

}
