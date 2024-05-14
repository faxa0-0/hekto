import './styles/pdp.scss';
import { onDocumentReady } from '../utils/dom.js';
import Swiper from 'swiper';
import { Navigation, Scrollbar } from 'swiper/modules';
import 'swiper/css/bundle';
import { loadedScripts } from '../utils/loadedScripts.js';

const state = {
  elements: {},
  lastScrollTop: 0,
  selectedProductOptionsList: {},
};

const cacheState = () => {
  state.elements = {
    sliders: document.querySelectorAll('.pdp-grid--container'),
    stickyElement: document.querySelector('[data-sticky-element]'),
    quantityInput: document.querySelector('#quantity-selector--value'),
    quantityValueIncrease: document.querySelector(
      '.quantity-selector--increase',
    ),
    quantityValueDecrease: document.querySelector(
      '.quantity-selector--decrease',
    ),
    addToCartButton: document.querySelector('#addToCart-btn'),
    optionContainer: document.querySelector(
      '.pdp-info--variant-option--container',
    ),
  };
  window.pdpCurrentProduct.options.forEach((option) => {
    state.selectedProductOptionsList[option] = '';
  });
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
function onQuantityValueIncrease(event) {
  const currentValue = Number(state.elements.quantityInput.value);
  state.elements.quantityInput.value = currentValue + 1;
}
function onQuantityValueDecrease(event) {
  const currentValue = Number(state.elements.quantityInput.value);
  if (currentValue > 1) state.elements.quantityInput.value = currentValue - 1;
}

function onOptionChange(event) {
  const name = event.target.attributes.name.value;
  const value = event.target.value;

  state.selectedProductOptionsList[name] = value;

  const optionTitle = document.getElementById(
    `pdp-info--variant-${name}-option-title`,
  );
  optionTitle.classList.remove('failed');
  optionTitle.innerHTML = name + ': <span>' + value + '</span>';
}

function validateData() {
  const emptyKeys = [];

  for (const key in state.selectedProductOptionsList) {
    if (
      state.selectedProductOptionsList.hasOwnProperty(key) &&
      state.selectedProductOptionsList[key] === ''
    ) {
      emptyKeys.push(key);
    }
  }
  if (emptyKeys.length != 0) {
    return showError(emptyKeys);
  }

  const selectedVariant = window.pdpCurrentProduct.variants.find(
    (variant) =>
      variant.title ===
      Object.values(state.selectedProductOptionsList).join(' / '),
  );

  if (!selectedVariant) {
    return showError("It's just impossible");
  }
  return selectedVariant.id;
}
function showError(value) {
  switch (typeof value) {
    case 'string':
      state.elements.addToCartButton.textContent = 'Failed to Add';
      state.elements.addToCartButton.classList.add('failed');
      console.error('there is no ID in variant');
      break;
    case 'object':
      if (Array.isArray(value)) {
        value.map((option) => {
          let optionTitle = document.getElementById(
            `pdp-info--variant-${option}-option-title`,
          );
          optionTitle.textContent = `Please select your ${option}`;
          optionTitle.classList.add('failed');
        });
      }
      break;
    default:
  }
}

function addToCart() {
  const selectedProductID = validateData();

  if (!selectedProductID) return;

  const selectedProductData = {
    items: [
      {
        id: selectedProductID,
        quantity: state.elements.quantityInput.value,
      },
    ],
  };

  fetch(window.Shopify.routes.root + 'cart/add.js', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(selectedProductData),
  })
    .then((response) => {
      return response.json();
    })
    .catch((error) => {
      console.error('Error:', error);
    });
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
  state.elements.quantityValueIncrease.addEventListener('click', (e) =>
    onQuantityValueIncrease(e),
  );
  state.elements.quantityValueDecrease.addEventListener('click', (e) =>
    onQuantityValueDecrease(e),
  );
  state.elements.addToCartButton.addEventListener('click', addToCart);
  state.elements.optionContainer.addEventListener('change', (e) =>
    onOptionChange(e),
  );
};

const init = () => {
  if (loadedScripts('pdp')) return;
  cacheState();
  attachEventListeners();
};

onDocumentReady(init);
