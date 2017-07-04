$(document).ready(function() {
  $("#submit").on("click", function(){
    $.ajax({
      url: 'api/login',
      method: 'post',
      data: {login: $('#login').val(), password: $('#password').val()},
      success: function(response){
        console.log(response);
        if (response == 'Fail') {
          $(".error-alerts").html("<div class='alert alert-danger alert-dismissable'>" +
                                      "<strong>Ошибка!</strong> Неверный e-mail или пароль." +
                                    "</div>");
        }
        else {
          window.location.href = "/";
        }
      }
    });
  });
});