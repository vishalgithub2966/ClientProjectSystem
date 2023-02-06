var _aws = $.ajax({
    url: "/api/services/app/AWS/GetUrl"
});

var awsUrl = "";

getAWSLink();

$.ajaxSetup({ cache: false });
function selectFile(item) {
    $('#pnlFileList li').removeClass('selected');
    $(item).prop('class', 'selected');
    var html = RoxyUtils.GetFilename($(item).attr('data-path'));
    html += ' (' + t('Size') + ': ' + RoxyUtils.FormatFileSize($(item).attr('data-size'));
    if ($(item).attr('data-w') > 0)
        html += ', ' + t('Dimensions') + ':' + $(item).attr('data-w') + 'x' + $(item).attr('data-h');
    html += ')';
    $('#pnlStatus').html(html);

}
function getLastDir() {
    return RoxyUtils.GetCookie('roxyld');
}
function setLastDir(path) {
    RoxyUtils.SetCookie('roxyld', path, 10);
}
function selectDir(item) {
    if ($(item).hasClass('selected')) {
        return false;
    }
    var d = Directory.Parse($(item).parent('li').attr('data-path'));
    if (d) {
        d.Select();
    }
    else {
        var df = Directory.Parse($(item).attr('data-path'));
        if (df) {
            df.Select();
        }
    }
}
function startDragDir() {

    // var d = Directory.Parse($(item).parent('li').attr('data-path'));

}
function startDragFile() {
    var countLi = $("#pnlFileList").children("li.selected").length;
    if (countLi > 1) {
        console.log(countLi);
    }
    else {
        selectFile(this);
    }
    //selectFile(this);
}
function dragFileOver() {
    //console.log(this);
    //$(this).children('img.dir').attr('src', '/lib/fileman/images/folder-green.png');
    $(this).addClass("dropableFolder");
}
function dragFileOut() {
    //console.log(this);
    //$('#pnlDirList').find('img.dir').attr('src', '/lib/fileman/images/folder.png');
    $(this).removeClass("dropableFolder");
}
function makeDragFile(e) {
    $.ajax({
        url: "/api/services/app/AWS/GetUrl"
    }).done(function (data) {
        console.log(data.result);
        //console.log("Helper");
        var countLi = $("#pnlFileList").children("li.selected").length;
        var f = new File($(e.target).closest('li').attr('data-path'));
        var url = f.fullPath;

        url = url.replace("/wwwroot/", data.result + "");
        var content = "";
        if (countLi > 1) {
            content = '<div class="dragDiv"><img src="' + url + '" align="absmiddle" style="width:50px; height:50px;">' + '<span class="dragSpan">' + countLi + '</span></div>';
        }
        else {
            content = '<div class="dragDiv"><img src="' + url + '" align="absmiddle" style="width:50px; height:50px;"></div>';
        }
    });


    return content;
}
function makeDragDir(e) {
    var f = new Directory($(e.target).attr('data-path') ? $(e.target).attr('data-path') : $(e.target).closest('li').attr('data-path'));
    return '<div class="pnlDragDir" data-path="' + f.fullPath + '"><img src="/lib/fileman/images/folder.png" align="absmiddle">&nbsp;' + f.name + '</div>';
}
function moveDir(e, ui, obj) {
    var dir = Directory.Parse(ui.draggable.attr('data-path'));
    var target = Directory.Parse($(obj).parent('li').attr('data-path'));
    if (!target) {
        target = Directory.Parse($(obj).attr('data-path'));
    }
    if (target.fullPath !== dir.path) {
        if (dir.flock !== "true") {
            if (target.subfolder === "true") {

                $.confirm({
                    title: 'Warning!',
                    content: '<h6>Would you like to update all references to this folder to reflect the new location?</h6>',
                    type: 'red',
                    typeAnimated: true,
                    buttons: {
                        Yes: {
                            btnClass: 'btn-red',
                            action: function () {
                                this.buttons.Yes.disable();
                                dir.Move(target);
                            }
                        },
                        No: function () {
                        }
                    }
                });
            }
            else {
                $.alert({
                    title: 'Alert!',
                    content: t('E_NoSubFolder')
                });
            }
        }
        else {
            $.alert({
                title: 'Alert!',
                content: t('E_LockFolder')
            });
        }

    }

}
function moveFile(e, ui, obj) {
    var check = checkGalleryMainFolder();
    if (!check) {
        return false;
    }

    var f = new File(ui.draggable.attr('data-path'));
    f.fid = (ui.draggable.attr('data-fid'));
    var d = Directory.Parse($(obj).parent('li').attr('data-path'));
    var src = Directory.Parse(f.path);
    if (f.path != d.fullPath) {

        $.confirm({
            title: 'Warning!',
            content: '<h6>Would you like to update all references to this file to reflect the new location?</h6>',
            type: 'red',
            typeAnimated: true,
            buttons: {
                Yes: {
                    btnClass: 'btn-red',
                    action: function () {
                        this.buttons.Yes.disable();
                        f.Move(d.fullPath);
                    }
                },
                No: function () {
                }
            }
        });
    }
}


function moveAllFile(e, DragSelected, obj) {
    var check = checkGalleryMainFolder();
    if (!check) {
        return false;
    }

    var LiData = DragSelected[0];
    var file = new File($(LiData).attr('data-path'));
    var d = getSelectedDir();
    if (file.path !== d.fullPath) {
        $.confirm({
            title: 'Warning!',
            content: '<h6>Would you like to update all references to this files to reflect the new location?</h6>',
            type: 'red',
            typeAnimated: true,
            buttons: {
                Yes: {
                    btnClass: 'btn-red',
                    action: function () {
                        this.buttons.Yes.disable();
                        $(DragSelected).each(function () {
                            var f = new File($(this).closest('li').attr('data-path'));
                            f.fid = $(this).closest('li').attr('data-fid');
                            //console.log(f);
                            a = f.MoveAll(d.fullPath, d);
                            //console.log(a);
                        });
                        selectDir(obj);
                    }
                },
                No: function () {
                }
            }
        });
    }
}



function moveFileChild(e, ui, obj) {
    var check = checkGalleryMainFolder();
    if (!check) {
        return false;
    }

    var f = new File(ui.draggable.attr('data-path'));
    f.fid = (ui.draggable.attr('data-fid'));
    var d = Directory.Parse($(obj).attr('data-path'));
    var src = Directory.Parse(f.path);
    if (f.path != d.fullPath) {

        $.confirm({
            title: 'Warning!',
            content: '<h6>Would you like to update all references to this file to reflect the new location?</h6>',
            type: 'red',
            typeAnimated: true,
            buttons: {
                Yes: {
                    btnClass: 'btn-red',
                    action: function () {
                        this.buttons.Yes.disable();
                        f.MoveChild(d);
                    }
                },
                No: function () {
                }
            }
        });
    }
}

