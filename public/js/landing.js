$(document).ready(function() { 
  $(".presentation .block").on("click", function(){
  	if (!$(this).hasClass("active")) {
 			$(".presentation .block").removeClass("active");
 			$(this).addClass("active");
 		}
  });
});

function sendCallbackBid(el) {
	$.ajax({
    type: 'put',
    url: '/api/callback',
    data: {
    	name: $('#name').val(),
    	phone: $('#tel').val()
    },
    error: function(response){
     	$(el).parent().parent().append('<p class="response text-danger small">Произошла ошибка, попробуйте позже.</p>');
     	removeResponseMsg();
    },
    success: function(response){
      $(el).parent().parent().append('<p class="response text-success small">Спасибо! Ваша заявка успешно отправлена.</p>');
      removeResponseMsg();
    }
  });
}

function removeResponseMsg() {
	setTimeout(function() { 
    $('.response').hide(500);
  }, 3000);
}





