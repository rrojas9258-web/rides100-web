const RIDES100_PLATFORM_FEE_RATE = 0.17;

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
    const stop1 = document.getElementById('webStop1')?.value.trim() || '';
    const forSomeoneElse = document.getElementById('rideForSomeoneElse')?.getAttribute('aria-pressed') === 'true';
    const guestRiderName = document.getElementById('guestRiderName')?.value.trim() || '';
    const guestRiderPhone = document.getElementById('guestRiderPhone')?.value.trim() || '';
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

    if (forSomeoneElse && (!guestRiderName || !guestRiderPhone)) {
      if (status) status.textContent = 'Enter the rider name and mobile number.';
      return;
    }

    sessionStorage.setItem('r100PendingRide', JSON.stringify({
      pickup,
      destination,
      stop1: stop1 || null,
      rideType,
      requestMode,
      scheduledFor,
      forSomeoneElse,
      guestRider: forSomeoneElse ? { name: guestRiderName, phone: guestRiderPhone } : null,
    }));
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
    const rideMode = document.getElementById('businessRideMode')?.value || 'event';
    const tripFormat = document.getElementById('businessTripFormat')?.value || 'oneway';
    const guestName = document.getElementById('businessGuestName')?.value.trim() || '';
    const guestPhone = document.getElementById('businessGuestPhone')?.value.trim() || '';
    const recurringFrequency = document.getElementById('businessRecurringFrequency')?.value || '';
    const recurringEnd = document.getElementById('businessRecurringEnd')?.value || '';
    const returnDate = document.getElementById('businessReturnDate')?.value || '';
    const returnTime = document.getElementById('businessReturnTime')?.value || '';
    const coordinatorName = document.getElementById('businessCoordinatorName')?.value.trim() || '';
    const coordinatorPhone = document.getElementById('businessCoordinatorPhone')?.value.trim() || '';
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

    if (rideMode === 'guest' && (!guestName || !guestPhone)) {
      if (status) status.textContent = 'Enter the guest name and mobile number.';
      return;
    }
    if (rideMode === 'recurring' && !recurringEnd) {
      if (status) status.textContent = 'Choose an end date for the recurring ride.';
      return;
    }
    if (tripFormat === 'roundtrip' && (!returnDate || !returnTime)) {
      if (status) status.textContent = 'Choose a return date and time for the round trip.';
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
      rideMode,
      tripFormat,
      guest: rideMode === 'guest' ? { name: guestName, phone: guestPhone } : null,
      recurring: rideMode === 'recurring' ? { frequency: recurringFrequency, endDate: recurringEnd } : null,
      returnTrip: tripFormat === 'roundtrip' ? { date: returnDate, time: returnTime } : null,
      coordinator: coordinatorName || coordinatorPhone ? { name: coordinatorName, phone: coordinatorPhone } : null,
      createdAt: new Date().toISOString(),
    };

    sessionStorage.setItem('r100PendingBusinessRequest', JSON.stringify(pending));
    if (status) status.textContent = `R-Business request prepared for ${totalVehicles} vehicle${totalVehicles === 1 ? '' : 's'}. Live business booking is not active yet.`;
  });
}


document.querySelectorAll('.wallet-demo-action').forEach((button) => {
  button.addEventListener('click', () => {
    const action = button.dataset.walletAction || '';
    const status = document.getElementById('walletPreviewStatus');
    const messages = {
      add: 'Add Funds preview: Apple Pay and debit/credit card will use the secure Rides100 payment backend. No money is moved in this development preview.',
      cashout: 'Cash Out preview: driver payouts remain locked until payout policy and Stripe Connect are approved.',
      history: 'Wallet Activity preview: ledger entries will appear here after trusted backend events are connected.',
    };
    if (status) status.textContent = messages[action] || 'Wallet action is not active in this development preview.';
  });
});


