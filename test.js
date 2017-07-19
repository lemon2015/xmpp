/**
 * Created by Administrator on 2017/7/14 0014.
 */
// XMPP服务器BOSH地址
var BOSH_SERVICE = 'https://im.bangwo8.com:7280/http-bind';
var WS_SERVICE = 'wss://im.bangwo8.com:7280/websocket';
// 房间JID
var ROOM_JID = '';

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
        console.log("连接成功，可以开始聊天了！");
        connected = true;

        // 当接收到<message>节，调用onMessage回调函数
        connection.addHandler(onMessage, null, 'message', null, null, null);
        // 处理<presence>节，调用onPresence回调函数
        connection.addHandler(onPresence, null, 'presence', null, null, null);

        // 首先要发送一个<presence>给服务器（initial presence）
        connection.send($pres().tree());

        // 发送<presence>元素，加入房间
        // connection.send($pres({
        //     from: jid,
        //     to: ROOM_JID + "/" + jid.substring(0,jid.indexOf("@"))
        // }).c('x',{xmlns: 'http://jabber.org/protocol/muc'}).tree());
    }
}

// 接收到<message>
function onMessage(msg) {
    console.log(msg);
    // 解析出<message>的from、type属性，以及body子元素
    var from = msg.getAttribute('from');
    var type = msg.getAttribute('type');
    var elems = msg.getElementsByTagName('body');

    if (type == "groupchat" && elems.length > 0) {
        var body = elems[0];
        $("#msg").append(from.substring(from.indexOf('/') + 1) + ":<br>" + Strophe.getText(body) + "<br>")
    }
    return true;
}

// <presence>回调
function onPresence(pres){

}

$(document).ready(function() {
    if(!connected) {
        // connection = new Strophe.Connection(BOSH_SERVICE);
        connection = new Strophe.Connection(WS_SERVICE);
        connection.connect('lemon@im.bangwo8.com', '123456', onConnect);
        jid = 'lemon@im.bangwo8.com';
    }
    // 通过BOSH连接XMPP服务器
    // $('#btn-login').click(function() {
    //     if(!connected) {
    //         // connection = new Strophe.Connection(BOSH_SERVICE);
    //         connection = new Strophe.Connection(WS_SERVICE);
    //         connection.connect($("#input-jid").val(), $("#input-pwd").val(), onConnect);
    //         jid = $("#input-jid").val();
    //     }
    // });

    Strophe.log = function (level, msg) {
        console.log("Strophe log: " + msg);
    };

    /**
     * 创建房间
     * im.bangwo8.com可能没有配置权限 不可以加desktop....
     * 服务器返回值
     * <presence xml:lang='en' to='lemon@im.bangwo8.com/1619812304234704541343670' from='bw8001@conference.im.bangwo8.com/Mark'><x xmlns='http://jabber.org/protocol/muc#user'><item jid='lemon@im.bangwo8.com/1619812304234704541343670' role='moderator' affiliation='owner'/><status code='170'/><status code='201'/><status code='110'/></x></presence>
     */
    $('#create-room').click(function(){
        var pres = $pres({
            from:'lemon@im.bangwo8.com',
            to:'bw8001@conference.im.bangwo8.com/Mark'
        }).c('x',{xmlns:'http://jabber.org/protocol/muc'});
        connection.send(pres.tree());


        /**
         * 请求即时房间并接受默认设置 服务器返回 没有配置可用
         * <iq from='lemon@im.bangwo8.com' id='create1' to='bw8001@conference.im.bangwo8.com' type='set' xmlns='jabber:client'><query xmlns='http://jabber.org/protocol/muc#owner'><x xmlns='jabber:x:data' type='submit'/></query></iq>

         <iq xml:lang='en' to='lemon@im.bangwo8.com/67214610068570561346034' from='bw8001@conference.im.bangwo8.com' type='result' id='create1'/>

         测试结果 后登录的用户 只要进来，服务器自动给他发送历史消息
         */
        var iq = $iq({
            from:'lemon@im.bangwo8.com',
            id:'create1',
            to:'bw8001@conference.im.bangwo8.com',
            type:'set'
        }).c('query',{xmlns:'http://jabber.org/protocol/muc#owner'}).c('x',{xmlns:'jabber:x:data',type:'submit'});

        /**
         * 新建保留房间
         *  服务器返回房间配置清单。。。
         */

        // var iq = $iq({
        //     from:'lemon@im.bangwo8.com',
        //     id:'create2',
        //     to:'bw8001@conference.im.bangwo8.com',
        //     type:'get'
        // }).c('query',{xmlns:'http://jabber.org/protocol/muc#owner'});

        connection.send(iq.tree());

        ROOM_JID = 'bw8001@conference.im.bangwo8.com';
    });

    /**
     * 退出房间
     */

    $('#out-room').click(function(){
       var pres =  $pres({
           from:jid,
           to:ROOM_JID,
           type:'unavailable'
       });
       connection.send(pres.tree());
    });

    /**
     * 邀请新客服进房间
     */
    $('#invite-room').click(function() {
        var inviteMsg = $msg({
            from: jid,
            to: ROOM_JID,
        }).c('x', {xmlns: 'http://jabber.org/protocol/muc#user'}).c('invite', {to: 'mark88@im.bangwo8.com'}).c('reason').t('来我房间嗨');
        console.log(inviteMsg.tree());
        connection.send(inviteMsg.tree());
    });

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

    //添加联系人
    $('#add-fid').click(function(){
        // 联系人的JID
        var fid = $('#input-fid').val();
        var iq = $iq({
            from:jid,
            id:'b12345',
            type:'set'
        }).c('query',{xmlns:'jabber:iq:roster'}).c('item',{jid:fid,name:'zhangsan',subscription:'both'}).c('group').t('servicerGroup');
        connection.send(iq.tree());
    });

    //添加联系人
    $('#sub-fid').click(function(){
        // 联系人的JID
        var fid = $('#input-fid').val();
        var pres = $pres({
            to:fid,
            from:jid,
            type:'subscribe'
        });
        connection.send(pres.tree());
    });


    //获取联系人列表
    /**
     * <iq from='juliet@example.com/balcony'
     id='bv1bs71f'
     type='get'>
     <query xmlns='jabber:iq:roster'/>
     </iq>
     */
    $('#get-fid-list').click(function(){
        var iq = $iq({
            from:jid,
            id:'a12345',
            type:'get'
        }).c('query',{xmlns: 'jabber:iq:roster'});
        connection.send(iq.tree());
    });

    /**
     * 删除一个联系人
     * <iq from='juliet@example.com/balcony'
     id='hm4hs97y'
     type='set'>
     <query xmlns='jabber:iq:roster'>
     <item jid='nurse@example.com'
     subscription='remove'/>
     </query>
     </iq>
     */
    $('#del-fid').click(function(){
        // 联系人的JID
        var fid = $('#input-fid').val();
        var iq = $iq({
            from:jid,
            id:'c12345',
            type:'set'
        }).c('query',{xmlns: 'jabber:iq:roster'}).c('item',{jid:fid,subscription:'remove'});
        connection.send(iq.tree());
    });


    /**
     * 在线状态探测
     */
    $('#ping-fid').click(function(){
        // 联系人的JID
        var fid = $('#input-fid').val();
       var pres = $pres({
           from:jid,
           id:'d12345',
           to:fid,
           type:'probe'
       });
       connection.send(pres.tree());
    });
});