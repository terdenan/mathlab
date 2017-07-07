/*
	By Osvaldas Valutis, www.osvaldas.info
	Available for use under the MIT License
*/

'use strict';

;( function ( document, window, index )
{
	var inputs = document.querySelectorAll( '.attachment-input' );
	Array.prototype.forEach.call( inputs, function( input )
	{
		var label	 = input.nextElementSibling;

		input.addEventListener( 'change', function( e )
		{
			var fileName = '';
			var fileSize = 0;
			if( this.files && this.files.length > 1 )
				fileName = ( this.getAttribute( 'data-multiple-caption' ) || '' ).replace( '{count}', this.files.length );
			else {
				fileName = e.target.value.split( '\\' ).pop();
				fileSize = ((e.target.files[0].size)/1024).toFixed(2);
				$(".attachments-block").html("<div class='attachment-document'>" +
	                      "<div class='message-attachment upload-attachment'>" +
	                          "<div class='message-attachment-img'>" +
	                              "<a class='btn btn-primary' role='button'>" +
	                                 "<i class='fa fa-paperclip' aria-hidden='true'></i>" +
	                              "</a>" +
	                          "</div>" +
	                          "<div class='message-attachment-body'>" +
	                              "<h5>" + fileName + "</h5>" +
	                              "<h6>" + fileSize + " КБ</h6>" +
	                          "</div>" +
	                      "</div>" +
	                  "</div>");
				$(".panel-body").css("height", "545px");
			}
			if( fileName ) {
				fileSize = ((e.target.files[0].size)/1024).toFixed(2);
				$(".attachments-block").html("<div class='attachment-document'>" +
	                      "<div class='message-attachment upload-attachment'>" +
	                          "<div class='message-attachment-img'>" +
	                              "<a class='btn btn-primary' role='button'>" +
	                                 "<i class='fa fa-paperclip' aria-hidden='true'></i>" +
	                              "</a>" +
	                          "</div>" +
	                          "<div class='message-attachment-body'>" +
	                              "<h5>" + fileName + "</h5>" +
	                              "<h6>" + fileSize + " КБ</h6>" +
	                          "</div>" +
	                      "</div>" +
	                  "</div>");
				$(".panel-body").css("height", "545px");
				}
			else
				label.innerHTML = labelVal;
		});

		// Firefox bug fix
		input.addEventListener( 'focus', function(){ input.classList.add( 'has-focus' ); });
		input.addEventListener( 'blur', function(){ input.classList.remove( 'has-focus' ); });
	});
}( document, window, 0 ));