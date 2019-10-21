import { cropconfigInit } from "./cropconfig";

let isInit=false
let list={cropconfig:cropconfigInit,}
export function initTable(value:{[key:string]:{k:string,v:string}}){
    if(isInit){
        return;
    }
    cropconfigInit
    isInit=true;
    for(let key in list){
        let init=list[key]
        let data=value[key]
        if(data){
            init(data.k,data.v)
        }else{
            init();
        }
    }
}
