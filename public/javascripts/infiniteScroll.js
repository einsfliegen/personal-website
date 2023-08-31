$('.container').infiniteScroll({
    // options
    path: '.pagination__next',
    append: '.card',
    hideNav: '.pagination',
  });

//   $(window).scroll(function() {
//     if($(window).scrollTop() + $(window).height() == $(document).height()) {
//         alert("bottom!");
//     }
//  });