function moveAllFileChild(e, DragSelected, obj) {

    var check = checkGalleryMainFolder();
    if (!check) {
        return false;
    }

    var LiData = DragSelected[0];
    var file = new File($(LiData).attr('data-path'));
    var dir = getSelectedDir();
    var d = Directory.Parse($(obj).attr('data-path'));
    if (file.path !== d.fullPath) {
        $.confirm({
            title: 'Warning!',
            content: '<h6>Would you like to update all references to this files to reflect the new location?</h6>',
            type: 'red',
            typeAnimated: true,
            buttons: {
                Yes: {
                    btnClass: 'btn-red',
                    action: function () {
                        this.buttons.Yes.disable();
                        $(DragSelected).each(function () {
                            var f = new File($(this).closest('li').attr('data-path'));
                            f.fid = $(this).closest('li').attr('data-fid');
                            //console.log(f);
                            a = f.MoveAll(d.fullPath, d);
                            //console.log(a);
                        });
                        selectDir(obj);
                    }
                },
                No: function () {
                }
            }
        });
    }
}



function moveObject(e, ui) {
    //console.log(e);
    //console.log(ui);

    $(this).removeClass("dropableFolder");
    $(this).addClass("SelectDropDir");
    // console.log(this);
    e.stopPropagation();

    var countLi = $("#pnlFileList").children("li.selected").length;
    if (countLi > 1) {
        var DragSelected = $("#pnlFileList").children("li.selected");
        //console.log(f);
        moveAllFile(e, DragSelected, this);
    }
    else {
        if (ui.draggable.hasClass('directory')) {
            moveDir(e, ui, this);
        }
        else {
            moveFile(e, ui, this);
        }
        dragFileOut();
        selectDir(this);

    }
}

function moveObjectChild(e, ui) {
    $(this).removeClass("dropableFolder");
    $(this).addClass("SelectDropDir");
    //// console.log(this);
    e.stopPropagation();

    var countLi = $("#pnlFileList").children("li.selected").length;
    if (countLi > 1) {
        var DragSelected = $("#pnlFileList").children("li.selected");
        //console.log(f);
        moveAllFileChild(e, DragSelected, this);
    }
    else {
        if (ui.draggable.hasClass('directory')) {
            moveDir(e, ui, this);
        }
        else {
            moveFileChild(e, ui, this);
        }
        dragFileOut();
        selectDir(this);
    }
}








function clickFirstOnEnter(elId) {
    $('#' + elId).unbind('keypress');
    $('.actions input').each(function () { this.blur(); });
    $('#' + elId).keypress(function (e) {
        if (e.keyCode == $.ui.keyCode.ENTER) {
            e.stopPropagation();
            $(this).parent().find('.ui-dialog-buttonset button').eq(0).trigger('click');
        }
    });
}
function addDir() {
    var f = getSelectedDir();

    if (f.subfolder == "false") {
        $.alert({
            title: 'Alert!',
            content: t('E_NoSubFolder')
        });
        return;
    }

    $.confirm({
        title: 'Create Folder',
        content: '' +
            '<div class="form-group">' +
            //'<label>Enter Folder Name</label>' +
            '<input type="text" placeholder="Folder name" class="name form-control" required />' +
            '</div>',
        buttons: {
            formSubmit: {
                text: 'Submit',
                btnClass: 'btn-blue',
                action: function () {
                    var name = this.$content.find('.name').val();
                    if (!name) {
                        $.alert('provide a valid name');
                        return false;
                    }
                    f.Create(name);
                    close;
                    //if (f.Create(name)) {
                    //    close;
                    //}
                }
            },
            cancel: function () {
                //close
            }
        },
        onContentReady: function () {

        }
    });

}
var uploadFileList = new Array();
function showUploadList(files) {
    var filesPane = $('#uploadFilesList');
    filesPane.html('');
    clearFileField();
    for (i = 0; i < files.length; i++) {
        filesPane.append('<div class="fileUpload"><div class="fileName">' + files[i].name + ' (' + RoxyUtils.FormatFileSize(files[i].size) + ')<span class="progressPercent"></span><div class="uploadProgress"><div class="stripes"></div></div></div><a class="removeUpload" onclick="removeUpload(' + i + ')"><i class="fa fa-trash-o"></i> </a></div>');
    }
    if (files.length > 0)
        $('#btnUpload').button('enable');
    else
        $('#btnUpload').button('disable');
}
function listUploadFiles(files) {
    if (!window.FileList) {
        $('#btnUpload').button('enable');
    }
    else if (files.length > 0) {
        uploadFileList = new Array();
        addUploadFiles(files);
    }
}
function addUploadFiles(files) {
    for (i = 0; i < files.length; i++)
        uploadFileList.push(files[i]);
    showUploadList(uploadFileList);
}
function removeUpload(i) {
    var el = findUploadElement(i);
    el.remove();
    try {
        uploadFileList.splice(i, 1);
        showUploadList(uploadFileList);
    }
    catch (ex) {
        //alert(ex); 
    }
}
function findUploadElement(i) {
    return $('#uploadFilesList .fileUpload:eq(' + (i) + ')');
}
function updateUploadProgress(e, i) {
    var el = findUploadElement(i);
    var percent = 99;
    if (e.lengthComputable) {
        percent = Math.floor((e.loaded / e.total) * 100);
    }
    if (percent > 99)
        percent = 99;
    el.find('.uploadProgress').css('width', percent + '%');
    el.find('.progressPercent').html(' - ' + percent + '%');
}
function uploadComplete(e, i) {
    uploadFinished(e, i, 'ok');
}
function uploadError(e, i) {
    setUploadError(i);
    uploadFinished(e, i, 'error');
}
function setUploadError(i) {
    var el = findUploadElement(i);
    el.find('.uploadProgress').css('width', '100%').addClass('uploadError').removeClass('uploadComplete');
    el.find('.progressPercent').html(' - <span class="error">' + t('E_UploadingFile') + '</span>');
}
function setUploadSuccess(i) {
    var el = findUploadElement(i);
    el.find('.uploadProgress').css('width', '100%').removeClass('uploadError').addClass('uploadComplete');
    el.find('.progressPercent').html(' - 100%');
}
function uploadCanceled(e, i) {
    uploadFinished(e, i, 'error');
}
function uploadFinished(e, i, res) {
    var el = findUploadElement(i);
    var httpRes = null;
    try {
        httpRes = JSON.parse(e.target.responseText);
    }
    catch (ex) { }

    if ((httpRes && httpRes.res == 'error') || res != 'ok') {
        res = 'error';
        setUploadError(i);
    }
    else {
        res = 'ok';
        setUploadSuccess(i)
    }

    el.attr('data-ulpoad', res);
    checkUploadResult();
}
function checkUploadResult() {
    var all = $('#uploadFilesList .fileUpload').length;
    var completed = $('#uploadFilesList .fileUpload[data-ulpoad]').length;
    var success = $('#uploadFilesList .fileUpload[data-ulpoad="ok"]').length;
    if (completed == all) {
        //$('#uploadResult').html(success + ' files uploaded; '+(all - success)+' failed');
        uploadFileList = new Array();
        var d = Directory.Parse($('#hdDir').val());
        d.ListFiles(true);
        $('#btnUpload').button('disable');
    }
}
function fileUpload(f, i) {

    var fData = new FormData();
    var el = findUploadElement(i);
    el.find('.removeUpload').remove();
    fData.append("d", $('#hdDir').attr('value'));
    fData.append("fid", $('#hdDirID').attr('value'));
    fData.append("files", f);
    fData.append("type", $("#FileManagerType").val());

    var url = RoxyFilemanConf.UPLOAD;
    $.ajax(
        {
            xhr: function () {
                var xhr = new window.XMLHttpRequest();
                xhr.upload.addEventListener("progress", function (e) {
                    updateUploadProgress(e, i);
                }, false);
                xhr.upload.addEventListener("load", function (e) {
                    uploadComplete(e, i);
                }, false);
                xhr.upload.addEventListener("error", function (e) {
                    uploadError(e, i);
                }, false);
                xhr.upload.addEventListener("abort", function (e) {
                    uploadCanceled(e, i);
                }, false);
                return xhr;
            },
            url: url,
            data: fData,
            processData: false,
            contentType: false,
            type: "POST",
            success: function (data) {
                // console.log(data);
                fileUploaded(data.result);
            }
        }
    );


}
function dropFiles(e, append) {
    if (e && e.dataTransfer && e.dataTransfer.files) {
        addFile();
        if (append)
            addUploadFiles(e.dataTransfer.files);
        else
            listUploadFiles(e.dataTransfer.files);
    }
    else
        addFile();
}
function clearFileField(selector) {
    if (!selector)
        selector = '#fileUploads';
    try {
        $(selector).val('');
        $(selector).val(null);
    }
    catch (ex) { }
}
function addFileClick() {
    //$('#uploadResult').html('');
    $("#fileUploads").click();
    showUploadList(new Array());
    addFile();

}

