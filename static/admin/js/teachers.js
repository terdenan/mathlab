var pending = true;
var firstLoad = true;
var endList = false;
var currenTr;

function loadTeachers(lastID) {
  $.ajax({
    url: '/api/teachers',
    method: 'get',
    data: {lastID: lastID},
    beforeSend: function() {
      pending = true;
    },
    success: function(response) {
      var teachers = "";
      pending = false;
      response.forEach(function(teacher, response){
        teachers += 
          "<tr id='" + teacher._id + "'>" +
            "<td>" + teacher.fullname + "</td>" +
            "<td>" + teacher.email + "</td>" +
            "<td>" + teacher.phone + "</td>" +
            "<td>" + (teacher.sex ? "Женский" : "Мужской") + "</td>" + 
            "<td>" + teacher.subject + "</td>" + 
            "<td>" + "<a class='btn btn-sm btn-primary' href='/admin/teacher/" + teacher._id + "'>Редактировать</a>" + "</td>" +
          "</tr>";
      });
      $('tbody').append(teachers);
      if(response[response.length - 1]) currenTr = response[response.length - 1]._id;
      else endList = true;
    }
  });
}

$(document).ready(function() {
  $('#anchor').viewportChecker({
        offset: 0,
        repeat: true,
        callbackFunction: function() {
          if (firstLoad) { 
            loadTeachers("000000000000000000000000");
            firstLoad = false;
          }
          else if (!pending && !endList && !firstLoad){
           loadTeachers(currenTr);
          }
        }
    });
});