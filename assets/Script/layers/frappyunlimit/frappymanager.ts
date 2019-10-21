
const {ccclass, property} = cc._decorator;

export enum Frappy_Statu{
    stand=0,
    playing=1,
    pause=2,
    over=3,
}

@ccclass
export default class frappymanager {

    protected static _instance:frappymanager = null;
    public static get instance(){
        if(!this._instance){
            this._instance = new frappymanager();
        }
        return this._instance;
    }

    private _gameStatu:Frappy_Statu = Frappy_Statu.stand;

    set gameStatu(value:Frappy_Statu){
        this._gameStatu = value;
    }
    get gameStatu(){
        return this._gameStatu;
    }
}