function addFile() {
    clickFirstOnEnter('dlgAddFile');
    $('#uploadResult').html('');
    clearFileField();
    var dialogButtons = {};
    dialogButtons[t('Upload')] = {
        id: 'btnUpload', text: t('Upload'), disabled: true, click: function () {
            if (!$('#fileUploads').val() && (!uploadFileList || uploadFileList.length == 0))
                alert(t('E_SelectFiles'));
            else {
                if (!RoxyFilemanConf.UPLOAD) {
                    alert(t('E_ActionDisabled'));
                    //$('#dlgAddFile').dialog('close');
                }
                else {
                    if (window.FormData && window.XMLHttpRequest && window.FileList && uploadFileList && uploadFileList.length > 0) {
                        for (i = 0; i < uploadFileList.length; i++) {
                            fileUpload(uploadFileList[i], i);
                        }
                    }
                    else {
                        document.forms['addfile'].action = RoxyFilemanConf.UPLOAD;
                        document.forms['addfile'].submit();
                    }
                }
            }
        }
    };

    dialogButtons[t('Cancel')] = function () { $('#dlgAddFile').dialog('close'); };
    $('#dlgAddFile').dialog({ title: t('T_AddFile'), modal: true, buttons: dialogButtons, width: 400 });
}
function fileUploaded(res) {
    res = JSON.parse(res);
    if (res.res == 'ok' && res.msg) {
        $('#dlgAddFile').dialog('close');
        var d = Directory.Parse($('#hdDir').val());
        d.ListFiles(true);
        alert(res.msg);
    }
    else if (res.res == 'ok') {
        $('#dlgAddFile').dialog('close');
        var d = Directory.Parse($('#hdDir').val());
        d.ListFiles(true);
    }
    else
        alert(res.msg);
}
function renameDir() {
    var f = getSelectedDir();
    if (!f)
        return;
    if ($('[data-path="' + f.fullPath + '"]').parents('li').length < 1) {
        $.alert({
            title: 'Alert!',
            content: t('E_CannotRenameRoot')
        });
        return;
    }
    if (f.flock == "true") {
        $.alert({
            title: 'Alert!',
            content: t('E_CannotRenameFolder')
        });
        return;
    }

    clickFirstOnEnter('pnlDirName');
    $('#txtDirName').val(f.name);

    $.confirm({
        title: 'Rename Folder',
        content: '' +
            '<div class="form-group">' +
            //'<label>Enter Folder Name</label>' +
            '<input type="text" placeholder="Folder name" class="name form-control" required value="' + f.name + '"/>' +
            '</div>',
        buttons: {
            formSubmit: {
                text: 'Update',
                btnClass: 'btn-blue',
                action: function () {
                    var name = this.$content.find('.name').val();
                    if (!name) {
                        $.alert('provide a valid name');
                        return false;
                    }

                    $.confirm({
                        title: 'Warning!',
                        content: '<h6>Would you like to update any references to the content of this folder?</h6>',
                        type: 'red',
                        typeAnimated: true,
                        buttons: {
                            Yes: {
                                //text: 'Yes',
                                btnClass: 'btn-red',
                                action: function () {
                                    if (f.Rename(name)) {
                                        close;
                                    }
                                }
                            },
                            No: function () {
                            }
                        }
                    });
                }
            },
            cancel: function () {
                //close
            }
        },
        onContentReady: function () {

        }
    });

}
function renameFile() {
    var f = getSelectedFile();
    if (!f)
        return;
    clickFirstOnEnter('pnlRenameFile');
    $('#txtFileName').val(f.name);
    $.confirm({
        title: 'Rename File',
        content: '' +
            '<div class="form-group">' +
            '<input type="text" placeholder="Folder name" class="name form-control" required value="' + f.name + '"/>' +
            '</div>',
        buttons: {
            formSubmit: {
                text: 'Update',
                btnClass: 'btn-blue',
                action: function () {
                    var name = this.$content.find('.name').val();
                    if (!name) {
                        $.alert('provide a valid name');
                        return false;
                    }
                    $.confirm({
                        title: 'Warning!',
                        content: '<h6>Would you like to update all references to this image to reflect the new name?</h6>',
                        type: 'red',
                        typeAnimated: true,
                        buttons: {
                            Yes: {
                                //text: 'Yes',
                                btnClass: 'btn-red',
                                action: function () {
                                    if (f.Rename(name)) {
                                        $('li[data-path="' + f.fullPath + '"] .name').text(name);
                                        $('li[data-path="' + f.fullPath + '"]').attr('data-path', RoxyUtils.MakePath(f.path, name));
                                        close;
                                    }
                                }
                            },
                            No: function () {
                            }
                        }
                    });
                }
            },
            cancel: function () {
                //close
            }
        },
        onContentReady: function () {

        }
    });

    if (f.name.lastIndexOf('.') > 0)
        RoxyUtils.SelectText('txtFileName', 0, f.name.lastIndexOf('.'));
}
function getSelectedFile() {
    var ret = null;
    if ($('#pnlFileList .selected').length > 0) {
        ret = new File($('#pnlFileList .selected').attr('data-path'));
        ret.fid = $('#pnlFileList .selected').attr('data-fid');
        ret.height = $('#pnlFileList .selected').attr('data-h');
        ret.width = $('#pnlFileList .selected').attr('data-w');
    }
    return ret;
}
//function getSelectedFileId() {
//    var ret = null;
//    if ($('#pnlFileList .selected').length > 0)
//        //ret = new File($('#pnlFileList .selected').attr('data-path', 'data-fid'));
//        ret = new File($('#pnlFileList .selected').attr('data-fid'));
//    return ret;
//}
function getSelectedDir() {
    var ret = null;

    if ($('#pnlFileList .selected').length > 0) {
        ret = null;
        ret = Directory.Parse($('#pnlFileList .selected').attr('data-path'));
        ret.fid = $('#pnlFileList .selected').attr('data-fid');

        if (!ret) {
            var SelectDir = $('#pnlDirList .SelectDropDir');
            ret = Directory.Parse($(SelectDir).parent('li').attr('data-path'));
            ret.fid = $(SelectDir).parent('li').attr('data-fid');
            $(SelectDir).removeClass("SelectDropDir");
            if (!ret) {
                ret = Directory.Parse($('#pnlDirList .selected').closest('li').attr('data-path'));
            }
        }
    }
    else if ($('#pnlDirList .selected')) {
        ret = Directory.Parse($('#pnlDirList .selected').closest('li').attr('data-path'));
    }
    return ret;
}
function getSelectedId() {
    var ret = null;
    if ($('#pnlDirList .selected'))
        ret = Directory.Parse($('#pnlDirList .selected').closest('li').attr('data-fid'));
    return ret;
}
function deleteDir(path) {
    var d = null;
    if (path)
        d = Directory.Parse(path);
    else
        d = getSelectedDir();

    if (!d) {
        return;
    }
    if (d.flock == "true") {
        $.alert({
            title: 'Alert!',
            content: t('E_CannotDeleteFolder')
        });
        return;
    }

    var text = "<h6>Are you sure to delete this folder.</h6>";
    if (d) {
        $.confirm({
            title: 'Warning!',
            content: text,
            type: 'red',
            typeAnimated: true,
            buttons: {
                Yes: {
                    text: 'Yes',
                    btnClass: 'btn-red',
                    action: function () {
                        d.Delete();
                        true;
                    }
                },
                No: function () {
                }
            }
        });
    }

    //if (d && confirm(t('Q_DeleteFolder'))) {
    //    d.Delete();
    //}
}
// ************Context Menu for files Start**************

