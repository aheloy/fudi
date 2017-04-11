'use strict';

var swiper = new Swiper('.swiper-container', {
  pagination: '.swiper-pagination',
  paginationClickable: true
});

var iconsToMorph = document.getElementsByClassName('benefits__icon');
for (var i = 0; i < iconsToMorph.length; i++) {
  iconsToMorph[i].onmouseover = function () {
    var icons = new SVGMorpheus('#icons');
    icons.to('logo');
  };
}
//# sourceMappingURL=main.js.map
