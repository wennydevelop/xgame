import Dialog from '../../core/Dialog';
import GlobalEmit from '../../core/GlobalEmit';
import tank from './tank';
import bullet from './bullet';
import tankControl, { TankGame_Statu } from './tankControl';
import Core from '../../core/Core';

const {ccclass, property} = cc._decorator;

enum Dir{
    up=1,
    down=2,
    left=3,
    right=4,
}

@ccclass
export default class tankGame extends Dialog {
    @property(cc.Node)
    root: cc.Node = null;

    @property(cc.Node)
    tank: cc.Node = null;

    @property(cc.Node)
    bullet: cc.Node = null;

    @property(cc.Node)
    gameLayer: cc.Node = null;

    private bulletArr:cc.Node[]=[];
    private bulletPool:cc.Node[]=[];
    private uniqueTag:number = 0;
    private bPlaying:boolean = false;
    private tankSpeed:number = 1.5;

    player:cc.Node = null;
    onInit(data:any){

    }

    onload(){
    
    }

    start () {
        cc.director.getCollisionManager().enabled = true;
        cc.director.getCollisionManager().enabledDebugDraw = true;
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyPressed, this);
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, this.onKeyReleased, this);
    }

    update(dt){
        // 
        this.syncGameStatu();
        this.checkRunningBullet();
    }

    onDestroy(){
        cc.director.getCollisionManager().enabled = false;
        cc.director.getCollisionManager().enabledDebugDraw = false;
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyPressed, this);
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_UP, this.onKeyReleased, this);
    }

    onClickClose(){
        GlobalEmit.instance.messageEmit.emit("CloseLayer","tank");
        this.close();
    }

    onClickStart(){
        this.gameStart();
    }

    syncGameStatu(){
        this.bPlaying = tankControl.instance.gameStatu==TankGame_Statu.playing;
    }
    isPlaying(){
        return this.bPlaying;
    }

    fire(){
        // 释放子弹
        let playerScript:tank = this.player.getComponent(tank);
        if(!playerScript){
            return;
        }
        let firePos = playerScript.getFirePos();
        let playerSp = playerScript.getLastSpeed();
        tankControl.instance.BornBullet(888,playerScript.getFirePos(),cc.v2(playerSp.x*3,playerSp.y*3));
    }

    onKeyPressed(event) {
        let keyCode = event.keyCode;
        if(!this.isPlaying()){
            return;
        }
        switch (keyCode) {
            case cc.macro.KEY.a:
            case cc.macro.KEY.left:
                this.playerControl(Dir.left);
                break;
            case cc.macro.KEY.d:
            case cc.macro.KEY.right:
                this.playerControl(Dir.right);
                break;
            case cc.macro.KEY.w:
            case cc.macro.KEY.up:
                this.playerControl(Dir.up);
                break;
            case cc.macro.KEY.s:
            case cc.macro.KEY.down:
                this.playerControl(Dir.down);
                break;
            case cc.macro.KEY.k:
                this.fire();
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
                this.playerControl(Dir.left,true);
                break;
            case cc.macro.KEY.d:
            case cc.macro.KEY.right:
                this.playerControl(Dir.right,true);
                break;
            case cc.macro.KEY.w:
            case cc.macro.KEY.up:
                this.playerControl(Dir.up,true);
                break;
            case cc.macro.KEY.s:
            case cc.macro.KEY.down:
                    this.playerControl(Dir.down,true);
                break;
        }
    }

    playerControl(value:Dir, bCancel?:boolean){
        if(!this.isPlaying()){
            return;
        }
        let playerScript:tank = this.player.getComponent(tank);
        if(!playerScript){
            return;
        }

        let spx = playerScript.speed.x;
        let spy = playerScript.speed.y;
        //spx = spx==0?1:spx;
        //spy = spy==0?1:0;
        if(value==Dir.up){
            spy = this.tankSpeed;
            if(bCancel){
                spy = 0;
            }
            //playerScript.speed = cc.v2(playerScript.speed.x,Math.abs(playerScript.speed.y));
        }else if(value==Dir.down){
            spy = -this.tankSpeed;
            if(bCancel){
                spy = 0;
            }
            //playerScript.speed = cc.v2(playerScript.speed.x,-Math.abs(playerScript.speed.y));
        }else if(value==Dir.left){
            spx = -this.tankSpeed;
            if(bCancel){
                spx = 0;
            }
            //playerScript.speed = cc.v2(-Math.abs(playerScript.speed.x), playerScript.speed.y);
        }else if(value==Dir.right){
            spx = this.tankSpeed;
            if(bCancel){
                spx = 0;
            }
            //playerScript.speed = cc.v2(Math.abs(playerScript.speed.x), playerScript.speed.y);
        }

        playerScript.speed = cc.v2(spx,spy)
    }

    public runBullet(group:number,p:cc.Vec2,sp:cc.Vec2){
        if(!this.isPlaying()){
            console.error("game over,no more block")
            return;
        }

        let tempBullet = this.getBullet();
        tempBullet.active = true;
        tempBullet.parent = this.gameLayer;

        let bulletScript:bullet = tempBullet.getComponent(bullet);
        if(bulletScript){
            bulletScript.tag = this.getUniqueTag();
            bulletScript.bValide = true;
            bulletScript.group = group;
            bulletScript.setPos(p);
            bulletScript.reSet();
            bulletScript.speed = sp;
            this.bulletArr.push(tempBullet);
        }
    }

    protected resetBullet(){
        this.bulletArr = [];
        this.bulletPool = [];
    }
    protected getUniqueTag(){
        this.uniqueTag++;
        return this.uniqueTag;
    }
    protected getBullet(){
        if(this.bulletPool.length<1){
            let blockRobot = cc.instantiate(this.bullet);
            console.log("Tank new bullet~");
            return blockRobot;
        }else{
            let block = this.bulletPool.pop();
            console.log("Tank used bullet~")
            return block;
        }
    }
    protected checkRunningBullet(){
        for(let index=0;index<this.bulletArr.length;index++){
            let blockNode = this.bulletArr[index];
            let blockScript:bullet = blockNode.getComponent(bullet);
            if(blockScript){
                if(!blockScript.bValide){
                    this.bulletPool.push(blockNode);
                    this.bulletArr.splice(index,1);
                    break;
                }
            }
        }
    }
    gameControl(){
        if(this.isPlaying()){
            this.checkRunningBullet();
        }
    }
    gameStart(){
        if(this.bPlaying){
            Core.instance.toast("game playing")
            return;
        }
        this.bPlaying = true;
        tankControl.instance.gameStatu = TankGame_Statu.playing;
        tankControl.instance.gameCenter = this.node;

        this.player = cc.instantiate(this.tank);
        this.player.parent = this.gameLayer;
        let tankScript:tank = this.player.getComponent(tank);
        if(tankScript){
            tankScript.bSelf = true;
            tankScript.bValide = true;
            tankScript.group = 888;
            tankScript.tag = this.getUniqueTag();
            tankScript.speed = cc.v2(0,1);
            tankScript.setPos(cc.v2(cc.winSize.width/2,cc.winSize.height/2));
        }
    }
    gameOver(){
        this.bPlaying = false;
        tankControl.instance.gameCenter = null;
        tankControl.instance.gameStatu = TankGame_Statu.over;
        this.resetBullet();

        Core.instance.toast("游戏结束~");
    }
}
