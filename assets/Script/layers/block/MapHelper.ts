
export class gridPos{
    x:number;
    y:number;
    t:number;   // 小于0不能通过 大于0可以通过
    f:number;
    g:number;
    h:number;
    parent:gridPos;
}

export default class MapHelper {
    protected static _instance: MapHelper
    public static get instance(): MapHelper {
        if (!this._instance)
            this._instance = new MapHelper();
        return this._instance;
    }

    private _width:number = 0;
    private _height:number = 0;
    private _width_block:number = 0;
    private _height_block:number = 0;
    public _width_count:number = 0;
    public _height_count:number = 0;

    private _blockPool:gridPos[][]= [];

    public initMapInfo(width:number,height:number,xCount:number,yCount:number){
        this._height = Math.floor(height*yCount);
        this._width = Math.floor(width*xCount);
        this._width_block = Math.floor(width);
        this._height_block = Math.floor(height);
        this._width_count = Math.floor(xCount);
        this._height_count = Math.floor(yCount);

        for(let i=0;i<this._height_count;i++){
            let tmp:gridPos[]=[];
            for(let j=0;j<this._width_count;j++){
                let grid = new gridPos;
                grid.x=i;
                grid.y=j;
                grid.t=1;
                tmp.push(grid);
            }
            this._blockPool.push(tmp);
        }
    }

    public getPosX(xIndex):number{
        return this._width_block*(xIndex+1/2);
    }
    public getPosY(yIndex):number{
        return this._height_block*(yIndex+1/2);
    }

    public getxIndex(posX):number{
        return Math.floor(posX/this._width_block);
    }
    public getyIndex(posY):number{
        return Math.floor(posY/this._height_block);
    }

    public validBlock(xIndex,yIndex,value=1){
        if(this._blockPool && this._blockPool.length>yIndex && this._blockPool[yIndex].length>xIndex){
            this._blockPool[yIndex][xIndex].t = value;
        }
    }
    public isValid(xIndex,yIndex):boolean{
        if(this._blockPool && this._blockPool.length>yIndex && this._blockPool[yIndex].length>xIndex){
            return this._blockPool[yIndex][xIndex].t>0;
        }
        return false;
    }

    public getBestPath(startPos:cc.Vec2,endPos:cc.Vec2,is8dir:boolean=true):cc.Vec2[]{
        let startGrid:gridPos = this._blockPool[startPos.x][startPos.y];
        let endGrid:gridPos = this._blockPool[endPos.x][endPos.y];;
        let openList:gridPos[]=[];
        let closeList:gridPos[]=[];
        let path:cc.Vec2[]=[];

        openList.push(startGrid);
        let curGrid = openList[0];
        while (openList.length > 0 && !(curGrid.x==endGrid.x && curGrid.y==endGrid.y)){
            // 每次都取出f值最小的节点进行查找
            curGrid = openList[0];
            if (curGrid.x==endGrid.x && curGrid.y==endGrid.y){
                cc.log("find path success.");
                path.push(cc.v2(curGrid.x,curGrid.y));
                while (curGrid.parent) {
                    curGrid = curGrid.parent;
                    path.push(cc.v2(curGrid.x,curGrid.y));
                }
                break;
            }

            for(let i=-1; i<=1; i++){
                for(let j=-1; j<=1; j++){
                    if (i !=0 || j != 0){
                        let col = curGrid.x + i;
                        let row = curGrid.y + j;
                        if (col >= 0 && row >= 0 && col <= this._width_count && row <= this._height_count
                            && this._blockPool[col][row].t > 0
                            && closeList.indexOf(this._blockPool[col][row]) < 0){
                                if (is8dir){
                                    // 8方向 斜向走动时要考虑相邻的是不是障碍物
                                    if (this._blockPool[col-i][row].t < 0 || this._blockPool[col][row-j].t < 0){
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
                                if (this._blockPool[col][row].g > 0 || this._blockPool[col][row].g > g){
                                    this._blockPool[col][row].g = g;
                                    // 更新父节点
                                    this._blockPool[col][row].parent = curGrid;
                                }
                                // 计算h值 manhattan估算法
                                this._blockPool[col][row].h = Math.abs(endPos.x - col) + Math.abs(endPos.y - row);
                                // 更新f值
                                this._blockPool[col][row].f = this._blockPool[col][row].g + this._blockPool[col][row].h;
                                // 如果不在开放列表里则添加到开放列表里
                                if (openList.indexOf(this._blockPool[col][row]) < 0){
                                    openList.push(this._blockPool[col][row]);
                                }
                                // 重新按照f值排序（升序排列)
                                openList.sort((a,b)=>{ return a.f-b.f;});
                        }
                    }
                }
            }
            // 遍历完四周节点后把当前节点加入关闭列表
            closeList.push(curGrid);
            // 从开发列表把当前节点移除
            openList.splice(openList.indexOf(curGrid), 1);
            if (openList.length <= 0){
                cc.log("find path failed.");
            }
        }
        return path;
    }
}