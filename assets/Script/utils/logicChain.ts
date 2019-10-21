
export class logicResult{
    success:boolean=true;//执行结果
    nextData:any=null;//向下传递的数据
    extra?:any=undefined
}

export default class logicChain{
    static total:number = 0;
    static current:number = 0;
    protected _next:logicChain;
    constructor(){
        
    }
    
    /**
     * 链接下一个逻辑
     * @param next 
     */
    link(next:logicChain){
        this._next=next;
        logicChain.total++;
        return next;
    }

    /**
     * 执行逻辑并返回结果
     */
    async execute(data:any):Promise<logicResult>{
        let result= await this.logic(data);
        
        if(result.success && this._next){
            logicChain.current++;
            await this._next.execute(result.nextData);
        }
        return result;
    }

    /**
     * 子类需要实现该函数
     */
    protected async logic(data:any):Promise<logicResult>{
        return new Promise<logicResult>((resolve,reject)=>{resolve(new logicResult())})
    }
}