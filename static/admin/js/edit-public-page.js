'use sctrict';

var id = window.location.href.split('/')[5];
var certificateNames = [];
var certificateImages = [];
var uploadedCertificates = [];
var uploadedCertificatesLength = 0;

function sendData(el) {
  var geoposition = $('#geoposition').val();
  var school = $('#school').val();
  var experience = $('#experience').val();
  var photo = $('#photo').prop('files')[0];
  var bio = $('#bio').val();
  var about = $('#about').val();
  var visible = $('#visibility-checkbox').is(':checked');
  var experience = $('#experience').val();
  var formData = new FormData();

  formData.append('geoposition', geoposition)
  formData.append('school', school);
  formData.append('avatar', photo);
  formData.append('bio', bio);
  formData.append('about', about);
  formData.append('visible', visible);
  formData.append('experience', experience);
  certificateNames.forEach((item) => {
    formData.append('certificatesNames[]', item);
  });
  certificateImages.forEach((item) => {
    formData.append('certificatesImages', item);
  });

  if (!$(el).hasClass("disabled")) {
    $.ajax({
      type: 'put',
      url: `/api/teacherInfo/${id}`,
      data: formData,
      processData: false,
      contentType: false,
      error: function(response){
        showResponseMessage("danger", "Произошла ошибка на сервере, попробуйте позже.");
      },
      success: function(response){
        showResponseMessage("success", "Готово! Страница успешно отредактирована.");
        certificateNames.forEach(function(certificate, i, certificateNames) {
          var uploadedCertificate = {
            name: certificate,
            id: null
          }
          uploadedCertificates.push(uploadedCertificate);
        });
        updateUploadedCertificatesList();
        clearForm();
      }
    });
  }
}
  

function addCertificate(el) {
  var certificateName = $('#certificate-name').val();
  var certificateImage = $('#certificate-image').prop('files')[0];

  if ((certificateNames.length + uploadedCertificates.length) < 5) {
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

function deleteUploadedCertificate(el, certId) {
  if (confirm('Вы уверены, что хотите удалить ранее загруженный сертификат?')) {
    $.ajax({
      url: `/api/teacherInfo/${id}/certificate/${certId}`,
      type: 'delete',
      error: function(response){
        showResponseMessage("danger", "Произошла ошибка на сервере, попробуйте позже.");
      },
      success: function(response){
        showResponseMessage("success", "Готово! Сертификат успешно удален.");
        $(el).parent().remove();
        collectUploadedCertificates();
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
  $('#photo').val(null);
  certificateNames = [];
  certificateImages = [];
  updateCertificatesList();
}

function updateCertificatesList() {
  var list = $('#certificates-list');

  list.html('');
  certificateNames.forEach(function(certificate, i, certificateNames) {
    list.append('<li><i class="fa fa-file-text-o" aria-hidden="true" style="color: #1abb9c; margin-right: 7px"></i>' + certificate + '<a style="margin-left: 10px;" onClick="deleteCertificate(' + i + ')" title="Удалить"><i class="fa fa-trash-o" aria-hidden="true"></i></a></li>')
  })
}

function collectUploadedCertificates() {
  uploadedCertificates = [];
  $('.uploaded-certificates').each(function(index) {
    var uploadedCertificate = {
      name: $(this).find('span').text(),
      id: $(this).find('a').data('id')
    }
    uploadedCertificates.push(uploadedCertificate);
  })
  updateUploadedCertificatesList();
}

function updateUploadedCertificatesList() {
  var list = $('#uploaded-certificates-list');

  list.html('');
  uploadedCertificates.forEach(function(certificate, i, uploadedCertificates) {
    if (certificate.id != null) list.append('<li class="uploaded-certificates"><i class="fa fa-file-text-o" aria-hidden="true" style="color: #1abb9c; margin-right: 7px"></i><span>' + certificate.name + '</span><a style="margin-left: 10px;" onClick="deleteUploadedCertificate(this, `' + certificate.id + '`)" title="Удалить"><i class="fa fa-trash-o" aria-hidden="true"></i></a></li>');
    else list.append('<li class="uploaded-certificates"><i class="fa fa-file-text-o" aria-hidden="true" style="color: #1abb9c; margin-right: 7px"></i><span>' + certificate.name + '</span></li>');
  })
}

function changePublicPageVisibility(checkbox, id) {
  if ($(checkbox).is(":checked")) {
    console.log(id + ' checked')
  }
  else {
    console.log(id + ' unchecked')
  }
}

function showResponseMessage(status, text) {
  $(".alerts").show(1);
  $(".alerts").html("<div class='alert alert-" + status + " alert-dismissable'>" + 
    "<a class='close' data-dismiss='alert' aria-label='close'>&times;</a>" + text + "</div>");
  setTimeout(function() {
    $(".alerts").hide(500);
  }, 3000);
}

$(document).ready(function() { 
  initPhotoFileButton();
  initCertificateFileButton();
  collectUploadedCertificates();
});