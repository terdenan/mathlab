$(document).ready(function() { 
  $("#signUpModal").modal({backdrop: "static"});

  $("#signUpModalClose").on("click", function(){
  	$("#signUpModalEffect").addClass("animated shake");
    $("#signUpModalErr").show();
  })
  $('#signUpModalEffect').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function(){
    $("#signUpModalEffect").removeClass("animated");
    $("#signUpModalEffect").removeClass("shake");
  });
  $('#signUpModalSubmit').on('click', function(){
    var reqBody = new Object();
    if ($("#modal-email").val()) reqBody['email'] = $("#modal-email").val();
    reqBody['grade'] = +($("#modal-grade option:selected").text());
    reqBody['phone'] = $("#modal-phone").val();
    console.log(reqBody);
    $.ajax({
      type: 'put',
      url: '/api/profileInfo',
      data: reqBody,
      success: function(response){
        console.log(response);
      }
    });
  });
});
