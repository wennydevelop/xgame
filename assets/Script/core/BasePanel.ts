import Dialog from "../Core/Dialog";
import Core from "../Core/Core";
import EManager, { EListener, EName } from "../manager/EventManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BasePanel extends Dialog {
    static Panels: BasePanel[] = [];

    protected _blockNode: cc.Node = null;
    protected _touchNode: string = "_panel_touch_node_";
    protected _eventListeners: EListener[] = [];
    protected _unloadInfos: { url: string, type: typeof cc.Asset }[] = [];
    protected _bgName: string = "";

    onLoad() {
        if (cc.sys.os == cc.sys.OS_IOS) {
            let widget = this.node.getComponent(cc.Widget);
            if (widget) {
                //widget.bottom += gm.safeArea.bottom;
                widget.updateAlignment();
            }
            else {
                //this.node.setContentSize(cc.winSize.width, cc.winSize.height - gm.safeArea.bottom);
                //this.node.y += gm.safeArea.bottom / 2;
            }
        }
        else {
            this.node.setContentSize(cc.director.getWinSize());
        }

        this._blockNode = new cc.Node("block");
        this._blockNode.setContentSize(this.node.getContentSize());
        this._blockNode.setAnchorPoint(this.node.getAnchorPoint());
        this._blockNode.zIndex = 1024;
        this._blockNode.parent = this.node;
        this._blockNode.addComponent(cc.BlockInputEvents);
        this._blockNode.runAction(cc.sequence(cc.delayTime(0.25), cc.callFunc(() => {
            this._blockNode.destroy();
            this._blockNode = null;
        })));

        if (BasePanel.Panels.length > 0 && this.isFullscreen()) {
            for (let i = 0; i < BasePanel.Panels.length; i++) {
                let panel = BasePanel.Panels[i];
                if (panel.node.active) panel.node.active = false;
            }
        }
        BasePanel.Panels.push(this);

        this._eventListeners = [];
        EManager.emit(EName.onShowPanel, this);
    };

    setPanelTouchEnable(enable: boolean) {
        let touchNode = this.node.getChildByName(this._touchNode);
        if (enable) {
            if (touchNode) {
                touchNode.active = false;
            }
        } else {
            if (!touchNode) {
                let node = new cc.Node(this._touchNode);
                node.width = cc.winSize.width;
                node.height = cc.winSize.height;
                node.addComponent(cc.Button);
                this.node.addChild(node);
            } else {
                touchNode.active = true;
            }
        }
    }

    start() {
    };

    update(dt: number) {
    };

    onEnable() {
        EManager.emit(EName.onEnablePanel, this);
    }

    onDisable() {
        EManager.emit(EName.onDisablePanel, this);
        if (cc.isValid(this._blockNode)) {
            this._blockNode.destroy();
            this._blockNode = null;
        }
    }

    onDestroy() {
        for (let listener of this._eventListeners) {
            EManager.removeEvent(listener);
        }
        this._eventListeners = [];
        this._removeSelf();

        EManager.emit(EName.onHidePanel, this);
    }

    isFullscreen(): boolean {
        return false;
    }

    closePanel() {
        let name = (this as any).__classname__;
        if (!BasePanel.getPanel(name)) return;

        this.close();
        this._removeSelf();
    }

    get isTop(): boolean {
        if (BasePanel.Panels.length > 0) {
            let panel = BasePanel.Panels[BasePanel.Panels.length - 1];
            return panel == this;
        }
        return false;
    }

    private _removeSelf() {
        for (let i = BasePanel.Panels.length - 1; i >= 0; i--) {
            let panel = BasePanel.Panels[i];
            if (panel == this) {
                BasePanel.Panels.splice(i, 1);
                for (let j = BasePanel.Panels.length - 1; j >= 0; j--) {
                    let panel = BasePanel.Panels[j];
                    if (j >= i) {
                        if (panel.node.active) {
                            if (panel.isFullscreen()) {
                                break;
                            }
                        }
                    }
                    else {
                        if (!panel.node.active) panel.node.active = true;
                        if (panel.isFullscreen()) {
                            break;
                        }
                    }
                }
                break;
            }
        }
    }

    static closePanel(className: string) {
        for (let panel of BasePanel.Panels) {
            let name = (panel as any).__classname__;
            if (name == className) {
                panel.closePanel();
                break;
            }
        }
    }

    static getPanel(className: string) {
        for (let panel of BasePanel.Panels) {
            let name = (panel as any).__classname__;
            if (name == className) {
                return panel;
            }
        }
    }

    static getNowPanelData() {
        let data = Core.instance.getLayerList();
        return (data && data.length > 0) ? data[data.length - 1] : null;
    }

    protected async _preloadBg(bgName: string) {

    }

    /**动态资源预加载 */
    protected async _preloadRes() {
        // override
    }

    /**资源释放 */
    protected _unloadRes(prefab: cc.Prefab) {
        for (let info of this._unloadInfos) {
            let res = cc.loader.getRes(info.url, info.type);
            if (res) {
                //loadUtils.releaseAssetRecursively(res);
            }
        }
        prefab.data = null;
        cc.loader.releaseAsset(prefab);
    }
}

export class PopupPanel extends BasePanel {
    isFullscreen(): boolean {
        return false;
    }
}

export class FullscreenPanel extends BasePanel {
    isFullscreen(): boolean {
        return true;
    }
}
