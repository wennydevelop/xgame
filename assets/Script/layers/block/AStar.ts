import Dialog from '../../core/Dialog';
import GlobalEmit from '../../core/GlobalEmit';
import Core from '../../core/Core';

const {ccclass, property} = cc._decorator;

class Grid{
    x:number=0;
    y:number=0;
    f:number=0;
    g:number=0;
    h:number=0;
    node:cc.Node=null;
    parent:Grid=null;
    type:number=0;          // -1 障碍物 0 正常 1 起点 2 终点 3 路径
}
// 参考地址: https://blog.csdn.net/xjw532881071/article/details/88391008
@ccclass
export default class AStar extends Dialog {
    @property(cc.Node)
    root: cc.Node = null;

    @property(cc.Node)
    block_item: cc.Node = null;

    @property(cc.Node)
    board: cc.Node = null;

    @property(cc.Node)
    sample: cc.Node = null;

    private _gridW:number=50;
    private _gridH:number=50;
    private _mapW:number=20;
    private _mapH:number=12;
    private _is8dir:boolean=true;
    private _startPos:cc.Vec2=cc.v2(2,1);
    private _endPos:cc.Vec2=cc.v2(16,10);

    private gridPool:Grid[][]=[];

    private openList:Grid[]=[];
    private closeList:Grid[]=[];
    private path:Grid[]=[];
    onInit(data:any){

    }

    private initMap(){
        this.openList = [];
        this.closeList = [];
        this.path = [];
        this.board.removeAllChildren();
        // 初始化格子二维数组
        this.gridPool = new Array(this._mapW + 1);
        for (let col=0;col<this.gridPool.length; col++){
            this.gridPool[col] = new Array(this._mapH + 1);
        }
        for (let col=0; col<= this._mapW; col++){
            for (let row=0; row<=this._mapH; row++){
                let node = cc.instantiate(this.block_item);
                node.parent=this.board;
                this.addGrid(col, row, 0, node);
            }
        }

        // 设置起点和终点
        this.setGridType(this._startPos.x,this._startPos.y,1);
        this.setGridType(this._endPos.x,this._endPos.y,2);

        this.freshGrid();
    }

    private addGrid(x:number,y:number,type:number,node:cc.Node){
        let grid= new Grid;
        grid.x=x;
        grid.y=y;
        grid.type=type;
        grid.node=node;
        this.gridPool[x][y]=grid;
    }

    private setGridType(x:number,y:number,type:number){
        this.gridPool[x][y].type=type;
    }

    private renderGrid(grid:Grid){
        let color = cc.Color.GRAY;
        color = grid.type==1?cc.Color.ORANGE:color;
        color = grid.type==2?cc.Color.YELLOW:color;
        color = grid.type==3?cc.Color.BLUE:color;
        color = grid.type<0?cc.Color.RED:color;
        if(grid.node){
            let tag=grid.node.getChildByName("tag")
            if(tag){ tag.color=color;}
            let flag=grid.node.getChildByName("flag");
            if(flag){ flag.getComponent(cc.Label).string=`(${grid.x},${grid.y})`};
            grid.node.position=this.getPos(grid.x,grid.y);
        }else{
            console.error("节点未找到");
        }
    }

    private freshGrid(){
        for(let i=0;i<this.gridPool.length;i++){
            for(let j=0;j<this.gridPool[i].length;j++){
                this.renderGrid(this.gridPool[i][j]);
            }
        }
    }

    private getPos(x:number,y:number):cc.Vec2{
        return cc.v2(this._gridW*(x+1/2),this._gridH*(y+1/2));
    }
    private getIndex(pos:cc.Vec2):cc.Vec2{
        return cc.v2(Math.floor(pos.x/this._gridW),Math.floor(pos.y/this._gridH));
    }

    private resetGrid(){
        for(let i=0;i<this.gridPool.length;i++){
            for(let j=0;j<this.gridPool[i].length;j++){
                if(this.gridPool[i][j].type<0 || this.gridPool[i][j].type>2){
                    this.gridPool[i][j].type=0;
                }
                this.gridPool[i][j].parent=null;
            }
        }
        this.openList=[];
        this.closeList=[];
        this.path=[];
    }

