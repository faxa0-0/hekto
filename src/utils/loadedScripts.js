export const loadedScripts = (sectionScripts) => {
  if (window.loadedScripts[sectionScripts]) return true;
  window.loadedScripts[sectionScripts] = true;
  return false;
};