document.querySelectorAll('.dashboard-demo-action').forEach((button) => {
  button.addEventListener('click', () => {
    const action = button.dataset.dashboardAction || '';
    const status = document.getElementById('dashboardStatus');
    const messages = {
      payment: 'Payment method management will activate with verified Rider Sign In and the secure payment backend.',
      profile: 'Profile and safety settings will activate with production authentication.',
      compliance: 'Driver compliance management will require verified Driver Sign In and admin-approved document review.',
    };
    if (status) status.textContent = messages[action] || 'This dashboard action is still in private development.';
  });
});


const businessAdminRequest = document.getElementById('businessAdminRequest');
if (businessAdminRequest) {
  const empty = document.getElementById('businessAdminEmpty');
  const status = document.getElementById('businessAdminStatus');

  function loadBusinessAdminPreview() {
    let pending = null;
    try { pending = JSON.parse(sessionStorage.getItem('r100PendingBusinessRequest') || 'null'); } catch {}
    if (!pending) {
      businessAdminRequest.hidden = true;
      if (empty) empty.hidden = false;
      document.getElementById('adminOpenRequests').textContent = '0';
      document.getElementById('adminVehiclesRequested').textContent = '0';
      document.getElementById('adminUnassigned').textContent = '0';
      return;
    }

    const fleet = pending.fleet || {};
    const total = Number(pending.totalVehicles || 0);
    businessAdminRequest.hidden = false;
    if (empty) empty.hidden = true;
    document.getElementById('adminOpenRequests').textContent = '1';
    document.getElementById('adminVehiclesRequested').textContent = String(total);
    document.getElementById('adminUnassigned').textContent = '1';
    document.getElementById('adminEventName').textContent = pending.eventName || 'Prepared event';
    document.getElementById('adminOrg').textContent = pending.org || '';
    document.getElementById('adminPickup').textContent = pending.pickup || 'Pickup';
    document.getElementById('adminDestination').textContent = pending.destination || 'Destination';
    document.getElementById('adminScheduled').textContent = pending.scheduledFor ? new Date(pending.scheduledFor).toLocaleString() : '—';
    document.getElementById('adminPassengers').textContent = String(pending.passengers || 0);
    document.getElementById('adminVehicleTotal').textContent = String(total);
    document.getElementById('adminContact').textContent = pending.contact || pending.email || '—';
    document.getElementById('fleetStandard').textContent = String(fleet.standard || 0);
    document.getElementById('fleetVan').textContent = String(fleet.van || 0);
    document.getElementById('fleetBlack').textContent = String(fleet.black || 0);
    document.getElementById('fleetSuv').textContent = String(fleet.blackSuv || 0);
  }

  loadBusinessAdminPreview();

  document.querySelectorAll('.admin-demo-action').forEach((button) => {
    button.addEventListener('click', () => {
      const action = button.dataset.adminAction || '';
      if (action === 'refresh') {
        loadBusinessAdminPreview();
        if (status) status.textContent = 'Preview refreshed from this browser session. No backend data was changed.';
        return;
      }
      const messages = {
        review: 'Admin review preview only. Production status changes will require authenticated admin authorization and audit logging.',
        assign: 'Driver assignment preview only. Production assignment will require eligible drivers, availability confirmation and trusted backend authorization.',
        notes: 'Admin notes preview only. Production notes will be stored in the protected back-office system.',
      };
      if (status) status.textContent = messages[action] || 'Admin action is not active in this development preview.';
    });
  });
}


const businessStatusSteps = ['prepared','reviewing','approved','partially_assigned','assigned','completed'];

function readBusinessPreviewStatus() {
  const raw = sessionStorage.getItem('r100BusinessAdminStatus') || 'prepared';
  return businessStatusSteps.includes(raw) ? raw : 'prepared';
}

function writeBusinessPreviewStatus(next) {
  if (!businessStatusSteps.includes(next)) return;
  sessionStorage.setItem('r100BusinessAdminStatus', next);
  renderBusinessPreviewStatus();
}