function contextByBtn(t, e) {
    var countLi = $("#pnlFileList").children("li.selected").length;
    if (countLi > 1) {
        e.stopPropagation();
        e.preventDefault();
        closeMenus('dir');
        //selectFile($(t).closest('li'));
        const origin = {
            left: e.pageX,
            top: e.pageY
        };
        setPositionAll(origin);
        return false;
    }
    else {
        e.stopPropagation();
        e.preventDefault();
        closeMenus('dir');
        selectFile($(t).closest('li'));
        const origin = {
            left: e.pageX,
            top: e.pageY
        };
        setPositionFile(origin);
        return false;
    }
}
var checkCon = $('#webpageIdText');
const setPositionFile = ({ top, left }) => {
    if (checkCon.length > 0) {
        left = Number(left) - 280;
        top = Number(top) - 80;
        $("#menuFile").css({ "left": `${left}px`, "top": `${top}px` });
    }
    else {
        $("#menuFile").css({ "left": `${left}px`, "top": `${top}px` });
    }
    if ($('#menuFile').css('display') === 'none') {
        $('#menuFile').css('display', 'block');
    }
    else {
        $('#menuFile').css('display', 'none');
    }
};

const setPositionAll = ({ top, left }) => {
    if (checkCon.length > 0) {
        left = Number(left) - 280;
        top = Number(top) - 80;
        $("#menuFileMulti").css({ "left": `${left}px`, "top": `${top}px` });
    }
    else {
        $("#menuFileMulti").css({ "left": `${left}px`, "top": `${top}px` });
    }
    if ($('#menuFileMulti').css('display') === 'none') {
        $('#menuFileMulti').css('display', 'block');
    }
    else {
        $('#menuFileMulti').css('display', 'none');
    }
};

// ************Context Menu for files End**************

// ************Context Menu for DIR Start**************

function contextDivByBtn(t, e) {
    e.stopPropagation();
    e.preventDefault();
    closeMenus('dir');
    console.log($(t));
    selectDir($(t).parent());
    //selectFile($(t).closest('li'));
    const origin = {
        left: e.pageX,
        top: e.pageY
    };
    setPositionDir(origin);
    return false;
}

const setPositionDir = ({ top, left }) => {
    if (checkCon.length > 0) {
        left = Number(left) - 280;
        top = Number(top) - 80;
        $("#menuDir").css({ "left": `${left}px`, "top": `${top}px` });
    }
    else {
        $("#menuDir").css({ "left": `${left}px`, "top": `${top}px` });
    }
    if ($('#menuDir').css('display') === 'none') {
        $('#menuDir').css('display', 'block');
    }
    else {
        $('#menuDir').css('display', 'none');
    }
};

