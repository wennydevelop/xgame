import bullet from "./bullet";

const {ccclass, property} = cc._decorator;

@ccclass
export default class tank extends cc.Component{

    private _speed:cc.Vec2 = cc.v2(0,0);
    
    public bValide:boolean = true;
    public bSelf:boolean = false;
    public tag:number = 0;
    public group:number = 0;

    private lastSpeed:cc.Vec2 = cc.v2(0,1);
    private tankRadius:number = 32;
    private bulletRadius:number = 16;

    @property (cc.Node)
    tankImage:cc.Node = null;
    
    onload(){
        
    }

    start () {
        let collider = this.getComponent(cc.CircleCollider);
        if (!collider) {
            return;
        }
        //this.schedule(this.checkTankMove,1);
    }

    checkTankMove(){
        if(this.bValide){
            this.node.x += this._speed.x;
            this.node.y += this._speed.y;
        }
    }

    update(dt){
       this.checkTankMove();
       if( !(this.speed.x==0 && this.speed.y==0) ){
            this.tankImage.rotation = this.getDirOffset();
            this.lastSpeed = this.speed;
       }
    }

    onDestroy(){

    }

    // 返回资源的旋转角度
    getDirOffset(){

        if(!this._speed){
            return 0;
        }
        if(this._speed.x==0 && this._speed.y==0){
            return 0;
        }

        //获取相对于x轴正轴的偏转弧度
        let offHd = Math.atan2(this._speed.y,this._speed.x);
        // 偏转角度
        let offJd = (offHd*180)/Math.PI;

        // 旋转角度
        if(offJd>=0){
            if(offJd<=90){
                return 90-offJd;
            }else{
                return 360-offJd+90;
            }
        }else{
            return -offJd+90;
        }
    }

    set speed(value:cc.Vec2){
        //console.log("tank setSpeed x: "+value.x+" y: "+value.y);
        this._speed = value;
    }

    get speed(){
        return this._speed;
    }

    setPos(p:cc.Vec2){
        this.node.x = p.x;
        this.node.y = p.y;
    }

    getLastSpeed(){
        return this.lastSpeed;
    }

    getFirePos():cc.Vec2{
        let radius = Math.sqrt(Math.abs(this.lastSpeed.x*this.lastSpeed.x)+Math.abs(this.lastSpeed.y*this.lastSpeed.y));

        let addRadius = this.tankRadius+this.bulletRadius+5;
        return cc.v2(this.node.x+(this.lastSpeed.x*addRadius)/radius, this.node.y+(this.lastSpeed.y*addRadius)/radius )
    }
    
    getNowPos(){
        return cc.v2(this.node.x, this.node.y);
        //return cc.v2(Math.floor(this.node.x), Math.floor(this.node.y));
    }

    onCollisionEnter (other, self) {
        console.log("tank collision enter")
        // 1st step 
        // get pre aabb, go back before collision
        let otherAabb = other.world.aabb;
        let otherPreAabb = other.world.preAabb.clone();

        let selfAabb = self.world.aabb;
        let selfPreAabb = self.world.preAabb.clone();
    }
    
    onCollisionStay (other, self) {
        console.log("tank collision stay")
        
    }
    
    onCollisionExit (other) {
        console.log("tank collision exit")
        
    }

    collision(collNode:cc.Node){
        let tankScript:tank = collNode.getComponent(tank);
        if(tankScript){
            if(tankScript.group==this.group){
                return;
            }else{
                this.bValide = false;
            }
        }

        let bulletScript:bullet = collNode.getComponent(bullet);
        if(bulletScript){
            if(bulletScript.group==this.group){
                return;
            }else{
                this.bValide = false;
            }
        }
    }

    checkImage(){
        let imageNode:cc.Node = this.node.getChildByName("image");
        if(imageNode){
            
        }
    }
}