import Core from "../../core/Core";

const {ccclass, property} = cc._decorator;

@ccclass
export default class dragon_Control extends cc.Component{

    @property(sp.Skeleton)
    heroSpine: sp.Skeleton = null;

    private gravity= -120
    // 开始 停止
    private bStartMove:boolean = false;
    private bGameOver:boolean = false;
    // 是否向上
    private bUpTouch:boolean = false;
    // 横向移动控制变量
    private moveSpeed:number = 100
    // 纵向移动控制变量
    private upSpeed:number = 0;
    private downFrame:number = 20;
    
    onload(){

    }

    start() {
        //add keyboard input listener to call turnLeft and turnRight
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyPressed, this);
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, this.onKeyReleased, this);

        this.loadSpine("spine/long", this.heroSpine, "long", ()=>{
            //this.holdSpineValide(true);
        });
    }

    reStart(){
        this.bStartMove = false;
        this.bGameOver = false;

        this.node.x = -300;
        this.node.y = -150;
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
        if(this.bGameOver){
            return;
        }
        switch(keyCode) {
            case cc.macro.KEY.a:
            case cc.macro.KEY.left:
                //this.direction = -1;
                //this.bStartMove = false;
                break;
            case cc.macro.KEY.d:
            case cc.macro.KEY.right:
                //this.bStartMove = true;
                break;
            case cc.macro.KEY.w:
            case cc.macro.KEY.up:
                //
                this.bStartMove = true;
                this.bUpTouch = true;
                this.upSpeed = -this.gravity*1.5;
                break;
        }
    }

    onKeyReleased(event) {
        let keyCode = event.keyCode;
        if(this.bGameOver){
            return;
        }
        switch(keyCode) {
            case cc.macro.KEY.a:
            case cc.macro.KEY.left:
                //this.reStart()
                break;
            case cc.macro.KEY.d:
            case cc.macro.KEY.right:
                //this.direction = 0;
                break;
            case cc.macro.KEY.w:
            case cc.macro.KEY.up:
                //
                this.bUpTouch = false;
                break;
        }
    }
    
    onCollisionEnter (other, self) {
        console.log("Hero collision enter")
        //this.node.color = cc.Color.RED;
        
        this.bStartMove = false;  
        this.bGameOver = true;
        Core.instance.toast("Game Over~");  
    }
    
    onCollisionStay (other, self) {
       
    }
    
    onCollisionExit (other) {
        console.log("Hero collision exit")
    }
    
    update(dt){
        if(!this.bStartMove || this.bGameOver){
            return;
        }
        
        console.log("update: "+dt);
        //this.holdSpineValide(true);

        // 纵向速度
        this.upSpeed = this.bUpTouch?this.upSpeed:(this.upSpeed-this.downFrame);
        console.log("dragon speed: "+ this.upSpeed)

        this.node.x += this.moveSpeed*dt;
        this.node.y += this.upSpeed*dt;
    }

    onDestroy(){
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyPressed, this);
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_UP, this.onKeyReleased, this);
    }

    // spine
    holdSpineValide(bValide:boolean){
        let nodeSpine = cc.find("hold",this.node)
        if(nodeSpine){
            nodeSpine.active = bValide;
        }
    }

    loadSpine(url: string, spineComponent: sp.Skeleton, spineName: string, callback?: Function) {
        cc.loader.loadRes(url, sp.SkeletonData, (err, sp) => {
            if (err) {
                console.log(err);
            } else {
                spineComponent.skeletonData = sp;
                let dragon_track= spineComponent.setAnimation(0, 'idle', true);
                /*
                spineComponent.setAnimation(0, 'ruchang', false);
                spineComponent.setCompleteListener(e => {
                    spineComponent.setAnimation(0, 'idle', true);
                });*/
                if(callback){
                    callback();
                }
            }
        })
    }
}