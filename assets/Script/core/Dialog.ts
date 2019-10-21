import Log from "./Log";
import Core from './Core';

const {ccclass, property} = cc._decorator;

@ccclass
export default class Dialog extends cc.Component {

    protected _data:any;//当前被绑定的数据

    public set data(value:any){
        this._data=value;
    }

    public get data():any{
        return this._data
    }

    // @property({
    //     tooltip:'启用缓存'
    // })
    // retain:boolean=false

    @property({
        tooltip:'使用自定义位置',
        displayName:'使用自定义位置',
    })
    allowModifyPosition:boolean=false

    @property({
        tooltip:'弹出动画',
        type:cc.AnimationClip,
        displayName:'弹出动画',
    })
    openAnim:cc.AnimationClip=null

    @property({
        tooltip:'关闭动画',
        type:cc.AnimationClip,
        displayName:'关闭动画',
    })
    closeAnim:cc.AnimationClip=null

    @property({
        tooltip:'背景动画',
        type:[cc.AnimationClip],
        displayName:'背景动画',
    })
    loopBGAnim:cc.AnimationClip[]=[]

    protected _onInit(){
        var anim = this.node.getComponent(cc.Animation) || this.node.getComponentInChildren(cc.Animation)
        if (anim != null) {
            if(anim.getClips().length<2){
                anim['_clips'].push(null)
            }
            if(anim.getClips().length<2){
                anim['_clips'].push(null)
            }

            for(let animclip of this.loopBGAnim){
                if(!anim.getClips().find(item=>item && item.name==animclip.name)){
                    anim.addClip(animclip)
                } 
                anim.playAdditive(animclip.name)
            }
        }
    }

    /**
     * 当界面加载完成后执行，界面数据由此传入
     * @param data 
     */
    public onInit(data:any){
        
    }
    
    close(){
        Core.instance.closeLayer(this.node)
        this.onClose()
    }

    onClose(){
        
    }

    播放点击音效(){
        return this.playClickEffect()
    }

    playClickEffect(){
        
    }
    
    关闭对话框(){
        return this.close()
    }

}