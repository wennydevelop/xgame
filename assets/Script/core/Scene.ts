const {ccclass, property} = cc._decorator;

@ccclass
export default class Scene extends cc.Component {

    protected _data:any;//当前被绑定的数据

    public set data(value:any){
        this._data=value;
    }

    public get data():any{
        return this._data
    }

    // 适配屏幕
    protected adaptScreen(){
        let screenSize = cc.view.getFrameSize();
        console.log("屏幕大小 w: "+screenSize.width+" h: "+screenSize.height);
        cc.Canvas.instance.designResolution = cc.size(750,1334);
        let mask:cc.Node = cc.find("mask");
        if(screenSize.width/screenSize.height > 750/1334){
            cc.view.setResolutionPolicy(cc.ResolutionPolicy.FIXED_HEIGHT);
            cc.Canvas.instance.fitHeight = true;
            cc.Canvas.instance.fitWidth = false;
            console.log("屏幕适配 fixHeight");
            if(mask){
                mask.active = true;
                mask.zIndex = 999;
            }
        }else{
            cc.view.setResolutionPolicy(cc.ResolutionPolicy.FIXED_WIDTH);
            cc.Canvas.instance.fitHeight = false;
            cc.Canvas.instance.fitWidth = true;
            console.log("屏幕适配 fixWidth");
            if(mask){
                mask.active = false;
            }
        }
    }

    private _bindNode() {
        //绑定$开头的节点到_开头的同名属性上
        let searchFun = (node: cc.Node) => {
            if (node.name[0] === `$`) {
                this[`_${node.name.slice(1)}`] = node;
            }
            for (let i = 0; i < node.children.length; ++i) {
                searchFun(node.children[i]);
            }

        }
        searchFun(this.node.parent);
    }

    /**
     * 当界面加载完成后执行，界面数据由此传入
     * @param data 
     */
    public onInit(data:any){
        
    }

    playClickEffect(){
       
    }
    
}