// ************Context Menu for DIR End**************



function deleteFile() {
    var f = getSelectedFile();
    var text = "<h6>Are you sure you want to delete this file? All references to it will be broken.</h6>";
    if (f) {
        $.confirm({
            title: 'Warning!',
            content: text,
            type: 'red',
            typeAnimated: true,
            buttons: {
                Yes: {
                    text: 'Yes',
                    btnClass: 'btn-red',
                    action: function () {
                        f.Delete();
                    }
                },
                No: function () {
                }
            }
        });
    }
    //if (f && confirm(t('Q_DeleteFile'))) {
    //    f.Delete();
    //}
}

function deleteAllFile() {
    var text = "<h6>Are you sure you want to delete these files? All references to them will be broken.</h6>";
    $.confirm({
        title: 'Warning!',
        content: text,
        type: 'red',
        typeAnimated: true,
        buttons: {
            Yes: {
                text: 'Yes',
                btnClass: 'btn-red',
                action: function () {
                    var AllSelected = $("#pnlFileList").children("li.selected");
                    $(AllSelected).each(function () {
                        var f = new File($(this).closest('li').attr('data-path'));
                        f.fid = $(this).closest('li').attr('data-fid');
                        f.Delete();
                    });
                }
            },
            No: function () {
            }
        }
    });
}



function previewFile() {
    var f = getSelectedFile();
    if (f) {
        window.open(f.fullPath);
    }
}
function downloadFile() {
    var f = getSelectedFile();
    if (f && RoxyFilemanConf.DOWNLOAD) {
        var url = RoxyUtils.AddParam(RoxyFilemanConf.DOWNLOAD, 'f', f.fullPath);
        window.frames['frmUploadFile'].location.href = url;
    }
    else if (!RoxyFilemanConf.DOWNLOAD)
        alert(t('E_ActionDisabled'));
}

var imageEditor;
function editFile() {
    $("#editImageModal").modal('show');

    var f = getSelectedFile();
    var img = $('#pnlFileList .selected').find("img");

    imageEditor = new tui.ImageEditor('#tui-image-editor-container', {
        includeUI: {
            loadImage: {
                path: img.attr("src"),
                name: f.name
            },
            theme: blackTheme, // or whiteTheme
            initMenu: 'filter',
            menuBarPosition: 'bottom'
        }
    });

    window.onresize = function () {
        imageEditor.ui.resizeEditor();
    }
}

function downloadDir() {
    var d = getSelectedDir();
    if (d && RoxyFilemanConf.DOWNLOADDIR) {
        var url = RoxyUtils.AddParam(RoxyFilemanConf.DOWNLOADDIR, 'd', d.fullPath);
        window.frames['frmUploadFile'].location.href = url;
    }
    else if (!RoxyFilemanConf.DOWNLOAD)
        alert(t('E_ActionDisabled'));
}
function closeMenus(el) {
    if (!el || el == 'dir')
        $('#menuDir').fadeOut();
    if (!el || el == 'file') {
        $('#menuFile').fadeOut();
        $('#menuFileMulti').fadeOut();
    }

}
function selectFirst() {
    var item = $('#pnlDirList li:first').children('div').first();
    if (item.length > 0)
        selectDir(item);
    else
        window.setTimeout('selectFirst()', 300);
}
function tooltipContent() {
    if ($('#menuFile').is(':visible'))
        return '';
    var html = '';
    var f = File.Parse($(this).attr('data-path'));
    if ($('#hdViewType').val() == 'thumb' && f.IsImage()) {
        html = f.fullPath + '<br><span class="filesize">' + t('Size') + ': ' + RoxyUtils.FormatFileSize(f.size) + ' ' + t('Dimensions') + ': ' + f.width + 'x' + f.height + '</span>';
    }
    else if (f.IsImage()) {
        if (RoxyFilemanConf.GENERATETHUMB) {
            imgUrl = RoxyUtils.AddParam(RoxyFilemanConf.GENERATETHUMB, 'f', f.fullPath);
            imgUrl = RoxyUtils.AddParam(imgUrl, 'width', RoxyFilemanConf.PREVIEW_THUMB_WIDTH);
            imgUrl = RoxyUtils.AddParam(imgUrl, 'height', RoxyFilemanConf.PREVIEW_THUMB_HEIGHT);
        }
        else
            imgUrl = f.fullPath;
        html = '<img src="' + imgUrl + '" class="imgPreview"><br>' + f.name + ' <br><span class="filesize">' + t('Size') + ': ' + RoxyUtils.FormatFileSize(f.size) + ' ' + t('Dimensions') + ': ' + f.width + 'x' + f.height + '</span>';
    }
    else
        html = f.fullPath + ' <span class="filesize">' + t('Size') + ': ' + RoxyUtils.FormatFileSize(f.size) + '</span>';
    return html;
}
function filterFiles() {
    var str = $('#txtSearch').val();
    $('#pnlSearchNoFiles').hide();
    if ($('#pnlFileList li').length == 0)
        return;
    if (!str) {
        $('#pnlFileList li').show();
        return;
    }
    var i = 0;
    $('#pnlFileList li').each(function () {
        var name = $(this).children('.name').text();
        if (name.toLowerCase().indexOf(str.toLowerCase()) > -1) {
            i++;
            $(this).show();
        }
        else {
            $(this).removeClass('selected');
            $(this).hide();
        }
    });
    if (i == 0)
        $('#pnlSearchNoFiles').show();
}
function sortFiles() {
    var d = getSelectedDir();
    if (!d)
        return;
    d.ListFiles();
    filterFiles();
    switchView($('#hdViewType').val());
}

function sortFilesByLabel(e) {
    var SelectValue = "";
    var MainSelect = $('#ddlOrder').val();
    if (e === "name") {
        MainSelect === "name" ? SelectValue = "name_desc" : SelectValue = "name";
    }
    else if (e === "size") {
        MainSelect === "size" ? SelectValue = "size_desc" : SelectValue = "size";
    }
    else if (e === "time") {
        MainSelect === "time" ? SelectValue = "time_desc" : SelectValue = "time";
    }

    //console.log($('#ddlOrder').val());
    $('#ddlOrder').val(SelectValue).trigger('change');
}
function getAWSLink() {
    $.ajax({
        url: "/api/services/app/AWS/GetUrl"
    }).done(function (data) {
        awsUrl = data.result;
    });
}

