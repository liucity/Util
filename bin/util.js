var arr = [];
var slice = arr.slice;
var tostring = Object.prototype.toString;

var _dirname = path.dirname(require.main.filename);

var util = {
    type: function (obj) {
        switch(tostring.call(obj)){
            case '[object Object]': return 'object';
            case '[object Number]': return 'number';
            case '[object String]': return 'string';
            case '[object Function]': return 'function';
            case '[object Array]': return 'array';
            case '[object Boolean]': return 'bool';
            case '[object Arguments]': return 'arguments';
        }
    },
    isFunction: function (obj) {
        return this.type(obj) === 'function';
    },
    isArray: function (obj) {
        return this.type(obj) === 'array';
    },
    toArray: function(obj){
        switch(this.type(obj)){
            case 'arguments': return slice.call(obj);
            case 'array': return obj;
            default: return[obj];
        }
    },
    each: function (obj, callback) {
        var name;
        if (this.isArray(obj)) {
            obj.every(function(item){
                return callback.apply(item, arguments);
            })
        } else {
            for (name in obj) {
                if (callback.call(obj[name], name, obj[name]) === false) break;
            }
        }
    },
    extend: function (deep, target) {
        var args = this.slice.call(arguments, 1);
        if(this.type(deep) !== 'bool'){
            target = deep;
            deep = false;
        }else{
            args = args.slice(1);
        }
        target = target || {};

        this.each(args, function (i, item) {
            if(item){
                util.each(item, function (k, v) {
                    if (item.hasOwnProperty(k) && v !== undefined) {
                        if(util.type(v) === 'object' && deep){
                            util.extend(deep, target[k], v);
                        }else{
                            target[k] = v;
                        }
                    }
                });
            }
        });
        return target;
    },
    //tool string
    replacer: (function () {
        var replacer_reg = /\{\s*([^\}]*)\s*\}/g;
        var getProperty = function (obj, properties) {
            var pArr = properties.split('.'),
                len = pArr.length,
                i = 0;

            for (; obj && i < len; i++) obj = obj[pArr[i]];
            return obj;
        }

        return function (temp, datas, callback) {
            var html, v;
            if (!temp) return;
            if (!datas) return temp;
            if (!this.isArray(datas)) datas = [datas];
            if (!this.isFunction(callback)) callback = function (data, m) {
                v = getProperty(data, m);
                return v === undefined ?
                    typeof data === 'string' || typeof data === 'number' ? data : ''
                    :
                    v;
            };
            html = datas.map(function(data){
                return temp.replace(replacer_reg, function (s, m) {
                    return callback(data, m);
                })
            });
            
            return html.join('');
        }
    })(),
    //
    random: function (max) {
        return Math.round(Math.random() * (max || 1));
    },
    promise: function(){
        var _promise;

        return function(callback){
            _promise = _promise ? _promise.then(function(){
                return new Promise(callback);
            }) : new Promise(callback);
        }
    }
}
