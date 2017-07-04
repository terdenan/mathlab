var pending = true;
var firstLoad = true;
var endList = false;
var currenTr;
var inProgressStatus = "<span class='label label-primary' id='inProgressStatus'>На рассмотрении</span>";
var acceptStatus = "<span class='label label-success'id='acceptStatus' >Подтверждено</span>";
var refuseStatus = "<span class='label label-danger' id='refuseStatus'>Отказано</span>";
function loadBids(lastID) {
  $.ajax({
    url: 'api/loadBids',
    method: 'post',
    data: {lastID: lastID},
    beforeSend: function() {
      pending = true;
    },
    success: function(response) {
      var bids = "";
      var currentStatus = "";
      pending = false;
      response.forEach(function(bid, response){
        if (bid.status == 'accept') currentStatus = acceptStatus;
        else if (bid.status == 'refuse') currentStatus = refuseStatus;
        else currentStatus = inProgressStatus;
        bids +=
          "<tr class='even pointer currenTr' id='" + bid._id + "'>" +
            "<td class='bid-student' id='" + bid.studentId + "'>" + bid.student + "</td>" +
            "<td class='bid-date'>" + moment(bid.date).format('DD.MM.YY, HH:mm') + "</td>" +
            "<td class='bid-subject'>" + bid.subject + "</td>" +
            "<td class='bid-prefDays'>" + bid.prefDays + "</td>" +
            "<td class='bid-prefTime'>" + bid.prefTime + "</td>" +
            "<td class='bid-phone'>" + bid.phone + "</td>" +
            "<td class='bid-phone'>" + (bid.target ? bid.target : "Не выбрано") + "</td>" +
            "<td class='bid-status'>" + currentStatus + "</td>" +
            "<td class='bid-cancel'><a href='#' data-toggle='tooltip' data-placement='left' title='Отмена заявки' id='cancelBid'><i class='fa fa-times'></i></a></td>" +
          "</tr>";
      });
      $('.tbody-bids').append(bids);
      if(response[response.length - 1]) currenTr = response[response.length - 1]._id;
      else endList = true;
      $('[data-toggle="tooltip"]').tooltip();
    }
  });
}

$(document).ready(function() {
  $('#anchor').viewportChecker({
        offset: 0,
        repeat: true,
        callbackFunction: function() {
          if (firstLoad) { 
            loadBids("ffffffffffffffffffffffff");
            firstLoad = false;
          }
          else if (!pending && !endList && !firstLoad){
           loadBids(currenTr);
          }
        }
    });
});

$(document).ready(function() {
  var student, subject, prefDays, prefTime, id, studentId, currentStatus;
  $(".tbody-bids").on("click", ".currenTr", function(){
    student = $(this).find(".bid-student").first().html();
    subject = $(this).find(".bid-subject").first().html();
    prefDays = $(this).find(".bid-prefDays").first().html();
    prefTime = $(this).find(".bid-prefTime").first().html();
    studentId = $(this).find(".bid-student").first().attr('id');
    currentStatus = $(this).find(".bid-status span").first().attr('id');
    id = $(this).attr('id');
    if (currentStatus == 'inProgressStatus') {
      $("#student").html(student);
      $("#subject").html(subject);
      $("#prefDays").html(prefDays);
      $("#prefTime").html(prefTime);
      $("#courseAddingModal").modal({show: true});
    }
  });
  $("#create-course").on('click', function(){
    var prefDaysFinally = "";
    if ($('#monday')[0].checked) prefDaysFinally += "Пн ";
    if ($('#tuesday')[0].checked) prefDaysFinally += "Вт ";
    if ($('#wednesday')[0].checked) prefDaysFinally += "Ср ";
    if ($('#thursday')[0].checked) prefDaysFinally += "Чт ";
    if ($('#friday')[0].checked) prefDaysFinally += "Пт ";
    if ($('#saturday')[0].checked) prefDaysFinally += "Сб ";
    if ($('#sunday')[0].checked) prefDaysFinally += "Вс ";
    $.ajax({
      url: 'api/createCourse',
      method: 'put',
      data: {id: id, studentId: studentId, student: student, subject: subject, teacherId: $('#teacher-list option:selected').attr('id'), teacher: $('#teacher-list option:selected').text(), days: prefDaysFinally, time: $("#time").val()},
      success: function(response){
        if (response == 'Success') {
          $("#courseAddingModal").modal('hide');
          $(".abs-alerts").html("<div class='alert alert-success'>" +
                                  "<strong>Готово!</strong> Курс установлен!" +
                                "</div>");
          $("#" + id).find(".bid-status").first().html(acceptStatus);
          setTimeout(function() { 
            $(".abs-alerts").html("");
          }, 2000);
          $.ajax({
            url: 'api/updateBid',
            method: 'post',
            data: {bidId: id, bidStatus: 'accept'},
            success: function(){

            }
          });
        }
        else {
          $("#courseAddingModal").modal('hide');
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
  $(".tbody-bids").on("click", "#cancelBid", function(){
    var id = $(this).parent().parent().attr('id');
    $("#courseAddingModal").modal('hide');
    $(this).parent().parent().find(".bid-status").first().html(refuseStatus);
    $.ajax({
      url: 'api/updateBid',
      method: 'post',
      data: {bidId: id, bidStatus: 'refuse'},
      success: function(response){
        console.log('Bid refused.');
      }
    });
  });

  $.ajax({
    url: 'api/teachers',
    method: 'get',
    success: function(response){
      var teacherList = "";
      response.forEach(function(item, response){
        teacherList +=
          "<option id='" + item._id + "'>" + item.fullname + "</option>";
      });
      $('#teacher-list').append(teacherList);
    }
  });
});