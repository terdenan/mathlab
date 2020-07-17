$(function() { 
  $(".presentation .block").on("click", function(){
  	if (!$(this).hasClass("active")) {
 			$(".presentation .block").removeClass("active");
 			$(this).addClass("active");
 		}
  });
});

function sendCallbackBid(el, prefTeacher) {
	var name = $('#name').val();
	var phone = $('#tel').val();
	var teacher = (prefTeacher) ? prefTeacher : '';

	if (!$(el).hasClass('disabled')) {
		if (phone != '+7 ') {
			$.ajax({
		    type: 'post',
		    url: '/api/callback',
		    data: {
		    	name: name,
		    	phone: phone,
		    	teacher: teacher
		    },
		    error: function(response){
		     	$(el).parent().parent().append('<p class="response text-danger small">Произошла ошибка, попробуйте позже.</p>');
		     	removeResponseMsg();
		    },
		    success: function(response){
		    	sendEvent({
            dataset: {
              eventName: 'Callback requested',
            }
          });
		      $(el).parent().parent().append('<p class="response text-success small">Спасибо! Ваша заявка успешно отправлена.</p>');
		      removeResponseMsg();
		      $('input').val('');
		      setTimeout(function() { 
				    $('#callbackModal').modal('hide');
				  }, 2500);
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