function switchView(t) {
    if (t == $('#hdViewType').val())
        return;
    if (!t)
        t = $('#hdViewType').val();
    $('.btnView').removeClass('selected');
    if (t == 'thumb') {
        //$('#pnlFileList .icon').attr('class', 'icon fa fa-file');
        $('#pnlFileList').addClass('thumbView');
        if ($('#dynStyle').length == 0) {
            $('head').append('<style id="dynStyle" />');
            var rules = 'ul#pnlFileList.thumbView li{width:' + RoxyFilemanConf.THUMBS_VIEW_WIDTH + 'px;}';
            rules += 'ul#pnlFileList.thumbView li{height:' + (parseInt(RoxyFilemanConf.THUMBS_VIEW_HEIGHT) + 20) + 'px;}';
            rules += 'ul#pnlFileList.thumbView .icon{width:' + RoxyFilemanConf.THUMBS_VIEW_WIDTH + 'px;}';
            rules += 'ul#pnlFileList.thumbView .icon{height:' + RoxyFilemanConf.THUMBS_VIEW_HEIGHT + 'px;}';
            $('#dynStyle').html(rules);
        }
        $('#pnlFileList li').each(function () {
            $(this).children('.deleteFileBtn').addClass('deleteFileBtnThum');
            var mainImg = $(this);
            var imgUrl = $(this).attr('data-path');
            if (RoxyUtils.IsImage($(this).attr('data-path'))) {
                var url = "";
                url = imgUrl.replace("/wwwroot/AppData", awsUrl + "");
                mainImg.children('img').css("display", "inline");
                mainImg.children('img').attr("src", url).css("width", "99%").css("height", "80%");
                mainImg.children('.icon').css("visibility", "hidden");
            }
            else {
                $(this).children('.icon').css("font-size", "80px");
            }
            $(".HeaderAction").find("span").css("visibility", "hidden");
            $(".HeaderAction").css("border-bottom", "");
        });
        $('#btnThumbView').addClass('selected');
    }
    else {
        $('#pnlFileList').removeClass('thumbView');
        $('#pnlFileList img').css('display', 'none');
        $('#pnlFileList li').each(function () {
            $(this).children('.deleteFileBtn').removeClass('deleteFileBtnThum');
            $(this).children('.icon').css("font-size", "");
            $(".HeaderAction").find("span").css("visibility", "");
            $(".HeaderAction").css("border-bottom", "solid 1px #dddddd");
            $(this).children('img').css("display", "none");
            $(this).children('.icon').css("visibility", "visible");
            $(this).children('img').attr("src", "").css("width", "").css("height", "");
        });
        $('#btnListView').addClass('selected');
    }
    $('#hdViewType').val(t);
    RoxyUtils.SetCookie('roxyview', t, 10);
}
var clipBoard = null;
var filesOperation = null;
var AllSelectedFile = null;
function Clipboard(a, obj) {
    this.action = a;
    this.obj = obj;
}
function cutDir() {
    var d = getSelectedDir();
    if (d) {
        setClipboard('cut', d);
        d.GetElement().addClass('pale');
    }
}
function copyDir() {
    var d = getSelectedDir();
    if (d) {
        setClipboard('copy', d);
    }
}
function cutFile() {
    var f = getSelectedFile();
    if (f) {
        setClipboard('cut', f);
        f.GetElement().addClass('pale');
    }
}
function propertyOfFile() {
    var f = getSelectedFile();
    return f;
}
function copyFile() {
    var f = getSelectedFile();
    if (f) {
        setClipboard('copy', f);
    }
}

function copyAllFile() {
    var countLi = $("#pnlFileList").children("li.selected").length;
    if (countLi > 1) {
        filesOperation = "copy";
        AllSelectedFile = $("#pnlFileList").children("li.selected");
        $('.paste').removeClass('pale');
    }
}

function cutAllFile() {
    var countLi = $("#pnlFileList").children("li.selected").length;
    if (countLi > 1) {
        filesOperation = "move";
        AllSelectedFile = $("#pnlFileList").children("li.selected");
        $(AllSelectedFile).each(function () {
            $(this).addClass('pale');
        });
        $('.paste').removeClass('pale');
    }
}



