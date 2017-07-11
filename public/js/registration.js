$(document).ready(function() {
  $(".loader-reg").hide();
  $("#submit-1").on("click", function(){
    if (!($("#submit-1").hasClass('disabled'))) {
      var reqBody = new Object();
      reqBody.fullname = $('#login').val();
      reqBody.email = $('#email').val();
      reqBody.password = $('#password').val();
      reqBody.phone = $('#tel').val();
      reqBody.sex = +($('#sex option:selected').val());
      reqBody.grade = +($('#grade option:selected').text());
      $.ajax({
        url: '/api/user',
        type: 'put',
        data: reqBody,
        error: function(response){
          if (response.status = 400) {
            $(".error-alerts")
              .html("<div class='alert alert-danger alert-dismissable'>" +
                      "<strong>Ошибка!</strong> Пользователь с таким E-mail уже зарегистрирован." +
                    "</div>");
          }
        },
        success: function(response){
          realHeight();
          $("#form-1").hide();
          $(".loader-reg").show();
          $(".error-alerts").html("");
          $("#cabinet-link").attr("href", "/cabinet");
          $("#user-email").html(response.email);
          setTimeout(function() {
            $(".loader-reg").hide();
            $("#form-3").show();
            $("#page-1").addClass("disabled-page");
            $("#page-3").removeClass("disabled-page");
            $(".forms").css({height: "auto"});
            formPaginationProgress();
          }, 500);
          return false;
        }
      });
    }
  });
  $("#submit-2").on("click", function(){
    $(".forms").css({height: "200px"});
    $("#form-2").hide();
    $(".loader-reg").show();
    setTimeout(function() {
      $(".loader-reg").hide();
      $("#form-3").show();
      $("#page-2").addClass("disabled-page");
      $("#page-3").removeClass("disabled-page");
      $(".forms").css({height: "auto"});
      formPaginationProgress();
    }, 500);
    return false;
  });
  $("#submit-3").on("click", function(){
    $(".forms").css({height: "200px"});
    $("#form-3").hide();
    $(".loader-reg").show();
    setTimeout(function() {
      $(".loader-reg").hide();
      $("#form-4").show();
      $("#page-3").addClass("disabled-page");
      $("#page-4").removeClass("disabled-page");
      $(".forms").css({height: "auto"});
      formPaginationProgress();
    }, 500);
    return false;
  });
  $("#show-password").mousedown(function(){
    $("#password").attr('type','text');
  }).mouseup(function(){
    $("#password").attr('type','password');
  }).mouseout(function(){
    $("#password").attr('type','password');
  });
})

function realHeight() {
  var realHeight = $(".forms").height();
  $(".forms").height(realHeight);
  return realHeight;
}

function formPaginationProgress() {
  $(".form-pagination-progress").animate({width: "+=33.333%"}, 200);
}
