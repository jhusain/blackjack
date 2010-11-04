if (!Object.defineProperties) {
    Object.defineProperties = function (obj, ps) {
        for (var prop in ps) {
            obj[prop] = ps[prop];
        }
    }
}

if (!Object.keys) {
    Object.keys = function (obj) {
        var array = new Array();
        for (var prop in obj) {
            //if (obj.hasOwnProperty(prop)) {
            array.push(prop);
            //}
        }
        return array;
    };
}

if (!Object.create) {
    Object.create = function (proto, props) {
        if ($.browser.msie && proto.constructor.toString().match(/HTML.*Element/)) {
            Object.defineProperties(proto, props);
            return proto;
        }
        else {
            var ctor = function (ps) {
                if (ps)
                    Object.defineProperties(this, ps);
            };
            ctor.prototype = proto;
            return new ctor(props);
        }
    };
}

// PARTIAL WORKAROUND for Function.prototype.bind
if (!Function.prototype.bind) {
    Function.prototype.bind = function (context /*, arg1, arg2... */) {
        'use strict';
        if (typeof this !== 'function') throw new TypeError();
        var _slice = Array.prototype.slice,
            _concat = Array.prototype.concat,
            _arguments = _slice.call(arguments, 1),
            _this = this,
            _function = function () {
                return _this.apply(this instanceof _dummy ? this : context,
                    _concat.call(_arguments, _slice.call(arguments, 0)));
            },
            _dummy = function () { };
        _dummy.prototype = _this.prototype;
        _function.prototype = new _dummy();
        return _function;
    };
}