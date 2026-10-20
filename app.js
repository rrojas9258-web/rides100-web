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


const webRideRequestForm = document.getElementById('webRideRequestForm');
if (webRideRequestForm) {
  webRideRequestForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const pickup = document.getElementById('webPickup')?.value.trim() || '';
    const destination = document.getElementById('webDestination')?.value.trim() || '';
    const rideType = document.getElementById('webRideType')?.value || 'standard';
    const requestMode = document.getElementById('webRequestMode')?.value || 'now';
    const scheduleDate = document.getElementById('webScheduleDate')?.value || '';
    const scheduleTime = document.getElementById('webScheduleTime')?.value || '';
    const status = document.getElementById('webRideStatus');

    if (!pickup || !destination) {
      if (status) status.textContent = 'Enter both pickup and destination.';
      return;
    }

    let scheduledFor = null;
    if (requestMode === 'advance') {
      if (!scheduleDate || !scheduleTime) {
        if (status) status.textContent = 'Choose a date and time for your advance request.';
        return;
      }
      const selected = new Date(`${scheduleDate}T${scheduleTime}`);
      if (!Number.isFinite(selected.getTime()) || selected.getTime() <= Date.now()) {
        if (status) status.textContent = 'Choose a future date and time.';
        return;
      }
      scheduledFor = selected.toISOString();
    }

    sessionStorage.setItem('r100PendingRide', JSON.stringify({ pickup, destination, rideType, requestMode, scheduledFor }));
    if (status) status.textContent = requestMode === 'advance'
      ? 'Advance request saved. Rider Sign In is required before scheduling can be confirmed.'
      : 'Rider Sign In is required before a live request can be sent.';
    window.location.href = 'rider-signin.html?next=request-ride';
  });
}


const rideCategoryCards = document.querySelectorAll('.ride-category-card');
const webRideTypeInput = document.getElementById('webRideType');

rideCategoryCards.forEach((card) => {
  card.addEventListener('click', () => {
    const type = card.dataset.rideType;
    if (!type || !webRideTypeInput) return;

    webRideTypeInput.value = type;
    rideCategoryCards.forEach((item) => {
      const active = item === card;
      item.classList.toggle('active', active);
      item.setAttribute('aria-pressed', String(active));
    });
  });
});


const scheduleOptions = document.querySelectorAll('.schedule-option');
const webRequestMode = document.getElementById('webRequestMode');
const scheduleFields = document.getElementById('scheduleFields');
const webScheduleDate = document.getElementById('webScheduleDate');

if (webScheduleDate) {
  const today = new Date();
  const localToday = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  webScheduleDate.min = localToday;
}

scheduleOptions.forEach((option) => {
  option.addEventListener('click', () => {
    const mode = option.dataset.requestMode === 'advance' ? 'advance' : 'now';
    if (webRequestMode) webRequestMode.value = mode;
    if (scheduleFields) scheduleFields.hidden = mode !== 'advance';
    scheduleOptions.forEach((item) => {
      const active = item === option;
      item.classList.toggle('active', active);
      item.setAttribute('aria-pressed', String(active));
    });
  });
});


const businessRequestForm = document.getElementById('businessRequestForm');
if (businessRequestForm) {
  const businessDate = document.getElementById('businessDate');
  if (businessDate) {
    const now = new Date();
    businessDate.min = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  }

  businessRequestForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const status = document.getElementById('businessStatus');
    const org = document.getElementById('businessOrg')?.value.trim() || '';
    const contact = document.getElementById('businessContact')?.value.trim() || '';
    const email = document.getElementById('businessEmail')?.value.trim() || '';
    const phone = document.getElementById('businessPhone')?.value.trim() || '';
    const eventName = document.getElementById('businessEvent')?.value.trim() || '';
    const passengers = Number(document.getElementById('businessPassengers')?.value || 0);
    const date = document.getElementById('businessDate')?.value || '';
    const time = document.getElementById('businessTime')?.value || '';
    const pickup = document.getElementById('businessPickup')?.value.trim() || '';
    const destination = document.getElementById('businessDestination')?.value.trim() || '';
    const notes = document.getElementById('businessNotes')?.value.trim() || '';
    const fleet = {
      standard: Number(document.getElementById('businessStandard')?.value || 0),
      van: Number(document.getElementById('businessVan')?.value || 0),
      black: Number(document.getElementById('businessBlack')?.value || 0),
      blackSuv: Number(document.getElementById('businessSuv')?.value || 0),
    };

    const fleetValues = Object.values(fleet);
    const totalVehicles = fleetValues.reduce((sum, value) => sum + value, 0);

    if (!org || !contact || !email || !eventName || !pickup || !destination || !date || !time || passengers < 1) {
      if (status) status.textContent = 'Complete the required event and contact information.';
      return;
    }
    if (fleetValues.some((value) => !Number.isInteger(value) || value < 0 || value > 50) || totalVehicles < 1) {
      if (status) status.textContent = 'Request at least one vehicle. Maximum 50 per category.';
      return;
    }

    const scheduled = new Date(`${date}T${time}`);
    if (!Number.isFinite(scheduled.getTime()) || scheduled.getTime() <= Date.now()) {
      if (status) status.textContent = 'Choose a future event date and pickup time.';
      return;
    }

    const pending = {
      org,
      contact,
      email,
      phone,
      eventName,
      passengers,
      scheduledFor: scheduled.toISOString(),
      pickup,
      destination,
      fleet,
      totalVehicles,
      notes,
      createdAt: new Date().toISOString(),
    };

    sessionStorage.setItem('r100PendingBusinessRequest', JSON.stringify(pending));
    if (status) status.textContent = `R-Business request prepared for ${totalVehicles} vehicle${totalVehicles === 1 ? '' : 's'}. Live business booking is not active yet.`;
  });
}
