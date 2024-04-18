import { onDocumentReady } from '../utils/dom.js';
import Swiper from 'swiper';
import { Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import { loadedScripts } from '../utils/loadedScripts.js';

const state = {
  elements: {},
};

const cacheState = () => {
  state.elements = {
    sliders: document.querySelectorAll('[data-component="hero-slider"]'),
  };
};

// TODO: Pagination doesn't work with multiple instances of swiper

const initSwipers = () => {
  state.elements.sliders.forEach((slider) => {
    const swiper = new Swiper(slider, {
      loop: true,
      modules: [Pagination],
      pagination: {
        el: slider.querySelector('[data-component="hero-slider-pagination"]'),
        clickable: true,
      },
    });
  });
};

const init = () => {
  if (loadedScripts()) return;
  cacheState();
  initSwipers();
};

onDocumentReady(() => init());
