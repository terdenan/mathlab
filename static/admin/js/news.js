'use strict'

function MarkdownParser() {

    this.elemTitle = document.getElementById("news-title");
    this.elemDescription = document.getElementById("short-description");
    this.elemFile = document.getElementById("file");
    this.elemFileSpan = document.getElementById("file").querySelector('span');
    this.elemMd = document.getElementById("markdown-textarea");
    this.elemVisualization = document.getElementById("visualization");
    this.elemAlertBox = document.getElementById("alerts");
    const self = this;

    this.elemMd.onkeyup = function(e) {
        self.elemVisualization.innerHTML = self.parse().replace(/\n/g, "<br>");
    }


    this.parse = function() {
        const html = marked(self.elemMd.value);
        return html;
    }

    this.clearAll = function() {
        self.elemTitle.value = "";
        self.elemDescription.value = "";
        self.elemMd.value = "";
        self.elemVisualization.innerHTML = "";
        self.elemFile.value = "";
        self.elemFileSpan.innerHTML = "Выбрать изображение";
    }

    this.setAlert = function(type) {
        switch(type) {
            case 'success':
                self.elemAlertBox.innerHTML = 
                    `<div class='alert alert-success alert-dismissable'>
                        <a href='#' class='close' data-dismiss='alert' aria-label='close'>&times;</a>
                        <strong>Готово!</strong> Новость успешно добавлена.
                    </div>`;
                break;
            case 'error':
                self.elemAlertBox.innerHTML = 
                    `<div class='alert alert-danger alert-dismissable'>
                        <a href='#' class='close' data-dismiss='alert' aria-label='close'>&times;</a>
                        <strong>Произошла ошибка!</strong> Попробуйте позже.
                    </div>`;
                break;
        }
    }
}

const parser = new MarkdownParser();

$('#publish').on('click', () => {
    var file = $('#file').prop('files')[0];
    var formData = new FormData();
    var title = parser.elemTitle.value.replace(/\s+/g, ' ').trim();

    formData.append('file', file);
    formData.append('title', title);
    formData.append('description', parser.elemDescription.value);
    formData.append('body', parser.elemMd.value);
    if (!$('#publish').hasClass("disabled") && !$("#file").val() == '') {
        $.ajax({
            type: "post",
            url: "/api/news",
            data: formData,
            processData: false,
            contentType: false,
            success: function(data) {
                parser.setAlert('success');
                parser.clearAll();
            },
            error: function(data){
                parser.setAlert('error')
            }
        });
    }
    else {
        $("#file-error").html("Вы не загрузили изображение обложки")
    }
});

    var input = document.getElementById("file"),
        label = input.nextElementSibling,
        labelVal = label.innerHTML,
        fileName = '';

    input.addEventListener('change', function(e){
        fileName = e.target.value.split( '\\' ).pop();

        if( fileName ) {
            label.querySelector('span').innerHTML = fileName;
            $("#file-error").html('');
        }
        else
            label.innerHTML = labelVal;
});