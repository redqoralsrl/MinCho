$("document").ready(function () {
    //attr 현재속성

    $(".tab_content").hide();
    $(".tab_content").eq(0).show();


    $("ul.tabs li").click(function () {
        $("ul.tabs li").removeClass("active")
        $(this).addClass("active")
        $(".tab_content").hide();
        var tabid = $(this).attr("rel");
        $("#" + tabid).fadeIn();
    })
});