window.onload = function () {
    var code = $(".codemirror-textarea")[0];
    if (code !== undefined) {
        var editableCodeMirror = CodeMirror.fromTextArea(code, {
            lineNumbers: true
        });
    }

    CodeMirror.commands.autocomplete = function (cm) {
        CodeMirror.showHint(cm, CodeMirror.hint.anyword);
    };

    //var autocompleteText = $(".codemirror-autocomplete")[0];
    var autocompleteText = $(".codemirror-autocomplete");  
    if (autocompleteText !== undefined) {
        for (i = 0; i < autocompleteText.length; i++) {
            var editor = CodeMirror.fromTextArea(autocompleteText[i], {
                lineNumbers: true,
                autoRefresh: true,
                autofocus: true,
                matchBrackets: true,
                mode: "text/html",
                indentUnit: 4,
                highlightSelectionMatches: true,
                styleActiveLine: true,
                extraKeys: {
                    "Ctrl-Space": "autocomplete",
                    "Ctrl-Space": function (cm) { CodeMirror.showHint(cm, CodeMirror.hint.anyword); }
                },
                autohint: true,
                readOnly: false,
                lineWrapping: true,

                autoCloseTags: true,
                autoCloseBrackets: true,
                enableSearchTools: true,
                enableCodeFormatting: true,
                autoFormatOnStart: true
            });

            setTimeout(function () {
                editor.refresh();
            }, 1);
        }
    }
};


function createCodeMirrorEditor(autocompleteText) {
    var editor = CodeMirror.fromTextArea(autocompleteText[0], {
        lineNumbers: true,
        autoRefresh: true,
        autofocus: true,
        matchBrackets: true,
        mode: "text/html",
        indentUnit: 4,
        highlightSelectionMatches: true,
        styleActiveLine: true,
        extraKeys: {
            "Ctrl-Space": "autocomplete",
            "Ctrl-Space": function (cm) { CodeMirror.showHint(cm, CodeMirror.hint.anyword); }
        },
        autohint: true,
        readOnly: false,
        lineWrapping: true,

        autoCloseTags: true,
        autoCloseBrackets: true,
        enableSearchTools: true,
        enableCodeFormatting: true,
        autoFormatOnStart: true
    });

    return editor;
}

function createCodeMirrorCSSEditor(autocompleteText) {
    var editor = CodeMirror.fromTextArea(autocompleteText[0], {
        lineNumbers: true,
        autoRefresh: true,
        autofocus: true,
        matchBrackets: true,
        mode: "text/css",
        indentUnit: 4,
        highlightSelectionMatches: true,
        styleActiveLine: true,
        extraKeys: {
            "Ctrl-Space": "autocomplete",
            "Ctrl-Space": function (cm) { CodeMirror.showHint(cm, CodeMirror.hint.anyword); }
        },
        autohint: true,
        readOnly: false,
        lineWrapping: true,

        autoCloseTags: true,
        autoCloseBrackets: true,
        enableSearchTools: true,
        enableCodeFormatting: true,
        autoFormatOnStart: true
    });

    return editor;
}

function createCodeMirrorJSEditor(autocompleteText) {
    var editor = CodeMirror.fromTextArea(autocompleteText[0], {
        lineNumbers: true,
        autoRefresh: true,
        autofocus: true,
        matchBrackets: true,
        mode: "text/javascript",
        indentUnit: 4,
        highlightSelectionMatches: true,
        styleActiveLine: true,
        extraKeys: {
            "Ctrl-Space": "autocomplete",
            "Ctrl-Space": function (cm) { CodeMirror.showHint(cm, CodeMirror.hint.anyword); }
        },
        autohint: true,
        readOnly: false,
        lineWrapping: true,

        autoCloseTags: true,
        autoCloseBrackets: true,
        enableSearchTools: true,
        enableCodeFormatting: true,
        autoFormatOnStart: true
    });

    return editor;
}