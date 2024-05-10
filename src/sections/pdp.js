import './styles/pdp.scss';
import { onDocumentReady } from '../utils/dom.js';
import Swiper from 'swiper';
import { Navigation, Scrollbar } from 'swiper/modules';
import 'swiper/css/bundle';
import { loadedScripts } from '../utils/loadedScripts.js';

const state = {
  elements: {},
  lastScrollTop: 0,
};

const cacheState = () => {
  state.elements = {
    sliders: document.querySelectorAll('.pdp-grid--container'),
    stickyElement: document.querySelector('[data-sticky-element]'),
  };
};
function updateStickyPosition() {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

  if (scrollTop > state.lastScrollTop) {
    state.elements.stickyElement.style.top = '0';
  } else {
    state.elements.stickyElement.style.top = '90px';
  }

  state.lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
}

const initSwipers = () => {
  state.elements.sliders.forEach((slider) => {
    const swiper = new Swiper(slider, {
      loop: true,
      modules: [Navigation, Scrollbar],
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },
      scrollbar: {
        el: '.swiper-scrollbar',
        hide: false,
      },
      breakpoints: {
        300: {
          enabled: true,
          on: {
            breakpoint: function () {
              swiper.init();
            },
          },
        },
        1009: {
          enabled: false,
          on: {
            breakpoint: function () {
              swiper.destroy();
            },
          },
        },
      },
    });
  });
};
const attachEventListeners = () => {
  initSwipers();

  window.addEventListener('scroll', updateStickyPosition);
};

const init = () => {
  if (loadedScripts('pdp')) return;
  cacheState();
  attachEventListeners();
};

onDocumentReady(() => init());
