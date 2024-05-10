import './styles/pdp.scss';
import { onDocumentReady } from '../utils/dom.js';
import Swiper from 'swiper';
import { Navigation, Scrollbar } from 'swiper/modules';
import 'swiper/css/bundle';
import { loadedScripts } from '../utils/loadedScripts.js';

const state = {
  elements: {},
};

const cacheState = () => {
  state.elements = {
    sliders: document.querySelectorAll('.pdp-grid--container'),
    stickyElement: document.querySelector('[data-sticky-element]'),
    stickyAnchor: document.querySelector('[data-sticky-element]').parentNode,
  };
};
const getAnchorOffset = () =>
  state.elements.stickyAnchor.getBoundingClientRect().top;

const updateSticky = () => {
  const isSticky = getAnchorOffset() < 0;
  state.elements.stickyElement.classList.toggle('is-sticky', isSticky);
};

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
  window.addEventListener('scroll', updateSticky);
  window.addEventListener('resize', updateSticky);
};

const init = () => {
  if (loadedScripts('pdp')) return;
  cacheState();
  updateSticky();
  attachEventListeners();
};

onDocumentReady(() => init());