function renderBusinessPreviewStatus() {
  const current = readBusinessPreviewStatus();
  const currentIndex = businessStatusSteps.indexOf(current);
  const badge = document.getElementById('businessCurrentStatus');
  if (badge) badge.textContent = current.replaceAll('_', ' ').toUpperCase();

  document.querySelectorAll('[data-business-status]').forEach((item) => {
    const index = businessStatusSteps.indexOf(item.dataset.businessStatus || '');
    item.classList.toggle('done', index >= 0 && index < currentIndex);
    item.classList.toggle('active', index === currentIndex);
  });

  const unassigned = document.getElementById('adminUnassigned');
  if (unassigned) {
    unassigned.textContent = ['assigned','completed'].includes(current) ? '0' : '1';
  }
}

if (document.getElementById('businessStatusFlow')) {
  renderBusinessPreviewStatus();

  document.querySelectorAll('.admin-demo-action').forEach((button) => {
    button.addEventListener('click', () => {
      const action = button.dataset.adminAction || '';
      const status = document.getElementById('businessAdminStatus');

      if (action === 'advance-status') {
        const current = readBusinessPreviewStatus();
        const index = businessStatusSteps.indexOf(current);
        const next = businessStatusSteps[Math.min(index + 1, businessStatusSteps.length - 1)];
        writeBusinessPreviewStatus(next);
        if (next !== current) appendBusinessAudit('Event status advanced', current.replaceAll('_', ' ') + ' → ' + next.replaceAll('_', ' ') + '.');
        if (status) status.textContent = next === current
          ? 'Event is already at Completed in this development preview.'
          : `Preview status advanced to ${next.replaceAll('_', ' ')}. No production data was changed.`;
      }

      if (action === 'reset-status') {
        writeBusinessPreviewStatus('prepared');
        appendBusinessAudit('Event status reset', 'Event preview status reset to Prepared.');
        if (status) status.textContent = 'Preview status reset to Prepared. No production data was changed.';
      }
    });
  });
}


function readAssignmentPreview() {
  try {
    const rows = JSON.parse(sessionStorage.getItem('r100BusinessAssignments') || '[]');
    return Array.isArray(rows) ? rows : [];
  } catch {
    return [];
  }
}

function writeAssignmentPreview(rows) {
  sessionStorage.setItem('r100BusinessAssignments', JSON.stringify(rows));
  renderAssignmentPreview();
}

function getPreparedBusinessRequest() {
  try {
    return JSON.parse(sessionStorage.getItem('r100PendingBusinessRequest') || 'null');
  } catch {
    return null;
  }
}

function requestedCountForType(request, type) {
  const fleet = request?.fleet || {};
  return Number(fleet[type] || 0);
}

