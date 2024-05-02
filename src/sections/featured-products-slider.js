import './styles/featured-products-slider.scss';
import { onDocumentReady } from '../utils/dom.js';
import Swiper from 'swiper';
import { Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import { loadedScripts } from '../utils/loadedScripts.js';

const state = {
  elements: {},
};

const addToCart = async (event) => {
  event.preventDefault();
  const target = event.target.closest("[data-component='add-to-cart']");
  try {
    target.classList.add('active');

    let formData = {
      items: [
        {
          id: target.getAttribute('data-id'),
          quantity: 1,
        },
      ],
    };

    const res = await fetch(window.Shopify.routes.root + 'cart/add.js', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });
    await res.json();
  } catch (error) {
    console.error('Error:', error);
  } finally {
    target.querySelector('.loader').classList.add('loaded');
    setTimeout(() => {
      target.querySelector('.loader').classList.remove('loaded');
      target.classList.remove('active');
    }, 2000);
    state.elements.cart.classList.add('c-cart-drawer--active');
  }
};

class AddToCart extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.addEventListener('click', (e) => addToCart(e));
  }
}

customElements.define('add-to-cart', AddToCart);

const cacheState = () => {
  state.elements = {
    sliders: document.querySelectorAll('.featured-products__slider'),
  };
};

const initSwipers = () => {
  state.elements.sliders.forEach((slider) => {
    const swiper = new Swiper(slider, {
      slidesPerView: 4,
      spaceBetween: 29,
      breakpoints: {
        220: {
          slidesPerView: 1,
          spaceBetween: 10,
        },
        370: {
          slidesPerView: 2,
          spaceBetween: 10,
        },
        550: {
          slidesPerView: 3,
          spaceBetween: 20,
        },
        1000: {
          slidesPerView: 4,
          spaceBetween: 30,
        },
      },
      modules: [Pagination],
      pagination: {
        el: slider.querySelector('.featured-products__slider--pagination'),
        clickable: true,
      },
    });
  });
};

const init = () => {
  if (loadedScripts('featured-products')) return;
  cacheState();
  initSwipers();
};

onDocumentReady(() => init());
