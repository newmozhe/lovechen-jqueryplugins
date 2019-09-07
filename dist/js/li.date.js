;! function (window, document, $) {
    var PLUGIN_NAME = "lidate",
        VERSION = "1.0.0",
        DEFAULTOPTIONS={
            yearStep:5,
            monthDisplay:["一月","二月","三月","四月","五月","六月","七月","八月","九月","十月","十一月","十二月"],
            weekDisplay:["日","一","二","三","四","五","六"],
            weekCss:["lidate_holiday",null,null,null,null,null,"lidate_holiday"],
            startOfWeek:0,
            mode:0,
            showPrevDays:true,
            showNextDays:false,
            format:"yyyy/MM/dd",
            flagDays:[],
            onChoose:null,
            afterDraw:null
        };

    var plugin = function(element, options){
        this.ele = element;
        this.opts = $.extend(!0, {}, DEFAULTOPTIONS, options);
        this.ui = {},
        this.monthDay = [31,0,31,30,31,30,31,31,30,31,30,31],
        this.year = 0,
        this.month = -1,

        this._init();
    }

    var closeAll = function(){
        $(".lidate_panel").hide();
        $("body").off("click",closeAll);
    }

    plugin.prototype = {
        _init: function(setting){
            this.initUi();

            var today = new Date();
            this.setYear(today.getFullYear());
            this.setMonth(today.getMonth());

            this.bindEvent();
        },
        initUi:function(){
            this.ui.panel = $("<div class='lidate_panel'></div>");
            
            var monthSelect = "<select class='lidate_monthsel'>";
            for(var i =0;i<12;++i){
                monthSelect += "<option value='" + i + "'>" + this.opts.monthDisplay[i] + "</option>";
            }
            monthSelect +="</select>";
            this.ui.toolbar = $("<div class='lidate_toolbar'><i class='fa fa-angle-double-left' aria-hidden='true'></i><i class='fa fa-angle-left' aria-hidden='true'></i><span class='lidate_yeardisplay'></span><span class='lidate_monthdisplay'></span><select class='lidate_yearsel'></select>" + monthSelect + "<i class='fa fa-angle-right' aria-hidden='true'></i><i class='fa fa-angle-double-right' aria-hidden='true'></i></div>");
            
            var titleHtml = "<ul class='lidate_title'>";
            for(var i=0;i<this.opts.weekDisplay.length;++i){
                titleHtml += "<li " + (this.opts.weekCss[i] ? "class='" + this.opts.weekCss[i] + "'" : "") + ">" + this.opts.weekDisplay[i] + "</li>";
            }
            this.ui.title = $(titleHtml);
            this.ui.body = $("<ul class='lidate_body mode" + this.opts.mode + "'></ul>");

            this.ui.panel.append(this.ui.toolbar);
            this.ui.panel.append(this.ui.title);
            this.ui.panel.append(this.ui.body);

            $("body").append(this.ui.panel);

            this.ui.yearDisplay = this.ui.toolbar.find(".lidate_yeardisplay");
            this.ui.monthDisplay = this.ui.toolbar.find(".lidate_monthdisplay");
            this.ui.yearSelect = this.ui.toolbar.find(".lidate_yearsel");
            this.ui.monthSelect = this.ui.toolbar.find(".lidate_monthsel");
        },
        setYear:function(year){
            year = parseInt(year);
            var dvalue = year - this.year;
            var seloptions = this.ui.yearSelect.children("option");

            if(dvalue == 1){
                seloptions.eq(0).remove();
                this.ui.yearSelect.append("<option value='" + (year + this.opts.yearStep) + "'>" + (year + this.opts.yearStep) + "</option>");
            } else if(dvalue == -1){
                seloptions.eq(seloptions.length - 1).remove();
                this.ui.yearSelect.prepend("<option value='" + (year - this.opts.yearStep) + "'>" + (year - this.opts.yearStep) + "</option>");
            } else {
                this.ui.yearSelect.empty();
                var options = "";
                for(var i=year-this.opts.yearStep;i<=year+this.opts.yearStep;++i){
                    options += "<option value='" + i + "'>" + i + "</option>";
                }
                this.ui.yearSelect.append(options);
            }

            this.ui.yearSelect.val(year);
            this.ui.yearDisplay.text(year);

            //根据是否是闰年设置二月份天数
            this.monthDay[1] = year%4==0&&year%100!=0||year%400==0 ? 29 : 28;

            this.year = year;
        },
        setMonth:function(month){
            month = parseInt(month);

            if(month < 0){
                this.setYear(this.year - 1);
                this.month = 11;
            }else if(month > 11){
                this.setYear(this.year + 1);
                this.month = 0;
            }else{
                this.month = month;
            }
            
            this.ui.monthSelect.val(this.month);
            this.ui.monthDisplay.text(this.ui.monthSelect.find("option:selected").text());

            this.drawCalendar();
        },
        drawCalendar:function(){
            this.ui.body.empty();

            var currentDate = new Date(this.year,this.month,1);
            var now = new Date();
            var today = this.year == now.getFullYear() && this.month == now.getMonth() ? now.getDate() : null;

            //补全前导
                currentDate.setDate(1);
                var firstDay = currentDate.getDay();
                var firstDayOffset = this.opts.startOfWeek <= firstDay ? firstDay - this.opts.startOfWeek : (7 - this.opts.startOfWeek) + firstDay;
                if(firstDay != this.opts.startOfWeek){
                    var prevDay = this.monthDay[this.month == 0 ? 11 : this.month - 1] - firstDay;
    
                    for(var i=1;i<= firstDayOffset;++i){
                        if(this.opts.showPrevDays){
                            this.ui.body.append("<li class='lidate_prevdays'>" + (prevDay + i) + "</li>");
                        }else{
                            this.ui.body.append("<li class='lidate_prevdays'></li>");
                        }
                    }
                }
            
            //填充本月日历
            for(var i=1;i<=this.monthDay[this.month];++i){
                var liclass = " class='lidate_item ";

                if(this.opts.weekCss[firstDayOffset]){
                    liclass += this.opts.weekCss[firstDayOffset];
                }
                
                if(today && i == today){
                    liclass += " lidate_today";
                }

                liclass += "'";
                
                this.ui.body.append("<li" + liclass + ">" + i + "</li>");
                ++firstDayOffset;
                if(firstDayOffset > 6) firstDayOffset = 0;
            }

            //补全后续
            if(this.opts.showNextDays){
                currentDate.setDate(this.monthDay[this.month]);
                var lastDay = currentDate.getDay();
                if(lastDay!=6){
                    var nextDays = 6 - lastDay;
                    for(var i=1;i<=nextDays;++i){
                        this.ui.body.append("<li class='lidate_nextdays'>" + i + "</li>");
                    }
                }
            }

            this.setFlagDay();

            if(typeof this.opts.afterDraw === "function"){
                this.opts.afterDraw(this);
            }
        },
        setFlagDay:function(){
            if(this.opts.flagDays && this.opts.flagDays.length > 0){
                var items = this.ui.body.children(".lidate_item");
                for(var i = 0,len = this.opts.flagDays.length; i < len; ++i){
                    items.eq(this.opts.flagDays[i] - 1).addClass("lidate_flagday");
                }
            }
        },
        formatDate:function(dateObj,fmt){
            var o = { 
                "M+" : dateObj.getMonth()+1,                 //月份 
                "d+" : dateObj.getDate(),                    //日 
                "h+" : dateObj.getHours(),                   //小时 
                "m+" : dateObj.getMinutes(),                 //分 
                "s+" : dateObj.getSeconds(),                 //秒 
                "q+" : Math.floor((dateObj.getMonth()+3)/3), //季度 
                "S"  : dateObj.getMilliseconds()             //毫秒 
            }; 
            if(/(y+)/.test(fmt)) {
                    fmt=fmt.replace(RegExp.$1, (dateObj.getFullYear()+"").substr(4 - RegExp.$1.length)); 
            }
            
            for(var k in o) {
                if(new RegExp("("+ k +")").test(fmt)){
                     fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
                 }
             }
            return fmt;
        },
        bindEvent:function(){
            var that = this;

            this.ui.toolbar.on("click",function(e){
                e.stopPropagation();
            });

            //上一年
            this.ui.toolbar.on("click",".fa-angle-double-left",function(e){
                that.setYear(that.year - 1);
                that.drawCalendar();
            });

            //上一月
            this.ui.toolbar.on("click",".fa-angle-left",function(e){
                that.setMonth(that.month - 1);
            });

            //下一月
            this.ui.toolbar.on("click",".fa-angle-right",function(e){
                that.setMonth(that.month + 1);
            });

            //下一年
            this.ui.toolbar.on("click",".fa-angle-double-right",function(e){
                that.setYear(that.year + 1);
                that.drawCalendar();
            });

            //年份选择
            this.ui.toolbar.on("change",".lidate_yearsel",function(e){
                that.setYear($(this).val());
                that.drawCalendar();
            });

            //月份选择
            this.ui.toolbar.on("change",".lidate_monthsel",function(e){
                that.setMonth($(this).val());
            });

            //弹出与隐藏
            this.ele.on("click",function(event){
                if(that.ui.panel.is(":hidden")){
                    closeAll();
                    that.ui.panel.css("left",that.ele.offset().left);
                    that.ui.panel.css("top",document.documentElement.clientHeight < (that.ele.offset().top + that.ele.outerHeight() + that.ui.panel.outerHeight()) ? (that.ele.offset().top - that.ui.panel.outerHeight())  : (that.ele.offset().top + that.ele.outerHeight()));
                    that.ui.panel.show();
                    $("body").on("click",closeAll);
                    event.stopPropagation();
                }
            });

            //日期点击
            this.ui.body.on("click","li",function(e){
                if((that.opts.mode == 1 && !$(this).hasClass("lidate_flagday")) || (that.opts.mode == 2 && $(this).hasClass("lidate_flagday"))){
                    e.stopPropagation();
                    return;
                }

                var day = parseInt($(this).text());
                var currentDate = new Date(that.year,that.month,day);
                var dateFmt = that.formatDate(currentDate,that.opts.format);

                if(typeof that.opts.onChoose !== "function" || that.opts.onChoose(that.year,that.month,day,dateFmt)){
                    if(that.ele.prop("value") === undefined){
                        that.ele.text(dateFmt);
                    } else {
                        that.ele.val(dateFmt);
                    }
                }
            });
        }
    }

    $.fn.lidate = function (s) {
        return new plugin(this, s), this
    }
}(window, document,jQuery);
