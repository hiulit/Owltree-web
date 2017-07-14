var userFeed = new Instafeed({
  get: 'user',
  userId: '5555136314',
  accessToken: '5555136314.ac3bfd8.0563de251fb54bf0af91387669045341',
  limit: 6,
  template: '<a href="{{link}}" target="_blank"><img src="{{image}}" /></a>'
});
userFeed.run();
