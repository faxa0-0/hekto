import './styles/plp-grid.scss';
import { onDocumentReady } from '../utils/dom.js';

const state = {
  elements: {},
};

const cacheState = () => {
  state.elements = {
    sortBy: document.getElementById('sort'),
    url: new URL(window.location.href),
    collectionGridWrapper: document.getElementById('plp-grid'),
    collectionGrid: document.getElementById('plp-grid-inner'),
    addToCartItems: document.querySelectorAll('#addToCart'),
    cart: document.querySelector('.c-cart-drawer'),
    filterCheckbox: document.querySelectorAll(
      ".filter-container input[type='checkbox']",
    ),
    filterPrice: document.querySelectorAll(
      ".filter-group-display__price-range input[type='number']",
    ),
    loadMoreBtn: document.querySelector('.plp-grid--load-more'),
    defaultPage: 2,
  };
};

const resultData = (data) => {
  const newInnerHtml = new DOMParser()
    .parseFromString(data, 'text/html')
    .getElementById('plp-grid-inner').innerHTML;

  state.elements.collectionGrid.innerHTML = newInnerHtml;
};

function updateUrlParams() {
  const sortBy = state.elements.sortBy;
  const params = new URLSearchParams();

  if (sortBy.value) {
    state.elements.defaultPage = 2;
    params.set(sortBy.name, sortBy.value);
  }

  state.elements.filterCheckbox.forEach((checkbox) => {
    if (checkbox.checked) {
      const name = checkbox.getAttribute('name');
      const value = checkbox.getAttribute('value');
      state.elements.defaultPage = 2;
      params.append(name, value);
    }
  });

  state.elements.filterPrice.forEach((price) => {
    state.elements.defaultPage = 2;
    const name = price.getAttribute('name');
    params.set(name, price.value);
  });

  state.elements.url.search = params.toString();
  window.history.pushState({}, '', state.elements.url);
}

const fetchData = async () => {
  const res = await fetch(state.elements.url);
  const data = await res.text();

  if (data) {
    resultData(data);
  }
};

const sortFunction = async (e) => {
  updateUrlParams();

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

const loadMoreFunction = async () => {
  try {
    const response = await fetch(
      window.location.pathname +
        `?section=${window.SectionID}&page=${state.elements.defaultPage}`,
    );
    const html = await response.text();
    const collectionsWrapper = new DOMParser().parseFromString(
      html,
      'text/html',
    );
    const items = collectionsWrapper.querySelectorAll('.plp-item');
    const nextPageState = collectionsWrapper
      .getElementById('plp-grid')
      .getAttribute('data-has-next-page');
    state.elements.collectionGridWrapper.setAttribute(
      'data-has-next-page',
      nextPageState,
    );
    state.elements.defaultPage += 1;
    items.forEach((item) => {
      state.elements.collectionGrid.insertAdjacentElement('beforeend', item);
    });
  } catch (error) {
    console.error('Error loading more:', error);
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

  state.elements.filterPrice.forEach((price) => {
    price.addEventListener('change', async () => {
      updateUrlParams();
      fetchData();
    });
  });

  state.elements.filterCheckbox.forEach((checkbox) => {
    checkbox.addEventListener('change', async () => {
      updateUrlParams();
      fetchData();
    });
  });

  state.elements.loadMoreBtn.addEventListener('click', loadMoreFunction);
};

const init = () => {
  cacheState();
  attachEventListeners();
};

onDocumentReady(init);

class AddToCart extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    onDocumentReady(() => {
      this.addToCart = this.querySelector("[data-component='add-to-cart']");
      this.init();
    });
  }

  init() {
    document.addEventListener('click', (e) => {
      addToCart(e);
    });
  }
}

customElements.define('add-to-cart', AddToCart);
