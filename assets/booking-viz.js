/* ============ Booking Demo Visualization (sync to audio) ============
 * Used on /demos and / (homepage). Looks for #bookSelfAudio and #bookingViz
 * in the DOM; bails silently if either is missing.
 *
 * Tunable keyframes are exposed on window.bookingDemoKeyframes for
 * console-tweaking during retuning.
 * ==================================================================== */
(function initBookingViz(){
  var audio = document.getElementById('bookSelfAudio');
  var viz = document.getElementById('bookingViz');
  if (!audio || !viz) return;

  // -------- Tunable keyframes (edit timestamps here to retune) --------
  var bookingDemoKeyframes = [
    { at: 28.0, action: 'calendar.start' },
    { at: 31.5, action: 'calendar.complete' },
    { at: 32.0, action: 'pms.start' },
    { at: 33.2, action: 'pms.field.patient' },
    { at: 34.0, action: 'pms.field.provider' },
    { at: 34.8, action: 'pms.field.type' },
    { at: 35.6, action: 'pms.field.date' },
    { at: 36.4, action: 'pms.field.time' },
    { at: 37.5, action: 'pms.complete' },
    { at: 50.0, action: 'sms.start' },
    { at: 51.0, action: 'sms.composing' },
    { at: 51.7, action: 'sms.encrypting' },
    { at: 52.5, action: 'sms.complete' },
    { at: 53.0, action: 'phone.notify' }
  ];
  // expose for console tweaking
  window.bookingDemoKeyframes = bookingDemoKeyframes;
  // --------------------------------------------------------------------

  var calCard = viz.querySelector('[data-bv-card="calendar"]');
  var pmsCard = viz.querySelector('[data-bv-card="pms"]');
  var smsCard = viz.querySelector('[data-bv-card="sms"]');
  var calTarget = viz.querySelector('[data-bv-cal-target]');
  var pmsFields = {
    patient: viz.querySelector('[data-bv-pms-field="patient"]'),
    provider: viz.querySelector('[data-bv-pms-field="provider"]'),
    type: viz.querySelector('[data-bv-pms-field="type"]'),
    date: viz.querySelector('[data-bv-pms-field="date"]'),
    time: viz.querySelector('[data-bv-pms-field="time"]')
  };
  var pmsPill = viz.querySelector('[data-bv-pms-pill]');
  var pmsPillLabel = pmsPill ? pmsPill.querySelector('.bv-pms-pill-label-idle') : null;
  var smsStatus = viz.querySelector('[data-bv-sms-status]');
  var notif = viz.querySelector('[data-bv-notif]');
  var callTimer = viz.querySelector('[data-bv-call-timer]');
  var phoneClock = viz.querySelector('[data-bv-phone-clock]');

  function pad(n){ return n < 10 ? '0'+n : ''+n; }
  function fmtTimer(sec){
    sec = Math.max(0, Math.floor(sec));
    var m = Math.floor(sec/60), s = sec%60;
    return pad(m)+':'+pad(s);
  }

  // Apply state for a given action. cumulative reset on seek.
  function applyAction(action){
    switch(action){
      case 'calendar.start':
        calCard.classList.add('is-active');
        calCard.classList.remove('is-complete');
        if (calTarget) calTarget.classList.remove('is-booked');
        break;
      case 'calendar.complete':
        calCard.classList.remove('is-active');
        calCard.classList.add('is-complete');
        if (calTarget) calTarget.classList.add('is-booked');
        break;
      case 'pms.start':
        pmsCard.classList.add('is-active');
        pmsCard.classList.remove('is-complete');
        if (pmsPillLabel) pmsPillLabel.textContent = 'Drafting…';
        break;
      case 'pms.field.patient':
        if (pmsFields.patient) pmsFields.patient.classList.add('is-shown');
        break;
      case 'pms.field.provider':
        if (pmsFields.provider) pmsFields.provider.classList.add('is-shown');
        break;
      case 'pms.field.type':
        if (pmsFields.type) pmsFields.type.classList.add('is-shown');
        break;
      case 'pms.field.date':
        if (pmsFields.date) pmsFields.date.classList.add('is-shown');
        break;
      case 'pms.field.time':
        if (pmsFields.time) pmsFields.time.classList.add('is-shown');
        break;
      case 'pms.complete':
        pmsCard.classList.remove('is-active');
        pmsCard.classList.add('is-complete');
        if (pmsPill) pmsPill.classList.add('is-shown');
        if (pmsPillLabel) pmsPillLabel.textContent = 'Booked';
        // ensure all fields are shown when complete
        Object.keys(pmsFields).forEach(function(k){ if (pmsFields[k]) pmsFields[k].classList.add('is-shown'); });
        break;
      case 'sms.start':
        smsCard.classList.add('is-active');
        smsCard.classList.remove('is-complete');
        if (smsStatus) smsStatus.textContent = 'Composing…';
        break;
      case 'sms.composing':
        if (smsStatus) smsStatus.textContent = 'Composing…';
        break;
      case 'sms.encrypting':
        if (smsStatus) smsStatus.textContent = 'Encrypting…';
        break;
      case 'sms.complete':
        smsCard.classList.remove('is-active');
        smsCard.classList.add('is-complete');
        if (smsStatus) smsStatus.textContent = 'Sent';
        break;
      case 'phone.notify':
        if (notif) notif.classList.add('is-shown');
        break;
    }
  }

  // Reset everything to initial state
  function resetAll(){
    calCard.classList.remove('is-active','is-complete');
    pmsCard.classList.remove('is-active','is-complete');
    smsCard.classList.remove('is-active','is-complete');
    if (calTarget) calTarget.classList.remove('is-booked');
    Object.keys(pmsFields).forEach(function(k){ if (pmsFields[k]) pmsFields[k].classList.remove('is-shown'); });
    if (pmsPill) pmsPill.classList.remove('is-shown');
    if (pmsPillLabel) pmsPillLabel.textContent = 'Drafting…';
    if (smsStatus) smsStatus.textContent = 'Composing…';
    if (notif) notif.classList.remove('is-shown');
    if (callTimer) callTimer.textContent = '00:00';
  }

  // Sync state to currentTime by replaying every keyframe with at <= t in order.
  // This is robust to seeks (forward AND backward) — we always start from a fresh reset.
  var lastSyncT = -1;
  function syncTo(t){
    // micro-optimize: if time advanced by less than 0.05s and we're not past a keyframe boundary, skip rebuild
    if (Math.abs(t - lastSyncT) < 0.05) return;
    lastSyncT = t;

    resetAll();
    for (var i = 0; i < bookingDemoKeyframes.length; i++){
      if (bookingDemoKeyframes[i].at <= t){
        applyAction(bookingDemoKeyframes[i].action);
      } else {
        break;
      }
    }
    // Update call timer (counts up while audio plays)
    if (callTimer) callTimer.textContent = fmtTimer(t);
  }

  // Audio listeners — only on this specific booking-demo audio element
  audio.addEventListener('timeupdate', function(){ syncTo(audio.currentTime); });
  audio.addEventListener('seeked', function(){ syncTo(audio.currentTime); });
  audio.addEventListener('play', function(){ syncTo(audio.currentTime); });
  audio.addEventListener('pause', function(){ /* freeze in place */ });
  audio.addEventListener('ended', function(){
    // Snap to final state — every keyframe applied
    resetAll();
    bookingDemoKeyframes.forEach(function(kf){ applyAction(kf.action); });
    if (callTimer) callTimer.textContent = fmtTimer(audio.duration || 61);
  });

  // Reset when scrubbed back to 0 OR loaded fresh
  audio.addEventListener('loadedmetadata', function(){ syncTo(audio.currentTime || 0); });

  // Set phone clock to current time on load (cosmetic)
  (function(){
    if (!phoneClock) return;
    var now = new Date();
    var hh = now.getHours();
    var mm = now.getMinutes();
    var hh12 = ((hh + 11) % 12) + 1;
    phoneClock.textContent = hh12 + ':' + pad(mm);
  })();
})();
