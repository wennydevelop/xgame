import Dialog from '../../core/Dialog';
import GlobalEmit from '../../core/GlobalEmit';
import block from './block';
import frappymanager, { Frappy_Statu } from './frappymanager';
import frappycontrol from './frappycontrol';

const {ccclass, property} = cc._decorator;

@ccclass
export default class frappyunlimit extends Dialog {
    @property(cc.Node)
    frappy: cc.Node = null;

    @property(cc.Node)
    board: cc.Node = null;

    @property(cc.Node)
    gameLayer: cc.Node = null;

    private blockArr:cc.Node[]=[];
    private blockPool:cc.Node[]=[];
    private uniqueTag:number = 0;
    private popBlockSpeed:number = 1;
    private lastBlockPos:cc.Vec2 = cc.v2(700,-200);
    private blockLength:number = 300;
    private minDis:number = 100;

    onInit(data:any){

    }

    onload(){
    
    }

    start () {
        
    }

    update(dt){
        // 
        this.gameControl();
    }

    onDestroy(){
        this.resetBlock();
    }

    onClickClose(){
        GlobalEmit.instance.messageEmit.emit("CloseLayer","frappyunlimit");
        this.close();
    }

    onClickStart(){
        if(this.gameStatu==Frappy_Statu.stand){
            this.gameStart();
        }else if(this.gameStatu==Frappy_Statu.playing){

        }else if(this.gameStatu==Frappy_Statu.pause){

        }else if(this.gameStatu==Frappy_Statu.over){
            
            this.gameLayer.removeAllChildren();
            this.resetBlock();
            
            let f_script:frappycontrol = this.frappy.getComponent(frappycontrol);
            if(f_script){
                f_script.resetFrappy();
            }
            this.gameStart();
        }
    }

    set gameStatu(value:Frappy_Statu){
        frappymanager.instance.gameStatu = value;
    }

    get gameStatu(){
        return frappymanager.instance.gameStatu;
    }

    gameStart(){
        this.gameStatu = Frappy_Statu.playing;
        this.schedule(()=>{
            this.runBlock();
        },this.popBlockSpeed);
    }
    gameControl(){
        if(this.gameStatu==Frappy_Statu.playing){
            this.checkRunningBlock();
        }
    }
    gameOver(){
        this.gameStatu = Frappy_Statu.over;
        this.resetBlock();
    }

    protected runBlock(){
        if(this.gameStatu!=Frappy_Statu.playing){
            console.error("game over,no more block")
            return;
        }

        let tempBlock = this.getBlockRobot();
        this.gameLayer.addChild(tempBlock);

        let blockScript:block = tempBlock.getComponent(block);
        if(blockScript){
            blockScript.tag = this.getUniqueTag();
            blockScript.bValide = true;
            blockScript.resetPos(this.getNewPos(false).x, this.getNewPos(false).y);
        }

        let l_rand = Math.random()*10;
        if(l_rand%2 == 1){
            let t_block = this.getBlockRobot();
            this.gameLayer.addChild(t_block);

            let t_script:block = t_block.getComponent(block);
            if(t_script){
                t_script.tag = this.getUniqueTag();
                t_script.bValide = true;
                t_script.resetPos(this.getNewPos(true).x, this.getNewPos(true).y);
            }
        }
    }

    protected resetBlock(){
        this.blockArr = [];
        this.blockPool = [];
    }
    protected getUniqueTag(){
        this.uniqueTag++;
        return this.uniqueTag;
    }
    protected getBlockRobot(){
        if(this.blockPool.length<1){
            let blockRobot = cc.instantiate(this.board);
            console.log("Frappy new block~");
            return blockRobot;
        }else{
            let block = this.blockPool.pop();
            console.log("Frappy used block~")
            return block;
        }
    }
    protected getNewPos(bSameX:boolean){
        let px:number = 0;
        let py:number = 0;
        let l_height:number = cc.winSize.height;
        if(bSameX){
            px = this.lastBlockPos.x;
            
            if(this.lastBlockPos.y<0){
                let minY:number = this.lastBlockPos.y+this.minDis+this.blockLength;
                py = minY+Math.random()*100;
            }else{
                let maxY:number = this.lastBlockPos.y-this.minDis-this.blockLength;
                py = maxY-Math.random()*100;
            }
        }else{
            px = this.lastBlockPos.x+ Math.random()*50;
            py = Math.random()*l_height-l_height/2;
        }
        this.lastBlockPos = cc.v2(px,py);
        return this.lastBlockPos;
    }
    protected checkRunningBlock(){
        for(let index=0;index<this.blockArr.length;index++){
            let blockNode = this.blockArr[index];
            let blockScript:block = blockNode.getComponent(block);
            if(blockScript){
                if(!blockScript.bValide){
                    this.blockPool.push(blockNode);
                    this.blockArr.splice(index,1);
                    break;
                }
            }
        }
    }
}
