$(document).ready(function() {
  $('#save-settings').on('click', function(){
    if ($('#login').val() || $('#phone').val() != "+7 ") {
      var request = {};
      if ($('#login').val()) request.fullname = $('#login').val();
      if ($('#phone').val() != "+7 ") request.phone = $('#phone').val();
      if ($('#grade1 option:selected').text()) request.grade = $('#grade1 option:selected').text();
      $.ajax({
        url: '/api/profileInfo',
        method: 'post',
        data: request,
        error: function(response){
          $(".settings-block").append("<div class='alert alert-danger alert-dismissable'>" +
                                        "<a href='#' class='close' data-dismiss='alert' aria-label='close'>&times;</a>" +
                                        "<strong>Ошибка!</strong> Попробуйте позже." +
                                      "</div>");
        },
        success: function(response){
          $(".settings-block").append("<div class='alert alert-success alert-dismissable'>" +
                                        "<a href='#' class='close' data-dismiss='alert' aria-label='close'>&times;</a>" +
                                        "<i class='fa fa-spinner fa-pulse fa-fw'></i>&nbsp;<strong>Ваши данные успешно изменены!</strong> Перенаправление в личный кабинет..." +
                                      "</div>");
          setTimeout(function(){
            $(".password-block").find(".alert").fadeOut(500);
            window.location.href = "/cabinet";
          }, 2200);
        }
      });
    }
  });

  $('#submit-1').on('click', function(){
    $.ajax({
      url: '/api/changePassword',
      method: 'post',
      data: {oldPassword: $('#old-password').val(), newPassword: $('#new-password').val()},
      error: function(response){
        if (response.status == 400) {
          $(".password-block").append("<div class='alert alert-danger alert-dismissable'>" +
                                        "<a href='#' class='close' data-dismiss='alert' aria-label='close'>&times;</a>" +
                                        "<strong>Ошибка!</strong> Введеный пароль не совпадает с нынешним." +
                                      "</div>");
        }
        else if (response.status == 500) {
          $(".password-block").append("<div class='alert alert-danger alert-dismissable'>" +
                                        "<a href='#' class='close' data-dismiss='alert' aria-label='close'>&times;</a>" +
                                        "<strong>Ошибка!</strong> Попробуйте позже." +
                                      "</div>");
        }
      },
      success: function(response){
        $('#old-password').val("");
        $('#new-password').val("");
        $(".password-block").append("<div class='alert alert-success alert-dismissable'>" +
                                      "<a href='#' class='close' data-dismiss='alert' aria-label='close'>&times;</a>" +
                                      "<strong>Готово!</strong> Ваш пароль успешно изменен." +
                                    "</div>");
        setTimeout(function(){
          $(".password-block").find(".alert").fadeOut(500);
        }, 2000)
      }
    });
  });

  $('.kv-avatar').on('click', '.fileinput-upload-button', function(){
    var file = $('#avatar').prop('files')[0];
    if (file)
    {
      var formData = new FormData();
      formData.append('file', file);
      $.ajax({
        url: 'api/changeAvatar',
        method: 'post',
        data: formData,
        processData: false,
        contentType: false,
        error: function(response){
          $(".avatar-block").append("<div class='alert alert-error alert-dismissable'>" +
                                        "<a href='#' class='close' data-dismiss='alert' aria-label='close'>&times;</a>" +
                                        "<strong>Произошла ошибка!</strong> Попробуйте позже." +
                                      "</div>");
        },
        success: function(response){
          $(".avatar-block").append("<div class='alert alert-success alert-dismissable'>" +
                                      "<a href='#' class='close' data-dismiss='alert' aria-label='close'>&times;</a>" +
                                      "<strong>Готово!</strong> Фотография профиля успешно загружена." +
                                    "</div>");
        }
      });
    }
  });

  setPhoto();
});
