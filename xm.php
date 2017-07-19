<?php
error_reporting(-1);
require '/home/mark/PhpstormProjects/localTest/JAXL-3.0.1/jaxl.php';
$client = new JAXL(array(
    'jid' => 'mark1@im.bangwo8.com',
    'pass' => 'hello',
    'log_path' => '/tmp/jaxl.log',
//    'auth_type' => 'PLAIN',
//    'bosh_url' => 'https://im.bangwo8.com:7280/http-bind',
    'host' => 'im.bangwo8.com',
    'port' => 7222,
//    'protocol' => 'tcp'
));
$client->add_cb('on_auth_success', function() {
    global $client;
    $client->set_status("available!");
    $client->send_chat_msg('mark@im.bangwo8.com','hello world');
    $client->send_end_stream();
});

$client->add_cb('on_chat_message', function($msg) {
    global $client;
    // echo back
    $msg->to = $msg->from;
    $msg->from = $client->full_jid->to_string();
    $client->send($msg);
});

$client->add_cb('on_disconnect', function() {
    _debug("got on_disconnect cb");
});

$client->start();
