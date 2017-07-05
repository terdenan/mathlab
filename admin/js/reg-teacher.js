$(document).ready(function() { 
  $("#reg-teacher").on('click', function(){
    $.ajax({
      url: '/api/teacher',
      type: 'put',
      data: {fullname: $('#fullname').val(), email: $('#email').val(), password: $('#password').val(), phone: $('#tel').val(), sex: $('#sex option:selected').text(), subject: $('#subject option:selected').text()},
      error: function(response){
        if ($("#reg-teacher").hasClass("disabled")) return;
        if (response.status == 400) {
          $(".alerts").html("<div class='alert alert-danger alert-dismissable'>" +
                                "<a href='#' class='close' data-dismiss='alert' aria-label='close'>&times;</a>" +
                                "<strong>Ошибка!</strong> Пользователь с таким E-mail уже зарегистрирован." +
                              "</div>");
        }
        else if (response.status == 500) {
          $(".alerts").html("<div class='alert alert-danger alert-dismissable'>" +
                                "<a href='#' class='close' data-dismiss='alert' aria-label='close'>&times;</a>" +
                                "<strong>Ошибка!</strong> Произошла ошибка на сервере, попробуйте позже." +
                              "</div>");
        }
      },
      success: function(response){
        if (!$("#reg-teacher").hasClass("disabled")) {
          $(".alerts").html("<div class='alert alert-success alert-dismissable'>" +
                              "<a href='#' class='close' data-dismiss='alert' aria-label='close'>&times;</a>" +
                              "<strong>Готово!</strong> Учитель успешно зарегистрирован." +
                            "</div>");
          $('#fullname').val("");
          $('#email').val("");
          $('#password').val("");
          $('#tel').val("");
        }
      }
    });
  });
});