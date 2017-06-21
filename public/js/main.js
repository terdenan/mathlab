$(document).ready(function() { 

  function setUserInfo() {
    $('#fullname').html(userInfo.fullname);
    $('#email').html(userInfo.email);
    $('#phone').html(userInfo.phone);
    $('#grade').html(userInfo.grade);
    $('#profile-img').css('backgroundImage', "url(/uploads/" + userInfo.id + ".jpg)");
    $('#link-to-cabinet').attr("href", "/cabinet/" + userInfo.id);
  }

  var socket = io();
  var userInfo = new Object();

  $.ajax({
    url: '/api/userInfo',
    method: 'post',
    success: function(response){
      userInfo = response;
      setUserInfo();
      socket.emit('setRooms', response.id);
    }
  });
  $("#log-out").on("click", function(){
    $.ajax({
      url: '/api/log-out',
      method: 'post',
      success: function(){
        //window.location.href = "/";
        console.log("log-out completed")
      }
    });
  });
  $.ajax({
    url: '/api/loadStudentCourses',
    method: 'get',
    success: function(response) {
      if (response.answer.length == 0) $("#empty-courses").show();
      var courses = "<tr>", cnt = 0, len = 0, siz = response.length;
      var arr = response.answer;
      var activeCourse = "";
      arr.forEach(function(item, arr){
        if (moment(response.time) < moment(item.endingTime)) activeCourse = 'active-course';
        else activeCourse = '';
        courses += 
          "<td id='" + item._id + "''>" +
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
          "</td>";
        cnt++;
        len++;
        if (cnt == 2 && len != siz) {
          courses += "</tr><tr>";
          cnt = 0;
        }
      });
      courses += "</tr>";
      $('tbody').append(courses);
    }
  });
  $.ajax({
    url: '/api/loadTeacherCourses',
    method: 'get',
    success: function(response) {
      if (response.length == 0) $("#empty-courses-t").show();
      var courses = "<tr>", cnt = 0, len = 0, siz = response.length;
      var arr = response.answer;
      var activeCourse = "";
      arr.forEach(function(item, arr){
        courses += 
          "<td id='" + item._id + "''>" +
            "<div class='course active-course' onClick='window.location.href=`/course/" + item._id + "`'>" +
              "<div class='course-header'>" +
                "<div class='course-info-img'>" +
                  "<div class='center-cropped img-50' style='background-image: url(/uploads/" + item.studentId + ".jpg);'></div>" +
                "</div>" +
                "<div class='course-info-titles'>" + 
                  "<h5>" + item.student + "</h5>" +
                  "<h6>" + item.subject + " <small>" + moment(item.date).format('DD.MM.YY') + ' - ' + moment(item.endingTime).format('DD.MM.YY') + "</small></h6>" +
                "</div>" +
              "</div>" +
            "</div>" +
            "</a>" +
          "</td>";
        cnt++;
        len++;
        if (cnt == 2 && len != siz) {
          courses += "</tr><tr>";
          cnt = 0;
        }
      });
      courses += "</tr>";
      $('tbody').append(courses);
    }
  });
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
      url: "api/putBid",
      method: "put",
      data: {subject: $('#subject option:selected').text(), prefDays: prefDays, prefTime: $(".bfh-timepicker input").val(), target: $('#target option:selected').text()},
      beforeLoad: function(){
        $(".modal-body").html("<img src='images/loading.svg'>");
      },
      success: function(response) {
        if (response == "Success") {
          $("#requestModal").modal('hide');
          $("#succesModal").modal({show: true});
        }
        else {
          $(".modal-body").append("<div class='alert alert-danger'>" +
                                    "<strong>Произошла ошибка!</strong> Попробуйте позже.</a>." +
                                  "</div>")
        }
      }
    });
  });
});

(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
      (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
      m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
      })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');
      ga('create', 'UA-71816939-6', 'auto');
      ga('send', 'pageview');
