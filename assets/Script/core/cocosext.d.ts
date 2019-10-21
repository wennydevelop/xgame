declare module cc{
    export function assert(condition:any,msg?:any);

    export function findTaggedNode(tag:string):Node;
    
    export class GLProgram {
        // _updateUniformLocation: function (location)
        // _description: function ()
        // _compileShader: function (shader, type, source)
        // ctor: function (vShaderFileName, fShaderFileName, glContext)
        
        destroyProgram():void;
        initWithVertexShaderByteArray(vertShaderStr:string, fragShaderStr:string):boolean;
        initWithString(vertShaderStr, fragShaderStr):void;
        initWithVertexShaderFilename(vShaderFilename:string, fShaderFileName:string):void;
        init(vShaderFilename:string, fShaderFileName:string):void;
        addAttribute(attributeName:string|number, index:number):void;
        link():void;
        use():void;
        updateUniforms():void;
        protected _addUniformLocation(name:string):void;
        getUniformLocationForName(name:string):void;
        getUniformMVPMatrix():void;
        getUniformSampler():void;
        setUniformLocationWith1i(location, i1):void;
        setUniformLocationWith2i(location, i1, i2):void;
        setUniformLocationWith3i(location, i1, i2, i3):void;
        setUniformLocationWith4i(location, i1, i2, i3, i4):void;
        setUniformLocationWith2iv(location, intArray):void;
        setUniformLocationI32(location, i1):void;
        setUniformLocationWith1f(location, f1):void;
        setUniformLocationWith2f(location, f1, f2):void;
        setUniformLocationWith3f(location, f1, f2, f3):void;
        setUniformLocationWith4f(location, f1, f2, f3, f4):void;
        setUniformLocationWith2fv(location, floatArray):void;
        setUniformLocationWith3fv(location, floatArray):void;
        setUniformLocationWith4fv(location, floatArray):void;
        setUniformLocationWithMatrix3fv(location, matrixArray):void;
        setUniformLocationWithMatrix4fv(location, matrixArray):void;
        setUniformLocationF32(p1, p2, p3, p4, p5):void;
        setUniformsForBuiltins():void;
        protected _setUniformsForBuiltinsForRenderer(node):void;
        setUniformForModelViewProjectionMatrix():void;
        setUniformForModelViewProjectionMatrixWithMat4(swapMat4):void;
        setUniformForModelViewAndProjectionMatrixWithMat4():void;
        protected _updateProjectionUniform():void;
        vertexShaderLog():void;
        getVertexShaderLog():void;
        getFragmentShaderLog():void;
        fragmentShaderLog():void;
        programLog():void;
        getProgramLog():void;
        reset():void;
        getProgram():void;
        retain():void;
        release():void;

    }

    export function errorID(id:number);
    export function warnID(id:number);

    export class DataBind extends cc.Component{
        readonly model:{[key:string]:any}
        setData(data:{[key:string]:any}):void
        markDirty():void
    }
    export class LabelStyle extends Component {
    }
    export class LabelShadow extends Component {
        color:cc.Color;
	}
}

declare var wdebug:boolean

/**
 * 点击效果组件
 */
declare class ClickEffect extends cc.Component{
}
