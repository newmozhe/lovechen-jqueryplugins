;! function (window, document, $) {
    var PLUGIN_NAME = "liemoji",
        VERSION = "1.0.0",
        DEFAULTS = {
            width:440,
            height:220
        };

    var plugin = function(element, options){
        this.ele = element;
        this.options = $.extend(!0, {}, DEFAULTS, options);;
        this.ui={};
        this._init();
    }

    plugin.prototype = {
        _init: function(){
            if(this.options.icons.length <= 0){
                //没有图标配置
                console.log('初始化表情选择器失败，必须配置icons');
                return false;
            }
            
            this.initUi();
            this.eventBind();
        },
        initUi:function(){
            var emoji_container = "";
            var tabLiHtml = "";
            var successCount = 0;
            
            for(var i = 0;i<this.options.icons.length;++i){
                var icons = this.options.icons[i];
                if(!icons.list) icons.list = new Array();

                if(icons.nums && icons.nums.length > 0){
                    var minNum=0,
                    maxNum=0,
                    excludeNums=null,
                    numsLength = icons.nums.length,
                    fileExtension = icons.extension || ".jpg",
                    path = icons.path;
    
                    if(numsLength === 1){
                        maxNum = icons.nums[0];
                    } else if(numsLength === 2){
                        minNum = icons.nums[0];
                        maxNum = icons.nums[1];
                    } else {
                        minNum = icons.nums.shift();
                        maxNum = icons.nums.shift();
                        excludeNums = icons.nums;
                    }
    
                    //将设置中的连续表情添加至表情列表
                    for(var j=minNum;j<=maxNum;++j){
                        //需要排除的序号
                        if (excludeNums && excludeNums.indexOf(j) >= 0) {
                            continue;
                        }
    
                        icons.list.push(path + j + fileExtension);
                    }
                }

                if(icons.list.length == 0){
                    //没有图标文件名数字范围
                    console.log('添加第' + (i+1) + '套表情包失败，没有有效表情');
                    continue;
                }
                
                var temp_itemArr = new Array();
                var ulStyle = "style='max-height:" + this.options.height + "px;";
                if(successCount != 0) ulStyle += "display:none;";
                ulStyle+="'";
                
                temp_itemArr.push("<ul class='imglist'");
                temp_itemArr.push(ulStyle);
                temp_itemArr.push(">");
                
                for(var k=0;k<icons.list.length;++k){
                    temp_itemArr.push('<li><img src="');
                    temp_itemArr.push(icons.list[k]);
                    temp_itemArr.push('"/></li>');
                }
                temp_itemArr.push("</ul>");

                emoji_container += temp_itemArr.join("");
                tabLiHtml += "<li" + (successCount == 0 ? " class='currenttab'" : "") + ">" + icons.name  + "</li>";
                ++successCount;
            }
            
            if(emoji_container === ""){
                alert('初始化表情选择器失败，错误代码：0x003');
                return false;
            }

            //设置面板高度，如果有多套表情包，再额外增加tab标签页的高度28像素
            var panelHeight = successCount > 1 ? this.options.height + 28 : this.options.height;
            this.id = "liemoji_container_" + (this.options.panelid || new Date().getTime());

            emoji_container = '<div class="liemoji_container" id="' + this.id + '" style="height:' + panelHeight + 'px;width:' + this.options.width + '">' + emoji_container;
            if(successCount > 1){
                emoji_container+="<div id='" + this.id + "_tab' class='liemoji_tab'><ul>" + tabLiHtml + "</ul></div>";
            }
            emoji_container+= "</div>";

            //添加到HTML页面中
            if($("#" + this.id).length > 0){
                $("#" + this.id).remove();
            }

            this.ele.after(emoji_container);
            this.ui.panel = $("#" + this.id);
            this.ui.tabbar = $("#" + this.id + "_tab");
            //$(emoji_container).appendTo($('body'));
        },
        show:function(that){
            $(that.options.editor).focus();

            var panelHeight = this.ui.panel.outerHeight();
            this.ui.panel.css("left",that.ele.offset().left);
            this.ui.panel.css("top",document.documentElement.clientHeight < (that.ele.offset().top + that.ele.outerHeight() + panelHeight) ? (that.ele.offset().top - panelHeight)  : (that.ele.offset().top + that.ele.outerHeight()));
            
            this.ui.panel.toggle();
        },
        eventBind:function(){
            var that = this;

            //绑定按钮单击时隐藏或显示表情选择器
            this.ele.click(function(){
                that.show(that);
            });

            //绑定表情被点击时插入到编辑器
            this.ui.panel.on("click","img",function(){
                var insertHtml = "<img class='liemoji_icon' src=" + $(this).attr("src") + " />";
                that.insertAtCursor($(that.options.editor)[0], insertHtml, false);
                that.show(that);
            });

            this.ui.tabbar.on("click","ul li",function(){
                if($(this).hasClass("currentTab")){
                    return;
                }

                //显示面板
                var index = $(this).index();
                $("#" + that.id + " .imglist:visible").hide();
                $("#" + that.id + " .imglist").eq(index).show();

                //页签样式
                $("#" + that.id + "_tab .currenttab").removeClass("currenttab");
                $(this).addClass("currenttab");
            });
        },
        insertAtCursor(field, value, selectPastedContent) {
            var sel, range;
            if (field.nodeName === 'DIV') {
                field.focus();
                if (window.getSelection) {
                    sel = window.getSelection();
                    if (sel.getRangeAt && sel.rangeCount) {
                        range = sel.getRangeAt(0);
                        range.deleteContents();
                        var el = document.createElement('div');
                        el.innerHTML = value;
                        var frag = document.createDocumentFragment(), node, lastNode;
                        while ((node = el.firstChild)) {
                            lastNode = frag.appendChild(node);
                        }
                        var firstNode = frag.firstChild;
                        range.insertNode(frag);
        
                        if (lastNode) {
                            range = range.cloneRange();
                            range.setStartAfter(lastNode);
                            if (selectPastedContent) {
                                range.setStartBefore(firstNode);
                            } else {
                                range.collapse(true);
                            }
                            sel.removeAllRanges();
                            sel.addRange(range);
                        }
                    }
                } else if ((sel = document.selection) && sel.type !== 'Control') {
                    var originalRange = sel.createRange();
                    originalRange.collapse(true);
                    sel.createRange().pasteHTML(html);
                    if (selectPastedContent) {
                        range = sel.createRange();
                        range.setEndPoint('StartToStart', originalRange);
                        range.select();
                    }
                }
            } else {
                if (document.selection) {
                    field.focus();
                    sel = document.selection.createRange();
                    sel.text = value;
                    sel.select();
                }
                else if (field.selectionStart || field.selectionStart === 0) {
                    var startPos = field.selectionStart;
                    var endPos = field.selectionEnd;
                    var restoreTop = field.scrollTop;
                    field.value = field.value.substring(0, startPos) + value + field.value.substring(endPos, field.value.length);
                    if (restoreTop > 0) {
                        field.scrollTop = restoreTop;
                    }
                    field.focus();
                    field.selectionStart = startPos + value.length;
                    field.selectionEnd = startPos + value.length;
                } else {
                    field.value += value;
                    field.focus();
                }
            }
        }
    };

    $.fn.liemoji = function (s) {
        return new plugin(this, s), this
    }
}(window, document,jQuery);