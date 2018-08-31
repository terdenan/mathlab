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
    var reqBody = new Object(),
        modalEmail = $("#modal-email").val(),
        modalPhone = $("#modal-phone").val(),
        modalGrade = $("#modal-grade option:selected").text();
    if (modalEmail) reqBody['email'] = modalEmail;
    reqBody['phone'] = modalPhone;
    reqBody['grade'] = +(modalGrade);

    $.ajax({
      type: 'put',
      url: '/api/profileInfo',
      data: reqBody,
      success: function(response){
        console.log(response);
        $("#signUpModal").modal("hide");
        location.reload();
      }
    });
  });

});
