var loader = "<img src='/images/loader.svg' class='loader'>",
    loaderWhite = "<img src='/images/loader-white.svg' class='loader'>";

$(document).ready(function() { 

  var socket = io();
  var pathname = window.location.pathname;
  var loader = "<img src='/images/loader.svg' class='loader'>",
      loaderWhite = "<img src='/images/loader-white.svg' class='loader'>";
  
  $("#req-submit").on("click", function(){
    var prefDays = "";
    if ($('#monday')[0].checked) prefDays += "Пн ";
    if ($('#tuesday')[0].checked) prefDays += "Вт ";
    if ($('#wednesday')[0].checked) prefDays += "Ср ";
    if ($('#thursday')[0].checked) prefDays += "Чт ";
    if ($('#friday')[0].checked) prefDays += "Пт ";
    if ($('#saturday')[0].checked) prefDays += "Сб ";
    if ($('#sunday')[0].checked) prefDays += "Вс ";
    $.ajax({
      url: "api/bid",
      method: "put",
      data: {subject: $('#subject option:selected').text(), prefDays: prefDays, prefTime: $(".bfh-timepicker input").val(), target: $('#target option:selected').text()},
      beforeSend: function() {
        $("#req-submit").html(loaderWhite).addClass("disable-point-events");
      },
      error: function(){
        $("#request-form").append(
          "<div class='alert alert-danger'>" +
            "<strong>Произошла ошибка!</strong> Попробуйте позже.</a>" +
          "</div>");
      },
      success: function(response) {
        if (response == "success") {
          $("#request-form").html(
            "<div class='text-center'>" +
              "<img src='/images/success.png' >" +
              "<h3>Отлично!</h3>" +
              "<p>Ваша заявка подана и находится на рассмотрении.</p>" +
              "<hr>" +
              "<a href='/request'>Подать еще одну заявку</a>" +
            "</div>");
        }
      }
    });
  });

  //Set active current li 
  $('.nav > li > a[href="' + pathname + '"]').parent().addClass('active');

});

function sendConfirmationEmail(){
  $.ajax({
    type: 'post',
    url: '/api/sendConfirmationEmail',
    beforeSend: function(){
      $('#status-message').html(loader);
    },
    error: function(response){
      if (response.status == 500)
        $('#status-message').html("Произошла ошибка! Попробуйте позже.");
      else (response.status == 400)
        $('#status-message').html("Email можно отправлять не чаще, чем раз в 15 минут.");
    },
    success: function(response){
      $('#status-message').html("Ссылка с подтверждением была выслана на Ваш email.");
    }
  });
}

(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
      (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
      m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
      })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');
      ga('create', 'UA-71816939-6', 'auto');
      ga('send', 'pageview');

