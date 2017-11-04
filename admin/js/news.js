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

    formData.append('file', file);
    formData.append('title', "Hello, world!");
    formData.append('body', parser.getValue());

    $.ajax({
        type: "post",
        url: "/api/note",
        data: formData,
        processData: false,
        contentType: false,
        success: function(data) {
            console.log(data);
        }
    });
});