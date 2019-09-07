# lovechen-jqueryplugins
在 https://im.lovechen.net 项目中自己开发的部分JQuery插件，使用了JQuery和Font Awesome字体库，包括日期插件lidate等。

lidate：
    文件：li.date.js、li.date.css
    依赖：JQuery、Font Awesome
    用途：在LoveChen IM 查看聊天记录模块中，用来显示哪天有聊天

    属性：
        yearStep：数字，年份选择下拉框中显示前后年份的数量
        monthDisplay：长度为12的数组，月份选择下拉框中月份的显示字符串
        weekDisplay：长度为7的数组，星期中每天显示的字符串
        weekCss：长度为7的数组，星期中每天需要附加的CSS class
        startOfWeek：数字0~6，日历中显示的星期的第一天
        flagDays：数组，需要标记的日期
        mode：数字0~2，模式，0表示普通模式，1表示只有flagDays中指定的日期可选，2表示除了flagDays中指定的日期以外可以选择
        showPrevDays：布尔类型，是否显示第一周上月日期，默认true
        showNextDays：布尔类型，是否显示最后一周下月的日期，默认false
        format：字符串，日期格式化说明符，默认yyyy/MM/dd

    事件：
        afterDraw(obj) 日历每次生成后触发，参数：lidate对象。
        onChoose(obj,date,fmt) 选择日期后触发，return false可以阻止默认事件，参数：lidate对象，日期对象，格式化后的日期字符串。