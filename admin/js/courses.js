var pending = true;
var firstLoad = true;
var endList = false;
var currenTr;


function loadCourses(lastID) {
  $.ajax({
    url: '/api/loadCourses',
    method: 'post',
    data: {lastID: lastID},
    beforeSend: function() {
      pending = true;
    },
    success: function(response) {
      var courses = "";
      pending = false;
      response.forEach(function(course, response){
        courses += 
          "<tr id='" + course._id + "' class='currenTr'>" +
            "<td class='course-subject'>" + course.subject + "</td>" +
            "<td class='course-student'>" + course.student + "</td>" +
            "<td class='course-teacher'>" + course.teacher + "</td>" +
            "<td>" + course.days + "</td>" +
            "<td>" + course.time + "</td>" + 
            "<td>" + moment(course.date).format("DD.MM.YY") + "</td>" + 
            "<td class='course-endingTime'>" + moment(course.endingTime).format("DD.MM.YY") + "</td>" + 
            "<td>Недоступно</td>" +
          "</tr>";
      });
      $('tbody').append(courses);
      if(response[response.length - 1]) currenTr = response[response.length - 1]._id;
      else endList = true;
    }
  });
}

$(document).ready(function() {
  var student, teacher, subject, endingTime, id;
  $('#anchor').viewportChecker({
      offset: 0,
      repeat: true,
      callbackFunction: function() {
        if (firstLoad) { 
          loadCourses("000000000000000000000000");
          firstLoad = false;
        }
        else if (!pending && !endList && !firstLoad){
         loadCourses(currenTr);
        }
      }
  });

  $(".tbody-courses").on("click", ".currenTr", function(){
    student = $(this).find(".course-student").first().html();
    teacher = $(this).find(".course-teacher").first().html();
    subject = $(this).find(".course-subject").first().html();
    endingTime = $(this).find(".course-endingTime").first().html();
    id = $(this).attr('id');
    if (id) {
      $("#student").html(student);
      $("#subject").html(subject);
      $("#teacher").html(teacher);
      $("#courseExtendModal").modal({show: true});
    }
  });

  $("#extend-course").on('click', function(){
    $.ajax({
      url: 'api/extendCourse',
      method: 'post',
      data: {courseId: id, endingTime: endingTime},
      success: function(response){
        if (response == 'Success') {
          $("#courseExtendModal").modal('hide');
          $(".abs-alerts").html("<div class='alert alert-success'>" +
                                  "<strong>Готово!</strong> Курс успешно продлен!" +
                                "</div>");
          $("#" + id).find(".course-endingTime").first().html(moment(endingTime, "DD.MM.YY").add(1, 'months').format("DD.MM.YY"));
          setTimeout(function() { 
            $(".abs-alerts").html("");
          }, 2000);
        }
        else {
          $("#courseExtendModal").modal('hide');
          $(".abs-alerts").html("<div class='alert alert-danger'>" +
                                  "<strong>Ошибка!</strong> Попробуйте позже" +
                                "</div>");
          setTimeout(function() { 
            $(".abs-alerts").html("");
          }, 2000);
        }
      }
    });
  });
});