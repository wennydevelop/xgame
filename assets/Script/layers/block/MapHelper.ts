
export interface gridPos{
    x:number;
    y:number;
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

    private _blockPool:number[][]= [];

    public initMapInfo(width,height,width_block,height_block){
        this._height = Math.floor(height);
        this._width = Math.floor(width);
        this._width_block = Math.floor(width_block);
        this._height_block = Math.floor(height_block);
        this._width_count = Math.floor(this._width/this._width_block);
        this._height_count = Math.floor(this._height/this._height_block);

        for(let i=0;i<this._height_count;i++){
            let tmp:number[]=[];
            for(let j=0;j<this._width_count;j++){
                tmp.push(1);
            }
            this._blockPool.push(tmp);
        }
    }

    public getPosX(xIndex):number{
        let posX:number = 0;
        return posX = this._width_block*(xIndex+1/2);
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
            this._blockPool[yIndex][xIndex] = value;
        }
    }
    public isValid(xIndex,yIndex):boolean{
        if(this._blockPool && this._blockPool.length>yIndex && this._blockPool[yIndex].length>xIndex){
            return this._blockPool[yIndex][xIndex]==1;
        }
        return false;
    }

    public getBestPath(startPos:gridPos,endPos:gridPos){

    }
}