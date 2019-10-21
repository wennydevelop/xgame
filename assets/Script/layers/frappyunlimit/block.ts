import frappymanager, { Frappy_Statu } from "./frappymanager";

const {ccclass, property} = cc._decorator;


@ccclass
export default class block extends cc.Component{

    public bValide:boolean = true;
    public tag:number = 0;
    public moveSpeed:number = -5;
    public endPosX:number = -750;

    private prePx:number = 0;
    private prePy:number = 0;
    onload(){
        
    }

    start () {
        let collider = this.getComponent(cc.BoxCollider);
        if (!collider) {
            return;
        }
    
        this.scheduleOnce(this.printPos,1);
    }

    update(dt){
        if(this.isPlaying() && this.tag!=0){
            this.robotRun();
        }
    }

    isPlaying(){
        return (frappymanager.instance.gameStatu==Frappy_Statu.playing);
    }

    onDestroy(){

    }

    printPos(){
        this.schedule(()=>{
            if(Math.floor(this.prePx)==Math.floor(this.node.x) && Math.floor(this.prePy)==Math.floor(this.node.y)){

            }else{
                console.log("tag: "+this.tag+" Px: "+Math.floor(this.node.x)+" Py: "+Math.floor(this.node.y));
                this.prePx = this.node.x;
                this.prePy = this.node.y;
            }
            
        },1);
    }

    resetPos(px:number,py:number){
        this.node.x = px;
        this.node.y = py;
        console.log("resetPos tag: "+this.tag+" Px: "+Math.floor(this.node.x)+" Py: "+Math.floor(this.node.y))
    }

    getNowPos(){
        return cc.v2(Math.floor(this.node.x), Math.floor(this.node.y));
    }

    robotRun(){
        if(this.bValide){
            this.node.active = true;
            this.node.x += this.moveSpeed;   
            this.checkValide();  
        }else{
            this.node.active = false;
        }
    }

    checkValide(){
        //this.bValide = (this.node.x<this.endPosX);
        let dis:number = this.node.x-this.endPosX;
        this.bValide = dis>0?true:false;
    }
}