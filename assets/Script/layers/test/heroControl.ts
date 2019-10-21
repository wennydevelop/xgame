
const {ccclass, property} = cc._decorator;

@ccclass
export default class heroControl extends cc.Component{

    @property(sp.Skeleton)
    heroSpine: sp.Skeleton = null;

    @property(cc.v2)
    speed:cc.Vec2 = cc.v2(0, 0)

    @property(cc.v2)
    maxSpeed:cc.Vec2=cc.v2(400, 600)
    
    // 重力
    @property gravity= -2000
    // 牵引
    @property drag= 1500
    // 运动方向 1向右运动 -1向左运动
    @property direction= 0
    // 跳跃速度
    @property jumpSpeed= 2500

    // X轴碰撞标志位 1向右碰撞 -1向左碰撞 0无碰撞
    collisionX = 0;
    // Y轴碰撞标志位 1向上碰撞 -1向下碰撞 0无碰撞
    collisionY = 0;

    prePosition =  cc.v2();
    preStep =  cc.v2();

    touchingNumber = 0;
    // 是否跳跃中
    jumping = false;
    hold_time = 0;
    onload(){

    }

    start() {
        //add keyboard input listener to call turnLeft and turnRight
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyPressed, this);
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, this.onKeyReleased, this);

        this.collisionX = 0;
        this.collisionY = 0;

        this.prePosition = cc.v2();
        this.preStep = cc.v2();

        this.touchingNumber = 0;
        this.jumping = false;

        this.loadSpine("spine/"+"boluo", this.heroSpine, "boluo");
    }

    onEnable() {
        cc.director.getCollisionManager().enabled = true;
        cc.director.getCollisionManager().enabledDebugDraw = true;
    }

    onDisable () {
        cc.director.getCollisionManager().enabled = false;
        cc.director.getCollisionManager().enabledDebugDraw = false;
    }

    onKeyPressed(event) {
        let keyCode = event.keyCode;
        switch(keyCode) {
            case cc.macro.KEY.a:
            case cc.macro.KEY.left:
                this.direction = -1;
                break;
            case cc.macro.KEY.d:
            case cc.macro.KEY.right:
                this.direction = 1;
                break;
            case cc.macro.KEY.w:
            case cc.macro.KEY.up:
                if (!this.jumping) {
                    this.jumping = true;
                    this.speed.y = this.jumpSpeed;    
                }
                break;
        }
    }

    onKeyReleased(event) {
        let keyCode = event.keyCode;
        switch(keyCode) {
            case cc.macro.KEY.a:
            case cc.macro.KEY.left:
            case cc.macro.KEY.d:
            case cc.macro.KEY.right:
                this.direction = 0;
                break;
        }
    }
    
    onCollisionEnter (other, self) {
        console.log("Hero collision enter")
        //this.node.color = cc.Color.RED;

        this.touchingNumber ++;
        
        // 1st step 
        // get pre aabb, go back before collision
        var otherAabb = other.world.aabb;
        var otherPreAabb = other.world.preAabb.clone();

        var selfAabb = self.world.aabb;
        var selfPreAabb = self.world.preAabb.clone();

        // 2nd step
        // forward x-axis, check whether collision on x-axis
        selfPreAabb.x = selfAabb.x;
        otherPreAabb.x = otherAabb.x;

        if (cc.Intersection.rectRect(selfPreAabb, otherPreAabb)) {
            if (this.speed.x < 0 && (selfPreAabb.xMax > otherPreAabb.xMax)) {
                //this.node.x = otherPreAabb.xMax - this.node.parent.x;
                this.collisionX = -1;
            }
            else if (this.speed.x > 0 && (selfPreAabb.xMin < otherPreAabb.xMin)) {
                //this.node.x = otherPreAabb.xMin - selfPreAabb.width - this.node.parent.x;
                this.collisionX = 1;
            }

            this.speed.x = 0;
            other.touchingX = true;
            return;
        }

        // 3rd step
        // forward y-axis, check whether collision on y-axis
        selfPreAabb.y = selfAabb.y;
        otherPreAabb.y = otherAabb.y;

        if (cc.Intersection.rectRect(selfPreAabb, otherPreAabb)) {
            if (this.speed.y < 0 && (selfPreAabb.yMax > otherPreAabb.yMax)) {
                // 自己在上面,对方在下面
                //this.node.y = otherPreAabb.yMax - this.node.parent.y;
                let endPos = this.node.parent.convertToNodeSpaceAR(cc.v2(selfPreAabb.x, otherPreAabb.yMax));
                this.node.y = endPos.y+selfPreAabb.height/2

                this.jumping = false;
                this.collisionY = -1;

                this.jumpParticleValide(true)
            }
            else if (this.speed.y > 0 && (selfPreAabb.yMin < otherPreAabb.yMin)) {
                // 自己在下面,对方在上面
                //this.node.y = otherPreAabb.yMin - selfPreAabb.height - this.node.parent.y;
                let endPos = this.node.parent.convertToNodeSpaceAR(cc.v2(selfPreAabb.x, otherPreAabb.yMin));
                this.node.y = endPos.y-selfPreAabb.height/2-1

                this.collisionY = 1;
            }
            
            this.speed.y = 0;
            other.touchingY = true;
        }    
        
    }
    
    onCollisionStay (other, self) {
       
    }
    
    onCollisionExit (other) {
        console.log("Hero collision exit")
        this.touchingNumber --;
        if (this.touchingNumber === 0) {
            //this.node.color = cc.Color.WHITE;
        }

        if (other.touchingX) {
            this.collisionX = 0;
            other.touchingX = false;
        }
        else if (other.touchingY) {
            other.touchingY = false;
            this.jumping = true;
            this.collisionY = 0;
            //this.jumpParticleValide(false)
        }
    }
    
    update(dt){
        if (this.collisionY === 0) {
            // y轴无碰撞
            this.speed.y += this.gravity * dt;
            
            if (Math.abs(this.speed.y) > this.maxSpeed.y) {
                this.speed.y = this.speed.y > 0 ? this.maxSpeed.y : -this.maxSpeed.y;
                console.log("Hero SpeedY: "+Math.floor(this.speed.y))
            }
        }

        if (this.direction === 0) {
            // 无操作输入
            if (this.speed.x > 0) {
                this.speed.x -= this.drag * dt;
                if (this.speed.x <= 0) this.speed.x = 0;
            }
            else if (this.speed.x < 0) {
                this.speed.x += this.drag * dt;
                if (this.speed.x >= 0) this.speed.x = 0;
            }
        }
        else {
            this.speed.x += (this.direction > 0 ? 1 : -1) * this.drag * dt;
            if (Math.abs(this.speed.x) > this.maxSpeed.x) {
                this.speed.x = this.speed.x > 0 ? this.maxSpeed.x : -this.maxSpeed.x;
            }
        }

        if (this.speed.x * this.collisionX > 0) {
            this.speed.x = 0;
        }
        
        this.prePosition.x = this.node.x;
        this.prePosition.y = this.node.y;

        this.preStep.x = this.speed.x * dt;
        this.preStep.y = this.speed.y * dt;
        
        this.node.x += this.speed.x * dt;
        this.node.y += this.speed.y * dt;

        if(!this.isHeroPosYValide(this.node.y)){
            this.node.y = this.preStep.y
        }

        let preY = Math.floor(this.prePosition.y);
        let nowY = Math.floor(this.node.y);
        
        if(Math.floor(this.prePosition.x)!= Math.floor(this.node.x) || 
            Math.floor(this.prePosition.y)!=Math.floor(this.node.y)){
            console.log("HeroPos preX:"+Math.floor(this.prePosition.x)+" preY:"+preY+" nowX:"+Math.floor(this.node.x)+" nowY:"+nowY);
            this.hold_time = 0;
        }else{
            this.hold_time += 1;
        }

        //this.holdSpineValide(this.hold_time>500?true:false);
    }

    onDestroy(){
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyPressed, this);
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_UP, this.onKeyReleased, this);
    }

    isHeroPosYValide(pos:number){
        let winSize = cc.winSize;
        if(pos< -winSize.height/2 ){
            return false;
        }
        return true;
    }
    
    // 粒子效果
    jumpParticleValide(bValide:boolean){
        let effect = cc.find("effect",this.node);
        if(effect){
            effect.active = bValide;
            
            let pr = effect.getComponent(cc.ParticleSystem)
            pr.node.active = true;
            pr.resetSystem();
        }
    }

    // spine
    holdSpineValide(bValide:boolean){
        let nodeSpine = cc.find("hold",this.node)
        if(nodeSpine){
            nodeSpine.active = bValide;
        }
    }

    loadSpine(url: string, spineComponent: sp.Skeleton, spineName: string) {
        cc.loader.loadRes(url, sp.SkeletonData, (err, sp) => {
            if (err) {
                console.log(err);
            } else {
                spineComponent.skeletonData = sp;
                spineComponent.setAnimation(0, 'ruchang', false);
                spineComponent.setCompleteListener(e => {
                    spineComponent.setAnimation(0, 'idle', true);
                });
            }
        })
    }
}