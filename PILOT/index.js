var io;
var tgtList = [];
var currentTgt;
var currentTgtIndex;
this.id = "PILOT";
_ = require('../CORE/lodash.uav.utility.js')(require('lodash'), this.id);


var UAV_TARGET_IS = function (msg) {
    console.log(msg.body.id, msg.body.status)
    tgtList[msg.body.id].status = msg.body.status;
    switch (msg.body.status) {
        case 0:
            break;
        case 1:
            break;
        case 2:
            break;
        case 3:
            if ((tgtList.length > currentTgtIndex + 1) && tgtList[currentTgtIndex + 1].autoStart) {
                setTimeout(UAV_TARGET_SET, tgtList[currentTgtIndex].autoStart, currentTgtIndex += 1)
                //UAV_TARGET_SET(currentTgtIndex += 1);
            }
            break;
        default:;
    }


}

var UAV_TARGET_SET = function (index) {
    io.emit_("UAV_TARGET_SET", _.ioMsg(null, tgtList[currentTgtIndex]));

    var debugUpdateStatus = function () {
        var msg = _.ioMsg(null, tgtList[index], null, "UAV")
        io.emit_("UAV_TARGET_IS", msg);
        UAV_TARGET_IS(msg)
        var status = tgtList[index].status;
        if (status < 3)
            setTimeout(debugUpdateStatus, [50, 1000, 500][status]);
        tgtList[index].status += (!tgtList[index].cam.trigger && status == 1) ? 2 : 1;
    }
    debugUpdateStatus();
}


var PILOT_TARGETLIST_SET = function (msg) {
    currentTgtIndex = -1;
    var body = msg.body;
    tgtList = _.map(body.list, function (target,i) {
        _.defaults(target, body.defaults)
        _.defaults(target.cam, body.defaults.cam)
        target.listId = msg.body.id;
        target.id = i;
        return target;
    })
    console.log(tgtList);

    if (tgtList[currentTgtIndex+1].autoStart)
        UAV_TARGET_SET(currentTgtIndex+=1);

}

var PILOT_TARGETLIST_GET = function (msg) {
    io.emit_("PILOT_TARGETLIST_IS", _.ioMsg(null, { list: tgtList }));
    if (_.path(msg, 'header.msg.ack'))
        io.ack(_.ioMsg(null, { test: "test" }, msg))
}

exports.init = function (io_) {
    io = io_;


    io_.sockets.on("connection", function (socket) {


        socket.on("UAV_TARGET_IS", UAV_TARGET_IS)
        socket.on("PILOT_TARGETLIST_SET", PILOT_TARGETLIST_SET)
        socket.on("PILOT_TARGETLIST_GET", PILOT_TARGETLIST_GET)




        /*
        if (socket.handshake.query.type !== "UI" && socket.handshake.query.type !== "UAV")
            return;

        switch (socket.handshake.query.type) {
            case "UI":
                socket.on("UAV_TARGET_IS", UAV_TARGET_IS)
                socket.on("PILOT_TARGETLIST_GET", PILOT_TARGETLIST_GET)
                break;
            case "UAV":
                socket.on("UAV_TARGET_IS", UAV_TARGET_IS)
                break;
            default:
                //nothing to do
                socket.on("PILOT_TARGETLIST_SET", PILOT_TARGETLIST_SET)
                socket.on("PILOT_TARGETLIST_GET", PILOT_TARGETLIST_GET)
                break;
        }*/
    })

    return this;
};
