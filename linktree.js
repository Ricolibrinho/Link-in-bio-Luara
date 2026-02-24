const cards = document.querySelectorAll('.content-card');
const standViews = new Set(['front', 'left', 'right']);

function showSection(targetId) {
  cards.forEach((card) => card.classList.toggle('is-active', card.id === targetId));
}

function setStandBackground(view) {
  const next = standViews.has(view) ? view : 'front';
  document.body.dataset.stand = next;
}

document.querySelectorAll('[data-target]').forEach((trigger) => {
  trigger.addEventListener('click', () => {
    showSection(trigger.dataset.target);
    setStandBackground(trigger.dataset.rotation || 'front');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
});
