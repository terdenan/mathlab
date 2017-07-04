var pending = true;
var firstLoad = true;
var endList = false;
var currenTr;

function loadTeachers(lastID) {
  $.ajax({
    url: 'api/loadTeachers',
    method: 'post',
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
            "<td>" + teacher.sex + "</td>" + 
            "<td>" + teacher.subject + "</td>" + 
            "<td>$320,800</td>" +
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