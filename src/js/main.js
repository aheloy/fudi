let swiper = new Swiper('.swiper-container', {
  pagination: '.swiper-pagination',
  paginationClickable: true
});

let iconsToMorph = document.getElementsByClassName('benefits__icon');
for (let i = 0; i < iconsToMorph.length; i++) {
  iconsToMorph[i].onmouseover = function () {
    let icons = new SVGMorpheus('#icons');
    icons.to('logo');
  }
}
