var slideshow = $('.js-slideshow');
var slideshowTimeToDisplay = 5000;
var slideshowUrls = [
  'assets/backgrounds/summer-collection-1.jpg',
  'assets/backgrounds/summer-collection-2.jpg',
  'assets/backgrounds/summer-collection-3.jpg',
  'assets/backgrounds/summer-collection-4.jpg'
];
var slideshowIndex = Math.floor(Math.random() * 3);

var slideshowTransition = function() {
  var url = slideshowUrls[slideshowIndex];

  slideshow.css('background-image', 'url(' + url + ')');

  slideshowIndex = slideshowIndex + 1;
  if (slideshowIndex > slideshowUrls.length - 1) {
    slideshowIndex = 0;
  }
};

var slideshowRun = function() {
  slideshowTransition();
  slideshow.fadeIn('slow', function() {
    setTimeout(function() {
      slideshow.fadeOut('slow', slideshowRun);
    }, slideshowTimeToDisplay);
  });
}

slideshowRun();

var realtedProductsCarouselRun = function(numItemsToShow) {
  var relatedProductsWrapper = $('.js-carousel-wrapper')
  var relatedProductsList = $('.js-carousel-list')
  var relatedProductsItem = $('.js-carousel-item')
  var relatedProductsLength = relatedProductsItem.length
  var offsetX = 0
  if (!numItemsToShow) {
    var numItemsToShow = 1
  }
  var relatedProductsItemWidth

  relatedProductsItem.css('width',  Math.floor(relatedProductsWrapper.width() / numItemsToShow))
  relatedProductsItemWidth = relatedProductsItem.width()
  relatedProductsList.css('width', Math.floor(relatedProductsItemWidth * relatedProductsLength))

  if ((relatedProductsItemWidth * relatedProductsLength) < relatedProductsWrapper.width()) {
    $('.js-carousel-arrow-prev, .js-carousel-arrow-next').hide()
  }

  $('.js-carousel-arrow-prev').click(function(e) {
    if (offsetX < 0) {
      offsetX = offsetX + relatedProductsItemWidth
      relatedProductsList.css('transform', 'translateX(' + offsetX +'px)')
    }
    return false;
  })

  $('.js-carousel-arrow-next').click(function(e) {
    if ((offsetX * -1) <= (relatedProductsList.width() - (relatedProductsItemWidth * numItemsToShow))) {
      offsetX = offsetX - relatedProductsItemWidth
      relatedProductsList.css('transform', 'translateX(' + offsetX +'px)')
    }
    return false;
  })
}

var responsiveRealtedProductsCarouselRun = function() {
  if (window.innerWidth <= 320) {
    realtedProductsCarouselRun(1);
  }
  if (window.innerWidth >= 320) {
    realtedProductsCarouselRun(2);
  }
  if (window.innerWidth >= 768) {
    realtedProductsCarouselRun(3);
  }
  if (window.innerWidth >= 1024) {
    realtedProductsCarouselRun(4);
  }
}

realtedProductsCarouselRun();
responsiveRealtedProductsCarouselRun();

var userFeed = new Instafeed({
  get: 'user',
  userId: '5555136314',
  accessToken: '5555136314.ac3bfd8.0563de251fb54bf0af91387669045341',
  limit: 6,
  template: '<a href="{{link}}" target="_blank"><img src="{{image}}" /></a>'
});
userFeed.run();

var scroll = new SmoothScroll('a[href*="#"]', {
  header: '[data-scroll-header]',
  offset: 30
});

$('#contact-form').on("submit", function(e) {
  _self = $(this);
  e.preventDefault();

  $('#contact-form-response').removeClass('alert--success');
  $('#contact-form-response').html('');
  _self.find($('input, textarea')).removeClass('danger');

  $.ajax({
    url: "/process.php",
    data: _self.serialize(),
    type: "POST",
    success:function(data){
      $('#contact-form-response').show();
      if (data.type === "danger") {
        $('#contact-form-response').addClass('alert--' + data.type);
        var ul = $('<ul>');
        $.each(data.message, function(index, value) {
          $('#' + value.field).addClass(data.type);
          ul.append('<li>' + value.text + '</li>');
          $('#contact-form-response').append(ul);
        });
        _self.find($('input, textarea')).keyup(function() {
          $(this).removeClass(data.type);
        });
      } else if (data.type === "success") {
        $('#contact-form-response').removeClass('alert--danger');
        $('#contact-form-response').addClass('alert--' + data.type);
        $('#contact-form-response').html(data.message);
        _self[0].reset();
        setTimeout(function() {
          $('#contact-form-response').hide();
        }, 3000);
      }
    },
    error: function (e){
      console.log(e.status + ' ' + e.statusText);
      $('#contact-form-response').addClass('alert--danger');
      _self.find($('input:not([type="submit"]), textarea')).addClass('danger');
      $('#contact-form-response').show();
      $('#contact-form-response').html('Whoops! Something went wrong! But it\'s on us... We\'re sorry :(<br>Please, try again later.');
    }
  });
});

window.onresize = function() {
  console.log(window.innerWidth)
  responsiveRealtedProductsCarouselRun();
}
