
export enum RedPoint {
    banqian = "banqian",          // 搬迁
    activity = "activity",        // 活动
    ac_login = "ac_login",        // 活动-签到 
}

// 红点功能

/*
    红点加入流程:
    1.注册红点逻辑名称和判断函数,如果不是首层红点注册时需传入首层红点名
    2.注册红点ui节点名,用于显示和隐藏
    3.调用刷新函数刷新红点

    ex:
    1.红点系统解锁
    2.红点暂时忽略(用于某段时间不显示红点)
 */

export default class redpointUtil {
    protected static _instance: redpointUtil
    public static get instance(): redpointUtil {
        if (!this._instance)
            this._instance = new redpointUtil();
        return this._instance;
    }
    // key:节点对应的逻辑名称,func:红点判断函数,child:子节点,node:自身节点,ignore:忽略红点
    private redpool: {[key:string]:{func?:Function,child?:any,node?:cc.Node,ignore?:boolean}} = {};  
    private unlockRed: boolean = true;  // 当前红点功能是否解锁                      
    private redpoints: { [key: string]: boolean } = {};

    public initRedPool() {
        this.initData()
        this.registFunc(RedPoint.banqian, this.funTest.bind(this));

        this.registFunc(RedPoint.activity);
        this.registFunc(RedPoint.ac_login, this.funTest.bind(this), RedPoint.activity);
    }

    // 注册红点忽略  如果忽略则不显示 不忽略则走正常逻辑
    public registerIgnoreRed(bIgnore: boolean, redName: string, root?: string) {
        let redItem = this.getItem(redName);
        if (redItem) {
            redItem.ignore = bIgnore;
        }
        if (root) {
            this.freshRed(root);
        }
    }

    // 本次登录的红点不显示
    public valideRed(redName: string, bHide: boolean) {
        if (!this.redpoints) {
            this.redpoints = {};
        }
        this.redpoints[redName] = bHide;
    }

    public registNode(selfName: string, redNode: cc.Node) {
        let redItem = this.getItem(selfName)
        if (redItem) {
            redItem.node = redNode;

        } else {
            console.error("未找到该节点~");
        }
    }

     // 针对某个节点进行刷新
     public freshRed(name: string) {
        this.freshRedEx(name);
    }

    // 所有红点进行一次刷新
    public freshRedPool() {
        Object.keys(this.redpool).forEach((key) => {
            this.freshRed(key);
        });
    }

    // 红点解锁
    public resetUnlockRed() {
        let preFlag: boolean = this.unlockRed;
        this.unlockRed = true;
        if (preFlag != this.unlockRed) {
            this.freshRedPool();
        }
    }

    private initData() {
        this.unlockRed = true;
    }

    private funTest(): boolean {
        return true;
    }

    private registFunc(selfName: string, fun?: Function, parentName?: string) {
        if (this.getItem(selfName)) {
            console.error("已存在该节点~");
            return;
        }

        if (parentName) {
            let pareItem = this.getItem(parentName);
            if (pareItem) {
                if (!pareItem.child) {
                    pareItem.child = {}
                }
                pareItem.child[selfName] = { func: fun };
            } else {
                console.error("父节点不存在~");
            }
        } else {
            this.redpool[selfName] = {};
            this.redpool[selfName] = { func: fun };
        }

    }

    private getItem(name: string) {
        let item: any;
        for (let key in this.redpool) {
            if (key === name) {
                item = this.redpool[key];
            }
            if (this.redpool[key].child) {
                let childRed: any = this.redpool[key].child;
                for (let subKey in childRed) {
                    if (subKey === name) {
                        item = childRed[subKey];
                    }
                }
            }
        }

        if (!item) {
            Object.keys(this.redpool).forEach((key) => {
                let res = this.getItemInChild(name, this.redpool[key]);
                item = res ? res : item;
            });
        }
        return item;
    }

    private getItemInChild(name: string, item: any): any {
        if (!name || !item || !item.child) {
            return null;
        }
        let result: any = null;
        Object.keys(item.child).forEach((key) => {
            if (key === name) {
                result = item.child[key];
            } else {
                let res = this.getItemInChild(name, item.child[key].child);
                result = res ? res : result;
            }
        });
        return result;
    }

    // 获取某个节点的根节点
    private getRootName(childName: string): string {
        let rootName: string = "";
        Object.keys(this.redpool).forEach((key) => {
            if (key === childName) {
                rootName = key;
            } else {
                if (this.bExistInChild(childName, this.redpool[key])) {
                    rootName = key;
                }
            }
        });
        return rootName;
    }

    // 判断某个节点的子节点中是否存在某个节点
    private bExistInChild(name: string, item: any): boolean {
        if (!name || !item || !item.child) {
            return false;
        }

        let bFind: boolean = false;
        Object.keys(item.child).forEach((key) => {
            if (key === name) {
                bFind = true;
            } else {
                if (item.child[key].child) {
                    let res = this.bExistInChild(name, item.child[key].child);
                    bFind = res ? res : bFind;
                }
            }
        });
        return bFind;
    }

    // 刷新某个节点
    private freshRedEx(name: string) {
        let rootName: string = this.getRootName(name);
        if (rootName && this.redpool[rootName]) {
            let rootItem = this.redpool[rootName];
            let bVisible: boolean = false;
            if (rootItem.child) {
                bVisible = this.freshChildRed(rootItem);
            } else {
                bVisible = rootItem.func ? rootItem.func() : false;
            }
            bVisible = rootItem.ignore ? false : bVisible;
            if (rootItem.node && cc.isValid(rootItem.node)) {
                rootItem.node.active = this.unlockRed ? bVisible : false;
            } else {
                console.error("redpoint root-" + rootName + " node is not valid~");
            }
        } else {
            console.error("redpoint root-" + rootName + " is not register~");
        }
    }

    private freshChildRed(item): boolean {
        if (!item) {
            return false;
        }
        let result: boolean = false;
        if (!item.child) {
            result = item.func ? item.func() : false;
        } else {
            Object.keys(item.child).forEach((key) => {
                let res = this.freshChildRed(item.child[key]);
                result = res ? res : result;
            });
        }
        result = item.ignore ? false : result;
        result = this.unlockRed ? result : false;
        if (item.node && cc.isValid(item.node)) {
            item.node.active = result;
        }

        return result;
    }

    private printRedLog(name: string, valid: boolean) {
        return;
    }
}