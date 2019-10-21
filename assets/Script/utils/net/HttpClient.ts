type RequestParam={
    method:"GET"|"POST"|"PUT"|"DELETE",
    url:string,
    data?:any,
    timeout?:number,
    headMap?:{[key:string]:string},
    onDone?:(data:any)=>void,
    onError?:(error:any)=>void,
    onTimeout?:()=>void,
    onProgress?:(loaded:number,total:number)=>void,
    onUploadProgress?:(loaded:number,total:number)=>void
}

export default class HttpClient{
    constructor(){
    }
    
    /**
     * 对http发起请求
     */
    public request({method="GET",
            url=null,
            data=null,
            timeout=5000,
            headMap=null,
            onDone=null,
            onError=null,
            onTimeout=null,
            onProgress=null,
            onUploadProgress=null,
        }:RequestParam){

        let http=new XMLHttpRequest();
        let clearListener=()=>{
            http.onreadystatechange=
            http.onprogress=
            http.onabort=
            http.onerror=
            http.ontimeout=null;

            if(http.upload){
                http.upload.onprogress=null;
            }
        }

        http.timeout=timeout
        http.open(method,url,true);
        
        http.onreadystatechange=(ev)=>{
            // console.log("onreadystatechange", ev)
            switch(http.readyState){
                case 1://OPENED  (未发送)
                break;
                case 2://HEADERS_RECEIVED (已获取响应头)
                break;
                case 3://LOADING (正在下载响应体)
                break;
                case 4://DONE (请求完成)
                    if(http.status==200){
                        if(onDone){
                            onDone(http.responseText);
                        }
                    }else{
                        if(onError){
                            onError(http.responseText);
                        }
                    }
                    clearListener();
                break;
            }
        }
        http.onprogress=(ev)=>{
            // console.log("onprogress", ev)
            if(onProgress){
                onProgress(ev.loaded,ev.total)
            }
        }
        http.onabort=(ev)=>{
            // console.log("onabort", ev)
            if(onError){
                onError(ev);
            }
            clearListener();
        }
        http.onerror=(ev)=>{
            // console.log("onerror", ev)
            if(onError){
                onError(ev);
            }
            clearListener();
        }
        http.ontimeout=(ev)=>{
            // console.log("ontimeout", ev)
            if(onTimeout){
                onTimeout();
            }
            clearListener();
        }
        
        if(http.upload){
            http.upload.onprogress=(ev)=>{
                if(onUploadProgress){
                    onUploadProgress(ev.loaded,ev.total)
                }
            }
        }

        if(headMap){
            for(let key in headMap){
                let value=headMap[key]
                http.setRequestHeader(key, value);
            }
        }        
        http.send(data);

    }

}