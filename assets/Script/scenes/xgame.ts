import Scene from '../core/Scene'
import Core from '../core/Core';
import utilTest from '../utils/utilTest';
import GlobalEmit from '../core/GlobalEmit';
import { initTable } from '../config/cfg/TableInit';

const {ccclass, property} = cc._decorator;
@ccclass
export default class xgame extends Scene {

    @property(cc.Label)
    label: cc.Label = null;

    protected baseKey:string = "";
    protected centerKey:string = "";

    onload(){
    }

    start () {

        // 界面ui框架初始化
        Core.instance.init();
        // 本地配置表初始化
        initTable({});

        this.valideEvent(true);
        this.test();
    }

    update(dt){
        // 
    }

    onDestroy(){
        Core.instance.off(Core.SHOW);
        Core.instance.off(Core.HIDE);
        this.valideEvent(false);
    }

    onClickBottom(sender: cc.Event.EventTouch){
        if(sender){
            let target:cc.Node = sender.currentTarget;
            if(target){
                if(target.name==="btn_test"){
                    Core.instance.showLayer("prefabs/test");
                }else if(target.name==="btn_frappy"){
                    Core.instance.showLayer("prefabs/frappydragon");
                }else if(target.name==="btn_frappyunlimit"){
                    Core.instance.showLayer("prefabs/frappyunlimit");
                }else if(target.name==="btn_pinball"){
                    Core.instance.showLayer("prefabs/pinball");
                }else if(target.name==="btn_tank"){
                    Core.instance.showLayer("prefabs/tank");
                }else if(target.name==="btn_block"){
                    //Core.instance.showLayer("prefabs/russiablock");
                    Core.instance.showLayer("prefabs/astar");
                }
            }
        }
    }

    valideEvent(valide:boolean){
        if(valide){
            GlobalEmit.instance.messageEmit.on("CloseLayer", (e)=>{
                console.log("close layer~");
            });
        }else{
            GlobalEmit.instance.messageEmit.off("CloseLayer");
        }
    }

    // 
    test(){
        //this.testEncrypt()
        //utilTest.instance.testStorage()
        //this.testMath();
        //utilTest.instance.testCfg();
    }

    protected testEncrypt(){
        utilTest.instance.testEncryption();
    }

    protected testMath(){

        let outputJiaodu= (value:number)=>{
            let outJd = 0;
            if(value){
                outJd = (value*180)/Math.PI
            }
            console.log("偏移角度: "+outJd);
        } 

        let value = Math.atan2(1,0);
        outputJiaodu(value);
        value = Math.atan2(1,1);
        outputJiaodu(value);
        value = Math.atan2(0,1)
        outputJiaodu(value);
        value = Math.atan2(-1,1);
        outputJiaodu(value);
        value = Math.atan2(-1,0);
        outputJiaodu(value);
        value = Math.atan2(-1,-1);
        outputJiaodu(value);
        value = Math.atan2(0,-1);
        outputJiaodu(value);
        value = Math.atan2(1,-1);
        outputJiaodu(value);
    }
}
