import './styles/plp-grid.scss';
import { onDocumentReady } from '../utils/dom.js';

const state = {
  elements: {},
};

const cacheState = () => {
  state.elements = {
    plpOverlay: document.querySelector('.plp-overlay'),
    mobileCloseBtn: document.querySelector('.plp-grid--filters .icon-close'),
    mobileOpenBtn: document.querySelector('.plp-filters--mobile-btn'),
    mobileFilters: document.querySelector('.plp-grid--filters'),
    sortBy: document.getElementById('sort'),
    url: new URL(window.location.href),
    collectionGridWrapper: document.getElementById('plp-grid'),
    collectionGrid: document.getElementById('plp-grid-inner'),
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

const toggleFilterSidebar = () => {
  document.body.classList.toggle('overflow-hidden');
  state.elements.plpOverlay.classList.toggle('active');
  state.elements.mobileFilters.classList.toggle('open');
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

  state.elements.mobileCloseBtn.addEventListener('click', toggleFilterSidebar);
  state.elements.mobileOpenBtn.addEventListener('click', toggleFilterSidebar);
  state.elements.plpOverlay.addEventListener('click', toggleFilterSidebar);

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
    this.addEventListener('click', (e) => addToCart(e));
  }
}

customElements.define('add-to-cart', AddToCart);