function renderAssignmentPreview() {
  const list = document.getElementById('assignmentList');
  if (!list) return;

  const request = getPreparedBusinessRequest();
  const required = Number(request?.totalVehicles || 0);
  const rows = readAssignmentPreview();

  const accepted = rows.filter((row) => row.status === 'accepted').length;
  const pending = rows.filter((row) => row.status === 'pending').length;
  const remaining = Math.max(required - accepted, 0);

  document.getElementById('assignmentRequired').textContent = String(required);
  document.getElementById('assignmentAccepted').textContent = String(accepted);
  document.getElementById('assignmentPending').textContent = String(pending);
  document.getElementById('assignmentRemaining').textContent = String(remaining);

  list.innerHTML = '';
  if (!rows.length) {
    const empty = document.createElement('div');
    empty.className = 'empty-dashboard-state';
    empty.textContent = 'No drivers added to this event preview yet.';
    list.appendChild(empty);
  } else {
    rows.forEach((row) => {
      const item = document.createElement('div');
      item.className = 'assignment-row';

      const main = document.createElement('div');
      main.className = 'assignment-row-main';
      const name = document.createElement('strong');
      name.textContent = row.name;
      const meta = document.createElement('span');
      const labelMap = { standard: 'R-Standard', van: 'R-Van', black: 'R-Black', blackSuv: 'R-SUV Black' };
      meta.textContent = labelMap[row.vehicleType] || row.vehicleType;
      main.append(name, meta);

      const select = document.createElement('select');
      select.className = 'assignment-status';
      ['pending','accepted','declined'].forEach((statusValue) => {
        const option = document.createElement('option');
        option.value = statusValue;
        option.textContent = statusValue.charAt(0).toUpperCase() + statusValue.slice(1);
        option.selected = row.status === statusValue;
        select.appendChild(option);
      });
      select.addEventListener('change', () => {
        const current = readAssignmentPreview();
        const previous = current.find((entry) => entry.id === row.id)?.status || 'pending';
        const next = current.map((entry) => entry.id === row.id ? { ...entry, status: select.value } : entry);
        writeAssignmentPreview(next);
        appendBusinessAudit('Assignment status changed', row.name + ': ' + previous + ' → ' + select.value + '.');

        const nextAccepted = next.filter((entry) => entry.status === 'accepted').length;
        const requiredVehicles = Number(getPreparedBusinessRequest()?.totalVehicles || 0);
        if (requiredVehicles > 0) {
          if (nextAccepted >= requiredVehicles) writeBusinessPreviewStatus('assigned');
          else if (nextAccepted > 0) writeBusinessPreviewStatus('partially_assigned');
        }
      });

      const actionWrap = document.createElement('div');
      actionWrap.className = 'assignment-row-actions';

      if (row.status === 'declined') {
        const reassign = document.createElement('button');
        reassign.className = 'assignment-reassign';
        reassign.type = 'button';
        reassign.textContent = 'Reassign this slot';
        reassign.addEventListener('click', () => {
          const nameInput = document.getElementById('assignmentDriverName');
          const typeInput = document.getElementById('assignmentVehicleType');
          const statusMessage = document.getElementById('businessAdminStatus');
          if (typeInput) typeInput.value = row.vehicleType;
          if (nameInput) {
            nameInput.value = '';
            nameInput.focus();
          }
          if (statusMessage) {
            statusMessage.textContent = 'Declined slot reopened for ' + (labelMap[row.vehicleType] || row.vehicleType) + '. Enter another qualified driver.';
          }
          appendBusinessAudit('Slot reopened', row.name + ' declined; ' + (labelMap[row.vehicleType] || row.vehicleType) + ' slot reopened for reassignment.');
        });
        actionWrap.appendChild(reassign);
      }

      const remove = document.createElement('button');
      remove.className = 'assignment-remove';
      remove.type = 'button';
      remove.textContent = 'Remove';
      remove.addEventListener('click', () => {
        writeAssignmentPreview(readAssignmentPreview().filter((entry) => entry.id !== row.id));
        appendBusinessAudit('Driver removed', row.name + ' removed from assignment preview.');
      });
      actionWrap.appendChild(remove);

      item.append(main, select, actionWrap);
      list.appendChild(item);
    });
  }
}

if (document.getElementById('driverAssignmentPanel')) {
  renderAssignmentPreview();

  const addButton = document.getElementById('addAssignmentDriver');
  addButton?.addEventListener('click', () => {
    const request = getPreparedBusinessRequest();
    const nameInput = document.getElementById('assignmentDriverName');
    const typeInput = document.getElementById('assignmentVehicleType');
    const status = document.getElementById('businessAdminStatus');
    const name = nameInput?.value.trim() || '';
    const vehicleType = typeInput?.value || 'standard';

    if (!request) {
      if (status) status.textContent = 'Prepare an R-Business event first before assigning drivers.';
      return;
    }
    if (name.length < 2) {
      if (status) status.textContent = 'Enter a qualified driver name for this preview.';
      return;
    }

    const requested = requestedCountForType(request, vehicleType);
    const current = readAssignmentPreview();
    const alreadyForType = current.filter((row) => row.vehicleType === vehicleType && row.status !== 'declined').length;
    if (requested < 1) {
      if (status) status.textContent = 'This event did not request that vehicle category.';
      return;
    }
    if (alreadyForType >= requested) {
      if (status) status.textContent = 'All requested vehicles in that category already have a driver in this preview.';
      return;
    }

    current.push({
      id: 'preview-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7),
      name,
      vehicleType,
      status: 'pending',
    });
    writeAssignmentPreview(current);
    appendBusinessAudit('Driver added', name + ' added for ' + vehicleType + ' as Pending.');
    if (nameInput) nameInput.value = '';
    if (status) status.textContent = 'Qualified driver added as Pending in this development preview.';
  });
}


