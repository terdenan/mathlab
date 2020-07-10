"use strict";

var socket = io();
var loader = "<img src='/images/loader.svg' class='loader'>";
var loaderWhite = "<img src='/images/loader-white.svg' class='loader'>";
var pathname = window.location.pathname;

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

function sendBid() {
  var prefDays = "";
    if ($('#monday')[0].checked) prefDays += "Пн ";
    if ($('#tuesday')[0].checked) prefDays += "Вт ";
    if ($('#wednesday')[0].checked) prefDays += "Ср ";
    if ($('#thursday')[0].checked) prefDays += "Чт ";
    if ($('#friday')[0].checked) prefDays += "Пт ";
    if ($('#saturday')[0].checked) prefDays += "Сб ";
    if ($('#sunday')[0].checked) prefDays += "Вс ";
    $.ajax({
      url: "/api/bid",
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
          sendEvent({
            dataset: {
              eventName: 'Course request submitted',
              eventProperties: JSON.stringify({
                "subject": $('#subject option:selected').text(),
                "aim": $('#target option:selected').text()
              }),
              //eventUserProperties: '{"user_id":"test@gmail.com","user_properties":{"user_type":"student","user_sex":"male","user_school_grade":11,"cohort_day":192,"cohort_week":28,"cohort_month":7}}' //TODO: Получать и проставлять свойства юзера
            }
          });
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
}

$(document).ready(function() { 
  $('.nav > li > a[href="' + pathname + '"]').parent().addClass('active');
});
