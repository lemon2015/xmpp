<?php
error_reporting(-1);
require 'E:\Program Files\PhpStudy\WWW\JAXL-3.0.1\JAXL-3.0.1\jaxl.php';
//require '/u01/gnway/www/icomet-master/chat/JAXL-3.0.1/jaxl.php';
$client = new JAXL(array(
    'jid' => 'mark1@im.bangwo8.com',
    'pass' => 'hello',
    'host' => 'im.bangwo8.com',
    'port' => 7222,
));
$client->add_cb('on_auth_success', function() {
    global $client;
    $client->set_status("available");
    $client->send_chat_msg('mark@im.bangwo8.com','hello world'.rand(1,10));
    $client->send_end_stream();
});

$client->add_cb('on_chat_message', function($msg) {
//    global $client;
    // echo back
//    $msg->to = $msg->from;
//    $msg->from = $client->full_jid->to_string();
//    $client->send($msg);
//    global $client;
//    echo $msg->childrens[0]->text."<br />";
//    $client->send_end_stream();
});

$client->add_cb('on_disconnect', function() {
    _debug("got on_disconnect cb");
});

$client->start();