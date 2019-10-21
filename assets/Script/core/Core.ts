import Scene from "./Scene"
import Dialog from './Dialog'
import Log from './Log'

let log=new Log({tags:["core"]})

export class SceneData{
    protected static _index:number=0;
    public static get index(){
        return ++this._index;
    }

    protected _index:number
    protected _name:string
    protected _data:Object

    public constructor(name:string,data:Object){
        this._index=SceneData.index;
        this._name=name
        this._data=data
    }

    public get index():number{
        return this._index;
    }

    public get name():string{
        return this._name
    }

    public get data():Object{
        return this._data
    }

}

export enum LayerType{
    FLOAT,
    INFO,
    DEBUG
}

export class EventType {
    /**
     * 界面初始化完成
     */
    static INIT:string="onInit"
}

export class LayerData{
    protected static _index:number=0;
    public static get index(){
        return ++this._index;
    }

    protected _index:number
    protected _url:string
    protected _prefab:cc.Prefab
    protected _data:Object
    protected _node:cc.Node
    protected _layerType:LayerType

    public constructor(prefab:cc.Prefab,data:Object,node:cc.Node,layerType:LayerType,url:string){
        this._index=SceneData.index;
        this._prefab=prefab
        this._data=data
        this._node=node
        this._layerType=layerType
        this._url=url
    }

    public get index():number{
        return this._index;
    }

    public get url():string{
        return this._url;
    }

    public get prefab():cc.Prefab{
        return this._prefab
    }

    public get data():Object{
        return this._data
    }

    public get node():cc.Node{
        return this._node
    }

    public get layerType():LayerType{
        return this._layerType
    }

}


/**
 * 界面框架 核心类 用于管理界面等
 */
export default class Core extends cc.EventTarget{
    protected static _instance:Core
    public allScreenLayerNum = 0;
    public static get instance():Core{
        if(!this._instance)
            this._instance=new Core();
        return this._instance;
    };

    //事件
    static readonly SHOW:string="show"
    static readonly HIDE:string="hide"
    protected _isShowed:boolean=true
    public get isShowed():boolean{
        return this._isShowed;
    }
    protected _loadingIndex=0;
    public get loadingIndex(){
        return this._loadingIndex++;
    }
    private bgSp:cc.SpriteFrame = null;
    public toastOffset=cc.p(0,0)



    protected _sceneList:Array<SceneData>=new Array<SceneData>()
    protected _layerList:Array<LayerData>=new Array<LayerData>()

    protected _floatLayer:cc.Node;
    protected _infoLayer:cc.Node;
    protected _debugLayer:cc.Node;

    protected _showLoadingModalCallback:(index:number,url:string)=>void=null;//显示模态化遮挡层
    protected _closeLoadingModalCallback:(index:number,url:string)=>void=null;//隐藏模态遮挡层


    public constructor(){
        super();
        
        cc.game.on(cc.game.EVENT_SHOW, () => {
            if(this._isShowed==false){
                this.emit(Core.SHOW)
                this._isShowed=true;
            }
        })
        cc.game.on(cc.game.EVENT_HIDE, () => {
            if(this._isShowed){
                this.emit(Core.HIDE)
                this._isShowed=false;
            }
        })
    }

    /**
     * 初始化场景，构建基础图层
     * 浮动层
     * 信息层
     * debug层
     */
    public init():void{
        if(this._floatLayer){
            return;
        }

        log.info("initialize Scene");

        let nowScene=cc.director.getScene();

        this._floatLayer=new cc.Node("floatLayer")
        this._infoLayer=new cc.Node("infoLayer")
        this._debugLayer=new cc.Node("debugLayer")

        nowScene.addChild(this._floatLayer,100)
        nowScene.addChild(this._infoLayer,200)
        nowScene.addChild(this._debugLayer,300)

        cc.game.addPersistRootNode(this._floatLayer)
        cc.game.addPersistRootNode(this._infoLayer)
        cc.game.addPersistRootNode(this._debugLayer)

        log.info("Scene init complete");

    }

