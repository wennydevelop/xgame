
const {ccclass, property} = cc._decorator;

enum coll_type{
    up=1,
    down=2,
    left=3,
    right=4,
}

@ccclass
export default class ball extends cc.Component{

    private maxSpeed:number = 15;
    private speedEx:number = 3;
    private _ballSpeed:cc.Vec2 = cc.v2(0,0);
    private autoMove:boolean = false;
    private isDraging:boolean = false;
    private preTouch:cc.Vec2 = cc.v2(0,0);
    
    onload(){
        
    }

    start () {
        let collider = this.getComponent(cc.CircleCollider);
        if (!collider) {
            return;
        }
        this.touchBall();
    }

    set ballSpeed(value:cc.Vec2){
        if(Math.abs(value.x)>this.maxSpeed){
            value.x = value.x>this.maxSpeed?this.maxSpeed:-this.maxSpeed;
        }
        if(Math.abs(value.y)>this.maxSpeed){
            value.y = value.y>this.maxSpeed?this.maxSpeed:-this.maxSpeed;
        }
        console.log("change ball speed x: "+value.x+" y: "+value.y);
        this._ballSpeed = value;
    }
    get ballSpeed(){
        return this._ballSpeed;
    }

    touchBall(){
        this.node.on(cc.Node.EventType.TOUCH_START,function(e:cc.Event.EventTouch){
            this.autoMove = false;
        },this)
        this.node.on(cc.Node.EventType.TOUCH_MOVE,function(e:cc.Event.EventTouch){
            let pos:cc.Vec2=this.node.getParent().convertTouchToNodeSpaceAR(e) 
            if(this.isDraging){
                this.ballSpeed = cc.v2(pos.x-this.preTouch.x, pos.y-this.preTouch.y);
                this.node.x += pos.x-this.preTouch.x;
                this.node.y += pos.y-this.preTouch.y;
            }
            this.isDraging = true;
            this.preTouch = pos;
        },this)
        this.node.on(cc.Node.EventType.TOUCH_END,function(e:cc.Event.EventTouch){
            this.autoMove = true;
            this.isDraging = false;
        },this)
        this.node.on(cc.Node.EventType.TOUCH_CANCEL,function(e:cc.Event.EventTouch){
            this.autoMove = true;
            this.isDraging = false;
        },this)
    }

    checkBallMove(){
        if(this.autoMove){
            let moveX:number = this.ballSpeed.x*this.speedEx;
            let moveY:number = this.ballSpeed.y*this.speedEx;
            moveX = moveX>this.maxSpeed?this.maxSpeed:moveX;
            moveX = moveX<-this.maxSpeed?-this.maxSpeed:moveX;
            moveY = moveY>this.maxSpeed?this.maxSpeed:moveY;
            moveY = moveY<-this.maxSpeed?-this.maxSpeed:moveY;
            this.node.x += moveX;
            this.node.y += moveY;
        }
    }

    update(dt){
        this.checkBallMove();
    }

    onDestroy(){

    }

    getNowPos(){
        return cc.v2(Math.floor(this.node.x), Math.floor(this.node.y));
    }

    private collisionDir(dir:coll_type){
        let bSpeed:cc.Vec2 = this.ballSpeed;
        if(dir==coll_type.up){
            bSpeed.y = bSpeed.y>0?-bSpeed.y:bSpeed.y;
        }else if(dir==coll_type.down){
            bSpeed.y = bSpeed.y<0?-bSpeed.y:bSpeed.y;
        }else if(dir==coll_type.left){
            bSpeed.x = bSpeed.x<0?-bSpeed.x:bSpeed.x;
        }else if(dir==coll_type.right){
            bSpeed.x = bSpeed.x>0?-bSpeed.x:bSpeed.x;
        }
        
        if(bSpeed.x!=this.ballSpeed.x || bSpeed.y!=this.ballSpeed.y){
            this.ballSpeed = bSpeed;
        }
    }

    onCollisionEnter (other, self) {
        console.log("ball collision enter")
        // 1st step 
        // get pre aabb, go back before collision
        let otherAabb = other.world.aabb;
        let otherPreAabb = other.world.preAabb.clone();

        let selfAabb = self.world.aabb;
        let selfPreAabb = self.world.preAabb.clone();

        // 2nd step
        // forward x-axis, check whether collision on x-axis
        selfPreAabb.x = selfAabb.x;
        otherPreAabb.x = otherAabb.x;

        // 横向碰撞
        if (cc.Intersection.rectRect(selfPreAabb, otherPreAabb)) {
            console.log("横向碰撞")
            if (selfPreAabb.xMax > otherPreAabb.xMax) {
                // 自己在右边,对方在左边
                console.log("球左边碰撞")
                this.collisionDir(coll_type.left);
                let endPos = this.node.parent.convertToNodeSpaceAR(cc.v2(otherPreAabb.xMax, selfPreAabb.y));
                this.node.x = endPos.x+self.radius;
            }
            else {
                // 自己在左边,对方在右边
                console.log("球右边碰撞")
                this.collisionDir(coll_type.right);
                let endPos = this.node.parent.convertToNodeSpaceAR(cc.v2(otherPreAabb.xMin, selfPreAabb.y));
                this.node.x = endPos.x-self.radius;
            }

            //other.touchingX = true;
            return;
        }

        // 3rd step
        // forward y-axis, check whether collision on y-axis
        selfPreAabb.y = selfAabb.y;
        otherPreAabb.y = otherAabb.y;

        // 纵向碰撞
        if (cc.Intersection.rectRect(selfPreAabb, otherPreAabb)) {
            console.log("纵向碰撞")
            if (selfPreAabb.yMax > otherPreAabb.yMax) {
                // 自己在上面,对方在下面
                console.log("球下边碰撞")
                //let endPos = this.node.parent.convertToNodeSpaceAR(cc.v2(selfPreAabb.x, otherPreAabb.yMax));
                //this.node.y = endPos.y+selfPreAabb.height/2
                this.collisionDir(coll_type.down);
            }
            else{
                // 自己在下面,对方在上面
                console.log("球上边碰撞")
                //let endPos = this.node.parent.convertToNodeSpaceAR(cc.v2(selfPreAabb.x, otherPreAabb.yMin));
                //this.node.y = endPos.y-selfPreAabb.height/2-1
                this.collisionDir(coll_type.up);
            }
            
            //other.touchingY = true;
        }  
    }
    
    onCollisionStay (other, self) {
        console.log("ball collision stay")
        //this.onCollisionEnter(other,self);
    }
    
    onCollisionExit (other) {
        console.log("ball collision exit")
    }
}