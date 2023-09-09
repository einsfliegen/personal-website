$('.my-container').infiniteScroll({
    // options
    path: '.pagination__next',
    append: '.my-card',
    status: '.scroller-status',
    hideNav: '.pagination',
  });

//   $(window).scroll(function() {
//     if($(window).scrollTop() + $(window).height() == $(document).height()) {
//         alert("bottom!");
//     }
//  });