    protected openScene(scene:SceneData,callback:()=>void=null):boolean{
        let index=this.loadingIndex;
        if(this._showLoadingModalCallback)
            this._showLoadingModalCallback(index,scene.name)

        return cc.director.loadScene(scene.name,()=>{
            //对场景进行数据绑定
            let newScene=cc.director.getScene();
            let sceneComponents= newScene.getComponents(Scene)

            for(let comp of sceneComponents){
                comp.data=scene.data
                comp.onInit(scene.data)
            }

            //执行场景初始化
            newScene.dispatchEvent(new cc.Event.EventCustom(EventType.INIT,false));

            if(this._closeLoadingModalCallback)
                this._closeLoadingModalCallback(index,scene.name)

            if(callback){
                callback();
            }
            
        });
    }

    /**
     * 压入场景
     */
    public pushScene(name:string,data?:any,callback:()=>void=null):SceneData{
        let scene=new SceneData(name,data)

        this._sceneList.push(scene)

        let result=this.openScene(scene,callback);
        return scene;
    }

    /**
     * 弹出场景
     */
    public popScene(callback:()=>void=null):SceneData{
        //已经是顶部场景
        if(this._sceneList.length<=1){
            if(cc.director.getScene()){
                //cc.director.popScene()
            }
            log.warn("no available scenes");
            return null;
        }
        
        this._sceneList.pop()
                
        let scene=this._sceneList[this._sceneList.length-1]

        let result=this.openScene(scene,callback);
        return scene;
    }

    /**
     * 切换场景
     */
    public replaceScene(name:string,data?:any,callback:()=>void=null):SceneData{
        this.popScene()
        return this.pushScene(name,data,callback)
    }

    /**
     * 获取当前的场景
     */
    public get currentScene(){
        return this._sceneList[this._sceneList.length-1]
    }
    

    /**
     * 通过预制资源 显示图层
     */
    protected showLayerPrefab(prefab:cc.Prefab,data:object,modalWindow:boolean=true,layer:LayerType=LayerType.FLOAT,url:string=null):LayerData{
        let node=cc.instantiate(prefab)

        let size=cc.director.getWinSize()
        size = cc.winSize;
        if(modalWindow){
            //初始模态背景
            var bg=new cc.Node("modalBg");
            bg.setContentSize(size.width,size.height)
            bg.addComponent(cc.Button);
            node.addChild(bg,-1);
            
            // var graphics=bg.addComponent(cc.Graphics)
            // graphics.fillColor=new cc.Color(0,0,0,Math.ceil(256*0.8-0.9))
            // graphics.fillRect(0,0,size.width,size.height)
            // bg.scale=5;
            // cc.Node['touchNum'] = 0;

            let sprite = bg.addComponent(cc.Sprite);
            sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
            sprite.type = cc.Sprite.Type.SLICED;
            if(!this.bgSp){
                cc.loader.loadRes(`image/common/splash`,cc.SpriteFrame,(err,sf)=>{
                    if(!err){
                        sprite.spriteFrame = sf;
                        this.bgSp = sf;
                    }
                })
            }else{
                sprite.spriteFrame = this.bgSp;
            }
            

            bg.color = cc.color(0,0,0,255);
            bg.opacity = Math.ceil(256*0.8-0.9);
            bg.setContentSize(cc.size(2000,2000));
        }

        let dialogComponents= node.getComponents(Dialog)
        
        node.setPosition((size.width)/2,(size.height)/2)
        for(let comp of dialogComponents){
            if(comp.allowModifyPosition){
                node.setPosition((size.width)/2+node.x,(size.height)/2+node.y)
                break
            }
        }

        //绑定数据
        for(let comp of dialogComponents){
            comp.data=data
            comp.onInit(data);
        }

        

        switch(layer){
            case LayerType.FLOAT:
                this._floatLayer.addChild(node)
            break
            case LayerType.INFO:
                this._infoLayer.addChild(node)
            break
            case LayerType.DEBUG:
                this._debugLayer.addChild(node)
            break
        }

        //默认第一个是打开动画
        /*
        var anim = node.getComponent(cc.Animation) || node.getComponentInChildren(cc.Animation)
        if (anim != null) {
            // 播放打开动画
            var animclip:cc.AnimationClip=null
            // 优先采用内定值
            animclip=node.getComponent(Dialog).openAnim
            if(animclip){
                if(!anim.getClips().find(item=>item && item.name==animclip.name)){
                    if(anim.getClips().length==1){
                        // 避免填入第二个
                        anim['_clips'].push(null)
                    }
                    anim.addClip(animclip)
                }
            }else{
                animclip=anim.getClips()[0]
            }

            if(animclip){
                anim.stop()
                anim.playAdditive(animclip.name)
            }
        }*/

        //绑定数据
        for(let comp of dialogComponents){
            comp['_onInit']()
        }
        let layerData=new LayerData(prefab,data,node,layer,url)

        this._layerList.push(layerData)
        return layerData;
    }

