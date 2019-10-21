import Dialog from '../../core/Dialog';
import GlobalEmit from '../../core/GlobalEmit';

const {ccclass, property} = cc._decorator;

@ccclass
export default class pinball extends Dialog {
    @property(cc.Node)
    root: cc.Node = null;

    @property(cc.Node)
    ball: cc.Node = null;

    @property(cc.Node)
    board: cc.Node = null;

    private bDragingBoard:boolean = false;
    private preBoardTouch:cc.Vec2 = cc.v2(0,0);

    onInit(data:any){

    }

    onload(){
    
    }

    start () {
        cc.director.getCollisionManager().enabled = true;
        cc.director.getCollisionManager().enabledDebugDraw = true;
        this.touchBoard();
    }

    touchBoard(){
        this.board.on(cc.Node.EventType.TOUCH_START,function(e:cc.Event.EventTouch){
            
        },this)
        this.board.on(cc.Node.EventType.TOUCH_MOVE,function(e:cc.Event.EventTouch){
            let pos:cc.Vec2=this.board.getParent().convertTouchToNodeSpaceAR(e)    
            if(this.bDragingBoard){
                this.board.x += pos.x-this.preBoardTouch.x;
            }
            this.bDragingBoard = true;
            this.preBoardTouch = pos;
            
        },this)
        this.board.on(cc.Node.EventType.TOUCH_END,function(e:cc.Event.EventTouch){
            this.bDragingBoard = false;
        },this)
        this.board.on(cc.Node.EventType.TOUCH_CANCEL,function(e:cc.Event.EventTouch){
            this.bDragingBoard = false;
        },this)
    }

    update(dt){
        // 
    }

    onDestroy(){
        cc.director.getCollisionManager().enabled = false;
        cc.director.getCollisionManager().enabledDebugDraw = false;
    }

    onClickClose(){
        GlobalEmit.instance.messageEmit.emit("CloseLayer","pinball");
        this.close();
    }

    onClickStart(){
        
    }

    
}
