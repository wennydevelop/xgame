
const { ccclass, property } = cc._decorator;

@ccclass
export default class bullet extends cc.Component {

    private lifeSec: number = 3;
    private _speed: cc.Vec2 = cc.v2(0, 0);
    private perSec: number = 0;
    
    public bValide: boolean = true;
    public tag:number = 0;
    public group:number = 0;

    onload() {

    }

    start() {
        let collider = this.getComponent(cc.CircleCollider);
        if (!collider) {
            return;
        }
    }

    checkMove() {
        if (this.bValide) {
            this.node.x += this._speed.x;
            this.node.y += this._speed.y;
        }
    }

    checkLife(dt) {
        this.perSec += dt;
        //console.log("bullet dt: " + this.perSec);
        if (this.perSec >= 1) {
            this.lifeSec--;
            this.perSec = 0;
            console.log("bullet tag:"+this.tag+" valid:"+this.bValide+" lifeSec:"+this.lifeSec)
            if (this.lifeSec <= 0) {
                this.bValide = false;
                this.node.active = false;
            }
        }

    }

    update(dt) {
        if(this.tag==0){
            return;
        }
        //console.log("bullet tag:"+this.tag+" valid:"+this.bValide+" px:"+this.node.x+" py:"+this.node.y);
        //this.node.active = this.bValide;

        this.checkLife(dt);
        this.checkMove();
    }

    onDestroy() {

    }

    reSet(){
        this.bValide = true;
        this.node.active = true;
        this.lifeSec = 3;
    }

    set speed(value:cc.Vec2){
        console.log("bullet spx:"+value.x+" spy:"+value.y+" tag:"+this.tag);
        this._speed = value;
    }

    get speed(){
        return this._speed;
    }
    setPos(p:cc.Vec2){
        this.node.x = p.x;
        this.node.y = p.y;
    }

    getNowPos() {
        return cc.v2(this.node.x, this.node.y);
        //return cc.v2(Math.floor(this.node.x), Math.floor(this.node.y));
    }

    onCollisionEnter(other, self) {
        console.log("bullet collision enter")
        this.bValide = false;
    }

    onCollisionStay(other, self) {
        console.log("bullet collision stay")
        this.bValide = false;
    }

    onCollisionExit(other) {
        console.log("bullet collision exit")
        this.bValide = false;
    }
}