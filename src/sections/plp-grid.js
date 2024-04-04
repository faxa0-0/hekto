import './styles/plp-grid.scss';
import { onDocumentReady } from '../utils/dom.js';

const state = {
  elements: {},
};

const cacheState = () => {
  state.elements = {
    sortBy: document.getElementById('sort'),
    url: new URL(window.location.href),
    collectionGrid: document.getElementById('plp-grid'),
    addToCartItems: document.querySelectorAll('#addToCart'),
    cart: document.querySelector('.c-cart-drawer'),
  };
};

const resultData = (data) => {
  const newInnerHtml = new DOMParser()
    .parseFromString(data, 'text/html')
    .getElementById('plp-grid').innerHTML;

  state.elements.collectionGrid.innerHTML = newInnerHtml;
};

const addToParam = (name, value) => {
  state.elements.url.searchParams.set(name, value);
  window.history.pushState({}, '', state.elements.url);
};

const fetchData = async () => {
  const res = await fetch(state.elements.url);
  const data = await res.text();

  if (data) {
    resultData(data);
  }
};

const sortFunction = async (e) => {
  addToParam(e.target.name, e.target.value);

  fetchData();
};

const addToCart = async (addToCartItem, dataId) => {
  try {
    addToCartItem.classList.add('active');

    let formData = {
      items: [
        {
          id: dataId,
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
    addToCartItem.querySelector('.loader').classList.add('loaded');
    setTimeout(() => {
      addToCartItem.querySelector('.loader').classList.remove('loaded');
      addToCartItem.classList.remove('active');
    }, 2000);
    state.elements.cart.classList.add('c-cart-drawer--active');
  }
};

const attachEventListeners = () => {
  state.elements.sortBy.addEventListener('change', sortFunction);

  state.elements.addToCartItems.forEach((addToCartItem) => {
    addToCartItem.addEventListener('click', (e) => {
      e.preventDefault();
      const dataId = addToCartItem.getAttribute('data-id');
      addToCart(addToCartItem, dataId);
    });
  });
};

const init = () => {
  cacheState();
  attachEventListeners();
};

onDocumentReady(init);
