
function Directory(fullPath, numDirs, numFiles, fid, flock, subfolder, time) {
    if (!fullPath) fullPath = '';
    this.fullPath = fullPath;
    this.name = RoxyUtils.GetFilename(fullPath);
    if (!this.name)
        this.name = 'My files';
    this.path = RoxyUtils.GetPath(fullPath);
    this.dirs = (numDirs ? numDirs : 0);
    this.files = (numFiles ? numFiles : 0);
    this.fid = (fid ? fid : 0);
    this.filesList = new Array();
    this.flock = flock;
    this.subfolder = subfolder;
    this.time = time;

    this.Show = function () {
        var html = this.GetHtml();
        var el = null;
        el = $('li[data-path="' + this.path + '"]');
        if (el.length == 0)
            el = $('#pnlDirList');
        else {
            if (el.children('ul').length == 0)
                el.append('<ul></ul>');
            el = el.children('ul');
        }
        if (el) {
            el.append(html);
            this.SetEvents();
        }
    };
    this.SetEvents = function () {
        var el = this.GetElement();
        if (RoxyFilemanConf.MOVEDIR) {
            el.draggable({ helper: makeDragDir, start: startDragDir, cursorAt: { left: 10, top: 10 }, delay: 200 });
        }
        el = el.children('div');
        el.click(function (e) {
            selectDir(this);
        });

        el.bind('contextmenu', function (e) {
            e.stopPropagation();
            e.preventDefault();
            closeMenus('file');
            selectDir(this);

            const origin = {
                left: e.pageX,
                top: e.pageY
            };
            setPosition(origin);
            return false;
        });


        el.droppable({ drop: moveObject, over: dragFileOver, out: dragFileOut });
        el = el.children('.dirPlus');
        el.click(function (e) {
            e.stopPropagation();
            var d = Directory.Parse($(this).closest('li').attr('data-path'));
            d.Expand();
        });
    };
    this.GetHtml = function () {
        var html = '<li data-path="' + this.fullPath + '" data-dirs="' + this.dirs + '" data-files="' + this.files + '" data-fid="' + this.fid + '" data-flock="' + this.flock + '" data-subfolder="' + this.subfolder + '" class="directory">';
        html += '<div><span class="fa fa' + (this.dirs > 0 ? '-caret-right' : '') + ' dirPlus"></span>'; //<img src="/lib/fileman/images/' + (this.dirs > 0 ? 'expand-arrow-20.png' : 'blank.gif') + '" class="dirPlus" width="20" height="20">'
        html += '<span class="fa fa-folder-open dir"></span><span class="name">' + this.name + '</span>'; //+ ' (' + this.files + ') //<img src="/lib/fileman/images/folder-48.png" class="dir">
        html += '<a href="javascript:;" class="dirContextBtn" onclick="contextDivByBtn(this,event)"><i class="fa fa-cog"></i></a></div>';
        html += '</li>';

        return html;
    };
    this.SetStatusBar = function () {
        $('#pnlStatus').html(this.files + ' ' + (this.files == 1 ? t('file') : t('files')));
    };
    this.SetSelectedFile = function (path) {
        if (path) {
            var f = File.Parse(path);
            if (f) {
                selectFile(f.GetElement());
            }
        }
    };
    this.Select = function (selectedFile) {
        var el = this.GetElement();
        el.children('div').addClass('selected');
        $('#pnlDirList li[data-path!="' + this.fullPath + '"] > div').removeClass('selected');
        el.children('img.dir').prop('src', '/lib/fileman/images/folder-48.png');
        this.SetStatusBar();
        var p = this.GetParent();
        while (p) {
            p.Expand(true);
            p = p.GetParent();
        }
        this.Expand(true);
        this.ListFiles(true, selectedFile);
        setLastDir(this.fullPath);
    };
    this.GetElement = function () {
        return $('li[data-path="' + this.fullPath + '"]');
    };
    this.IsExpanded = function () {
        var el = this.GetElement().children('ul');
        return (el && el.is(":visible"));
    };
    this.IsListed = function () {
        if ($('#hdDir').val() == this.fullPath && $('#hdDirID').val() == this.fid)
            return true;
        return false;
    };
    this.GetExpanded = function (el) {
        var ret = new Array();
        if (!el)
            el = $('#pnlDirList');
        el.children('li').each(function () {
            var path = $(this).attr('data-path');
            var d = new Directory(path);
            if (d) {
                if (d.IsExpanded() && path)
                    ret.push(path);
                ret = ret.concat(d.GetExpanded(d.GetElement().children('ul')));
            }
        });

        return ret;
    };
    this.RestoreExpanded = function (expandedDirs) {
        for (i = 0; i < expandedDirs.length; i++) {
            var d = Directory.Parse(expandedDirs[i]);
            if (d)
                d.Expand(true);
        }
    };
    this.GetParent = function () {
        return Directory.Parse(this.path);
    };
    this.SetOpened = function () {
        var li = this.GetElement();
        if (li.find('li').length < 1) {
            li.children('div').children('.dirPlus').prop('class', 'fa  dirPlus');
            li.parent('ul').find('.dir').prop('class', 'fa fa-folder dir');
            li.children('div').children('.dir').prop('class', 'fa fa-folder-open dir');

        }
        else if (this.IsExpanded()) {
            li.children('div').children('.dirPlus').prop('class', 'fa fa-caret-down dirPlus');
            li.parent('ul').find('.dir').prop('class', 'fa fa-folder dir');
            li.children('div').children('.dir').prop('class', 'fa fa-folder-open dir');
        }
        else {
            li.children('div').children('.dirPlus').prop('class', 'fa fa-caret-right dirPlus');
            li.parent('ul').find('.dir').prop('class', 'fa fa-folder dir');
            li.children('div').children('.dir').prop('class', 'fa fa-folder dir');
        }
    };
    this.Update = function (newPath) {
        var el = this.GetElement();
        if (newPath) {
            this.fullPath = newPath;
            this.name = RoxyUtils.GetFilename(newPath);
            if (!this.name)
                this.name = 'My files';
            this.path = RoxyUtils.GetPath(newPath);
        }
        el.attr('data-path', this.fullPath);
        el.attr('data-dirs', this.dirs);
        el.attr('data-files', this.files);
        el.children('div').children('.name').html(this.name); //+ ' (' + this.files + ')'
        this.SetOpened();
    };
    this.LoadAll = function (selectedDir) {
        var expanded = this.GetExpanded();
        var dirListURL = RoxyFilemanConf.DIRLIST;
        if (!dirListURL) {
            $.alert(t('E_ActionDisabled'));
            return;
        }
        $('#pnlLoadingDirs').show();

        $('#pnlDirList').hide();
        var type = $("#FileManagerType").val();
        // dirListURL = RoxyUtils.AddParam(dirListURL, 'type', RoxyUtils.GetUrlParam('type'));
        dirListURL = RoxyUtils.AddParam(dirListURL, 'type', type);
        var dir = this;
        $.ajax({
            url: dirListURL,
            type: 'POST',
            dataType: 'json',
            async: true,
            cache: false,
            success: function (dirs) {
                $('#pnlDirList').children('li').remove();
                for (i = 0; i < dirs.length; i++) {
                    var d = new Directory(dirs[i].p, dirs[i].d, dirs[i].f, dirs[i].id, dirs[i].flock, dirs[i].subfolder, dirs[i].t);
                    d.Show();
                }
                $('#pnlLoadingDirs').hide();
                $('#pnlDirList').show();
                dir.RestoreExpanded(expanded);
                var d = Directory.Parse(selectedDir);
                if (d)
                    d.Select();
            },
            error: function (data) {
                $('#pnlLoadingDirs').hide();
                $('#pnlDirList').show();
                $.alert(t('E_LoadingAjax') + ' ' + RoxyFilemanConf.DIRLIST);
            }
        });
    };
    this.Expand = function (show) {
        var li = this.GetElement();
        var el = li.children('ul');
        if (this.IsExpanded() && !show)
            el.hide();
        else
            el.show();

        this.SetOpened();
    };
    this.Create = function (newName) {
        if (!newName)
            return false;
        else if (!RoxyFilemanConf.CREATEDIR) {
            $.alert(t('E_ActionDisabled'));
            return;
        }
        var url = RoxyUtils.AddParam(RoxyFilemanConf.CREATEDIR, 'd', this.fullPath);
        url = RoxyUtils.AddParam(url, 'n', newName);
        url = RoxyUtils.AddParam(url, 'Fid', fid);
        var item = this;
        $.ajax({
            url: url,
            type: 'POST',
            data: { d: this.fullPath, n: newName, fid: fid },
            dataType: 'json',
            success: function (data) {
                if (data.res.toLowerCase() == 'ok') {
                    item.LoadAll(RoxyUtils.MakePath(item.fullPath, newName));
                    abp.notify.success('Folder Cretaed');
                }
                else {
                    abp.notify.error(data.msg);
                }
            },
            error: function (data) {
                $.alert(t('E_LoadingAjax') + ' ' + item.name);
            }
        });
        //return ret;
    };
    this.Delete = function () {
        if (!RoxyFilemanConf.DELETEDIR) {
            $.alert(t('E_ActionDisabled'));
            return;
        }
        var url = RoxyUtils.AddParam(RoxyFilemanConf.DELETEDIR, 'd', this.fullPath);
        url = RoxyUtils.AddParam(RoxyFilemanConf.DELETEDIR, 'id', this.fid);
        var item = this;
        $.ajax({
            url: url,
            type: 'POST',
            data: { d: this.fullPath, id: this.fid },
            dataType: 'json',
            success: function (data) {
                if (data.res.toLowerCase() == 'ok') {
                    var parent = item.GetParent();
                    parent.dirs--;
                    parent.Update();
                    parent.Select();
                    item.GetElement().remove();
                    abp.notify.success("Successfully Deleted");
                }
                else {
                    abp.notify.error(data.msg);
                }
            },
            error: function (data) {
                abp.message.error(t('E_LoadingAjax') + ' ' + item.name);
            }
        });
    };
    this.Rename = function (newName) {
        if (!newName)
            return false;
        else if (!RoxyFilemanConf.RENAMEDIR) {
            $.alert(t('E_ActionDisabled'));
            return;
        }
        var url = RoxyUtils.AddParam(RoxyFilemanConf.RENAMEDIR, 'd', this.fullPath);
        url = RoxyUtils.AddParam(url, 'n', newName);
        url = RoxyUtils.AddParam(url, 'id', this.fid);
        var item = this;
        var ret = false;
        $.ajax({
            url: url,
            type: 'POST',
            data: { d: this.fullPath, n: newName, id: this.fid },
            dataType: 'json',
            async: true,
            cache: false,
            success: function (data) {
                if (data.res.toLowerCase() == 'ok') {
                    var newPath = RoxyUtils.MakePath(item.path, newName);
                    item.Update(newPath);
                    item.Select();
                    ret = true;
                }
                if (data.msg)
                    $.alert(data.msg);
            },
            error: function (data) {
                $.alert(t('E_LoadingAjax') + ' ' + item.name);
            }
        });
        return ret;
    };
    this.Copy = function (newPath) {
        if (!RoxyFilemanConf.COPYDIR) {
            $.alert(t('E_ActionDisabled'));
            return;
        }
        var SelectedDir = getSelectedDir();
        var url = RoxyUtils.AddParam(RoxyFilemanConf.COPYDIR, 'd', this.fullPath);
        url = RoxyUtils.AddParam(url, 'n', newPath);
        url = RoxyUtils.AddParam(url, 'Fid', this.fid);
        url = RoxyUtils.AddParam(url, 'ParentId', SelectedDir.fid);
        var item = this;
        var ret = false;
        $.ajax({
            url: url,
            type: 'POST',
            data: { d: this.fullPath, n: newPath, Fid: this.fid, ParentId: SelectedDir.fid },
            dataType: 'json',
            async: true,
            cache: false,
            success: function (data) {
                if (data.res.toLowerCase() == 'ok') {
                    var d = Directory.Parse(newPath);
                    if (d) {
                        d.LoadAll(d.fullPath);
                    }
                    ret = true;
                }
                if (data.msg)
                    $.alert(data.msg);
            },
            error: function (data) {
                $.alert(t('E_LoadingAjax') + ' ' + url);
            }
        });
        return ret;
    };
    this.Move = function (newDir) {

        if (!newDir.fullPath)
            return false;
        else if (!RoxyFilemanConf.MOVEDIR) {
            $.alert(t('E_ActionDisabled'));
            return;
        }
        var SelectedDir = getSelectedDir();
        var url = RoxyUtils.AddParam(RoxyFilemanConf.MOVEDIR, 'd', this.fullPath);
        url = RoxyUtils.AddParam(url, 'n', newDir.fullPath);
        url = RoxyUtils.AddParam(url, 'Fid', this.fid);
        url = RoxyUtils.AddParam(url, 'ParentId', newDir.fid);
        var item = this;
        var ret = false;
        $.ajax({
            url: url,
            type: 'POST',
            data: { d: this.fullPath, n: newDir.fullPath, Fid: this.fid, ParentId: newDir.fid },
            dataType: 'json',
            async: true,
            cache: false,
            success: function (data) {
                if (data.res.toLowerCase() == 'ok') {
                    //item.LoadAll(RoxyUtils.MakePath(newDir.fullPath, item.name));
                    abp.notify.success('Folder Cretaed');
                }
                if (data.msg)
                    abp.notify.error(data.msg);
            },
            error: function (data) {
                $.alert(t('E_LoadingAjax') + ' ' + item.name);
            }
        });
        return ret;
    };
    this.ListFiles = function (refresh, selectedFile) {
        $('#pnlLoading').show();
        $("#pnlDirList").find(".directory").addClass("disiblePointer");
        //$('#pnlLoadingDirs').show();
        $('#pnlEmptyDir').hide();
        $('#pnlFileList').hide();
        $('#pnlSearchNoFiles').hide();
        this.LoadFiles(refresh, selectedFile);
    };

    this.FilesLoaded = function (filesList, dirlist, selectedFile) {
        filesList = this.SortFiles(filesList);
        dirList = this.SortFolder(dirlist);
        $('#pnlFileList').html('');

        for (i = 0; i < dirList.length; i++) {
            var d = dirList[i];
            d.FoldersShow();
        }

        for (i = 0; i < filesList.length; i++) {
            var f = filesList[i];
            f.Show();
        }


        $('#hdDir').val(this.fullPath);
        $('#hdDirID').val(this.fid);
        $('#pnlLoading').hide();

        $("#pnlDirList").find(".directory").removeClass("disiblePointer");


        //$('#pnlLoadingDirs').hide();
        if ($('#pnlFileList').children('li').length == 0)
            $('#pnlEmptyDir').show();
        this.files = $('#pnlFileList').children('li').length;
        this.Update();
        this.SetStatusBar();
        filterFiles();
        switchView();
        $('#pnlFileList').show();
        this.SetSelectedFile(selectedFile);
    };

    this.FoldersShow = function () {
        html = '<li data-path="' + this.fullPath + '" data-time="' + this.time + '" data-w="' + "" + '" data-h="' + "" + '" data-type="' + "Folder" + '" data-size="' + "" + '" data-icon-big="' + '/lib/fileman/images/folder.png' + '" data-fid ="' + this.fid + '" title="' + this.name + '" data-flock="' + this.flock + '" data-subfolder="' + this.subfolder + '" class="directory">';
        //html = '<li data-path="' + this.fullPath + '" data-icon-big="' + '/lib/fileman/images/folder-max.png' + '" data-fid ="' + this.fid + '" title="' + this.name + '">'; //'" data-icon="' + this.icon +    
        html += '<span class="fa fa-folder icon">' + "" + '</span>';
        html += '<span class="time">' + moment(RoxyUtils.FormatDate(new Date(this.time * 1000)),"mm-d-yyyy") + '</span>';
        html += '<span class="name">' + this.name + '</span>';
        html += '<span class="size">' + "" + '</span>';
        html += '</li>';
        $('#pnlFileList').append(html);
        var li = $("#pnlFileList li:last");
        li.click(function (e) {
            selectDir(this);
        });
        li.draggable({ helper: makeDragDir, start: startDragDir, cursorAt: { left: 10, top: 10 }, delay: 200 });
        li.droppable({ drop: moveObjectChild, over: dragFileOver, out: dragFileOut });
        //el.click(function (e) {
        //    selectDir(this);
        //});
        //li.tooltip({ show: { delay: 700 }, track: true, content: tooltipContent });
        li.bind('contextmenu', function (e) {

            e.stopPropagation();
            e.preventDefault();
            closeMenus('dir');
            selectFile(this);

            const origin = {
                left: e.pageX,
                top: e.pageY
            };
            setPosition(origin);
            return false;
        });
    };

    this.FoldersLoad = function (dirs, selectedFile) {
        $('#pnlFileList').html('');
        for (i = 0; i < dirs.length; i++) {
            var d = dirs[i];
            d.FoldersShow();
        }
    };

    this.LoadFiles = function (refresh, selectedFile) {
        if (!RoxyFilemanConf.FILESLIST) {
            $.alert(t('E_ActionDisabled'));
            return;
        }
        var ret = new Array();
        var dir = new Array();
        var type = $("#FileManagerType").val();
        var fileURL = RoxyFilemanConf.FILESLIST;
        fileURL = RoxyUtils.AddParam(fileURL, 'd', this.fullPath);
        fileURL = RoxyUtils.AddParam(fileURL, 'type', type);
        fileURL = RoxyUtils.AddParam(fileURL, 'Fid', this.fid);
        var item = this;
        if (!this.IsListed() || refresh) {

            $.ajax({
                url: fileURL,
                type: 'POST',
                data: { d: this.fullPath, type: type, fid: this.fid },
                dataType: 'json',
                async: true,
                cache: false,
                success: function (result) {
                    var files = result.Files;
                    var dirs = result.Folders;
                    //console.log(result);

                    for (i = 0; i < dirs.length; i++) {
                        dir.push(new Directory(dirs[i].p, dirs[i].d, dirs[i].f, dirs[i].id, dirs[i].flock, dirs[i].subfolder, dirs[i].t));
                    }
                    item.FoldersLoad(dir, selectedFile);

                    for (i = 0; i < files.length; i++) {
                        ret.push(new File(files[i].p, files[i].s, files[i].t, files[i].w, files[i].h, files[i].id));
                    }
                    item.FilesLoaded(ret, dir, selectedFile);

                },
                error: function (data) {
                    $.alert(t('E_LoadingAjax') + ' ' + fileURL);
                }
            });
        }
        else {
            $('#pnlFileList li').each(function () {
                if ($(this).attr('data-type') === "Folder") {
                    dir.push(new Directory($(this).attr('data-path'), 0, 0, $(this).attr('data-fid'), $(this).attr('data-flock'), $(this).attr('data-subfolder'), $(this).attr('data-time')));
                }
                else {
                    ret.push(new File($(this).attr('data-path'), $(this).attr('data-size'), $(this).attr('data-time'), $(this).attr('data-w'), $(this).attr('data-h')));

                }
            });
            item.FilesLoaded(ret, dir, selectedFile);
        }

        return ret;
    };

    this.SortByName = function (files, order) {
        files.sort(function (a, b) {
            var x = (order == 'desc' ? 0 : 2)
            a = a.name.toLowerCase();
            b = b.name.toLowerCase();
            if (a > b)
                return -1 + x;
            else if (a < b)
                return 1 - x;
            else
                return 0;
        });

        return files;
    };
    this.SortByNamedir = function (dirs, order) {
        dirs.sort(function (a, b) {
            var x = (order == 'desc' ? 0 : 2)
            a = a.name.toLowerCase();
            b = b.name.toLowerCase();
            if (a > b)
                return -1 + x;
            else if (a < b)
                return 1 - x;
            else
                return 0;
        });

        return dirs;
    };


    this.SortBySize = function (files, order) {
        files.sort(function (a, b) {
            var x = (order == 'desc' ? 0 : 2)
            a = parseInt(a.size);
            b = parseInt(b.size);
            if (a > b)
                return -1 + x;
            else if (a < b)
                return 1 - x;
            else
                return 0;
        });

        return files;
    };
    this.SortByTime = function (files, order) {
        files.sort(function (a, b) {
            var x = (order == 'desc' ? 0 : 2)
            a = parseInt(a.time);
            b = parseInt(b.time);
            if (a > b)
                return -1 + x;
            else if (a < b)
                return 1 - x;
            else
                return 0;
        });

        return files;
    };
    this.SortByTimedir = function (dirs, order) {
        dirs.sort(function (a, b) {
            var x = (order == 'desc' ? 0 : 2)
            a = parseInt(a.time);
            b = parseInt(b.time);
            if (a > b)
                return -1 + x;
            else if (a < b)
                return 1 - x;
            else
                return 0;
        });

        return dirs;
    };
    this.SortFiles = function (files) {
        var order = $('#ddlOrder').val();
        if (!order)
            order = 'name';

        switch (order) {
            case 'size':
                files = this.SortBySize(files, 'asc');
                break;
            case 'size_desc':
                files = this.SortBySize(files, 'desc');
                break;
            case 'time':
                files = this.SortByTime(files, 'asc');
                break;
            case 'time_desc':
                files = this.SortByTime(files, 'desc');
                break;
            case 'name_desc':
                files = this.SortByName(files, 'desc');
                break;
            default:
                files = this.SortByName(files, 'asc');
        }

        return files;
    };


    this.SortFolder = function (dirs) {
        var order = $('#ddlOrder').val();
        if (!order)
            order = 'name';
        switch (order) {
            //case 'size':
            //    dirs = this.SortBySizedir(dirs, 'asc');
            //    break;
            //case 'size_desc':
            //    dirs = this.SortBySizedir(dirs, 'desc');
            //    break;
            case 'time':
                dirs = this.SortByTimedir(dirs, 'asc');
                break;
            case 'time_desc':
                dirs = this.SortByTimedir(dirs, 'desc');
                break;
            case 'name_desc':
                dirs = this.SortByNamedir(dirs, 'desc');
                break;
            default:
                dirs = this.SortByNamedir(dirs, 'asc');
        }

        return dirs;
    };

    const menuDir = document.querySelector("#menuDir");
    let menuVisible = false;

    const toggleMenu = command => {
        menuDir.style.display = command === "show" ? "block" : "none";
        menuVisible = !menuVisible;
    };
    var checkCon = $('#webpageIdText');
    const setPosition = ({ top, left }) => {
        if (checkCon.length > 0) {
            left = Number(left) - 280;
            top = Number(top) - 80;
            menuDir.style.left = `${left}px`;
            menuDir.style.top = `${top}px`;
        }
        else {
            menuDir.style.left = `${left}px`;
            menuDir.style.top = `${top}px`;
        }
        toggleMenu("show");
    };

    window.addEventListener("click", e => {
        if (menuVisible) toggleMenu("hide");
    });
}
Directory.Parse = function (path) {
    var ret = false;
    var li = $('#pnlDirList').find('li[data-path="' + path + '"]');
    if (li.length > 0)
        ret = new Directory(li.attr('data-path'), li.attr('data-dirs'), li.attr('data-files'), li.attr('data-fid'), li.attr('data-flock'), li.attr('data-subfolder'), li.attr('data-time'));

    return ret;
};