    public showLayer(url:string,{data,modalWindow,layer,callback}:
        {data?:any,modalWindow?:boolean,layer?:LayerType,callback?:(layerData:LayerData)=>void}={modalWindow:true,layer:LayerType.FLOAT}){
        if(this.isLayerShown(url)){
            console.warn(`${url} is already opened`);
            return;
        }
        let index=this.loadingIndex;

        if(this._showLoadingModalCallback)
            this._showLoadingModalCallback(index,url)
        
        cc.loader.loadRes(url,(err:Error,prefab:cc.Prefab)=>{
            if(!prefab || prefab instanceof cc.Prefab == false){
                log.error("无法找到对话框",url)
                if(this._closeLoadingModalCallback)
                    this._closeLoadingModalCallback(index,url)
                this.resLoadRetry(()=>{
                    this.showLayer(url,{data:data,modalWindow:modalWindow,layer:layer,callback:callback});
                })
                return
            }

            if(this._closeLoadingModalCallback)
                this._closeLoadingModalCallback(index,url)
            if(prefab){
                let l=this.showLayerPrefab(prefab,data,modalWindow,layer,url)
                if(callback){
                    callback(l)
                }
            }else{
                log.error(err)
            }
        })
    }

    protected wxGC(){
        
    }

    public isLayerShown(data:string):boolean{
        let layerData=this._layerList.where(a=>a.url==data).single
        return !!layerData
    }

    /**
     * 关闭图层
     */
    public closeLayer(data:number|string|LayerData|cc.Node){
        let layerData:LayerData
        if(typeof data == "number"){
            layerData=this._layerList.where(a=>a.index==data).single
        }else if(typeof data=="string"){
            layerData=this._layerList.where(a=>a.url==data).single
        }else if(data instanceof LayerData){
            layerData=data
        }else if(data instanceof cc.Node){
            layerData=this._layerList.where(a=>a.node==data).single
        }

        if(!layerData){
            log.warn("no layer",data)
            return
        }

        let isValidAnim=false
        /*
        // 优先采用内定动画
        var anim = layerData.node.getComponent(cc.Animation) || layerData.node.getComponentInChildren(cc.Animation)
        var animclip=null
            //默认第2个是打开动画
        if (anim != null) {
            animclip = layerData.node.getComponent(Dialog).closeAnim
            if(!animclip){
                if(anim.getClips().length>=2 && anim.getClips()[1]){
                    let state=anim.getAnimationState(anim.getClips()[1].name)
                    if(state.repeatCount!=Infinity && state.duration<2){
                        isValidAnim=true
                    }else{
                        // console.warn('关闭对话框时,第二个动画为无限循环动画或者时长超过2秒,则不使用第二个动画作为关闭动画')
                    }
                }
            }else{
                isValidAnim=true
            }

            if(isValidAnim){
                animclip=animclip || anim.getClips()[1]
                if(!anim.getClips().find(info=>info && info.name==animclip.name)){
                    if(anim.getClips().length==0){
                        anim['_clips'].push(null)
                    }
                    anim.addClip(animclip)
                }
            }
        }
        if(isValidAnim){
            anim.play(animclip.name)
            anim.once("finished", ()=>{
                // layerData.node.removeFromParent(true);
                layerData.node.destroy()
                this._layerList.remove(layerData)
                // cc.Node['touchNum'] =0;
            })
        }else{
            // layerData.node.removeFromParent(true);
            layerData.node.destroy()
            this._layerList.remove(layerData)
            // cc.Node['touchNum'] =0;
        }
        */
       layerData.node.destroy();
        this._layerList.remove(layerData);
    }


