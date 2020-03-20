import Dialog from '../../core/Dialog';
import GlobalEmit from '../../core/GlobalEmit';
import MapHelper from './MapHelper';
import Core from '../../core/Core';

const {ccclass, property} = cc._decorator;

const block_width:number = 30;
const block_height:number= 30;
const blockType=[
    [{x:0,y:0},{x:0,y:-1},{x:0,y:-2},{x:0,y:-3}],
    [{x:0,y:0},{x:1,y:0},{x:2,y:0},{x:3,y:0}],
    [{x:0,y:0},{x:0,y:-1},{x:1,y:0},{x:1,y:-1}],
    [{x:0,y:0},{x:0,y:-1},{x:0,y:-2},{x:1,y:-2}], // L
    [{x:0,y:-1},{x:1,y:-1},{x:2,y:-1},{x:2,y:0}],
    [{x:0,y:0},{x:1,y:0},{x:1,y:-1},{x:1,y:-2}],
    [{x:0,y:0},{x:1,y:0},{x:2,y:0},{x:0,y:-1}],
    [{x:1,y:0},{x:0,y:-1},{x:1,y:-1},{x:2,y:-1}], // 品
    [{x:0,y:-1},{x:1,y:0},{x:1,y:-1},{x:1,y:-2}],
    [{x:0,y:0},{x:1,y:0},{x:2,y:0},{x:1,y:-1}],
    [{x:0,y:0},{x:0,y:-1},{x:0,y:-2},{x:1,y:-1}],
]

interface russia_grid{
    x:number;
    y:number;
    node:cc.Node;
    valid:boolean;
}

enum gameStatu{
    stand=0,
    play=1,
    pause=2,
    end=3,
}

enum dir{
    up=0,
    down=1,
    left=2,
    right=3,
}

@ccclass
export default class RussiaBlock extends Dialog {
    @property(cc.Node)
    root: cc.Node = null;

    @property(cc.Node)
    block_item: cc.Node = null;

    @property(cc.Node)
    board: cc.Node = null;

    @property(cc.Node)
    sample: cc.Node = null;

    private _statu:gameStatu=gameStatu.stand;

    private _blockPool:cc.Node[]=[];            // 方块pool
    private _runningBlocks:russia_grid[]=[];    // 下降中的方块
    private _currBlocks:russia_grid[]=[];       // 当前静止的方块

    private _blockSameple:russia_grid[]=[];
    private _sampleIndex:number = 0;

    private getBlockNode():cc.Node{
        if(this._blockPool.length!=0){
            return this._blockPool.pop();
        }
        let newBlock:cc.Node = cc.instantiate(this.block_item);
        //newBlock.parent = this.board;
        return newBlock;
    }

    private pushToPool(block:cc.Node){
        block.x=0;
        block.y=0;
        block.active = false;
        this._blockPool.push(block);
    }

    set gameStatu(value:gameStatu){
        this._statu = value;
    }
    get gameStatu(){
        return this._statu;
    }

    private nextblocks(){
        if(this._runningBlocks.length!=0 || this.gameStatu!=gameStatu.play){
            return;
        }

        let max:number = blockType.length;
        let index:number = Math.floor(Math.random()*max);
        index = index<max?index:max-1;

        let blocks:{x:number,y:number}[]=blockType[index];
        let preX:number = Math.floor(MapHelper.instance._width_count/2);
        let preY:number = MapHelper.instance._height_count-1;

        let gameOver:boolean = blocks.some((v,i,arr)=>{
            let over:boolean = false;
            over = !MapHelper.instance.isValid(v.x+preX,v.y+preY);
            return over;
        });
        if(gameOver){
            Core.instance.toast("游戏结束!")
            this.russiaGameEnd();
            return;
        }

        blocks.forEach((v,i,arr)=>{
            let tmp:any={};
            tmp.x = v.x+preX;
            tmp.y = v.y+preY;
            tmp.valid = false;
            tmp.node = this.getBlockNode();
            this._runningBlocks.push(tmp);
        })

        // node
        this._runningBlocks.forEach((v,i,arr)=>{
            v.node.parent = this.board;
            v.valid = true;
            v.node.x = MapHelper.instance.getPosX(v.x);
            v.node.y = MapHelper.instance.getPosY(v.y);
            v.node.active = true;
            v.node.scale = 0.6;
        })
    }

