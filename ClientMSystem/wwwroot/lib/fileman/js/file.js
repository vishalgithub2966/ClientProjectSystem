
function File(filePath, fileSize, modTime, w, h, fid) {
    this.fullPath = filePath;
    this.type = RoxyUtils.GetFileType(filePath);
    this.name = RoxyUtils.GetFilename(filePath);
    this.ext = RoxyUtils.GetFileExt(filePath);
    this.path = RoxyUtils.GetPath(filePath);
    this.icon = RoxyUtils.GetFileIcon(filePath);
    this.faClass = RoxyUtils.FileIconClass(filePath);
    this.bigIcon = this.faClass;
    this.image = filePath;
    this.size = (fileSize ? fileSize : fileSize == undefined ? 0 : RoxyUtils.GetFileSize(filePath)); 
    this.time = modTime;
    this.width = (w ? w : 0);
    this.height = (h ? h : 0);
    this.fid = fid;
    this.Show = function () {
        html = '<li data-path="' + this.fullPath + '" data-time="' + this.time + '" data-w="' + this.width + '" data-h="' + this.height + '" data-size="' + this.size + '" data-icon-big="' + this.bigIcon + '" data-fid ="' + this.fid + '" title="' + this.name + '">'; //'" data-icon="' + this.icon +    
        html += '<img src=""' + 'class="" style="display:none">';
        html += '<a href="javascript:;" class="deleteFileBtn" onclick="contextByBtn(this,event)"><i class="fa fa-cog"></i></a>';
        html += '<span class="icon fa fa-file-' + this.faClass + '">' + "" + '</span>';
        html += '<span class="time">' + moment(RoxyUtils.FormatDate(new Date(this.time * 1000)), "mm-d-yyyy")  + '</span>';
        html += '<span class="name">' + this.name + '</span>';
        html += '<span class="size">' + RoxyUtils.FormatFileSize(this.size) + '</span>';
        html += '</li>';
        $('#pnlFileList').append(html);
        var li = $("#pnlFileList li:last");
        if (RoxyFilemanConf.MOVEFILE) {
            li.draggable({helper:makeDragFile,start:startDragFile,cursorAt: { left: 10 ,top:10},delay:200});
        }
        li.click(function (e) {
            if (e.ctrlKey) {
                if ($(this).hasClass("selected")) {
                    $(this).removeClass("selected");
                }
                else {
                    $(this).addClass("selected");
                }
                
            }
            else {
                selectFile(this);
            }
            
        });        

        li.dblclick(function (e) {
            selectFile(this);
            setFile();
        });
        li.tooltip({ show: { delay: 700 }, track: true, content: tooltipContent });

        li.bind('contextmenu', function (e) {
            var countLi = $("#pnlFileList").children("li.selected").length;
            if (countLi > 1) {
                os = li.offset();
                //console.log(os.top + " and " + os.left);
                e.stopPropagation();
                e.preventDefault();
                closeMenus('dir');
                //selectFile(this);
                $(this).tooltip({
                    hide: { effect: "explode", duration: 1000 }
                });

                const origin = {
                    left: e.pageX,
                    top: e.pageY
                };
                setPositionAll(origin);
                return false;


                //console.log(countLi);
            }
            else {
                os = li.offset();
                //console.log(os.top + " and " + os.left);
                e.stopPropagation();
                e.preventDefault();
                closeMenus('dir');
                selectFile(this);
                $(this).tooltip({
                    hide: { effect: "explode", duration: 1000 }
                });

                const origin = {
                    left: e.pageX,
                    top: e.pageY
                };
                setPositionFile(origin);
                return false;
            }
        });
    };
    this.GetElement = function () {
        return $('li[data-path="' + this.fullPath + '"]');
    };
    this.IsImage = function () {
        var ret = false;
        if (this.type == 'image')
            ret = true;
        return ret;
    };
    this.Delete = function () {
        if (!RoxyFilemanConf.DELETEFILE) {
            alert(t('E_ActionDisabled'));
            return;
        }
        var deleteUrl = RoxyUtils.AddParam(RoxyFilemanConf.DELETEFILE, 'f', this.fullPath);
        deleteUrl = RoxyUtils.AddParam(RoxyFilemanConf.DELETEFILE, 'id', this.fid);
        var item = this;
        $.ajax({
            url: deleteUrl,
            type: 'POST',
            data: { f: this.fullPath, id: this.fid },
            dataType: 'json',
            success: function (data) {
                if (data.res.toLowerCase() == 'ok') {
                    $('li[data-path="' + item.fullPath + '"]').remove();
                    var d = Directory.Parse(item.path);
                    if (d) {
                        d.files--;
                        d.Update();
                        d.SetStatusBar();
                        abp.notify.info("Successfully Deleted");
                    }
                }
                else {

                    $.alert({
                        title: 'Alert!',
                        content: "<h6>" + data.msg + "</h6>"
                    });
                    //alert(data.msg);
                }
            },
            error: function (data) {
                $.alert({
                    title: 'Alert!',
                    content: (t('E_LoadingAjax') + ' ' + deleteUrl)
                });
                //alert(t('E_LoadingAjax') + ' ' + deleteUrl);
            }
        });
    };
    this.Rename = function (newName) {
        if (!RoxyFilemanConf.RENAMEFILE) {
            alert(t('E_ActionDisabled'));
            return false;
        }
        if (!newName)
            return false;
        var url = RoxyUtils.AddParam(RoxyFilemanConf.RENAMEFILE, 'f', this.fullPath);
        url = RoxyUtils.AddParam(url, 'n', newName);
        url = RoxyUtils.AddParam(url, 'id', this.fid);
        var item = this;
        var ret = false;
        $.ajax({
            url: url,
            type: 'POST',
            data: { f: this.fullPath, n: newName, id: this.fid },
            dataType: 'json',
            async: true,
            success: function (data) {
                if (data.res.toLowerCase() === 'ok') {
                    var newPath = RoxyUtils.MakePath(this.path, newName);
                    $('li[data-path="' + item.fullPath + '"] .icon').attr('src', RoxyUtils.GetFileIcon(newName));
                    $('li[data-path="' + item.fullPath + '"] .name').text(newName);
                    $('li[data-path="' + newPath + '"]').attr('data-path', newPath);
                    ret = true;
                }
                if (data.msg)
                    //alert(data.msg);
                    $.alert({
                        title: 'Alert!',
                        content: "<h6>" + data.msg + "</h6>"
                    });
            },
            error: function (data) {
                alert(t('E_LoadingAjax') + ' ' + url);
            }
        });
        return ret;
    };
    this.Copy = function (newPath) {
        if (!RoxyFilemanConf.COPYFILE) {
            alert(t('E_ActionDisabled'));
            return;
        }
        var SelectedDir = getSelectedDir();
        //console.log(SelectedDir.fid);

        var url = RoxyUtils.AddParam(RoxyFilemanConf.COPYFILE, 'f', this.fullPath);
        url = RoxyUtils.AddParam(url, 'n', newPath);
        url = RoxyUtils.AddParam(url, 'fileId', this.fid);
        url = RoxyUtils.AddParam(url, 'fid', SelectedDir.fid);
        var item = this;
        var ret = false;
        $.ajax({
            url: url,
            type: 'POST',
            data: { f: this.fullPath, n: newPath, fileId: this.fid, fid: SelectedDir.fid },
            dataType: 'json',
            async: true,
            success: function (data) {
                if (data.res.toLowerCase() == 'ok') {
                    var d = Directory.Parse(newPath);
                    if (d) {
                        d.files++;
                        d.Update();
                        d.SetStatusBar();
                        d.ListFiles(true);
                    }
                    ret = true;
                }
                if (data.msg)
                    //alert(data.msg);
                    $.alert({
                        title: 'Alert!',
                        content: "<h6>" + data.msg + "</h6>"
                    });
            },
            error: function (data) {
                alert(t('E_LoadingAjax') + ' ' + url);
            }
        });
        return ret;
    };


    this.CopyAll = function (newPath, SelectedDir) {
        if (!RoxyFilemanConf.COPYFILE) {
            alert(t('E_ActionDisabled'));
            return;
        }
        //var SelectedDir = getSelectedDir();
        //console.log(SelectedDir.fid);

        var url = RoxyUtils.AddParam(RoxyFilemanConf.COPYFILE, 'f', this.fullPath);
        url = RoxyUtils.AddParam(url, 'n', newPath);
        url = RoxyUtils.AddParam(url, 'fileId', this.fid);
        url = RoxyUtils.AddParam(url, 'fid', SelectedDir.fid);
        var item = this;
        var ret = false;
        $.ajax({
            url: url,
            type: 'POST',
            data: { f: this.fullPath, n: newPath, fileId: this.fid, fid: SelectedDir.fid },
            dataType: 'json',
            async: true,
            success: function (data) {
                if (data.res.toLowerCase() == 'ok') {
                    var d = Directory.Parse(newPath);
                    if (d) {
                        d.files++;
                        d.Update();
                        d.SetStatusBar();
                        d.ListFiles(true);
                    }
                    ret = true;
                }
                if (data.msg)
                    //alert(data.msg);
                    $.alert({
                        title: 'Alert!',
                        content: "<h6>" + data.msg + "</h6>"
                    });
            },
            error: function (data) {
                alert(t('E_LoadingAjax') + ' ' + url);
            }
        });
        return ret;
    };



    this.Move = function (newPath) {       
        if (!RoxyFilemanConf.MOVEFILE) {
            alert(t('E_ActionDisabled'));
            return;
        }
        var SelectedDir = getSelectedDir();
        newFullPath = newPath;//RoxyUtils.MakePath(newPath, this.name);
        var url = RoxyUtils.AddParam(RoxyFilemanConf.MOVEFILE, 'f', this.fullPath);
        url = RoxyUtils.AddParam(url, 'n', newFullPath);
        url = RoxyUtils.AddParam(url, 'folderId', SelectedDir.fid);
        url = RoxyUtils.AddParam(url, 'fid', this.fid);
        var item = this;
        var ret = false;
        $.ajax({            
            url: url,
            type: 'POST',
            data: { f: this.fullPath, n: newFullPath, folderId: SelectedDir.fid, fid: this.fid },
            dataType: 'json',
            async: true,
            success: function (data) {
                if (data.res.toLowerCase() == 'ok') {
                    $('li[data-path="' + item.fullPath + '"]').remove();
                    var d = Directory.Parse(item.path);
                    if (d) {
                        d.files--;
                        d.Update();
                        d.SetStatusBar();
                        d = Directory.Parse(newPath);
                        d.files++;
                        d.Update();
                    }
                    selectDir($("#pnlFileList").attr("data-path", newPath));
                    ret = true;
                }
                if (data.msg) {
                    //alert(data.msg);
                    $.alert({
                        title: 'Alert!',
                        content: "<h6>" + data.msg + "</h6>"
                    });                   
                }
            },
            error: function (data) {
                alert(t('E_LoadingAjax') + ' ' + url);
            }
        });
        return ret;
    };


    this.MoveChild = function (dir) {
        if (!RoxyFilemanConf.MOVEFILE) {
            alert(t('E_ActionDisabled'));
            return;
        }
        var SelectedDir = getSelectedDir();
        newFullPath = RoxyUtils.MakePath(dir.fullPath, this.name);
        var url = RoxyUtils.AddParam(RoxyFilemanConf.MOVEFILE, 'f', this.fullPath);
        url = RoxyUtils.AddParam(url, 'n', newFullPath);
        url = RoxyUtils.AddParam(url, 'folderId', dir.fid);
        url = RoxyUtils.AddParam(url, 'fid', this.fid);
        var item = this;
        var ret = false;
        $.ajax({
            url: url,
            type: 'POST',
            data: { f: this.fullPath, n: newFullPath, folderId: dir.fid, fid: this.fid },
            dataType: 'json',
            async: true,
            success: function (data) {
                if (data.res.toLowerCase() == 'ok') {
                    $('li[data-path="' + item.fullPath + '"]').remove();
                    var d = Directory.Parse(item.path);
                    if (d) {
                        d.files--;
                        d.Update();
                        d.SetStatusBar();
                        d = Directory.Parse(dir.fullPath);
                        d.files++;
                        d.Update();
                    }
                    selectDir($("#pnlFileList").attr("data-path", dir.fullPath));
                    ret = true;
                }
                if (data.msg) {
                    //alert(data.msg);
                    $.alert({
                        title: 'Alert!',
                        content: "<h6>" + data.msg + "</h6>"
                    });
                }
            },
            error: function (data) {
                alert(t('E_LoadingAjax') + ' ' + url);
            }
        });
        return ret;
    };



    this.MoveAll = function (newPath, SelectedDir) {
        if (!RoxyFilemanConf.MOVEFILE) {
            alert(t('E_ActionDisabled'));
            return;
        }        
        newFullPath = RoxyUtils.MakePath(newPath, this.name);
        var url = RoxyUtils.AddParam(RoxyFilemanConf.MOVEFILE, 'f', this.fullPath);
        url = RoxyUtils.AddParam(url, 'n', newFullPath);
        url = RoxyUtils.AddParam(url, 'folderId', SelectedDir.fid);
        url = RoxyUtils.AddParam(url, 'fid', this.fid);
        var item = this;
        var ret = false;
        $.ajax({
            url: url,
            type: 'POST',
            data: { f: this.fullPath, n: newFullPath, folderId: SelectedDir.fid, fid: this.fid },
            dataType: 'json',
            async: true,
            success: function (data) {
                if (data.res.toLowerCase() == 'ok') {  
                    $('li[data-path="' + item.fullPath + '"]').remove();
                    var d = Directory.Parse(item.path);
                    if (d) {
                        d.files--;
                        d.Update();
                        d.SetStatusBar();
                        d = Directory.Parse(newPath);
                        d.files++;
                        d.Update();
                    }

                    selectDir($("#pnlFileList").attr("data-path", newPath));
                    ret = true;
                }
                if (data.msg) {
                    //alert(data.msg);
                    $.alert({
                        title: 'Alert!',
                        content: "<h6>" + data.msg + "</h6>"
                    });
                }
            },
            error: function (data) {
                alert(t('E_LoadingAjax') + ' ' + url);
            }
        });
        return ret;
    };


    const fileMenuAll = document.querySelector("#menuFileMulti");
    const fileMenu = document.querySelector("#menuFile");
    let menuVisibleAll = false;
    let menuVisible = false;

    const toggleMenuAll = command => {
        fileMenuAll.style.display = command === "show" ? "block" : "none";
        menuVisibleAll = !menuVisibleAll;
    };

    const toggleMenu = command => {
        fileMenu.style.display = command === "show" ? "block" : "none";
        menuVisible = !menuVisible;
    };

    var checkCon = $('#webpageIdText');
    const setPositionAll = ({ top, left }) => {        
        if (checkCon.length > 0) {
            left = Number(left) - 280;
            top = Number(top) - 80;
            fileMenuAll.style.left = `${left}px`;
            fileMenuAll.style.top = `${top}px`;
        }
        else {
            fileMenuAll.style.left = `${left}px`;
            fileMenuAll.style.top = `${top}px`;
        }
        toggleMenuAll("show");
    };

    const setPositionFile = ({ top, left }) => {
        if (checkCon.length > 0) {
            left = Number(left) - 280;
            top = Number(top) - 80;
            fileMenu.style.left = `${left}px`;
            fileMenu.style.top = `${top}px`;
        }
        else {
            fileMenu.style.left = `${left}px`;
            fileMenu.style.top = `${top}px`;
        }
        toggleMenu("show");
    };


    window.addEventListener("click", e => {
        if (menuVisibleAll) toggleMenuAll("hide");
        if (menuVisible) toggleMenu("hide");
    });



}
File.Parse = function (path) {
    var ret = false;
    var li = $('#pnlFileList').find('li[data-path="' + path + '"]');
    if (li.length > 0)
        ret = new File(li.attr('data-path'), li.attr('data-size'), li.attr('data-time'), li.attr('data-w'), li.attr('data-h'));

    return ret;
};