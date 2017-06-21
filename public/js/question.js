$(document).ready(function() {
	$("#send").on('click', function(){
		$.ajax({
			url: 'api/uploadQuestion',
			type: 'post',
			data: {question: $('#question').val(), answer: $('#answer').val()},
			success: function(res){
				console.log(res);
			}
		});
	});  
});