function pasteToFiles(e, el) {
    if ($(el).hasClass('pale')) {
        e.stopPropagation();
        return false;
    }
    var d = getSelectedDir();
    if (!d)
        d = Directory.Parse($('#pnlDirList li:first').children('div').first());
    var countLi = $("#pnlFileList").children("li.selected").length;
    if (countLi > 1) {
        if (filesOperation == "copy") {
            //console.log(AllSelectedFile);
            var DragSelected = AllSelectedFile;
            $(DragSelected).each(function () {
                var f = new File($(this).closest('li').attr('data-path'));
                f.fid = $(this).closest('li').attr('data-fid');
                //console.log(f);
                a = f.CopyAll(d.fullPath, d);
                //console.log(a);
            });
        }
    }
    else {
        if (d && clipBoard && clipBoard.obj) {
            if (clipBoard.action == 'copy')
                clipBoard.obj.Copy(d.fullPath);
            else {

                $.confirm({
                    title: 'Warning!',
                    content: '<h6>Would you like to update all references to this file to reflect the new location?</h6>',
                    type: 'red',
                    typeAnimated: true,
                    buttons: {
                        Yes: {
                            btnClass: 'btn-red',
                            action: function () {
                                clipBoard.obj.Move(d.fullPath);
                                clearClipboard();
                            }
                        },
                        No: function () {
                        }
                    }
                });
            }
        }
    }
    return true;
}
function pasteToDirs(e, el) {
    var check = checkGalleryMainFolder();
    if (!check) {
        return false;
    }

    if ($(el).hasClass('pale')) {
        e.stopPropagation();
        return false;
    }
    var d = getSelectedDir();
    if (!d)
        d = Directory.Parse($('#pnlDirList li:first').children('div').first());
    var countLi = 0;
    if (AllSelectedFile != null) {
        countLi = AllSelectedFile.length;
    }
    if (countLi > 1) {
        if (filesOperation == "copy") {
            // console.log(AllSelectedFile);
            var CopySelected = AllSelectedFile;
            $(CopySelected).each(function () {
                var f = new File($(this).closest('li').attr('data-path'));
                f.fid = $(this).closest('li').attr('data-fid');
                //console.log(f);
                a = f.CopyAll(d.fullPath, d);
                //console.log(a);
            });
        }
        else {
            $.confirm({
                title: 'Warning!',
                content: '<h6>Would you like to update all references to this files to reflect the new location?</h6>',
                type: 'red',
                typeAnimated: true,
                buttons: {
                    Yes: {
                        btnClass: 'btn-red',
                        action: function () {
                            var MoveSelected = AllSelectedFile;
                            $(MoveSelected).each(function () {
                                var f = new File($(this).closest('li').attr('data-path'));
                                f.fid = $(this).closest('li').attr('data-fid');
                                //console.log(f);
                                a = f.MoveAll(d.fullPath, d);
                                //console.log(a);
                            });
                        }
                    },
                    No: function () {
                    }
                }
            });
        }
    }
    else {

        if (clipBoard && d) {
            if (clipBoard.action == 'copy')
                clipBoard.obj.Copy(d.fullPath);
            else {

                $.confirm({
                    title: 'Warning!',
                    content: '<h6>Would you like to update all references to this file to reflect the new location?</h6>',
                    type: 'red',
                    typeAnimated: true,
                    buttons: {
                        Yes: {
                            btnClass: 'btn-red',
                            action: function () {
                                clipBoard.obj.Move(d.fullPath);
                                clearClipboard();
                                d.ListFiles(true);
                            }
                        },
                        No: function () {
                        }
                    }
                });
            }
        }
        else
            alert('error');
    }
    return true;
}
function clearClipboard() {
    $('#pnlDirList li').removeClass('pale');
    $('#pnlFileList li').removeClass('pale');
    clipBoard = null;
    $('.paste').addClass('pale');
}
function setClipboard(a, obj) {
    clearClipboard();
    if (obj) {
        clipBoard = new Clipboard(a, obj);
        $('.paste').removeClass('pale');
    }
}
function ResizeLists() {
    var tmp = $(window).innerHeight() - $('#fileActions .actions').outerHeight() - $('.bottomLine').outerHeight();
    $('.scrollPane').css('height', tmp);
}
function removeDisabledActions() {
    if (RoxyFilemanConf.CREATEDIR == '') {
        $('#mnuCreateDir').next().remove();
        $('#mnuCreateDir').remove();
        $('#btnAddDir').remove();
    }
    if (RoxyFilemanConf.DELETEDIR == '') {
        $('#mnuDeleteDir').prev().remove();
        $('#mnuDeleteDir').remove();
        $('#btnDeleteDir').remove();
    }
    if (RoxyFilemanConf.MOVEDIR == '') {
        $('#mnuDirCut').next().remove();
        $('#mnuDirCut').remove();
    }
    if (RoxyFilemanConf.COPYDIR == '') {
        $('#mnuDirCopy').next().remove();
        $('#mnuDirCopy').remove();
    }
    if (RoxyFilemanConf.COPYDIR == '' && RoxyFilemanConf.MOVEDIR == '') {
        $('#mnuDirPaste').next().remove();
        $('#mnuDirPaste').remove();
    }
    if (RoxyFilemanConf.RENAMEDIR == '') {
        $('#mnuRenameDir').next().remove();
        $('#mnuRenameDir').remove();
        $('#btnRenameDir').remove();
    }
    if (RoxyFilemanConf.UPLOAD == '') {
        $('#btnAddFile').remove();
    }
    if (RoxyFilemanConf.DOWNLOAD == '') {
        $('#mnuDownload').next().remove();
        $('#mnuDownload').remove();
    }
    if (RoxyFilemanConf.DOWNLOADDIR == '') {
        $('#mnuDownloadDir').next().remove();
        $('#mnuDownloadDir').remove();
    }
    if (RoxyFilemanConf.DELETEFILE == '') {
        $('#mnuDeleteFile').prev().remove();
        $('#mnuDeleteFile').remove();
        $('#btnDeleteFile').remove();
    }
    if (RoxyFilemanConf.MOVEFILE == '') {
        $('#mnuFileCut').next().remove();
        $('#mnuFileCut').remove();
    }
    if (RoxyFilemanConf.COPYFILE == '') {
        $('#mnuFileCopy').next().remove();
        $('#mnuFileCopy').remove();
    }
    if (RoxyFilemanConf.COPYFILE == '' && RoxyFilemanConf.MOVEFILE == '') {
        $('#mnuFilePaste').next().remove();
        $('#mnuFilePaste').remove();
    }
    if (RoxyFilemanConf.RENAMEFILE == '') {
        $('#mnuRenameFile').next().remove();
        $('#mnuRenameFile').remove();
        $('#btnRenameFile').remove();
    }
}
function getPreselectedFile() {
    var filePath = RoxyUtils.GetUrlParam('selected');
    if (!filePath) {
        switch (getFilemanIntegration()) {
            case 'ckeditor':
                try {
                    var dialog = window.opener.CKEDITOR.dialog.getCurrent();
                    filePath = dialog.getValueOf('info', (dialog.getName() == 'link' ? 'url' : 'txtUrl'));
                }
                catch (ex) { }
                break;
            case 'tinymce3':
                try {
                    var win = tinyMCEPopup.getWindowArg("window");
                    filePath = win.document.getElementById(tinyMCEPopup.getWindowArg("input")).value;
                    if (filePath.indexOf('..') == 0)
                        filePath = filePath.substr(2);
                }
                catch (ex) { }
                break;
            case 'tinymce4':
                try {
                    var win = (window.opener ? window.opener : window.parent);
                    filePath = win.document.getElementById(RoxyUtils.GetUrlParam('input')).value;
                    if (filePath.indexOf('..') == 0)
                        filePath = filePath.substr(2);
                }
                catch (ex) { }
                break;
            default:
                filePath = GetSelectedValue();
                break;
        }
    }
    if (RoxyFilemanConf.RETURN_URL_PREFIX) {
        var prefix = RoxyFilemanConf.RETURN_URL_PREFIX;
        if (filePath.indexOf(prefix) == 0) {
            if (prefix.substr(-1) == '/')
                prefix = prefix.substr(0, prefix.length - 1);
            filePath = filePath.substr(prefix.length);
        }
    }

    return filePath;
}
function initSelection(filePath) {
    var hasSelection = false, fileSelected = true;
    if (!filePath)
        filePath = getPreselectedFile();
    if (!filePath && RoxyUtils.ToBool(RoxyFilemanConf.OPEN_LAST_DIR)) {
        filePath = getLastDir();
        fileSelected = false;
    }
    if (filePath) {
        var p = (fileSelected ? RoxyUtils.GetPath(filePath) : filePath);
        var d = tmp = Directory.Parse(p);
        do {
            if (tmp) {
                tmp.Expand(true);
                hasSelection = true;
            }
            tmp = Directory.Parse(tmp.path);
        } while (tmp);

        if (d) {
            d.Select(filePath);
            hasSelection = true;
        }
    }
    if (!hasSelection)
        selectFirst();
}
$(function () {
    RoxyUtils.LoadConfig();
    abp.event.on('app.triggerConfigLoad', function () {

        var d = new Directory();
        d.LoadAll();
        $('#wraper').show();

        window.setTimeout('initSelection()', 100);

        RoxyUtils.Translate();
        $('body').click(function () {
            closeMenus();
        });

        var viewType = RoxyUtils.GetCookie('roxyview');
        if (!viewType)
            viewType = RoxyFilemanConf.DEFAULTVIEW;
        if (viewType)
            switchView(viewType);

        ResizeLists();
        $(".actions input").tooltip({ track: true });
        $(window).resize(ResizeLists);

        document.oncontextmenu = function () { return false; };
        removeDisabledActions();
        $('#copyYear').html(new Date().getFullYear());
        if (RoxyFilemanConf.UPLOAD && RoxyFilemanConf.UPLOAD != '') {
            var dropZone = document.getElementById('fileActions');
            dropZone.ondragover = function () {
                //$("#testa").css('visibility', 'visible');
                return false;
            };
            dropZone.ondragend = function () {
                // $("#testa").css('visibility', 'hidden');
                //DeleteDropZone();
                return false;
            };
            dropZone.ondragenter = function () {
                var check = checkGalleryMainFolder();
                if (!check) {
                    return false;
                }

                CreateDropZone();
                //$("#testa").css('visibility', 'visible');
                //alert("Enter");
                return false;
            };
            dropZone.ondragleave = function () {
                //alert("Leave");
                //DeleteDropZone();
                //$("#testa").css('visibility', 'hidden');
                return false;
            };
            dropZone.ondrop = function (e) {
                //DeleteDropZone();
                //e.preventDefault();
                //e.stopPropagation();
                //dropFiles(e);.
                return false;
            };

            //dropZone = document.getElementById('dlgAddFile');
            //dropZone.ondragover = function () {

            //    return false;
            //};
            //dropZone.ondragenter = function () {
            //    //$("#testa").css('visibility', 'visible');
            //    alert("Enter");
            //    return false;
            //};
            //dropZone.ondragleave = function () {
            //    alert("Leave");
            //    //$("#testa").css('visibility', 'hidden');
            //    return false;
            //};
            //dropZone.ondragend = function () {

            //    return false;
            //};
            //dropZone.ondrop = function (e) {
            //    e.preventDefault();
            //    e.stopPropagation();
            //    dropFiles(e, true);
            //};
        }

        if (getFilemanIntegration() == 'tinymce3') {
            try {
                $('body').append('<script src="js/tiny_mce_popup.js"><\/script>');
            }
            catch (ex) { }
        }
    });
});

