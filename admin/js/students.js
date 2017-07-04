var pending = true;
var firstLoad = true;
var endList = false;
var currenTr;


function loadStudents(lastID) {
  $.ajax({
    url: 'api/loadStudents',
    method: 'post',
    data: {lastID: lastID},
    beforeSend: function() {
      pending = true;
    },
    success: function(response) {
      var students = "";
      pending = false;
      response.forEach(function(student, response){
        students += 
          "<tr id='" + student._id + "'>" +
            "<td>" + student.fullname + "</td>" +
            "<td>" + student.email + "</td>" +
            "<td>" + student.phone + "</td>" +
            "<td>" + student.grade + "</td>" + 
            "<td>" + student.sex + "</td>" + 
            "<td>" + student.confirmed + "</td>" + 
          "</tr>";
      });
      $('tbody').append(students);
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
            loadStudents("000000000000000000000000");
            firstLoad = false;
          }
          else if (!pending && !endList && !firstLoad){
           loadStudents(currenTr);
          }
        }
    });
});