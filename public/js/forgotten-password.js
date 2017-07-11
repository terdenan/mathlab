$(document).ready(function(){
    var loaderWhite = "<img src='/images/loader-white.svg' class='loader'>";

    $("#submit-recover").on("click", function(){
        $.ajax({
        	url: '/api/recoverPassword',
        	type: 'post',
        	data: { email: $("#login").val() },
            beforeSend: function(){
               $("#submit-recover").html(loaderWhite).addClass("disable-point-events"); 
            },
        	error: function(response){
                if (response.status == 400) {
                   $("#send-feedback .form").append(
                        "<div class='alert alert-danger text-center'>" +
                            "<strong>Неверный e-mail!</strong> Попробуйте еще раз.</a>" +
                        "</div>"
                   );
                   $("#submit-recover").html("Отправить").removeClass("disable-point-events"); 
                }
                else if (response.status == 403) {
                    $("#send-feedback .form").append(
                        "<div class='alert alert-danger text-center'>" +
                            "E-mail можно отправлять не чаще, чем раз в 15 минут." +
                        "</div>"
                   );
                   $("#submit-recover").html("Отправить").removeClass("disable-point-events"); 
                }
        	},
        	success: function(response){
                if (response == 'success') {
                    $("#send-feedback").html(
                        "<div class='row'>" +
                            "<div class='col-md-8 col-md-offset-2'>" +
                                "<div class='base text-center'>" +
                                    "<img src='/images/mail-confirm.png' >" +
                                    "<h4>Мы отправили Вам письмо с подтверждением</h4>" +
                                    "<h5>Перейдите по ссылке в письме, для того, что бы сменить пароль</h5>" +
                                "</div>" +
                            "</div>" +
                        "</div>"
                    )
                }
        	}
        });
    });
    $("#submit-save-password").on("click", function(){
        var url = new URL(window.location.href);
        $.ajax({
            url: '/api/recoverPassword',
            type: 'put',
            data: {code: url.searchParams.get("code"), newPassword: $("#password").val() },
            beforeSend: function(){
               $("#submit-save-password").html(loaderWhite).addClass("disable-point-events"); 
            },
            error: function(response){
                $("#send-feedback .form").append(
                        "<div class='alert alert-danger text-center'>" +
                            "<strong>Произошла ошибка.</strong> Попробуйте позже.</a>" +
                        "</div>"
                   );
                   $("#submit-recover").html("Отправить").removeClass("disable-point-events");
            },
            success: function(response){
                if (response == 'success') {
                    $("#send-feedback").html(
                        "<div class='row'>" +
                            "<div class='col-md-8 col-md-offset-2'>" +
                                "<div class='base text-center'>" +
                                    "<img src='/images/key.png' >" +
                                    "<h4>Ваш пароль успешно изменен</h4>" +
                                    "<h5>Теперь Вы можете зайти на портал, используя новый пароль</h5>" +
                                    "<hr>" +
                                    "<a href='/sign-in' class='btn btn-default'> Вход в личный кабинет </a>" +
                                "</div>" +
                            "</div>" +
                        "</div>"
                    )
                }
            }
        });
    });
});