    generatePath(grid){
        this.path.push(grid);
        while (grid.parent){
            grid = grid.parent;
            this.path.push(grid);
        }
        cc.log("path.length: " + this.path.length);
        for (let i=0; i<this.path.length; i++){
            // 起点终点不覆盖，方便看效果
            if (i!=0 && i!= this.path.length-1){
                let grid = this.path[i];

                grid.type=3;
                this.renderGrid(grid);
            }
        }
    }

    findPath(starPos:cc.Vec2,endPos:cc.Vec2){
        let startGrid = this.gridPool[starPos.x][starPos.y];
        let endGrid = this.gridPool[endPos.x][endPos.y];

        this.openList.push(startGrid);
        let curGrid = this.openList[0];
        while (this.openList.length > 0 && curGrid.type != 2){
            // 每次都取出f值最小的节点进行查找
            curGrid = this.openList[0];
            if (curGrid.type == 2 || (curGrid.x==endGrid.x && curGrid.y==endGrid.y)){
                cc.log("find path success.");
                this.generatePath(curGrid);
                return;
            }

            for(let i=-1; i<=1; i++){
                for(let j=-1; j<=1; j++){
                    if (i !=0 || j != 0){
                        let col = curGrid.x + i;
                        let row = curGrid.y + j;
                        if (col >= 0 && row >= 0 && col <= this._mapW && row <= this._mapH
                            && this.gridPool[col][row].type != -1
                            && this.closeList.indexOf(this.gridPool[col][row]) < 0){
                                if (this._is8dir){
                                    // 8方向 斜向走动时要考虑相邻的是不是障碍物
                                    if (this.gridPool[col-i][row].type == -1 || this.gridPool[col][row-j].type == -1){
                                        continue;
                                    }
                                } else {
                                    // 四方形行走
                                    if (Math.abs(i) == Math.abs(j)){
                                        continue;
                                    }
                                }

                                // 计算g值
                                //let g = curGrid.g + parseInt(Math.sqrt(Math.pow(i*10,2) + Math.pow(j*10,2)));
                                let g = curGrid.g + (Math.sqrt(Math.pow(i*10,2) + Math.pow(j*10,2)));
                                if (this.gridPool[col][row].g == 0 || this.gridPool[col][row].g > g){
                                    this.gridPool[col][row].g = g;
                                    // 更新父节点
                                    this.gridPool[col][row].parent = curGrid;
                                }
                                // 计算h值 manhattan估算法
                                this.gridPool[col][row].h = Math.abs(endPos.x - col) + Math.abs(endPos.y - row);
                                // 更新f值
                                this.gridPool[col][row].f = this.gridPool[col][row].g + this.gridPool[col][row].h;
                                // 如果不在开放列表里则添加到开放列表里
                                if (this.openList.indexOf(this.gridPool[col][row]) < 0){
                                    this.openList.push(this.gridPool[col][row]);
                                }
                                // 重新按照f值排序（升序排列)
                                this.openList.sort((a,b)=>{ return a.f-b.f;});
                        }
                    }
                }
            }
            // 遍历完四周节点后把当前节点加入关闭列表
            this.closeList.push(curGrid);
            // 从开发列表把当前节点移除
            this.openList.splice(this.openList.indexOf(curGrid), 1);
            if (this.openList.length <= 0){
                cc.log("find path failed.");
            }
        }
    }

    onTouchBegin(event){
        
    }
    onTouchMove(event){
        let pos = event.getLocation();  
        let real = this.getIndex(pos);
        //console.log(`touchPos: (${pos.x},${pos.y})`);
        //console.log(`indexPos: (${real.x},${real.y})`)
        
        let x = real.x;
        let y = real.y;
        if (this.gridPool[x][y].type == 0){
            this.gridPool[x][y].type = -1;
            this.renderGrid(this.gridPool[x][y]);
        }
    }
    onTouchEnd(){

    }

    onCilckStart(){
        // 开始寻路
        this.findPath(this._startPos, this._endPos);
    }

    onload(){
        
    }

    start () {
        this.initMap();

        this.board.on(cc.Node.EventType.TOUCH_START, this.onTouchBegin, this);
        this.board.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.board.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
    }

    update(dt){
        // 
    }

    onDestroy(){
        
    }

    onClickClose(){
        GlobalEmit.instance.messageEmit.emit("CloseLayer","AStar");
        this.close();
    }
}
