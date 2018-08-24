$(document).ready(function() { 
  $(".presentation .block").on("click", function(){
  	if (!$(this).hasClass("active")) {
 			$(".presentation .block").removeClass("active");
 			$(this).addClass("active");
 		}
  });
});

function sendCallbackBid(el) {
	var name = $('#name').val();
	var phone = $('#tel').val();

	if (!$(el).hasClass('disabled')) {
		if (phone != '+7 ') {
			$.ajax({
		    type: 'put',
		    url: '/api/callback',
		    data: {
		    	name: name,
		    	phone: phone
		    },
		    error: function(response){
		     	$(el).parent().parent().append('<p class="response text-danger small">Произошла ошибка, попробуйте позже.</p>');
		     	removeResponseMsg();
		    },
		    success: function(response){
		      $(el).parent().parent().append('<p class="response text-success small">Спасибо! Ваша заявка успешно отправлена.</p>');
		      removeResponseMsg();
		      yaCounter50080147.reachGoal('callback-submit');
		      setTimeout(function() { 
				    $('#callbackModal').modal('hide');
				  }, 3000);
		    }
		  });
		}
		else {
			$(el).parent().parent().append('<p class="response text-danger small">Введен некорректный формат телефона.</p>');
		  removeResponseMsg();
		}
	}
}

function removeResponseMsg() {
	setTimeout(function() { 
    $('.response').hide(500);
  }, 3000);
}





