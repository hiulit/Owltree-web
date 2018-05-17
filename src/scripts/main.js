var timeToDisplay = 5000;

var slideshow = $('.js-slideshow');

var urls = [
  'assets/backgrounds/summer-collection-1.jpg',
  'assets/backgrounds/summer-collection-2.jpg',
  'assets/backgrounds/summer-collection-3.jpg',
  'assets/backgrounds/summer-collection-4.jpg'
];

var index = Math.floor(Math.random() * 3);

var transition = function() {
  var url = urls[index];

  slideshow.css('background-image', 'url(' + url + ')');

  index = index + 1;
  if (index > urls.length - 1) {
    index = 0;
  }
};

var run = function() {
  transition();
  slideshow.fadeIn('slow', function() {
    setTimeout(function() {
      slideshow.fadeOut('slow', run);
    }, timeToDisplay);
  });
}

run();

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
