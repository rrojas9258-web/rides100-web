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
    const open = !mobileMenu.hidden;
    menuToggle.textContent = open ? '×' : '☰';
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  });

  mobileMenu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      mobileMenu.hidden = true;
      menuToggle.textContent = '☰';
      menuToggle.setAttribute('aria-expanded', 'false');
      menuToggle.setAttribute('aria-label', 'Open menu');
    });
  });
}

const ecoModal = document.getElementById('ecoModal');
const ecoModalTitle = document.getElementById('ecoModalTitle');
const ecoModalDescription = document.getElementById('ecoModalDescription');
const ecoModalLink = document.getElementById('ecoModalLink');

document.querySelectorAll('[data-eco-name]').forEach((hotspot) => {
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


const signupForm = document.getElementById('signupForm');
const signupType = document.getElementById('signupType');
const signupStatus = document.getElementById('signupStatus');
const driverFields = document.getElementById('driverFields');
const signupSubmit = document.querySelector('.signup-submit');
const signupTabs = document.querySelectorAll('[data-signup-type]');

function setSignupType(type) {
  if (!signupType) return;
  const isDriver = type === 'driver';
  signupType.value = isDriver ? 'driver' : 'rider';
  if (driverFields) driverFields.hidden = !isDriver;
  if (signupSubmit) signupSubmit.textContent = isDriver ? 'Join Driver Launch List' : 'Join Rider Launch List';
  signupTabs.forEach((tab) => {
    const active = tab.dataset.signupType === signupType.value;
    tab.classList.toggle('active', active);
    tab.setAttribute('aria-selected', String(active));
  });
}

signupTabs.forEach((tab) => {
  tab.addEventListener('click', () => setSignupType(tab.dataset.signupType || 'rider'));
});

if (signupForm) {
  signupForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const name = document.getElementById('signupName')?.value.trim() || '';
    const email = document.getElementById('signupEmail')?.value.trim() || '';
    const phone = document.getElementById('signupPhone')?.value.trim() || '';
    const city = document.getElementById('signupCity')?.value.trim() || '';
    const vehicle = document.getElementById('signupVehicle')?.value.trim() || '';
    const website = document.getElementById('signupWebsite')?.value.trim() || '';
    const consent = document.getElementById('signupConsent')?.checked === true;
    const type = signupType?.value === 'driver' ? 'driver' : 'rider';

    if (!name || !email || !consent) {
      if (signupStatus) signupStatus.textContent = 'Please enter your name, email, and confirm consent.';
      return;
    }

    if (signupSubmit) signupSubmit.setAttribute('disabled', 'true');
    if (signupStatus) signupStatus.textContent = 'Saving your signup…';

    try {
      const response = await fetch('https://utpprhmhbnioisavfdst.supabase.co/functions/v1/r100-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          signupType: type,
          name,
          email,
          phone,
          city,
          vehicle,
          website,
          consent,
        }),
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result?.error || 'Could not save signup.');

      signupForm.reset();
      setSignupType(type);
      if (signupStatus) {
        signupStatus.textContent = result?.duplicate
          ? 'You are already on the Rides100 launch list.'
          : 'Success — you are on the Rides100 launch list.';
      }
    } catch (error) {
      if (signupStatus) signupStatus.textContent = error instanceof Error ? error.message : 'Could not save signup.';
    } finally {
      if (signupSubmit) signupSubmit.removeAttribute('disabled');
    }
  });
}

if (signupType) {
  const requestedType = new URLSearchParams(window.location.search).get('type');
  if (requestedType === 'driver' || requestedType === 'rider') setSignupType(requestedType);
}
