import Dialog from '../../core/Dialog';
import GlobalEmit from '../../core/GlobalEmit';
import dragon_Control from './dragon_control';
const {ccclass, property} = cc._decorator;

@ccclass
export default class frappy extends Dialog {
    @property(cc.Node)
    dragon: cc.Node = null;

    onInit(data:any){

    }

    onload(){
        
    }

    onEnable(){
        cc.director.getCollisionManager().enabled = true;
        cc.director.getCollisionManager().enabledDebugDraw = true;
        cc.director.getCollisionManager().enabledDrawBoundingBox = true;
    }

    onDisable(){
        cc.director.getCollisionManager().enabled = false;
        cc.director.getCollisionManager().enabledDebugDraw = false;
        cc.director.getCollisionManager().enabledDrawBoundingBox = false;
    }

    start () {

        
    }

    update(dt){
        // 
    }

    onDestroy(){
        
    }

    onClickClose(){
        GlobalEmit.instance.messageEmit.emit("CloseLayer","frappy");
        this.close();
    }

    onClickStart(){
        if(this.dragon){
            let control_scrip:dragon_Control = this.dragon.getComponent(dragon_Control);
            if(control_scrip){
                control_scrip.reStart();
            }
        }
    }
}