function renderDriverBusinessInvites() {
  const list = document.getElementById('driverBusinessAssignmentList');
  if (!list) return;

  const request = getPreparedBusinessRequest();
  const assignments = readAssignmentPreview();
  list.innerHTML = '';

  if (!request || !assignments.length) {
    const empty = document.createElement('div');
    empty.className = 'empty-dashboard-state';
    empty.textContent = 'No R-Business assignment invitation in this browser session.';
    list.appendChild(empty);
    return;
  }

  assignments.forEach((row) => {
    const card = document.createElement('div');
    card.className = 'driver-business-invite';

    const title = document.createElement('h4');
    title.textContent = request.eventName || 'R-Business event';

    const org = document.createElement('p');
    org.textContent = request.org || '';

    const meta = document.createElement('div');
    meta.className = 'driver-business-invite-meta';

    const labelMap = { standard: 'R-Standard', van: 'R-Van', black: 'R-Black', blackSuv: 'R-SUV Black' };
    const items = [
      ['Vehicle', labelMap[row.vehicleType] || row.vehicleType],
      ['Pickup', request.pickup || '—'],
      ['Destination', request.destination || '—'],
      ['Scheduled', request.scheduledFor ? new Date(request.scheduledFor).toLocaleString() : '—'],
    ];
    items.forEach(([label, value]) => {
      const box = document.createElement('div');
      const a = document.createElement('span');
      a.textContent = label;
      const b = document.createElement('strong');
      b.textContent = value;
      box.append(a, b);
      meta.appendChild(box);
    });

    const actions = document.createElement('div');
    actions.className = 'driver-business-response';

    const status = document.createElement('span');
    status.className = 'driver-response-status' + (row.status === 'accepted' ? ' accepted' : row.status === 'declined' ? ' declined' : '');
    status.textContent = row.status.charAt(0).toUpperCase() + row.status.slice(1);

    const accept = document.createElement('button');
    accept.className = 'button primary';
    accept.type = 'button';
    accept.textContent = 'Accept';
    accept.disabled = row.status === 'accepted';
    accept.addEventListener('click', () => {
      const current = readAssignmentPreview();
      const next = current.map((entry) => entry.id === row.id ? { ...entry, status: 'accepted' } : entry);
      writeAssignmentPreview(next);
      appendBusinessAudit('Driver accepted', row.name + ' accepted R-Business assignment.');
      renderDriverBusinessInvites();
      const accepted = next.filter((entry) => entry.status === 'accepted').length;
      const required = Number(getPreparedBusinessRequest()?.totalVehicles || 0);
      if (required > 0) {
        if (accepted >= required) writeBusinessPreviewStatus('assigned');
        else if (accepted > 0) writeBusinessPreviewStatus('partially_assigned');
      }
      const dashboardStatus = document.getElementById('dashboardStatus');
      if (dashboardStatus) dashboardStatus.textContent = 'R-Business assignment accepted in this development preview.';
    });

    const decline = document.createElement('button');
    decline.className = 'button secondary dark-outline';
    decline.type = 'button';
    decline.textContent = 'Decline';
    decline.disabled = row.status === 'declined';
    decline.addEventListener('click', () => {
      const current = readAssignmentPreview();
      const next = current.map((entry) => entry.id === row.id ? { ...entry, status: 'declined' } : entry);
      writeAssignmentPreview(next);
      appendBusinessAudit('Driver declined', row.name + ' declined R-Business assignment.');
      renderDriverBusinessInvites();
      const dashboardStatus = document.getElementById('dashboardStatus');
      if (dashboardStatus) dashboardStatus.textContent = 'R-Business assignment declined in this development preview.';
    });

    actions.append(status, accept, decline);
    card.append(title, org, meta, actions);
    list.appendChild(card);
  });
}

