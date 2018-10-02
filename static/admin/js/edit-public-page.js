'use sctrict';

var certificateNames = [];
var certificateImages = [];
var uploadedCertificatesLength = 0;

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
  formData.append('certificateNames', certificateNames);
  formData.append('certificateImages', certificateImages);

  if (!$(el).hasClass("disabled")) {
    $.ajax({
      url: '',
      type: 'post',
      data: formData,
      processData: false,
      contentType: false,
      error: function(response){
        showResponseMessage("danger", "Произошла ошибка на сервере, попробуйте позже.");
      },
      success: function(response){
        showResponseMessage("success", "Готово! Страница успешно отредактирована.");
        clearForm();
      }
    });
  }
}
  

function addCertificate(el) {
  var certificateName = $('#certificate-name').val();
  var certificateImage = $('#certificate-image').prop('files')[0];

  if ((certificateNames.length + uploadedCertificatesLength) < 5) {
    certificateNames.push(certificateName);
    certificateImages.push(certificateImage);
    updateCertificatesList();
  }
  else {
    showResponseMessage("danger", "Добавлено максимальное количество сертификатов: 5.");
  }
  
  $('#addCertificateModal').modal('hide');
}

function deleteCertificate(index) {
  if (confirm('Вы уверены, что хотите удалить сертификат?')) {
    certificateNames.splice(index, 1);
    certificateImages.splice(index, 1);
    updateCertificatesList();
  } 
}

function deleteUploadedCertificate(id) {
  if (confirm('Вы уверены, что хотите удалить ранее загруженный сертификат?')) {
    $.ajax({
      url: '',
      type: 'post',
      data: {
        id: id
      },
      error: function(response){
        showResponseMessage("danger", "Произошла ошибка на сервере, попробуйте позже.");
      },
      success: function(response){
        showResponseMessage("success", "Готово! Сертификат успешно удален.");
      }
    });
  }
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
  certificateNames.forEach(function(certificate, i, certificateNames) {
    list.append('<li><i class="fa fa-file-text-o" aria-hidden="true" style="color: #1abb9c; margin-right: 7px"></i>' + certificate + '<a href="#" style="margin-left: 10px;" onClick="deleteCertificate(' + i + ')" title="Удалить"><i class="fa fa-trash-o" aria-hidden="true"></i></a></li>')
  })
}

function countUploadedCertificates() {
  uploadedCertificatesLength = $('.uploaded-certificates').length;
}

function showResponseMessage(status, text) {
  $(".alerts").show(1);
  $(".alerts").html("<div class='alert alert-" + status + " alert-dismissable'>" + 
    "<a href='#' class='close' data-dismiss='alert' aria-label='close'>&times;</a>" + text + "</div>");
  setTimeout(function() {
    $(".alerts").hide(500);
  }, 3000);
}

$(document).ready(function() { 
  initPhotoFileButton();
  initCertificateFileButton();
  countUploadedCertificates();
});