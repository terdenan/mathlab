$(document).ready(function(){
    $("#submit-recover").on("click", function(){
        $.ajax({
        	url: '/api/recoverPassword',
        	type: 'post',
        	data: { email: $("#login").val() },
        	error: function(response){
                console.log(response);
        	},
        	success: function(response){
                console.log(response);
        	}
        });
    });
    $("#submit-save-password").on("click", function(){
        var url = new URL(window.location.href);
        $.ajax({
            url: '/api/recoverPassword',
            type: 'put',
            data: {code: url.searchParams.get("code"), newPassword: $("#password").val() },
            error: function(response){
                console.log(response);
            },
            success: function(response){
                console.log(response);
            }
        });
    });
});