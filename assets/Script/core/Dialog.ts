import Core from './Core';

const { ccclass, property } = cc._decorator;

@ccclass
export default class Dialog extends cc.Component {

    protected _data: any;//当前被绑定的数据

    public set data(value: any) {
        this._data = value;
    }

    public get data(): any {
        return this._data
    }

    @property({
        tooltip: '使用自定义位置',
        displayName: '使用自定义位置',
    })
    allowModifyPosition: boolean = false

    protected _onInit() {

    }

    /**
     * 当界面加载完成后执行，界面数据由此传入
     * @param data 
     */
    public onInit(data: any) {

    }

    close() {
        Core.instance.closeLayer(this.node)
        this.onClose()
    }

    onClose() {

    }

}