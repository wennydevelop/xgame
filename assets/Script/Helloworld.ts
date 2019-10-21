import Scene from '../Script/core/Scene'
import Core from './core/Core';

const {ccclass, property} = cc._decorator;

@ccclass
export default class Helloworld extends Scene {

    @property(cc.Label)
    label: cc.Label = null;

    @property
    text: string = '';

    @property(cc.ProgressBar)
    circle_pro: cc.ProgressBar = null;

    protected gameScene:string = "xgame"

    onload(){
        this.circle_pro.progress = 0;

        cc.director.preloadScene(this.gameScene,()=>{})
    }

    start () {
        // init logic
        this.label.string = this.text;

        this.scheduleOnce(()=>{
            //Core.instance.pushScene(this.gameScene);
        },3.5);

        this.schedule(()=>{
            //this.updateCirclePro(this.getCirclePro()+0.05);
        },1);

        Core.instance.pushScene(this.gameScene);
    }

    update(dt){
        // 
        //this.updateCirclePro(this.getCirclePro()+0.005);
    }

    onDestroy(){

    }


    updateCirclePro(flPro:number){
        let pro = flPro>1.00?1.00:flPro;
        pro = pro<0?0:pro;

        if(this.getCirclePro()==pro){
            return;
        }

        this.circle_pro.progress = pro;
        if(this.getCirclePro()==1){
            Core.instance.pushScene(this.gameScene);
        }
        console.log("xgame circle progress: "+pro);
    }

    getCirclePro(){
        if(this.circle_pro && cc.isValid(this.circle_pro)){
            return this.circle_pro.progress;
        }
        return 0;
    }
}
