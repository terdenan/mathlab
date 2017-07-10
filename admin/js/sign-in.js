$(document).ready(function() {
  $("#submit").on("click", function(){
    $.ajax({
      url: '/login',
      method: 'post',
      data: {login: $('#login').val(), password: $('#password').val()}
    });
  });
});