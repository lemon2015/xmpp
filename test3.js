/**
 * Created by Administrator on 2017/7/14 0014.
 */
// XMPP服务器BOSH地址
var BOSH_SERVICE = 'https://im.bangwo8.com:7280/http-bind';
var WS_SERVICE = 'wss://im.bangwo8.com:7280/websocket';
// 房间JID
var ROOM_JID = 'bw8001@conference.im.bangwo8.com';

// XMPP连接
var connection = null;

// 当前状态是否连接
var connected = false;

// 当前登录的JID
var jid = "";

// 连接状态改变的事件
function onConnect(status) {
    if (status == Strophe.Status.CONNFAIL) {
        alert("连接失败！");
    } else if (status == Strophe.Status.AUTHFAIL) {
        alert("登录失败！");
    } else if (status == Strophe.Status.DISCONNECTED) {
        alert("连接断开！");
        connected = false;
    } else if (status == Strophe.Status.CONNECTED) {
        alert("连接成功，可以开始聊天了！");
        connected = true;

        // 当接收到<message>节，调用onMessage回调函数
        connection.addHandler(onMessage, null, 'message', null, null, null);

        // 首先要发送一个<presence>给服务器（initial presence）
        connection.send($pres().tree());

        //寻找房间 'bw8001@conference.im.bangwo8.com';
        // var iq = $iq({
        //     from:jid,
        //     id:'disco1',
        //     to:'mark@conference.im.bangwo8.com',
        //     type:'get'
        // }).c('query',{xmlns:'http://jabber.org/protocol/disco#items'});
        // connection.send(iq.tree());
        // 发送<presence>元素，加入房间
        // connection.send($pres({
        //     from: jid,
        //     to: ROOM_JID + "/" + jid.substring(0,jid.indexOf("@"))
        // }).c('x',{xmlns: 'http://jabber.org/protocol/muc'}).tree());
    }
}

// 接收到<message>
function onMessage(msg) {
    // 解析出<message>的from、type属性，以及body子元素
    console.log(msg);
    //如果收到邀请信息 进入该房间
    connection.send($pres({
        from: jid,
        to: ROOM_JID + "/" + jid.substring(0,jid.indexOf("@"))
    }).c('x',{xmlns: 'http://jabber.org/protocol/muc'}).tree());
    var from = msg.getAttribute('from');
    var to = msg.getAttribute('to');
    //拒绝邀请
    // connection.send($msg({
    //     from: jid,
    //     to: ROOM_JID + "/" + jid.substring(0, jid.indexOf("@"))
    // }).c('x',{'xmlns':'http://jabber.org/protocol/muc#user'}).c('decline',{to:from}).c('reason').t('sorry,I am too busy').tree());

    var type = msg.getAttribute('type');
    var elems = msg.getElementsByTagName('body');

    if (type == "groupchat" && elems.length > 0) {
        var body = elems[0];
        $("#msg").append(from.substring(from.indexOf('/') + 1) + ":<br>" + Strophe.getText(body) + "<br>")
    }
    return true;
}

$(document).ready(function() {

    // 通过BOSH连接XMPP服务器
    $('#btn-login').click(function() {
        if(!connected) {
            // connection = new Strophe.Connection(BOSH_SERVICE);
            connection = new Strophe.Connection(WS_SERVICE);
            connection.connect($("#input-jid").val(), $("#input-pwd").val(), onConnect);
            jid = $("#input-jid").val();
        }
    });

    //创建房间

    // 发送消息
    $("#btn-send").click(function() {
        if(connected) {
            // 创建一个<message>元素并发送
            var msg = $msg({
                to: ROOM_JID,
                from: jid,
                type: 'groupchat'
            }).c("body", null, $("#input-msg").val());
            connection.send(msg.tree());

            $("#input-msg").val('');
        } else {
            alert("请先登录！");
        }
    });
});