    private checkRunningBlock(){
        if(this._runningBlocks.length==0 || this.gameStatu!=gameStatu.play){
            return ;
        }

        let down:boolean = this._runningBlocks.every((v,i,arr)=>{
            let nextStep:boolean = !MapHelper.instance.isValid(v.x,v.y-1);
            return nextStep;
        })

        if(down){
            // 下降一格
            this._runningBlocks.forEach((v,i,arr)=>{
                v.y -= 1;
            })
        }else{
            // 停止
            this._runningBlocks.forEach((v,i,arr)=>{
                MapHelper.instance.validBlock(v.x,v.y,0);
                this._currBlocks.push(v);
            })
            this._runningBlocks = [];
            this.scheduleOnce(()=>{
                this.nextblocks();
            },0.3);
        }
        this.freshRunningBlockUI();
    }

    private freshRunningBlockUI(){
        this._runningBlocks.forEach((v,i,arr)=>{
            if(v.node && v.valid){
                v.node.x = MapHelper.instance.getPosX(v.x);
                v.node.y = MapHelper.instance.getPosY(v.y);
            }
        });
    }

    private moveDir(move_dir:dir){
        if(move_dir==dir.left){
            let move:boolean = this._runningBlocks.every((v,i,arr)=>{
                return MapHelper.instance.isValid(v.x-1,v.y);
            });

            if(move){
                this._runningBlocks.forEach((v,i,arr)=>{
                    v.x-=1;
                });
            }
        }else if(move_dir==dir.right){
            let move:boolean = this._runningBlocks.every((v,i,arr)=>{
                return MapHelper.instance.isValid(v.x+1,v.y);
            });

            if(move){
                this._runningBlocks.forEach((v,i,arr)=>{
                    v.x+=1;
                });
            }
        }
    }

    public russiaGameStart(){
        this.gameStatu = gameStatu.play;
        this.nextblocks();
        this.schedule(()=>{
            this.checkRunningBlock();
        },0.35);
    }

    public russiaGameEnd(){
        this.board.removeAllChildren(true);
        this._runningBlocks=[];
        this._blockPool=[];
        this._currBlocks=[];
        this.gameStatu = gameStatu.stand;
    }

    onInit(data:any){

    }

    onload(){
        MapHelper.instance.initMapInfo(block_width,block_height,this.board.width/block_width,this.board.height/block_height);
    }

    start () {
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyPressed, this);
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, this.onKeyReleased, this);
    }

    update(dt){
        // 
    }

    onDestroy(){
        
    }

    onClickClose(){
        GlobalEmit.instance.messageEmit.emit("CloseLayer","RussiaBlock");
        this.close();
    }

    onClickStart(){
        this.russiaGameStart();
        //this.BlockSample();
    }

    onKeyPressed(event) {
        let keyCode = event.keyCode;
        if(this.gameStatu!=gameStatu.play){
            return;
        }
        switch(keyCode) {
            case cc.macro.KEY.a:
            case cc.macro.KEY.left:
                this.moveDir(dir.left);
                break;
            case cc.macro.KEY.d:
            case cc.macro.KEY.right:
                this.moveDir(dir.right);
                break;
            case cc.macro.KEY.w:
            case cc.macro.KEY.up:
                break;
        }
    }

    onKeyReleased(event) {
        let keyCode = event.keyCode;
        if(this.gameStatu!=gameStatu.play){
            return;
        }
        switch(keyCode) {
            case cc.macro.KEY.a:
            case cc.macro.KEY.left:
                break;
            case cc.macro.KEY.d:
            case cc.macro.KEY.right:
                break;
            case cc.macro.KEY.w:
            case cc.macro.KEY.up:
                break;
        }
    }

    private BlockSample(){
        
        // data
        let blocks:{x:number,y:number}[]=blockType[this._sampleIndex];
        let cached:boolean = this._blockSameple.length==blocks.length;

        let preX:number = Math.floor(MapHelper.instance._width_count/2);
        let preY:number = MapHelper.instance._height_count-1;
        if(cached){
            blocks.forEach((v,i,arr)=>{
                this._blockSameple[i].x = v.x+preX;
                this._blockSameple[i].y = v.y+preY;
                this._blockSameple[i].valid = true;
            })
        }else{
            this._blockSameple = [];
            blocks.forEach((v,i,arr)=>{
                let tmp:any={};
                tmp.x = v.x+preX;
                tmp.y = v.y+preY;
                tmp.valid = false;
                tmp.node = this.getBlockNode();
                this._blockSameple.push(tmp);
            })
        }
        
        // ui
        this._blockSameple.forEach((v,i,arr)=>{
            v.node.parent = this.board;
            v.valid = true;
            v.node.x = MapHelper.instance.getPosX(v.x);
            v.node.y = MapHelper.instance.getPosY(v.y);
            v.node.active = true;
            v.node.scale = 0.5;
        })

        this._sampleIndex++;
        this._sampleIndex = this._sampleIndex>=blockType.length?0:this._sampleIndex;
    }
}
