import { DataFactory } from "../../config/lib/SafeData";
import DataBase from "../../config/lib/DataBase";
import LocalStorage from "./LocalStorage"

import util from "../../utils/utilTest"
import LoginData from "../data/LoginData"

export default class StorageBase{

    public storageKey:string="glee_storage"
    public timestampKey:string="glee_storage_timestamp"
    public roleIdKey:string= "glee_roleId"

    public autoInterval:number=20*1000//默认20秒保存一次
    protected _autoSave:boolean=false
    protected _saveHandler:any=null

    public onAutoSave:()=>void=null;//当默认保存时，触发


    loginData:LoginData=new LoginData();

    constructor(){
        
    }

    resetKey(oppoId:string){
        this.storageKey = this.storageKey + oppoId;
        this.timestampKey = this.timestampKey + oppoId;
    }

    set autoSave(value:boolean){
        if(this._autoSave==value){
            return;
        }
        this._autoSave=value

        if(this._autoSave){
            this._saveHandler=setInterval(()=>{
                this.saveToLocalStorage();
                if(this.onAutoSave)
                    this.onAutoSave()
            },this.autoInterval)
        }else{
            clearInterval(this._saveHandler);
        }
    }

    get autoSave(){
        return this._autoSave
    }

    _saveToLocalStorage(async:boolean=true){
        let data=this.save()
        let storage=JSON.stringify(data)
        LocalStorage.setItem(this.storageKey,storage);//保存游戏存档
        let serverTime=util.instance.getSystemTime()
        LocalStorage.setItem(this.timestampKey,serverTime.getTime().toString());//保存时间戳key
    }

    saveToLocalStorage(async:boolean=true){
        try{
            return this._saveToLocalStorage(async)
        }catch(e){
            console.log("本地存储异常!!")
        }
    }

    loadFromLocalStorage(){
        let storage=LocalStorage.getItem(this.storageKey);
        if(!storage){
            return;
        }
        try{
            let data=JSON.parse(storage);
            this.load(data);
        }catch(e){
            //Log.instance.error("存档解析失败",storage)
            throw new Error("存档解析失败")
        }
    }

    /**
     * 保存玩家数据至字符串
     */
    public save():any{
        let result:any={}
        for (const key in this) {
            let data=this[key]
            if (data instanceof DataBase) {
                result[key]=this.saveObject(data);
            }
        }
        return result;
    }

    /**
     * 加载玩家数据字符串
     */
    public load(data:any){
        for (const key in data) {
            this[key]=this.loadObject(data[key]);
        }
    }

    public saveObject(obj:any){
        if(obj instanceof DataBase){
            //遍历所有已经设置的属性，保存类名
            let result:any={}            
            result.__class__= obj['_classname_'];
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    if(key.startsWith("__")&&key.endsWith("__")){
                        //属性
                        let newkey=key.substring(2,key.length-2);
                        let value=obj[key];
                        result[newkey]=this.saveObject(value);
                    }
                }
            }
            return result;
        }else if(obj instanceof Array){
            //保存数组对象
            let result=[]
            for(let i=0;i<obj.length;i++){
                result.push(this.saveObject(obj[i]))
            }
            return result;
        }else if(obj instanceof Object){
            //常规对象数据
            let result:any={}            
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    result[key]=this.saveObject(obj[key]);
                }
            }
            return result;
        }else{
            //普通数据
            return obj;
        }
    }

    public loadObject(obj:any){ 
        if(obj instanceof Array){
            let result=[]
            for(let i=0;i<obj.length;i++){
                result.push(this.loadObject(obj[i]))
            }
            return result;
        }else if(obj instanceof Object){
            //对象
            if(obj.__class__){
                //数据模型
                let result=DataFactory.instance.create(obj.__class__)
                if(result){
                    for (const key in obj) {
                        if (key!="__class__" && obj.hasOwnProperty(key)) {
                            result["__"+key+"__"]=this.loadObject(obj[key]);
                        }
                    }
                    return result;
                }else{
                    console.log("存档解析错误，无法找到模型"+obj.__class__)
                    return null;
                }
            }else{
                //常规对象
                let result:any={}            
                for (const key in obj) {
                    if (obj.hasOwnProperty(key)) {
                        result[key]=this.loadObject(obj[key]);
                    }
                }
                return result;    
            }
        }else{
            //普通数据
            return obj;
        }
    }

    /**
     * 本地是否已经有存档
     */
    get isSaved(){
        let data=LocalStorage.getItem(this.storageKey)
        return data!=null&&data!=""
    }

    /**
     * 获取最新保存的存档的时间戳
     */
    get timestamp(){
        let time=LocalStorage.getItem(this.timestampKey);
        if(time){
            let t=parseInt(time)
            if(!isNaN(t)){
                return t;
            }else{
                return 0;
            }
        }else{
            return 0;
        }
    }

    /**
     * 应用服务器提供的奖励数据 需要在子类实现
     * @param reward 奖励数据
     */
    public applyServerReward(reward){

    }
}