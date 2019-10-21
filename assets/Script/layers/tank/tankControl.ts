import tankGame from "./tankGame";

const {ccclass, property} = cc._decorator;
export enum TankGame_Statu{
    stand=0,
    playing=1,
    pause=2,
    over=3,
}

@ccclass
export default class tankControl {

    protected static _instance:tankControl = null;
    public static get instance(){
        if(!this._instance){
            this._instance = new tankControl();
        }
        return this._instance;
    }

    
    private _gameStatu:TankGame_Statu = TankGame_Statu.stand;
    private _gameLayer:cc.Node = null;

    set gameStatu(value:TankGame_Statu){
        this._gameStatu = value;
    }
    get gameStatu(){
        return this._gameStatu;
    }
    
    set gameCenter(value:cc.Node){
        this._gameLayer = value;
    }
    get gameCenter(){
        return this._gameLayer;
    }

    BornBullet(group:number,p:cc.Vec2,sp:cc.Vec2){
        if(this._gameLayer){
            let gameScript:tankGame = this._gameLayer.getComponent(tankGame);
            if(gameScript){
                gameScript.runBullet(group,p,sp);
            }
        }
    }
}