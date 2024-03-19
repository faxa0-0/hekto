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

const attachEventListeners = () => {
  state.elements.sortBy.addEventListener('change', sortFunction);
};

const init = () => {
  cacheState();
  sortFunction();
  attachEventListeners();
};

onDocumentReady(init);
