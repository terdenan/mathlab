$(document).ready(function() {
  $("#submit-1").on("click", function(){
    if (!($("#submit-1").hasClass('disabled'))) {
      $.ajax({
        url: 'api/registration',
        type: 'put',
        data: {fullname: $('#login').val(), email: $('#email').val(), password: $('#password').val(), phone: $('#tel').val(), sex: $('#sex option:selected').text(), grade: $('#grade option:selected').text()},
        success: function(response){
          if (response == 'Fail') {
            $(".error-alerts").html("<div class='alert alert-danger alert-dismissable'>" +
                                      "<strong>Ошибка!</strong> Пользователь с таким E-mail уже зарегистрирован." +
                                    "</div>");
          }
          else {
            sessionStorage.clear();
            realHeight();
            $("#form-1").hide();
            $(".loader").show();
            $(".error-alerts").html("");
            $("#cabinet-link").attr("href", "/cabinet/" + response.id);
            $("#user-email").html(response.email);
            setTimeout(function() {
              $(".loader").hide();
              $("#form-3").show();
              $("#page-1").addClass("disabled-page");
              $("#page-3").removeClass("disabled-page");
              $(".forms").css({height: "auto"});
              formPaginationProgress();
            }, 500);
            return false;
          }
        }
      });
    }
  });
  $("#submit-2").on("click", function(){
    //if (!($("#submit-2").hasClass('disabled'))) {
      $(".forms").css({height: "200px"});
      $("#form-2").hide();
      $(".loader").show();
      setTimeout(function() {
        $(".loader").hide();
        $("#form-3").show();
        $("#page-2").addClass("disabled-page");
        $("#page-3").removeClass("disabled-page");
        $(".forms").css({height: "auto"});
        formPaginationProgress();
      }, 500);
      return false;
   // }
  });
  $("#submit-3").on("click", function(){
    $(".forms").css({height: "200px"});
    $("#form-3").hide();
    $(".loader").show();
    setTimeout(function() {
      $(".loader").hide();
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