if (document.getElementById('driverBusinessAssignments')) {
  renderDriverBusinessInvites();
}


function readBusinessAudit() {
  try {
    const rows = JSON.parse(sessionStorage.getItem('r100BusinessAudit') || '[]');
    return Array.isArray(rows) ? rows : [];
  } catch {
    return [];
  }
}

function appendBusinessAudit(type, detail) {
  const rows = readBusinessAudit();
  rows.unshift({
    id: 'audit-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7),
    type,
    detail,
    at: new Date().toISOString(),
  });
  sessionStorage.setItem('r100BusinessAudit', JSON.stringify(rows.slice(0, 100)));
  renderBusinessAudit();
}

function renderBusinessAudit() {
  const container = document.getElementById('businessAuditTrail');
  if (!container) return;
  const rows = readBusinessAudit();
  container.innerHTML = '';

  if (!rows.length) {
    const empty = document.createElement('div');
    empty.className = 'empty-dashboard-state';
    empty.textContent = 'No assignment activity recorded in this browser session.';
    container.appendChild(empty);
    return;
  }

  rows.forEach((row) => {
    const item = document.createElement('div');
    item.className = 'audit-entry';

    const time = document.createElement('div');
    time.className = 'audit-time';
    time.textContent = row.at ? new Date(row.at).toLocaleString() : '—';

    const body = document.createElement('div');
    body.className = 'audit-body';
    const title = document.createElement('strong');
    title.textContent = row.type || 'Activity';
    const detail = document.createElement('span');
    detail.textContent = row.detail || '';
    body.append(title, detail);

    item.append(time, body);
    container.appendChild(item);
  });
}

if (document.getElementById('businessAuditTrail')) {
  renderBusinessAudit();
  document.getElementById('clearBusinessAudit')?.addEventListener('click', () => {
    sessionStorage.removeItem('r100BusinessAudit');
    renderBusinessAudit();
    const status = document.getElementById('businessAdminStatus');
    if (status) status.textContent = 'Preview audit log cleared from this browser session only.';
  });
}


const driverOpenCounter = document.getElementById('driverOpenCounter');
const driverCounterPanel = document.getElementById('driverCounterPanel');
const driverCounterNet = document.getElementById('driverCounterNet');
const driverNetOffer = document.getElementById('driverNetOffer');
const driverAcceptNetOffer = document.getElementById('driverAcceptNetOffer');
const driverDeclineNetOffer = document.getElementById('driverDeclineNetOffer');
const driverSendCounter = document.getElementById('driverSendCounter');

if (driverOpenCounter && driverCounterPanel) {
  driverOpenCounter.addEventListener('click', () => {
    driverCounterPanel.hidden = !driverCounterPanel.hidden;
    if (!driverCounterPanel.hidden) driverCounterNet?.focus();
  });
}

driverAcceptNetOffer?.addEventListener('click', () => {
  const status = document.getElementById('dashboardStatus');
  const net = driverNetOffer?.textContent || '';
  if (status) status.textContent = 'Ride accepted at ' + net + ' net earnings in this development preview.';
});

driverDeclineNetOffer?.addEventListener('click', () => {
  const status = document.getElementById('dashboardStatus');
  if (status) status.textContent = 'Ride declined in this development preview.';
});

