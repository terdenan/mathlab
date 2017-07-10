$(document).ready(function() {
  $('#save-settings').on('click', function(){
    if ($('#login').val() || $('#phone').val() != "+7 ") {
      var request = {};
      if ($('#login').val()) request.fullname = $('#login').val();
      if ($('#phone').val() != "+7 ") request.phone = $('#phone').val();
      request.grade = $('#grade1 option:selected').text();
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
        url: 'api/uploadImg',
        method: 'post',
        data: formData,
          processData: false,
          contentType: false,
          success: function(response){
              sessionStorage.clear();
              if (response == "Success") {
                $(".avatar-block").append("<div class='alert alert-success alert-dismissable'>" +
                                            "<a href='#' class='close' data-dismiss='alert' aria-label='close'>&times;</a>" +
                                            "<strong>Готово!</strong> Фотография профиля успешно загружена." +
                                          "</div>");
              }
              else {
                $(".avatar-block").append("<div class='alert alert-error alert-dismissable'>" +
                                            "<a href='#' class='close' data-dismiss='alert' aria-label='close'>&times;</a>" +
                                            "<strong>Произошла ошибка!</strong> Попробуйте позже." +
                                          "</div>");
              }
          }
      });
    }
  });
  function setPhoto() {
    alert();
    $("#avatar").fileinput({
      overwriteInitial: true,
      maxFileSize: 1500,
      showClose: false,
      showCaption: false,
      browseLabel: 'Выбрать...',
      removeLabel: 'Удалить',
      uploadLabel: 'Загрузить',
      browseIcon: '<i class="fa fa-folder-open" aria-hidden="true"></i>',
      removeIcon: '<i class="fa fa-close" aria-hidden="true"></i>',
      uploadIcon: '<i class="fa fa-upload" aria-hidden="true"></i>',
      browseClass: 'btn btn-default',
      removeTitle: 'Отменить',
      elErrorContainer: '#kv-avatar-errors-1',
      msgErrorClass: 'alert alert-block alert-danger',
      defaultPreviewContent: '<img src="/images/member-2.png" alt="Ваш аватар" class="img-circle" style="width:100%">',
      layoutTemplates: {main2: '{preview} ' + '<div class="btn-group">' + '{browse} {remove} {upload}' + '</div>'},
      allowedFileExtensions: ["jpg", "jpeg", "png"]
    });
  }
});