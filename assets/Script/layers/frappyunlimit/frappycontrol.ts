import Core from "../../core/Core";
import frappymanager, { Frappy_Statu } from "./frappymanager";

const {ccclass, property} = cc._decorator;

@ccclass
export default class frappycontrol extends cc.Component{

    // 是否向上
    private bUpTouch:boolean = false;
    // 横向移动控制变量
    private moveX:number = 0;
    // 纵向移动控制变量
    private moveY:number = 0;

    private upSpeed:number = 200;
    private downFrame:number = 8;
    
    onload(){

    }

    start() {
        //add keyboard input listener to call turnLeft and turnRight
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyPressed, this);
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, this.onKeyReleased, this);

        cc.director.getCollisionManager().enabled = true;
        //cc.director.getCollisionManager().enabledDebugDraw = true;
    }

    isPlaying(){
        return (frappymanager.instance.gameStatu==Frappy_Statu.playing);
    }

    resetFrappy(){
        this.node.x = 0;
        this.node.y = 0;

        this.bUpTouch = false;
        this.moveX = 0;
        this.moveY = 0;
    }

    onKeyPressed(event) {
        let keyCode = event.keyCode;
        if(!this.isPlaying()){
            return;
        }
        switch(keyCode) {
            case cc.macro.KEY.a:
            case cc.macro.KEY.left:
                this.moveX = -200;
                break;
            case cc.macro.KEY.d:
            case cc.macro.KEY.right:
                this.moveX = 200;
                break;
            case cc.macro.KEY.w:
            case cc.macro.KEY.up:
                this.bUpTouch = true;
                this.moveY = this.upSpeed;
                break;
        }
    }

    onKeyReleased(event) {
        let keyCode = event.keyCode;
        if(!this.isPlaying()){
            return;
        }
        switch(keyCode) {
            case cc.macro.KEY.a:
            case cc.macro.KEY.left:
                this.moveX = 0;
                break;
            case cc.macro.KEY.d:
            case cc.macro.KEY.right:
                this.moveX = 0;
                break;
            case cc.macro.KEY.w:
            case cc.macro.KEY.up:
                this.bUpTouch = false;
                break;
        }
    }

    onCollisionEnter (other, self) {
        console.log("frappy collision enter")
        //this.node.color = cc.Color.RED;
        
        Core.instance.toast("Game Over~"); 
        frappymanager.instance.gameStatu = Frappy_Statu.over;
    }
    
    onCollisionStay (other, self) {
       
    }
    
    onCollisionExit (other) {
        console.log("frappy collision exit")
    }
    
    update(dt){
        if(!this.isPlaying()){
            return;
        } 
        //console.log("update: "+dt);

        if(this.moveX==0){
            // 纵向速度
            this.moveY = this.bUpTouch?this.moveY:(this.moveY-this.downFrame);
            this.node.y += this.moveY*dt;
        }else{
            this.node.x += this.moveX*dt;
        }

    }

    onDestroy(){
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyPressed, this);
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_UP, this.onKeyReleased, this);

        cc.director.getCollisionManager().enabled = false;
    }
}