driverSendCounter?.addEventListener('click', () => {
  const status = document.getElementById('dashboardStatus');
  const value = Number(driverCounterNet?.value || 0);
  if (!Number.isFinite(value) || value <= 0) {
    if (status) status.textContent = 'Enter the net amount you want to earn.';
    return;
  }

  const formatted = '$' + value.toFixed(2);
  if (driverNetOffer) driverNetOffer.textContent = formatted;
  if (driverAcceptNetOffer) driverAcceptNetOffer.textContent = 'Accept ' + formatted;
  if (driverCounterPanel) driverCounterPanel.hidden = true;
  const riderTotalInternal = grossFromDriverNet(value);
  if (status) status.textContent = 'Counter sent for ' + formatted + ' net earnings. Rider total is calculated internally and is not shown to the driver.';
  // Development preview only: riderTotalInternal is intentionally not rendered on the driver UI.
});


function grossFromDriverNet(netAmount, feeRate = RIDES100_PLATFORM_FEE_RATE) {
  const net = Number(netAmount);
  const rate = Number(feeRate);
  if (!Number.isFinite(net) || net <= 0 || !Number.isFinite(rate) || rate < 0 || rate >= 1) return null;
  return Math.round((net / (1 - rate)) * 100) / 100;
}


const R100_ADDRESS_SEARCH_URL = 'https://utpprhmhbnioisavfdst.supabase.co/functions/v1/r100-address-search';

function makeSearchSessionToken() {
  if (globalThis.crypto?.randomUUID) return crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function attachR100AddressAutocomplete(input) {
  if (!input || input.dataset.r100Autocomplete === 'ready') return;
  input.dataset.r100Autocomplete = 'ready';
  input.setAttribute('aria-autocomplete', 'list');
  input.setAttribute('autocomplete', 'off');

  const host = document.createElement('div');
  host.className = 'r100-address-search';
  input.parentNode?.insertBefore(host, input);
  host.appendChild(input);

  const list = document.createElement('div');
  list.className = 'r100-suggestions';
  list.setAttribute('role', 'listbox');
  list.hidden = true;
  host.appendChild(list);

  let sessionToken = makeSearchSessionToken();
  let timer = null;
  let controller = null;

  function closeList() {
    list.hidden = true;
    list.innerHTML = '';
    input.setAttribute('aria-expanded', 'false');
  }

  async function retrieveSuggestion(suggestion) {
    try {
      const response = await fetch(R100_ADDRESS_SEARCH_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'retrieve', id: suggestion.id, sessionToken }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data?.result) throw new Error(data?.error || 'Could not retrieve address.');

      const result = data.result;
      input.value = result.fullAddress || result.name || suggestion.fullAddress || suggestion.name;
      input.dataset.mapboxId = result.mapboxId || suggestion.id || '';
      input.dataset.latitude = Number.isFinite(result.latitude) ? String(result.latitude) : '';
      input.dataset.longitude = Number.isFinite(result.longitude) ? String(result.longitude) : '';
      input.dispatchEvent(new Event('change', { bubbles: true }));
      closeList();
      sessionToken = makeSearchSessionToken();
    } catch {
      closeList();
    }
  }

  async function runSuggest() {
    const q = input.value.trim();
    if (q.length < 2) {
      closeList();
      return;
    }

    controller?.abort();
    controller = new AbortController();

    try {
      const response = await fetch(R100_ADDRESS_SEARCH_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'suggest', q, sessionToken }),
        signal: controller.signal,
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !Array.isArray(data?.suggestions)) {
        closeList();
        return;
      }

      list.innerHTML = '';
      data.suggestions.forEach((suggestion) => {
        const option = document.createElement('button');
        option.type = 'button';
        option.className = 'r100-suggestion';
        option.setAttribute('role', 'option');

        const name = document.createElement('strong');
        name.textContent = suggestion.name || '';
        const address = document.createElement('span');
        address.textContent = suggestion.fullAddress || suggestion.placeFormatted || '';

        option.append(name, address);
        option.addEventListener('mousedown', (event) => event.preventDefault());
        option.addEventListener('click', () => retrieveSuggestion(suggestion));
        list.appendChild(option);
      });

      list.hidden = data.suggestions.length === 0;
      input.setAttribute('aria-expanded', String(data.suggestions.length > 0));
    } catch (error) {
      if (error?.name !== 'AbortError') closeList();
    }
  }

  input.addEventListener('input', () => {
    delete input.dataset.mapboxId;
    delete input.dataset.latitude;
    delete input.dataset.longitude;
    if (timer) clearTimeout(timer);
    timer = setTimeout(runSuggest, 250);
  });

  input.addEventListener('focus', () => {
    if (input.value.trim().length >= 2 && list.childElementCount > 0) {
      list.hidden = false;
      input.setAttribute('aria-expanded', 'true');
    }
  });

  input.addEventListener('blur', () => {
    setTimeout(closeList, 120);
  });

  input.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeList();
  });
}