function CreateDropZone() {
    //$("#DropZoneLabel").css('visibility', 'visible');
    //$("#DropZoneID").children("div").addClass("disabledbutton");
    //$("#DropZoneID").addClass("dropZone");
    //$("#dropzoneCont").css('visibility', 'visible');
    $("#uploadModal").modal('show');
}
function DeleteDropZone() {
    //$("#DropZoneLabel").css('visibility', 'hidden');
    //$("#DropZoneID").children("div").removeClass("disabledbutton");
    //$("#DropZoneID").removeClass("dropZone");
    //$("#dropzoneCont").css('visibility', 'hidden');

    $("#uploadModal").modal('hide');
}

function getFilemanIntegration() {
    var integration = RoxyUtils.GetUrlParam('integration');
    if (!integration)
        integration = RoxyFilemanConf.INTEGRATION;

    return integration.toLowerCase();
}
function setFile() {
    var f = getSelectedFile();
    if (!f) {
        alert(t('E_NoFileSelected'));
        return;
    }
    var insertPath = f.fullPath;
    if (RoxyFilemanConf.RETURN_URL_PREFIX) {
        var prefix = RoxyFilemanConf.RETURN_URL_PREFIX;
        if (prefix.substr(-1) == '/')
            prefix = prefix.substr(0, prefix.length - 1);
        insertPath = prefix + (insertPath.substr(0, 1) !== '/' ? '/' : '') + insertPath;
    }
    //console.log(f.type);
    if (f.type === 'image') {
        $.ajax({
            url: "/api/services/app/AWS/GetUrl"
        }).done(function (data) {
            console.log(data.result);
            var modal = document.getElementById('myModal');
            // Get the image and insert it inside the modal - use its "alt" text as a caption
            var mode = Number(f.width) > Number(f.height) ? 2 : 1;
            if (mode === 2) {
                $("#myModal").removeAttr("style");
                $("#myModal").css({ 'display': 'block' });
            }
            else {
                $("#myModal").removeAttr("style");
                $("#myModal").css({ 'display': 'block', 'top': '0%', 'bottom': '2%', 'right': '30%', 'left': '30%' });
            }

            var modalImg = document.getElementById("img01");
            var captionText = document.getElementById("caption");
            var span = document.getElementsByClassName("close")[0];
            // When the user clicks on <span> (x), close the modal
            span.onclick = function () {
                $("#myModal").modal('hide');
            };
            url = insertPath.replace("/wwwroot/AppData", data.result + "");
            modal.style.display = "block";
            modalImg.src = url;
            captionText.innerHTML = f.name;
        });

    }


}

function AlertConfirmMsg(text) {
    var result = false;
    $.confirm({
        title: 'Warning!',
        content: text,
        type: 'red',
        typeAnimated: true,
        buttons: {
            Yes: {
                text: 'Yes',
                btnClass: 'btn-red',
                action: function () {
                    result = true;
                }
            },
            No: function () {
            }
        }
    });
    return result;
}

function checkGalleryMainFolder() {
    var d = getSelectedDir();
    console.log("Gallery", d);
    if (d) {
        var isGallery = false;
        var str1 = d.fullPath;
        var str2 = "/Images/Galleries";
        if (str1.indexOf(str2) != -1) {
            isGallery = true;
        }
        if (d.flock == "true" && d.subfolder == "false" && d.name == "Galleries" && isGallery) {
            abp.message.warn('Images cannot be uploaded here‌');
            closeMenus();
            return false;
        }
        else {
            return true;
        }
    }
}