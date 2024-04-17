import { onDocumentReady } from '../utils/dom.js';
import Swiper from 'swiper';
import { Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

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
  cacheState();
  if (window.loadedScripts["hero-slider"]) return;
  window.loadedScripts["hero-slider"] = true;
  initSwipers();
};

onDocumentReady(() => init());
