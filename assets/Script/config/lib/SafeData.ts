import DataBase from "./DataBase";

// ------------------ B ------------------
function bshift23encode(s){
    let s1t=[]
    for(let c of s){
        s1t.push(String.fromCharCode((c.charCodeAt()+23)%65536))
    }
    return s1t.join("")

    // return s.split('').map(e=>String.fromCharCode(
    //     (e.charCodeAt()+23)%65536
    // )).join('')
}

function bshift23decode(s){
    let s1t=[]
    for(let c of s){
        s1t.push(String.fromCharCode((c.charCodeAt()-23)%65536))
    }
    return s1t.join("")

    // return s.split('').map(e=>String.fromCharCode(
    //     (e.charCodeAt()-23)%65536
    // )).join('')
}

function b64decode(s){
    s=s.split("").reverse().join("")
    return Base64.decode(s)
}

function encode(value,log = false){
    let type =typeof value
    if(type=="number"){
        //对数字进行加密
        if(value%1===0){
            return "a"+bshift23encode(value.toString(16))
        }else{
            return "A"+bshift23encode(value.toString())
        }

    }else if(type=="string"){
        //对字符串进行加密
        return "R"+bshift23encode(value);
    }else if(type=="boolean"){
        //对布尔值进行加密
        return value?"f":"t"
    }else{
        return value
    }
}

function decode(value,log = false){
    let type =typeof value
    if(type=="string"){
        let type=value[0]
        value=value.substr(1);
        if(type=="A"){
            return parseFloat(bshift23decode(value))
        }else if(type=="a"){
            //解密数字
            return parseInt(bshift23decode(value),16)
        }else if(type=="R"){
            //解密字符串
            return bshift23decode(value);
        }else if(type=="f"){
            return true;
        }else if(type=="t"){
            return false;
        }else if(type=="N"){
            return parseFloat(b64decode(value))
        }else if(type=="n"){
            //解密数字
            let [left,right]=value.split("I")
            left=~-parseInt(left,36)
            let rr=~-parseInt(right,36)
            right=rr/Math.pow(10,rr.toString().length)
            return left>=0?left+right:left-right
        }else if(type=="s"){
            //解密字符串
            return b64decode(value);
        }
    }else{
        return value
    }
}

// ------------------------ B ----------------------

window["encode"]=encode
window["decode"]=decode

function build(target,property){
    let value=target[property]
    let type=typeof value
    
    delete target[property]
    Object.defineProperty(target, property, {
        get: function () {
            return decode(this["__"+property+"__"])
        },
        set: function (value) {
            this["__"+property+"__"]=encode(value)
        }
    });
}

export class DataFactory{
    static readonly instance:DataFactory=new DataFactory;
    protected _creatorMap:{[key:string]:()=>void}={};
    protected _creatorList:{className:string,creator:()=>DataBase}[]=[];
    constructor(){

    }
    addCreator(className:string,creator:()=>DataBase){
        this._creatorMap[className]=creator;
        this._creatorList.push({className:className,creator:creator});
    }

    create(className):DataBase{
        let creator=this._creatorMap[className];
        if(creator){
            return new creator();
        }
        return null;
    }
    get creatorList(){
        return this._creatorList;
    }
}

export function SafeClass(className:string):any{
    return function(ctor){
        var safeclass:any = function (...args) {
            try{
                ctor.apply(this, args)
            }catch(e){
                console.error(`@SafeClass(${className})(`,args,`)构造失败`)
                throw e
            }
    
            for(let key in this){
                if (this.hasOwnProperty(key)) {
                    let value=this[key]
                    let type=typeof value
                    build(this,key);
                    this[key]= value;
                }
                
            }
            this._classname_=className;
    
            return this;
        }
        
        safeclass.prototype = ctor.prototype;
        DataFactory.instance.addCreator(className,safeclass);
    
        return safeclass;
    
    }
}

export function SafeProperty(target,property){
    let value=target[property]
    build(target,property)
    target[property]=value;
}