export let EName = {
    onPushView: "on push view",
    onPopView: "on pop view",
    onNetworkError: "on network error",

    onShow: "on show",
    onHide: "on hide",
    onClosePanel: "on close panel",
    onClosePanels: "on close panels",
    onTouch: "on touch",

    onEnablePanel: "on enable panel",
    onDisablePanel: "on disable panel",
    onReloadView: "on reload view",

    onGameExit: "退出游戏",
    onShowPanel: "显示面板",
    onHidePanel: "隐藏面板",
}

export class EListener {
    /**
     * 事件名称
     */
    name: string

    /**
     * 事件回调，返回false表示事件中断
     */
    func: (data: any, connection: EConnection) => void

    /**
     * 只监听一次
     */
    once: boolean

    /**
     * 优先级
     */
    prority: number

    /**
     * 是否有效
     */
    enable: boolean
}

/**
 * 各监听者之间的传递者
 */
export class EConnection {
    listener: EListener;
    stop: boolean = false;
}

/**
 * 事件分发器   
 */
export default class EManager {
    protected static _allEvtListeners: { [key: string]: EListener[] } = {}

    /**
     * 添加事件监听者
     * @param key 事件名称
     * @param func 事件回调     
     */
    public static addEvent(key: string, func: (data: any, connection: EConnection) => void, once?: boolean, prority?: number): EListener {
        let listener = new EListener()
        listener.name = key
        listener.func = func
        listener.once = once
        listener.prority = prority ? prority : 0;
        listener.enable = true;

        if (this._allEvtListeners[key] == null) {
            this._allEvtListeners[key] = []
        }
        let listeners = this._allEvtListeners[key];
        listeners.push(listener);
        listeners.sort((a: EListener, b: EListener) => {
            return a.prority - b.prority
        });

        return listener
    }

    /**
     * 批量添加事件监听者
     * @param keys 事件名称
     * @param func 事件回调     
     */
    public static addEventArray(keys: string[], func: (data: any, connection: EConnection) => void, once?: boolean, prority?: number): EListener[] {
        let listeners = [];
        for (let key of keys) {
            let listener = this.addEvent(key, func, once, prority)
            listeners.push(listener);
        }

        return listeners;
    }

    /**
     * 删除事件监听者
     * @param listener 事件监听者
     */
    public static removeEvent(listener: EListener) {
        let listeners = this._allEvtListeners[listener.name]
        if (listeners instanceof Array) {
            let index = listeners.indexOf(listener)
            if (index >= 0) {
                listener.enable = false;
                listeners.splice(index, 1)
                if (listeners.length == 0) {
                    delete this._allEvtListeners[listener.name]
                }
            }
        }
    }

    /**
     * 
     * @param key 事件名称
     * @param data 附带的数据
     */
    public static emit(key: string, data?: any) {
        let listeners = this._allEvtListeners[key]
        if (listeners instanceof Array) {
            let connection = new EConnection();
            let tempListeners = listeners.slice(0)
            for (let listener of tempListeners) {
                if (listener.enable) {
                    connection.listener = listener;
                    listener.func(data, connection)
                    if (listener.once) {
                        this.removeEvent(listener)
                    }
                    if (connection.stop) {
                        break;
                    }
                }
            }
        }
    }
}