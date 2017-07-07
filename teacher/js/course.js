$(document).ready(function() {
  var socket = io();

  var windowHeight = $(window).height();
  $(".panel-body").height(windowHeight * 0.7);

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

function addMessage(message){

}

function sendMessage() {
  var formData = new FormData(),
      courseId = (window.location.href).split('/')[4];
  
  $.each($("#attachment").prop('files'), function(i, file){
    formData.append('file', file);
  });

  formData.append('message', $('.message-input').html());
  formData.append('courseId', courseId);

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
      $(".panel-body").height(windowHeight * 0.7);
      $(".nano").nanoScroller();
      $(".nano").nanoScroller({ 
        scroll: 'bottom' 
      });
      $("#send-button").addClass("send-button").html("<i class='fa fa-paper-plane' aria-hidden='true'></i>");
      $("#empty-dialog").hide();
    }
  });
};

(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
      (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
      m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
      })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');
      ga('create', 'UA-71816939-6', 'auto');
      ga('send', 'pageview');

