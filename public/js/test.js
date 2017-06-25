'use strict'

$(document).ready(function(){
	$.ajax({
		type: 'get',
		url: 'http://api.mysite.com/getInfo',
		success: function(response){
			console.log(response);
		}
	});
});