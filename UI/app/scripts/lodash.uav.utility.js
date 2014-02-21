var noMsgSignals = ['disconnect'],
    id = 'UI',
    errorMap = {
    '504': "Gateway Time-out",
    '400': "Bad Request",
    '403': "Forbidden"
}

_.mixin(
    {
        noFn: function () {
            return function () { };
        },
        path: function (obj, path, def) {
            for (var i = 0, path = path.split('.'), len = path.length; i < len; i++) {
                if (!obj || typeof obj !== 'object') return def;
                obj = obj[path[i]];
            }
            if (obj === undefined) return def;
            return obj;
        },
        hasAll: function (obj) {
            for (var i = 1; i < arguments.length; i++)
                if (!_.has(obj, arguments[i]))
                    return false
            return true;
        },
        hasOne: function (obj) {
            for (var i = 1; i < arguments.length; i++)
                if (_.has(obj, arguments[i]))
                    return true
            return false;
        },
        ioValid: function (signal, msg) {
            if (msg) {
                return _.has(msg, 'header')
                    && _.has(msg.header, 'msg')
                    && _.hasAll(msg.header.msg, 'id', 'timestamp', 'timestamp', 'emitter')
                    && _.hasOne(msg, 'body', 'error');
            } else {
                return (noMsgSignals.indexOf(signal) + 1)
            }
        },
        ioMsg: function (error, body, reqMsg) {
            var msg = {
                "header": {
                    "msg": {
                        "emitter": id || "NO_NAME",
                        "id": Math.random().toString(36).substring(2, 11),
                        "timestamp": +new Date()
                    }
                }
            }

            if (error)
                msg.error = _.isUndefined(errorMap[error]) ? error : { code: error, description: errorMap[error] };
            else
                msg.body = body;

            if (reqMsg)
                msg.header.req = reqMsg.header.msg;
            return msg;
        },
        ioEmitter: function (msg) {
            return _.path(msg, 'header.msg.emitter');
        },
        ioBody: function (msg) {
            return _.path(msg, 'body', 'no body');
        },
        ioAckId: function (name) {
            return [+new Date(), name || 'NONAME', Math.random().toString(36)].join("_")
        }
    }
   )