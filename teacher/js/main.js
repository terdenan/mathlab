$(document).ready(function() { 

  var socket = io();
  var pathname = window.location.pathname;
  /*"<td id='" + item._id + "''>" +
    "<div class='course " + activeCourse + "' onClick='window.location.href=`/course/" + item._id + "`'>" +
      "<div class='course-header'>" +
        "<div class='course-info-img'>" +
          "<div class='center-cropped img-50' style='background-image: url(/uploads/" + item.teacherId + ".jpg);'></div>" +
        "</div>" +
        "<div class='course-info-titles'>" + 
          "<h5>" + item.teacher + "</h5>" +
          "<h6>" + item.subject + " <small>" + moment(item.date).format('DD.MM.YY') + ' - ' + moment(item.endingTime).format('DD.MM.YY') + "</small></h6>" +
        "</div>" +
      "</div>" +
    "</div>" +
    "</a>" +
  "</td>";*/
  
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
      error: function(){
        $("#request-form").append(
          "<div class='alert alert-danger'>" +
            "<strong>Произошла ошибка!</strong> Попробуйте позже.</a>" +
          "</div>");
      },
      success: function(response) {
        if (response == "success") {
          $("#request-form").append(
          "<div class='alert alert-success'>" +
            "<strong>Отлично!</strong> Ваша заявка отправлена и находится на рассмотрении.</a>" +
          "</div>");
        }
      }
    });
  });

  //Set active current li 
  $('.nav > li > a[href="' + pathname + '"]').parent().addClass('active');

});

(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
      (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
      m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
      })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');
      ga('create', 'UA-71816939-6', 'auto');
      ga('send', 'pageview');
