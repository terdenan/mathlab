
$(document).ready(function() { 
  $(".presentation .block").on("click", function(){
  	if (!$(this).hasClass("active")) {
 			$(".presentation .block").removeClass("active");
 			$(this).addClass("active");
 		}
  });
});