['pickupInput','destinationInput','webPickup','webDestination','webStop1','businessPickup','businessDestination']
  .map((id) => document.getElementById(id))
  .filter(Boolean)
  .forEach(attachR100AddressAutocomplete);


const rideForSomeoneElse = document.getElementById('rideForSomeoneElse');
const guestRiderFields = document.getElementById('guestRiderFields');
const addRideStop = document.getElementById('addRideStop');
const rideStopFields = document.getElementById('rideStopFields');

rideForSomeoneElse?.addEventListener('click', () => {
  const enabled = rideForSomeoneElse.getAttribute('aria-pressed') !== 'true';
  rideForSomeoneElse.setAttribute('aria-pressed', String(enabled));
  rideForSomeoneElse.textContent = enabled ? 'On' : 'Off';
  if (guestRiderFields) guestRiderFields.hidden = !enabled;
});

addRideStop?.addEventListener('click', () => {
  const enabled = addRideStop.getAttribute('aria-pressed') !== 'true';
  addRideStop.setAttribute('aria-pressed', String(enabled));
  addRideStop.textContent = enabled ? 'Remove stop' : 'Add stop';
  if (rideStopFields) rideStopFields.hidden = !enabled;
  if (!enabled) {
    const stop = document.getElementById('webStop1');
    if (stop) stop.value = '';
  }
});


const businessRideMode = document.getElementById('businessRideMode');
const businessTripFormat = document.getElementById('businessTripFormat');
const businessGuestFields = document.getElementById('businessGuestFields');
const businessRecurringFields = document.getElementById('businessRecurringFields');
const businessRoundTripFields = document.getElementById('businessRoundTripFields');

function renderBusinessOptionPanels() {
  if (businessGuestFields) businessGuestFields.hidden = businessRideMode?.value !== 'guest';
  if (businessRecurringFields) businessRecurringFields.hidden = businessRideMode?.value !== 'recurring';
  if (businessRoundTripFields) businessRoundTripFields.hidden = businessTripFormat?.value !== 'roundtrip';
}
businessRideMode?.addEventListener('change', renderBusinessOptionPanels);
businessTripFormat?.addEventListener('change', renderBusinessOptionPanels);
renderBusinessOptionPanels();


document.querySelectorAll('[data-safety-action]').forEach((button) => {
  button.addEventListener('click', () => {
    const action = button.dataset.safetyAction || '';
    const status = document.getElementById('dashboardStatus');
    const messages = {
      pin: 'Ride PIN preview: production rides will show a secure verification PIN before trip start.',
      share: 'Share Trip preview: live trip sharing will activate only during an authenticated ride.',
      contacts: 'Emergency Contacts preview: saved contacts will require verified account settings.',
      report: 'Report Issue preview: safety reporting will connect to the protected support workflow.',
      '911': '911 access is not activated in this development preview. In production, emergency access will use the device emergency flow.',
    };
    if (status) status.textContent = messages[action] || 'Safety tool is not active in this development preview.';
  });
});
