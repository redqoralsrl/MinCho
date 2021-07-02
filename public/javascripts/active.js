$("document").ready(function () {
    //attr 현재속성

    $(".tab_content").hide();
    $(".tab_content").eq(0).show();
    $(".guide_content").hide();
    $(".guide_content").eq(0).show();

    
    // sideNav
    $("ul.tabs li").click(function () {
        $("ul.tabs li").removeClass("active")
        $(this).addClass("active")
        $(".tab_content").hide();
        var tabid = $(this).attr("rel");
        $("#" + tabid).fadeIn();
    })
    // main_guide
    $("ul li.mid a").click(function () {
        $("ul li.mid a").removeClass("active")
        $(this).addClass("active")
        $(".guide_content").hide();
        var contentid = $(this).attr("rel");
        $("#" + contentid).fadeIn();
    })
});