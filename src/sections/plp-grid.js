import './styles/plp-grid.scss';
import { onDocumentReady } from '../utils/dom.js';

const state = {
  elements: {},
  defaultPage: 2,
  url: new URL(window.location.href),
  soloParams: ['sort_by', 'filter.v.price.gte', 'filter.v.price.lte', 'page'],
  queryParams: new URLSearchParams(window.location.search),
};

const cacheState = () => {
  state.elements = {
    plpOverlay: document.querySelector('.plp-overlay'),
    mobileCloseBtn: document.querySelector('.plp-grid--filters .icon-close'),
    mobileOpenBtn: document.querySelector('.plp-filters--mobile-btn'),
    mobileFilters: document.querySelector('.plp-grid--filters'),
    collectionGridWrapper: document.getElementById('plp-grid'),
    collectionGrid: document.getElementById('plp-grid-inner'),

    sortBy: document.getElementById('sort'),
    filtersContainer: document.querySelector('.filters-form'),
    loadMoreBtn: document.querySelector('.plp-grid--load-more'),
  };
};

const toggleFilterSidebar = (force) => {
  document.body.classList.toggle('overflow-hidden', force);
  state.elements.plpOverlay.classList.toggle('active');
  state.elements.mobileFilters.classList.toggle('open');
};

const renderData = (data) => {
  const newNextPageState = new DOMParser()
    .parseFromString(data, 'text/html')
    .getElementById('plp-grid')
    .getAttribute('data-has-next-page');

  const newInnerHtml = new DOMParser()
    .parseFromString(data, 'text/html')
    .getElementById('plp-grid-inner').innerHTML;

  state.elements.collectionGridWrapper.setAttribute(
    'data-has-next-page',
    newNextPageState,
  );

  state.elements.collectionGrid.innerHTML = newInnerHtml;
};

const fetchData = async () => {
  try {
    const res = await fetch(state.url);
    const data = await res.text();

    if (data) {
      return data;
    }
  } catch (error) {
    console.error(error);
  }
};

function updateUrl() {
  state.url.search = state.queryParams.toString();
  window.history.pushState({}, '', state.url);
}

function setUrlParams(name, value) {
  if (state.queryParams.has(name, value)) {
    state.queryParams.delete(name, value);
  } else if (
    (name == 'filter.v.price.gte' || name == 'filter.v.price.lte') &&
    value == ''
  ) {
    state.queryParams.delete(name);
  } else if (state.soloParams.includes(name)) {
    state.queryParams.set(name, value);
  } else {
    state.queryParams.append(name, value);
  }
}

const onSortAndFilterChange = async (e) => {
  const name = e.target.attributes.name.value;
  const value = e.target.value;

  setUrlParams(name, value);

  updateUrl();

  const data = await fetchData();

  renderData(data);

  state.defaultPage = 2;
};

const loadMoreFunction = async () => {
  try {
    const response = await fetch(
      window.location.pathname +
        `?section=${window.SectionID}&${state.queryParams.toString()}&page=${state.defaultPage}`,
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
    state.defaultPage += 1;
    items.forEach((item) => {
      state.elements.collectionGrid.insertAdjacentElement('beforeend', item);
    });
  } catch (error) {
    console.error('Error loading more:', error);
  }
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
  }
};

const attachEventListeners = () => {
  state.elements.sortBy.addEventListener('change', (e) => {
    onSortAndFilterChange(e);
  });

  state.elements.filtersContainer.addEventListener('change', async (e) => {
    onSortAndFilterChange(e);
  });

  state.elements.mobileCloseBtn.addEventListener('click', toggleFilterSidebar);
  state.elements.mobileOpenBtn.addEventListener('click', toggleFilterSidebar);
  state.elements.plpOverlay.addEventListener('click', () =>
    toggleFilterSidebar(false),
  );

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
