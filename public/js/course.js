var dialogId = (window.location.href).split('/')[4];
var dialogInfo;
var userInfo;
var socket = io();
var pending = true;
var firstLoad = true;
var endList = false;
var currenTr;
var emptyDialog = false;

function loadMessages(lastId) {
  $.ajax({
    url: '/api/loadMessages',
    method: 'post',
    data: {dialogId: dialogId, lastId: lastId},
    beforeSend: function() {
      pending = true;
      $(".messages-loader").show();
    },
    success: function(response) {
      if (response.length == 0 && emptyDialog == false){
       $("#empty-dialog").show();
       emptyDialog = true;
      }
      if (response.length != 0) {
        emptyDialog = true;
      }
      console.log(response.length);
      pending = false;
      var messages = "";
      response.forEach(function(message, response){
        if (message.senderId != $(".message:last-child").attr("id")) {
          messages +=
            "<div class='message' id='" + message._id + "'>" +
              "<div class='message-img'>" +
                "<div class='center-cropped img-40' style='background-image: url(/uploads/" + message.senderId + ".jpg);'></div>" +
              "</div>" +
              "<div class='message-body'>" +
                "<h5>" + message.sender + "</h5>";
        if (message.fileUrl) {
          messages +=
            "<div class='message-attachment' onClick='window.location = `" + message.fileUrl + "`'>" +
              "<div class='message-attachment-img'>" +
                "<a href='" + message.fileUrl + "' class='btn btn-primary' role='button' download><i class='fa fa-paperclip' aria-hidden='true'></i></a>" +
              "</div>" +
              "<div class='message-attachment-body'>" +
                  "<h5>" + (message.fileUrl).split('/')[(message.fileUrl).split('/').length - 1] + "</h5>" +
                "<h6>" + (message.fileSize / 1024).toFixed(2) + " КБ</h6>" +
              "</div>" +
            "</div>";
        }
          messages +=
                "<ul>" +
                  "<li>" + message.message + "</li>" +
                "</ul>" +
              "</div>" +
              "<div class='message-date'>" +
                "<span>" + moment(message.date).format("DD.MM.YY, HH:mm") + "</span>" +
              "</div>" +
            "</div>";
        }
      });
      $('.messages').prepend(messages);
      if (response[response.length - 1]) currenTr = response[0]._id;
      else endList = true;
      $(".nano").nanoScroller({ 
        scroll: 'bottom' 
      });
      $(".messages-loader").hide();
    }
  });
}

