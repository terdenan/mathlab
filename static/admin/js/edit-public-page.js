'use sctrict';

var certificates = [];

function sendData(el) {
  var fullname = $('#fullname').val();
  var subject = $('#subject').val();
  var geoposition = $('#geoposition').val();
  var school = $('#school').val();
  var photo = $('#photo').prop('files')[0];
  var bio = $('#bio').val();
  var about = $('#about').val();
  var formData = new FormData();

  formData.append('fullname', fullname);
  formData.append('subject', subject);
  formData.append('geoposition', geoposition)
  formData.append('school', school);
  formData.append('photo', photo);
  formData.append('bio', bio);
  formData.append('about', about);
  formData.append('certificates', certificates);

  if (!$("#reg-teacher").hasClass("disabled")) {
    $.ajax({
      url: '',
      type: 'post',
      data: formData,
      processData: false,
      contentType: false,
      error: function(response){
        $(".alerts").html("<div class='alert alert-danger alert-dismissable'>" +
                              "<a href='#' class='close' data-dismiss='alert' aria-label='close'>&times;</a>" +
                              "<strong>Ошибка!</strong> Произошла ошибка на сервере, попробуйте позже." +
                            "</div>");
      },
      success: function(response){
        $(".alerts").html("<div class='alert alert-success alert-dismissable'>" +
                            "<a href='#' class='close' data-dismiss='alert' aria-label='close'>&times;</a>" +
                            "<strong>Готово!</strong> Страница успешно отредактирована." +
                          "</div>");
        clearForm();
      }
    });
  }
}
  

function addCertificate(el) {
  var certificateName = $('#certificate-name').val();
  var certificateImage = $('#certificate-image').prop('files')[0];
  var certificateImagePath = $('#certificate-image').val();

  certificates.push({
    certificateName: certificateName,
    certificateImage: certificateImage,
    certificateImagePath: certificateImagePath
  });

  $('#addCertificateModal').modal('hide');
  updateCertificatesList();
}

function initPhotoFileButton() {
  var input = $('#photo');
  var label = $('#photo-span');
  var fileName = '';

  input.on("change", function(e) {
    fileName = e.target.value.split( '\\' ).pop();
    label.html(fileName);
  });
}

function initCertificateFileButton() {
  var input = $('#certificate-image');
  var label = $('#certificate-image-span');
  var fileName = '';

  input.on("change", function(e) {
    fileName = e.target.value.split( '\\' ).pop();
    label.html(fileName);
  });
}

function clearModal() {
  $('#certificate-name').val('');
  $('#certificate-image').val(null);
  $('#certificate-image-span').html('Выбрать изображение')
}

function clearForm() {
  $('#fullname').val('');
  $('#subject').val('');
  $('#geoposition').val('');
  $('#school').val('');
  $('#photo').val(null);
  $('#bio').val('');
  $('#about').val('');
  certificates = [];
  updateCertificatesList();
}

function updateCertificatesList() {
  var list = $('#certificates-list');

  list.html('');
  certificates.forEach(function(certificate, certificates) {
    list.append('<li><i class="fa fa-file-text-o" aria-hidden="true" style="color: #1abb9c;"></i> &nbsp;' + certificate.certificateName + '</li>')
  })
}

$(document).ready(function() { 
  initPhotoFileButton();
  initCertificateFileButton();
});