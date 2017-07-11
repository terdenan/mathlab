$(document).ready(function(){
	$("#submit-recover").on("click", function(){
    $.ajax({
    	url: '/api/recoverPassword',
    	type: 'post',
    	data: { email: $("#login").val() },
    	error: function(response){

    	},
    	success: function(response){

    	}
    });
  });
});