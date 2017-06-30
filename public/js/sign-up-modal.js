$(document).ready(function() { 
  $("#signUpModalBtn").on("click", function(){
      $("#signUpModal").modal({backdrop: "static"});
    });
  $("#signUpModalClose").on("click", function(){
  	$("#signUpModalEffect").addClass("animated shake");
    $("#signUpModalErr").show();
  })
  $('#signUpModalEffect').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function(){
    $("#signUpModalEffect").removeClass("animated");
    $("#signUpModalEffect").removeClass("shake");
  });
});
