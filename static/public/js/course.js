"use strict";

var socket = io();
var rows = 1;
var loaderGrey = "<img src='/images/loader-grey.svg' class='loader'>";
var splittedURL = (window.location.href).split('/');
var courseId = splittedURL[splittedURL.length - 1];

function initWaypoint() {
  if ($('.message').length !== 0) {
    var waypoint = new Waypoint({
      element: $('.message')[0],
      handler: function(direction) {
        if (direction === "up") {
          $.ajax({
            url: '/api/messages',
            type: 'get',
            data: { courseId: courseId, lastId: $(".message").first().attr('id') },
            beforeSend: function(){
              $(".panel-heading").prepend(loaderGrey);
            },
            error: function(response){
              console.log("Не удалось загрузить сообщения.")
            },
            success: function(response){
              $('.messages').prepend(response);
              $('.loader').remove();
            }
          });
        }
      },
      context: $('.nano-content')[0],
      offset: -180
    })
  }
};

function sendMessage() {
  var formData = new FormData();
  var message = $('.message-input').html().replace(/<br\s*\/?>/mg,"\n").replace(/<div>/mg, "\n").replace(/<\/div>/mg, "");
  var fileList = $("#attachment").prop('files');
  
  $.each(fileList, function(i, file){
    formData.append('file', file);
  });

  formData.append('message', message);
  formData.append('courseId', courseId);

  if (!(!message && fileList.length == 0)) {
    $.ajax({
      url: '/api/message',
      data: formData,
      method: 'put',
      contentType: false,
      processData: false,
      beforeSend: function(){
        switchSendButton(0);
      },
      error: function(response){
        console.log('Не удалось отправить сообщение.');
      },
      success: function(response){
        var windowHeight = $(window).height();
        $('.messages').append(response);
        $('.message-input').html("");
        $('.attachments-block').html("");
        $("#attachment").val("");
        $(".panel-body").height(windowHeight * 0.7);
        $(".empty-dialog").remove();
        socket.emit('sendMessage', {courseId: courseId, message: response} );
        switchSendButton(1);
        initNanoScroller();
      }
    });
  }
};

function deleteMessage(id) {
  if (confirm('Вы действительно хотите удалить сообщение?')) {
    $.ajax({
      url: '/api/messages/' + id,
      method: 'delete',
      contentType: false,
      processData: false,
      error: function(response){
        console.log('Не удалось удалить сообщение.');
      },
      success: function(response){
        var message = $('#' + id);
        var windowHeight = $(window).height();

        message.remove();
        $('.messages').append(response);
        $(".panel-body").height(windowHeight * 0.7);
        initNanoScroller();
      }
    });
  }
}

function initNanoScroller() {
  $(".nano").nanoScroller();
  $(".nano").nanoScroller({ 
    scroll: 'bottom' 
  });
};

function switchSendButton(stage) {
  if (stage === 0) {
    $("#send-button").removeClass("send-button").html("<div class='send-message-loader'><div id='loader-sm'><div id='loader-sm_1' class='loader-sm'></div><div id='loader-sm_2' class='loader-sm'></div><div id='loader-sm_3' class='loader-sm'></div></div></div>");
  }
  else {
    $("#send-button").addClass("send-button").html("<i class='fa fa-paper-plane' aria-hidden='true'></i>");
  }
}

$(document).ready(function() {
  var windowHeight = $(window).height();

  $(".panel-body").height(windowHeight * 0.7);

  socket.emit('setRoom', courseId);
  socket.on('newMessage', function(data){
    data = data.replace(" unread", "");
    socket.emit('accepted', { courseId: courseId, _message_id: $('.message:last-child').attr('id') });
    $('.messages').append(data);
    initNanoScroller();
  });
  socket.on('markReaded', function(){
    $(".unread").removeClass("unread");
  });

  $(".message-input").on("focusin", function(){
    if (!$(".message-input").html()) {
      $(".placeholder").addClass("hidden");
    }
  });

  $(".message-input").on("focusout", function(){
    if (!$(".message-input").html()) {
      $(".placeholder").removeClass("hidden");
    }
  });

  $("body").keypress(function(e){
      if(e.keyCode == 13 && e.shiftKey){
        if (rows <= 2) {
          $(".message-input").css("height", "+=20");
          rows++;
        }
        if (rows > 2 && rows <= 7) {
          $(".message-input").css("height", "+=20");
          $(".panel-body").css("height", "-=20");
          rows++;
        }
      }
      else if (e.keyCode == 13) {
        sendMessage();
        e.preventDefault();
      }
  });

  $(".message-input").keyup(function(e){
    if ($('.message-input').html() == "" || $('.message-input').html() == "<br>") {
      $('.message-input').html("");
      $(".message-input").css("height", "40px");
      $(".panel-body").height(windowHeight * 0.7);
    }
  });

  initNanoScroller();
  initWaypoint();
});

(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
      (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
      m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
      })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');
      ga('create', 'UA-71816939-6', 'auto');
      ga('send', 'pageview');