    closeAllLayer(){
        let excludeLayer = {
            "prefabs/dialogs/Loading":1,
            "prefabs/dialogs/DGuide2":1
        }
        for (let i = this._layerList.length-1; i >= 0;--i) {
            if(!excludeLayer[this._layerList[i].url]){
                this.closeLayer(this._layerList[i].url);
            }
        }
    }

    public set showModalCallback(callback:(index:number,url:string)=>void){
        this._showLoadingModalCallback=callback;
    }

    public set closeModalCallback(callback:(index:number,url:string)=>void){
        this._closeLoadingModalCallback=callback;
    }



    public getLayerList():Array<LayerData>{
        return this._layerList.concat()
    }

    /**
     * 弹出简单信息 结束后关闭
     */
    public toast(text:string, {prefab,icon}:{prefab?:string,icon?:cc.SpriteFrame}={prefab:"prefabs/toast",icon:null}){
        cc.loader.loadRes(prefab, cc.Prefab,(err:Error,prefab:cc.Prefab):void=>{
            if(!prefab || prefab instanceof cc.Prefab == false){
                log.error("无法找到对话框" + prefab)
                return
            }
            //显示图层
            var layer=this.showLayerPrefab(prefab,{},false,LayerType.INFO);

            //进行toast 偏移
            layer.node.x+=this.toastOffset.x;
            layer.node.y+=this.toastOffset.y;

            //设置节点大小
            let rootNode=cc.find("root",layer.node)
            cc.assert(rootNode);

            let labelNode=cc.find("root/label",layer.node)
            let iconNode=cc.find("root/icon",layer.node);
            let bgNode=cc.find("root/bg",layer.node)

            if (labelNode) {
                var label=labelNode.getComponent(cc.Label)
                if(label){
                    label.string=text
                    setTimeout(() => {
                        let size=label.node.getContentSize()
                        size.width+=20
                        size.height+=20
                        if(bgNode){
                            bgNode.setContentSize(size)
                        }
                    }, 0);
                }
                var richText=labelNode.getComponent(cc.RichText)
                if(richText){
                    richText.string=text
                    setTimeout(() => {
                        let size=richText.node.getContentSize()
                        size.width+=20
                        size.height+=20
                        if(bgNode){
                            bgNode.setContentSize(size)
                        }
                    }, 0);
                }
            }

            if(iconNode && icon){
                let sprite=iconNode.getComponent(cc.Sprite)
                if(sprite){
                    sprite.spriteFrame=icon;
                }
            }

            if (rootNode) {
                var anim=rootNode.getComponent(cc.Animation);
                if(anim){
                    var onFinished=(e:cc.Event)=>{
                        anim.off("finished",onFinished)
                        this.closeLayer(layer)
                    }
                    anim.once("finished",onFinished)    
                    var stat=anim.play("ToastClip")    
                }else{
                    setTimeout(() => {
                        this.closeLayer(layer)
                    }, 1000);
                }
            }
        })
    }

    protected resLoadRetry(retry:()=>void){
        this.showDialog('network_error',()=>{
            retry();
        })
    }

    /**
     * 打开对话框
     */
    public showDialog(message:string,callback:(v:boolean)=>void,{title,okText,cancelText,cancelable}:{title?:string,okText?:string,cancelText?:string,cancelable?:boolean}={title:"友情提示",okText:"确定",cancelText:"取消",cancelable:false}){
        if(false){
            // vivo信息弹出框
            qg.showDialog({
                title:title || "友情提示",
                message:message,
                buttons:[
                    {
                        text:okText || "确定",
                        color:"#33dd44"
                    },
                    {
                        text:cancelText || "取消",
                        color:"#33dd44"
                    }
                ],
                success:(data)=>{
                    if(data && data.index){
                        console.log("vivo 弹窗选择按钮序号: "+data.index);
                    }
                    
                    if(cancelable){
                        callback((data && data.index==1));
                    }else{
                        callback(true);
                    }
                },
                cancel:()=>{
                    console.log("vivo 弹窗选择 取消");
                    callback(true);
                },
                fail:(data,code)=>{
                    console.error("vivo 弹窗选择 失败");
                    callback(false);
                }
            });
        }
        else{
            //系统默认弹框
            if(cancelable){
                callback(confirm(message));
            }else{
                alert(message);
                callback(true);
            }
        }
    }
}

