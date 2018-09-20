var pending = true;
var firstLoad = true;
var endList = false;
var currenTr;

function loadTeachers(lastID) {
  $.ajax({
    url: '/api/teachers',
    method: 'get',
    data: {lastID: lastID},
    beforeSend: function() {
      pending = true;
    },
    success: function(response) {
      var teachers = "";
      pending = false;
      response.forEach(function(teacher, response){
        teachers += 
          "<tr id='" + teacher._id + "'>" +
            "<td>" + teacher.fullname + "</td>" +
            "<td>" + teacher.email + "</td>" +
            "<td>" + teacher.phone + "</td>" +
            "<td>" + (teacher.sex ? "Женский" : "Мужской") + "</td>" + 
            "<td>" + teacher.subject + "</td>" + 
            "<td>" + `<a class='btn btn-sm btn-primary' href='/admin/teacher/${teacher._id}'>Редактировать</a>` + "</td>" +
          "</tr>";
      });
      $('tbody').append(teachers);
      if(response[response.length - 1]) currenTr = response[response.length - 1]._id;
      else endList = true;
    }
  });
}

$(document).ready(function() {
  $('#anchor').viewportChecker({
        offset: 0,
        repeat: true,
        callbackFunction: function() {
          if (firstLoad) { 
            loadTeachers("000000000000000000000000");
            firstLoad = false;
          }
          else if (!pending && !endList && !firstLoad){
           loadTeachers(currenTr);
          }
        }
    });
});

var inputs = document.querySelectorAll( '.inputfile' );
Array.prototype.forEach.call( inputs, function( input )
{
  var label  = input.nextElementSibling,
    labelVal = label.innerHTML;

  input.addEventListener( 'change', function( e )
  {
    var fileName = '';
    if( this.files && this.files.length > 1 )
      fileName = ( this.getAttribute( 'data-multiple-caption' ) || '' ).replace( '{count}', this.files.length );
    else
      fileName = e.target.value.split( '\\' ).pop();

    if( fileName )
      label.querySelector( 'span' ).innerHTML = fileName;
    else
      label.innerHTML = labelVal;
  });
});