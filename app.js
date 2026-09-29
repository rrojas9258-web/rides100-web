const pickup = document.getElementById('pickupInput');
const destination = document.getElementById('destinationInput');
const button = document.getElementById('previewOffersButton');
const panel = document.getElementById('offersPanel');

if (button && panel) {
  button.addEventListener('click', () => {
    const hasPickup = pickup && pickup.value.trim().length > 0;
    const hasDestination = destination && destination.value.trim().length > 0;
    if (!hasPickup || !hasDestination) {
      button.textContent = 'Enter pickup and destination';
      setTimeout(() => { button.textContent = 'Preview driver offers'; }, 1800);
      return;
    }
    panel.hidden = false;
    button.textContent = 'Sample offers ready';
    panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });
}

const menuToggle = document.getElementById('menuToggle');
const mobileMenu = document.getElementById('mobileMenu');

if (menuToggle && mobileMenu) {
  menuToggle.addEventListener('click', () => {
    mobileMenu.hidden = !mobileMenu.hidden;
    menuToggle.textContent = mobileMenu.hidden ? '☰' : '×';
  });

  mobileMenu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      mobileMenu.hidden = true;
      menuToggle.textContent = '☰';
    });
  });
}

const ecoModal = document.getElementById('ecoModal');
const ecoModalTitle = document.getElementById('ecoModalTitle');
const ecoModalDescription = document.getElementById('ecoModalDescription');
const ecoModalLink = document.getElementById('ecoModalLink');

document.querySelectorAll('.eco-hotspot[data-eco-name]').forEach((hotspot) => {
  hotspot.addEventListener('click', () => {
    if (!ecoModal) return;
    ecoModalTitle.textContent = hotspot.dataset.ecoName || 'Riscasan project';
    ecoModalDescription.textContent = hotspot.dataset.ecoDescription || '';
    ecoModalLink.href = hotspot.dataset.ecoUrl || 'https://riscasan.com';
    ecoModalLink.textContent = 'Open ' + (hotspot.dataset.ecoName || 'project') + ' →';
    ecoModal.hidden = false;
    document.body.style.overflow = 'hidden';
    ecoModal.querySelector('.eco-modal-close')?.focus();
  });
});

document.querySelectorAll('[data-eco-close]').forEach((control) => {
  control.addEventListener('click', () => {
    if (!ecoModal) return;
    ecoModal.hidden = true;
    document.body.style.overflow = '';
  });
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && ecoModal && !ecoModal.hidden) {
    ecoModal.hidden = true;
    document.body.style.overflow = '';
  }
});
