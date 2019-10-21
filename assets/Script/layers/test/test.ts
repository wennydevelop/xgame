
import Dialog from '../../core/Dialog';
import GlobalEmit from '../../core/GlobalEmit';
import Core from '../../core/Core';
const {ccclass, property} = cc._decorator;

@ccclass
export default class test extends Dialog {

    //@property(cc.Label)
    //label: cc.Label = null;

    onInit(data:any){
        
    }

    onload(){
        
    }

    onEnable(){
        //cc.director.getCollisionManager().enabled = true;
        //cc.director.getCollisionManager().enabledDebugDraw = true;
        //cc.director.getCollisionManager().enabledDrawBoundingBox = true;
    }

    onDisable(){
        //cc.director.getCollisionManager().enabled = false;
        //cc.director.getCollisionManager().enabledDebugDraw = false;
        //cc.director.getCollisionManager().enabledDrawBoundingBox = false;
    }

    start () {

        
    }

    update(dt){
        // 
    }

    onDestroy(){
        
    }

    onClickClose(){
        GlobalEmit.instance.messageEmit.emit("CloseLayer","test");
        Core.instance.closeLayer("prefabs/test");
        //this.close();
    }
}