$(document).ready(function() {

  var rows = 1;
  var socket = io();

  $('#anchor').viewportChecker({
    offset: 0,
    repeat: true,
    callbackFunction: function() {
      if (firstLoad) { 
        loadMessages("ffffffffffffffffffffffff");
        firstLoad = false;
      }
      else if (!pending && !endList && !firstLoad){
        loadMessages(currenTr);
      }
    }
  });

  $(".nano-content").scroll(function(){
    var panelBodyTop = $('.panel-body').offset().top;
    var anchorTop = $('#anchor').offset().top;
    if (panelBodyTop < anchorTop) {
      if (firstLoad) { 
        loadMessages("ffffffffffffffffffffffff");
        firstLoad = false;
      }
      else if (!pending && !endList && !firstLoad){
        loadMessages(currenTr);
      }
    }
  });

  var windowHeight = $(window).height();
  $(".panel-body").height(windowHeight * 0.7);

  socket.on('newMessage', function(response){
    console.log(response);
    var message = "";
    message += 
      "<div class='message' id='" + response.senderId + "'>" +
        "<div class='message-img'>" +
          "<div class='center-cropped img-40' style='background-image: url(/uploads/" + response.senderId + ".jpg);'></div>" +
        "</div>" +
        "<div class='message-body'>" +
          "<h5>" + response.sender + "</h5>";
    if (response.fileUrl) {
      message +=
        "<div class='message-attachment'>" +
          "<div class='message-attachment-img' onClick='window.location = `" + response.fileUrl + "`'>" +
            "<a href='" + response.fileUrl + "' class='btn btn-primary' role='button' download><i class='fa fa-paperclip' aria-hidden='true'></i></a>" +
          "</div>" +
          "<div class='message-attachment-body'>" +
              "<h5>" + (response.fileUrl).split('/')[(response.fileUrl).split('/').length - 1] + "</h5>" +
            "<h6>" + (response.fileSize / 1024).toFixed(2) + " КБ</h6>" +
          "</div>" +
        "</div>";
    }
    message +=
          "<ul>" +
            "<li>" + response.message + "</li>" +
          "</ul>" +
        "</div>" +
        "<div class='message-date'>" +
          "<span>" + moment(response.date).format("DD.MM.YY, HH:mm") + "</span>" +
        "</div>" +
      "</div>";
    $('.messages').append(message);
    $(".nano").nanoScroller();
    $(".nano").nanoScroller({ 
      scroll: 'bottom' 
    });
    $("#empty-dialog").hide();
      emptyDialog = true;
    });
  $(".send-button").on('click', function(){
    sendMessage();
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
  $(".message-input").keypress(function(e){
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
    }
  });
});

function sendMessage() {
  var file = $('#attachment').prop('files')[0];
  var formData = new FormData();
  formData.append('file', file);
  formData.append('dialogId', dialogId);
  formData.append('message', $('.message-input').html());
  $.ajax({
    url: '/api/sendMessage',
    method: 'post',
    data: formData,
    processData: false,
    contentType: false,
    beforeSend: function(){
        $("#send-button").removeClass("send-button").html("<div class='send-message-loader'>" +
                                                            "<div id='loader-sm'>" +
                                                                "<div id='loader-sm_1' class='loader-sm'></div>" +
                                                                "<div id='loader-sm_2' class='loader-sm'></div>" +
                                                                "<div id='loader-sm_3' class='loader-sm'></div>" +
                                                            "</div>" +
                                                        "</div>");
      },
    success: function(response){
      socket.emit('sendMessage', response);
      var message = "";
      var windowHeight = $(window).height();
      message += 
        "<div class='message' id='" + response.senderId + "'>" +
          "<div class='message-img'>" +
            "<div class='center-cropped img-40' style='background-image: url(/uploads/" + response.senderId + ".jpg);'></div>" +
          "</div>" +
          "<div class='message-body'>" +
            "<h5>" + response.sender + "</h5>";
      if (response.fileUrl) {
        message +=
          "<div class='message-attachment'>" +
            "<div class='message-attachment-img' onClick='window.location = `" + response.fileUrl + "`'>" +
              "<a href='" + response.fileUrl + "' class='btn btn-primary' role='button' download><i class='fa fa-paperclip' aria-hidden='true'></i></a>" +
            "</div>" +
            "<div class='message-attachment-body'>" +
                "<h5>" + (response.fileUrl).split('/')[(response.fileUrl).split('/').length - 1] + "</h5>" +
              "<h6>" + (response.fileSize / 1024).toFixed(2) + " КБ</h6>" +
            "</div>" +
          "</div>";
      }
      message +=
            "<ul>" +
              "<li>" + response.message + "</li>" +
            "</ul>" +
          "</div>" +
          "<div class='message-date'>" +
            "<span>" + moment(response.date).format("DD.MM.YY, HH:mm") + "</span>" +
          "</div>" +
        "</div>";
      //$('.messages').append(message);
      $('.message-input').html("");
      $('.attachments-block').html("");
      $(".panel-body").height(windowHeight * 0.7);
      $(".nano").nanoScroller();
      $(".nano").nanoScroller({ 
        scroll: 'bottom' 
      });
      $("#send-button").addClass("send-button").html("<i class='fa fa-paper-plane' aria-hidden='true'></i>");
      $("#empty-dialog").hide();
      emptyDialog = true;
    }
  });
};

(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
      (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
      m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
      })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');
      ga('create', 'UA-71816939-6', 'auto');
      ga('send', 'pageview');

