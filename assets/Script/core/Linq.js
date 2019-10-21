(function(){
var p = Array.prototype

p.whereEqual = function (key, value) {
    return this.where(function (a) { return a[key] == value; });
};
if(p.filter){
    p.where=p.filter
}else{
    p.where = function (callback) {
        var list = new Array();
        for (var i = 0; i < this.length; i++) {
            var element = this[i];
            if (callback(element)) {
                list.push(element);
            }
        }
        return list;
    };
}
p.countEqual = function (key, value) {

    return this.count(function (a) { return a[key] == value; });

};
p.count = function (callback) {
    var count = 0;
    for (var i = 0; i < this.length; i++) {
        var element = this[i];
        if (callback(element)) {
            count++;
        }
    }
    return count;
};
p.orderBy = function (callback) {
    this.sort(function (a, b) { return callback(a) - callback(b); });
    return this;
};
p.orderByDescing = function (callback) {
    this.sort(function (a, b) { return callback(b) - callback(a); });
    return this;
};
p.__defineGetter__('single', function () {
    return this[0];
});
if (p.forEach) {
    p.foreach = p.forEach
} else {
    p.foreach = function (callback) {
        for (var index = 0; index < this.length; index++) {
            callback(this[index]);
        }
        return this;
    };
}
p.remove = function (value) {
    if(value==null)
        return;
    var removeList = null;
    if (typeof value == "object") {
        if (value instanceof Array) {
            removeList = value
        } else {
            removeList = [value]
        }
    } else if (typeof value == "number" && typeof removeList[0]=="object") {
        removeList = [this[value]]
    }else{
        removeList=[value]
    }
    if (removeList) {
        for (var i = 0; i < removeList.length; i++) {
            var element = removeList[i];
            var index = this.indexOf(element)
            if (index != -1) {
                this.splice(index, 1)
            }
        }
    }
    return this;
}
p.deleteWhere = function (callback) {
    return this.remove(this.where(callback))
}
p.sum = function (callback) {
    var sum = 0;
    for (var i = 0; i < this.length; i++) {
        var element = this[i];
        var value = callback(element)
        sum += value;
    }
    return sum;
}
p.multiplied=function(callback){
    var mul = 1;
    for (var i = 0; i < this.length; i++) {
        var element = this[i];
        var value = callback(element)
        mul *= value;
    }
    return mul;
}
p.pushList = function (array) {
    for (var i = 0; i < array.length; i++) {
        var v = array[i];
        this.push(v)
    }
    return this;
}
p.and = function (callback) {
    for (var i = 0; i < this.length; i++) {
        var element = this[i];
        if (!callback(element))
            return false
    }
    return true
}
p.or = function (callback) {
    for (var i = 0; i < this.length; i++) {
        var element = this[i];
        if (callback(element))
        return true
    }
    return false
}
var NULL=Symbol('null')
p.max = function (callback) {
    if(this.length<=0){
        return undefined,undefined
    }
    var maxItem = NULL
    var maxValue=undefined
    for (var i = 0; i < this.length; i++) {
        var element = this[i];
        var value = callback(element)
        if(maxItem==NULL || maxValue<value){
            maxItem=element
            maxValue=value
        }
    }
    if(maxItem==NULL){
        maxItem=undefined
    }
    return maxItem;
}
p.min = function (callback) {
    if(this.length<=0){
        return undefined,undefined
    }
    var maxItem = NULL
    var maxValue=undefined
    for (var i = 0; i < this.length; i++) {
        var element = this[i];
        var value = callback(element)
        if(maxItem==NULL || maxValue>value){
            maxItem=element
            maxValue=value
        }
    }
    if(maxItem==NULL){
        maxItem=undefined
    }
    return maxItem;
}
p.unpack=function(){
    if(this[0] instanceof Array == false)
        return this;
    var a=this[0];
    for(var i=1;i<this.length;i++){
        a=a.concat(this[i]);
    }
    return a;
}
})()
