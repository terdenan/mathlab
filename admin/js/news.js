'use strict'

function MarkdownParser(id) {

    var elem = document.getElementById(id);
    var self = this;

    elem.onkeyup = function(e) {
        document.getElementById("visualization").innerHTML = self.parse().replace(/\n/g, "<br>");
    }

    this.getValue = function() {
        return elem.value;
    }

    this.parse = function() {
        const html = marked(this.getValue());
        return html;
    }

}

const parser = new MarkdownParser("markdown-textarea");

$('#publish').on('click', () => {
    var file = $('#file').prop('files')[0];
    var formData = new FormData();
    var title = document.getElementById("news-title").value;

    formData.append('file', file);
    formData.append('title', title.replace(/\s+/g, ' ').trim());
    formData.append('body', parser.getValue());

    $.ajax({
        type: "post",
        url: "/api/note",
        data: formData,
        processData: false,
        contentType: false,
        success: function(data) {
            $(".alerts").html("<div class='alert alert-success alert-dismissable'>" +
                              "<a href='#' class='close' data-dismiss='alert' aria-label='close'>&times;</a>" +
                              "<strong>Готово!</strong> Новость успешно добавлена." +
                            "</div>");
            $("#news-title").val("");
            $("#markdown-textarea").val("");
            $("#visualization").val("");
        },
        error: function(data){
            $(".alerts").html("<div class='alert alert-danger alert-dismissable'>" +
                                "<a href='#' class='close' data-dismiss='alert' aria-label='close'>&times;</a>" +
                                "<strong>Произошла ошибка!</strong> Попробуйте позже. " +
                              "</div>");
        }
    });
});