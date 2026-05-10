/* ============ Insurance Demo Visualization (sync to audio) ============
 * Sister to booking-viz.js. Drives the .insurance-viz block on /demos
 * (and any future homepage embed) in lockstep with the
 * #insuranceAudio <audio> element.
 *
 * Tunable keyframes are exposed on window.insuranceDemoKeyframes for
 * console retuning. Audio is ~69s — timestamps below are best-effort
 * estimates against the script flow; nudge in dev tools as needed.
 * ===================================================================== */
(function initInsuranceViz(){
  var audio = document.getElementById('insuranceAudio');
  var viz = document.getElementById('insuranceViz');
  if (!audio || !viz) return;

  // -------- Tunable keyframes (edit timestamps here to retune) --------
  // Audio duration ≈ 68.94s. Script flow:
  //   ~0–6s greeting + intent
  //   ~6–22s name / DOB / member ID / carrier exchange
  //   ~22–32s "Got it…" verification + max + deductible read-back
  //   ~32–46s coverage tiers (preventive 100, basic 80, major 50)
  //   ~46–62s procedure list (cleanings, exams, bitewings, panoramic)
  //   ~62–69s thank-you / sign-off
  var insuranceDemoKeyframes = [
    { at:  6.0, action: 'lookup.start' },
    { at:  9.0, action: 'lookup.name' },
    { at: 12.5, action: 'lookup.dob' },
    { at: 16.0, action: 'lookup.member' },
    { at: 21.0, action: 'lookup.carrier' },
    { at: 23.0, action: 'verify.start' },
    { at: 25.0, action: 'verify.complete' },
    { at: 25.5, action: 'benefits.start' },
    { at: 26.5, action: 'benefits.maxCount' },
    { at: 28.5, action: 'benefits.deductible' },
    { at: 32.0, action: 'tiers.preventive' },
    { at: 34.5, action: 'tiers.basic' },
    { at: 37.0, action: 'tiers.major' },
    { at: 46.0, action: 'procedures.cleanings' },
    { at: 49.0, action: 'procedures.exams' },
    { at: 52.0, action: 'procedures.bitewings' },
    { at: 55.0, action: 'procedures.panoramic' },
    { at: 60.0, action: 'doc.complete' }
  ];
  // expose for console tweaking
  window.insuranceDemoKeyframes = insuranceDemoKeyframes;
  // --------------------------------------------------------------------

  // Card refs
  var lookupCard   = viz.querySelector('[data-iv-card="lookup"]');
  var verifyCard   = viz.querySelector('[data-iv-card="verify"]');
  var benefitsCard = viz.querySelector('[data-iv-card="benefits"]');

  // Lookup card sub-elements
  var idName    = viz.querySelector('[data-iv-id-field="name"]');
  var idDob     = viz.querySelector('[data-iv-id-field="dob"]');
  var idMember  = viz.querySelector('[data-iv-id-field="member"]');
  var idCarrier = viz.querySelector('[data-iv-id-field="carrier"]');

  // Benefits card sub-elements
  var maxStat       = viz.querySelector('[data-iv-stat="max"]');
  var maxNumEl      = viz.querySelector('[data-iv-num="max"]');
  var maxProgress   = viz.querySelector('[data-iv-progress="max"]');
  var deductStat    = viz.querySelector('[data-iv-stat="deductible"]');
  var deductNumEl   = viz.querySelector('[data-iv-num="deductible"]');
  var deductProgress= viz.querySelector('[data-iv-progress="deductible"]');
  var tiers = {
    preventive: viz.querySelector('[data-iv-tier="preventive"]'),
    basic:      viz.querySelector('[data-iv-tier="basic"]'),
    major:      viz.querySelector('[data-iv-tier="major"]')
  };
  var procs = {
    cleanings:  viz.querySelector('[data-iv-proc="cleanings"]'),
    exams:      viz.querySelector('[data-iv-proc="exams"]'),
    bitewings:  viz.querySelector('[data-iv-proc="bitewings"]'),
    panoramic:  viz.querySelector('[data-iv-proc="panoramic"]')
  };

  // Right-side doc fields
  var docFields = {
    patient:   viz.querySelector('[data-iv-doc="patient"]'),
    dob:       viz.querySelector('[data-iv-doc="dob"]'),
    carrier:   viz.querySelector('[data-iv-doc="carrier"]'),
    planYear:  viz.querySelector('[data-iv-doc="planYear"]'),
    max:       viz.querySelector('[data-iv-doc="max"]'),
    deductible:viz.querySelector('[data-iv-doc="deductible"]'),
    preventive:viz.querySelector('[data-iv-doc="preventive"]'),
    basic:     viz.querySelector('[data-iv-doc="basic"]'),
    major:     viz.querySelector('[data-iv-doc="major"]'),
    cleanings: viz.querySelector('[data-iv-doc="cleanings"]'),
    exams:     viz.querySelector('[data-iv-doc="exams"]'),
    bitewings: viz.querySelector('[data-iv-doc="bitewings"]'),
    panoramic: viz.querySelector('[data-iv-doc="panoramic"]')
  };
  var docBadge = viz.querySelector('[data-iv-doc-badge]');
  var docStamp = viz.querySelector('[data-iv-doc-stamp]');

  // Counter animation helpers — anchored to time so a seek snaps cleanly
  var maxAnimAnchor = null;
  var deductAnimAnchor = null;
  function animateMax(){
    if (!maxNumEl) return;
    if (maxAnimAnchor) cancelAnimationFrame(maxAnimAnchor);
    var start = performance.now();
    var dur = 1500;
    function tick(now){
      var p = Math.min(1, (now - start) / dur);
      // ease out cubic
      var e = 1 - Math.pow(1 - p, 3);
      var v = Math.round(2500 * e);
      maxNumEl.textContent = v.toLocaleString();
      if (maxProgress) maxProgress.style.width = (e * 100).toFixed(1) + '%';
      if (p < 1) maxAnimAnchor = requestAnimationFrame(tick);
      else {
        maxAnimAnchor = null;
        if (maxStat) {
          maxStat.classList.add('is-burst');
          setTimeout(function(){ maxStat && maxStat.classList.remove('is-burst'); }, 950);
        }
      }
    }
    maxAnimAnchor = requestAnimationFrame(tick);
  }
  function animateDeduct(){
    if (!deductNumEl) return;
    if (deductAnimAnchor) cancelAnimationFrame(deductAnimAnchor);
    var start = performance.now();
    var dur = 900;
    function tick(now){
      var p = Math.min(1, (now - start) / dur);
      var e = 1 - Math.pow(1 - p, 3);
      var v = Math.round(50 * e);
      deductNumEl.textContent = v.toString();
      if (p < 1) deductAnimAnchor = requestAnimationFrame(tick);
      else { deductAnimAnchor = null; }
    }
    deductAnimAnchor = requestAnimationFrame(tick);
    // deductible "buffer" bar stays at 0% met (none used) — show empty
    if (deductProgress) deductProgress.style.width = '0%';
  }

  // Apply a single keyframe action
  function applyAction(action){
    switch(action){
      case 'lookup.start':
        if (lookupCard) {
          lookupCard.classList.add('is-active');
          lookupCard.classList.remove('is-complete');
        }
        break;
      case 'lookup.name':
        if (idName) idName.classList.add('is-shown');
        if (docFields.patient) docFields.patient.classList.add('is-shown');
        break;
      case 'lookup.dob':
        if (idDob) idDob.classList.add('is-shown');
        if (docFields.dob) docFields.dob.classList.add('is-shown');
        break;
      case 'lookup.member':
        if (idMember) idMember.classList.add('is-shown');
        break;
      case 'lookup.carrier':
        if (idCarrier) idCarrier.classList.add('is-shown');
        if (docFields.carrier) docFields.carrier.classList.add('is-shown');
        if (docFields.planYear) docFields.planYear.classList.add('is-shown');
        break;
      case 'verify.start':
        if (lookupCard) {
          lookupCard.classList.remove('is-active');
          lookupCard.classList.add('is-complete');
        }
        if (verifyCard) {
          verifyCard.classList.add('is-active');
          verifyCard.classList.remove('is-complete');
        }
        break;
      case 'verify.complete':
        if (verifyCard) {
          verifyCard.classList.remove('is-active');
          verifyCard.classList.add('is-complete');
        }
        if (docBadge) {
          docBadge.classList.add('is-shown');
          docBadge.classList.add('is-glow');
        }
        break;
      case 'benefits.start':
        if (benefitsCard) {
          benefitsCard.classList.add('is-active');
          benefitsCard.classList.remove('is-complete');
        }
        break;
      case 'benefits.maxCount':
        animateMax();
        if (docFields.max) docFields.max.classList.add('is-shown');
        break;
      case 'benefits.deductible':
        animateDeduct();
        if (docFields.deductible) docFields.deductible.classList.add('is-shown');
        break;
      case 'tiers.preventive':
        if (tiers.preventive) {
          tiers.preventive.classList.add('is-shown');
          var fill = tiers.preventive.querySelector('.iv-bd-tier-fill');
          if (fill) fill.style.width = '100%';
        }
        if (docFields.preventive) docFields.preventive.classList.add('is-shown');
        break;
      case 'tiers.basic':
        if (tiers.basic) {
          tiers.basic.classList.add('is-shown');
          var fill = tiers.basic.querySelector('.iv-bd-tier-fill');
          if (fill) fill.style.width = '80%';
        }
        if (docFields.basic) docFields.basic.classList.add('is-shown');
        break;
      case 'tiers.major':
        if (tiers.major) {
          tiers.major.classList.add('is-shown');
          var fill = tiers.major.querySelector('.iv-bd-tier-fill');
          if (fill) fill.style.width = '50%';
        }
        if (docFields.major) docFields.major.classList.add('is-shown');
        break;
      case 'procedures.cleanings':
        if (procs.cleanings) procs.cleanings.classList.add('is-shown');
        if (docFields.cleanings) docFields.cleanings.classList.add('is-shown');
        break;
      case 'procedures.exams':
        if (procs.exams) procs.exams.classList.add('is-shown');
        if (docFields.exams) docFields.exams.classList.add('is-shown');
        break;
      case 'procedures.bitewings':
        if (procs.bitewings) procs.bitewings.classList.add('is-shown');
        if (docFields.bitewings) docFields.bitewings.classList.add('is-shown');
        break;
      case 'procedures.panoramic':
        if (procs.panoramic) procs.panoramic.classList.add('is-shown');
        if (docFields.panoramic) docFields.panoramic.classList.add('is-shown');
        break;
      case 'doc.complete':
        if (benefitsCard) {
          benefitsCard.classList.remove('is-active');
          benefitsCard.classList.add('is-complete');
        }
        break;
    }
  }

  function pad(n){ return n < 10 ? '0' + n : '' + n; }
  function fmtTimer(sec){
    sec = Math.max(0, Math.floor(sec));
    var m = Math.floor(sec / 60), s = sec % 60;
    return pad(m) + ':' + pad(s);
  }

  // Reset everything to initial state
  function resetAll(){
    if (maxAnimAnchor) { cancelAnimationFrame(maxAnimAnchor); maxAnimAnchor = null; }
    if (deductAnimAnchor) { cancelAnimationFrame(deductAnimAnchor); deductAnimAnchor = null; }

    [lookupCard, verifyCard, benefitsCard].forEach(function(c){
      if (c) c.classList.remove('is-active','is-complete');
    });
    [idName, idDob, idMember, idCarrier].forEach(function(el){
      if (el) el.classList.remove('is-shown');
    });
    if (maxNumEl) maxNumEl.textContent = '0';
    if (maxProgress) maxProgress.style.width = '0%';
    if (maxStat) maxStat.classList.remove('is-burst');
    if (deductNumEl) deductNumEl.textContent = '0';
    if (deductProgress) deductProgress.style.width = '0%';
    Object.keys(tiers).forEach(function(k){
      if (tiers[k]) {
        tiers[k].classList.remove('is-shown');
        var fill = tiers[k].querySelector('.iv-bd-tier-fill');
        if (fill) fill.style.width = '0%';
      }
    });
    Object.keys(procs).forEach(function(k){ if (procs[k]) procs[k].classList.remove('is-shown'); });
    Object.keys(docFields).forEach(function(k){ if (docFields[k]) docFields[k].classList.remove('is-shown'); });
    if (docBadge) docBadge.classList.remove('is-shown','is-glow');
  }

  // Apply final-snap (used on ended) without counter animation re-run
  function snapToFinal(){
    resetAll();
    insuranceDemoKeyframes.forEach(function(kf){
      // for counter animations on a snap, we want the end state instantly
      if (kf.action === 'benefits.maxCount'){
        if (maxNumEl) maxNumEl.textContent = '2,500';
        if (maxProgress) maxProgress.style.width = '100%';
        if (docFields.max) docFields.max.classList.add('is-shown');
        return;
      }
      if (kf.action === 'benefits.deductible'){
        if (deductNumEl) deductNumEl.textContent = '50';
        if (docFields.deductible) docFields.deductible.classList.add('is-shown');
        return;
      }
      applyAction(kf.action);
    });
  }

  var lastSyncT = -1;
  function syncTo(t){
    if (Math.abs(t - lastSyncT) < 0.05) return;
    lastSyncT = t;

    resetAll();
    for (var i = 0; i < insuranceDemoKeyframes.length; i++){
      if (insuranceDemoKeyframes[i].at <= t){
        // For the counter actions we want the END state if we've already
        // passed them by more than 1.5s — otherwise let the counter run.
        var action = insuranceDemoKeyframes[i].action;
        if (action === 'benefits.maxCount' && t - insuranceDemoKeyframes[i].at > 1.6){
          if (maxNumEl) maxNumEl.textContent = '2,500';
          if (maxProgress) maxProgress.style.width = '100%';
          if (docFields.max) docFields.max.classList.add('is-shown');
        } else if (action === 'benefits.deductible' && t - insuranceDemoKeyframes[i].at > 1.0){
          if (deductNumEl) deductNumEl.textContent = '50';
          if (docFields.deductible) docFields.deductible.classList.add('is-shown');
        } else {
          applyAction(action);
        }
      } else {
        break;
      }
    }
    // Update doc footer timestamp
    if (docStamp) docStamp.textContent = 'Generated by Aria · ' + fmtTimer(t);
  }

  // Audio listeners
  audio.addEventListener('timeupdate', function(){ syncTo(audio.currentTime); });
  audio.addEventListener('seeked',     function(){ syncTo(audio.currentTime); });
  audio.addEventListener('play',       function(){ syncTo(audio.currentTime); });
  audio.addEventListener('pause',      function(){ /* freeze */ });
  audio.addEventListener('ended', function(){
    snapToFinal();
    if (docStamp) docStamp.textContent = 'Generated by Aria · ' + fmtTimer(audio.duration || 69);
  });
  audio.addEventListener('loadedmetadata', function(){ syncTo(audio.currentTime || 0); });
})();
