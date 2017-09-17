var socket = io();
var courseId = (window.location.pathname).split('/')[2];
var rows = 1;
var loaderGrey = "<img src='/images/loader-grey.svg' class='loader'>";

$(document).ready(function() {

  socket.emit('setRoom', courseId);
  socket.on('newMessage', function(data){
    data = data.replace(" unread", "");
    $('.messages').append(data);
    socket.emit('accepted', { courseId: courseId, _message_id: $('.message:last-child').attr('id') });
    $(".nano").nanoScroller();
    $(".nano").nanoScroller({ 
      scroll: 'bottom' 
    });
  });
  socket.on('markReaded', function(){
    $(".unread").removeClass("unread");
  });
  var windowHeight = $(window).height();
  $(".panel-body").height(windowHeight * 0.7);

  $(".send-button").on('click', function(){
    sendMessage();
  });

  $(".nano").nanoScroller();
  $(".nano").nanoScroller({ 
    scroll: 'bottom' 
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
      $(".panel-body").height(windowHeight * 0.7);
    }
  });

});

$(window).on('resize load', function() {
  waypoint();
})

function waypoint() {
  var waypoint = new Waypoint({
    element: $('.message')[0],
    handler: function(direction) {
      if (direction === "up") {
        // Ajax request here, please :)
        // Yes, sir
        $.ajax({
          url: '/api/getMessages',
          type: 'post',
          data: { courseId: courseId, lastId: $(".message").first().attr('id') },
          beforeSend: function(){
            $(".panel-heading").prepend(loaderGrey);
          },
          error: function(response){

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



function sendMessage() {
  var formData = new FormData(),
      courseId = (window.location.href).split('/')[4],
      message = $('.message-input').html().replace(/<br\s*\/?>/mg,"\n").replace(/<div>/mg, "\n").replace(/<\/div>/mg, ""),
      fileList = $("#attachment").prop('files');
  
  $.each(fileList, function(i, file){
    formData.append('file', file);
  });

  formData.append('message', message);
  formData.append('courseId', courseId);

  if (!(!message && fileList.length == 0)) {
    $.ajax({
      url: '/api/sendMessage',
      data: formData,
      method: 'post',
      contentType: false,
      processData: false,
      beforeSend: function(){
        $("#send-button").removeClass("send-button").html("<div class='send-message-loader'>" +
                                                            "<div id='loader-sm'>" +
                                                              "<div id='loader-sm_1' class='loader-sm'></div>" +
                                                              "<div id='loader-sm_2' class='loader-sm'></div>" +
                                                              "<div id='loader-sm_3' class='loader-sm'></div>" +
                                                            "</div>" +
                                                          "</div>");
      },
      error: function(response){
        console.log('error');
      },
      success: function(response){
        var windowHeight = $(window).height();
        $('.messages').append(response);
        $('.message-input').html("");
        $('.attachments-block').html("");
        $("#attachment").val("");
        $(".panel-body").height(windowHeight * 0.7);
        $(".nano").nanoScroller();
        $(".nano").nanoScroller({ 
          scroll: 'bottom' 
        });
        $("#send-button").addClass("send-button").html("<i class='fa fa-paper-plane' aria-hidden='true'></i>");
        $(".empty-dialog").remove();
        socket.emit('sendMessage', {courseId: courseId, message: response} );
      }
    });
  }
};

(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
      (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
      m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
      })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');
      ga('create', 'UA-71816939-6', 'auto');
      ga('send', 'pageview');

