(function () {
  const STORAGE_KEY = 'ramadan_submissions';
  const LOGO_PATHS = ['assets/img/pta-logo.png', 'assets/img/logo.png', 'img/pta-logo.png', 'pta-logo.png'];

  // Logo: try paths and show text fallback on error
  function initLogo(imgId, fallbackId) {
    var img = document.getElementById(imgId);
    var fallback = document.getElementById(fallbackId);
    if (!img) return;
    var tried = 0;
    img.onerror = function () {
      tried++;
      if (tried < LOGO_PATHS.length) {
        img.src = LOGO_PATHS[tried];
      } else if (fallback) {
        img.style.display = 'none';
        fallback.hidden = false;
      }
    };
    img.onload = function () {
      if (fallback) fallback.hidden = true;
    };
    if (fallback) fallback.hidden = true;
  }

  // Welcome animations – eye-catching staggered entrance
  function runWelcomeAnimations() {
    if (typeof gsap === 'undefined') return;
    const anims = document.querySelectorAll('[data-anim]');
    gsap.set(anims, { opacity: 0, y: 36, scale: 0.92 });
    gsap.to(anims, {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.85,
      stagger: 0.12,
      ease: 'back.out(1.2)',
      delay: 0.15
    });
    const btn = document.getElementById('btnSignup');
    if (btn) {
      gsap.set(btn, { opacity: 0, scale: 0.8, y: 20 });
      gsap.to(btn, {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: 0.6,
        delay: 1.1,
        ease: 'back.out(1.6)'
      });
    }
  }

  // Form overlay - run when DOM is ready
  function initForm() {
    const formOverlay = document.getElementById('formOverlay');
    const formModal = document.getElementById('formModal');
    const formBackdrop = document.getElementById('formBackdrop');
    const btnSignup = document.getElementById('btnSignup');
    const formClose = document.getElementById('formClose');
    const signupForm = document.getElementById('signupForm');

    function openForm(e) {
      if (e) e.preventDefault();
      if (!formOverlay) return;
      formOverlay.setAttribute('aria-hidden', 'false');
      formOverlay.classList.add('is-open');
      formOverlay.style.display = 'flex';
      document.body.style.overflow = 'hidden';
      if (typeof gsap !== 'undefined' && formModal) {
        gsap.fromTo(formModal, { scale: 0.95, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.35, ease: 'power2.out' });
      }
    }

    function closeForm() {
      if (!formOverlay) return;
      formOverlay.classList.remove('is-open');
      formOverlay.style.display = '';
      formOverlay.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }

    if (btnSignup) btnSignup.addEventListener('click', openForm);
    if (formClose) formClose.addEventListener('click', closeForm);
    if (formBackdrop) formBackdrop.addEventListener('click', closeForm);

    // Validation modal (message + OK)
    var validationModal = document.getElementById('validationModal');
    var validationMessage = document.getElementById('validationMessage');
    var validationOk = document.getElementById('validationOk');
    var validationBackdrop = document.getElementById('validationBackdrop');

    function showValidationModal(message) {
      if (validationMessage) validationMessage.textContent = message;
      if (validationModal) {
        validationModal.classList.add('is-open');
        validationModal.setAttribute('aria-hidden', 'false');
        var btn = validationOk;
        if (btn) setTimeout(function () { btn.focus(); }, 100);
      }
    }
    function hideValidationModal() {
      if (validationModal) {
        validationModal.classList.remove('is-open');
        validationModal.setAttribute('aria-hidden', 'true');
      }
    }
    if (validationOk) validationOk.addEventListener('click', hideValidationModal);
    if (validationBackdrop) validationBackdrop.addEventListener('click', hideValidationModal);
    document.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape' && validationModal && validationModal.classList.contains('is-open')) {
        hideValidationModal();
      }
    });

    function isValidEmail(s) {
      var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return typeof s === 'string' && re.test(s.trim());
    }
    function isValidPhone(s) {
      if (typeof s !== 'string') return false;
      var digits = s.replace(/\D/g, '');
      return digits.length >= 10;
    }

    // Conditional fields: business owner Yes -> business type; No -> W2 question
    const businessOwnerRadios = document.querySelectorAll('input[name="businessOwner"]');
    const businessTypeWrap = document.getElementById('businessTypeWrap');
    const w2Wrap = document.getElementById('w2Wrap');
    const businessTypeSelect = document.getElementById('businessType');
    const businessTypeOtherWrap = document.getElementById('businessTypeOtherWrap');
    const businessTypeOtherInput = document.getElementById('businessTypeOther');
    const w2Radios = document.querySelectorAll('input[name="w2Income"]');

    function toggleConditional() {
      const value = document.querySelector('input[name="businessOwner"]:checked')?.value;
      if (businessTypeWrap) {
        businessTypeWrap.hidden = value !== 'yes';
        if (businessTypeSelect) businessTypeSelect.removeAttribute('required');
        if (value === 'yes') businessTypeSelect?.setAttribute('required', '');
        toggleBusinessTypeOther();
      }
      if (w2Wrap) {
        w2Wrap.hidden = value !== 'no';
        w2Radios.forEach(function (r) { r.removeAttribute('required'); });
        if (value === 'no') w2Radios.forEach(function (r) { r.setAttribute('required', 'required'); });
      }
    }

    function toggleBusinessTypeOther() {
      var isOthers = businessTypeSelect?.value === 'others';
      if (businessTypeOtherWrap) businessTypeOtherWrap.hidden = !isOthers;
      if (businessTypeOtherInput) {
        if (isOthers) businessTypeOtherInput.setAttribute('required', '');
        else {
          businessTypeOtherInput.removeAttribute('required');
          businessTypeOtherInput.value = '';
        }
      }
    }

    businessOwnerRadios.forEach(function (r) {
      r.addEventListener('change', toggleConditional);
    });
    if (businessTypeSelect) businessTypeSelect.addEventListener('change', toggleBusinessTypeOther);
    toggleConditional();
    toggleBusinessTypeOther();

    // Submit: validate, store, redirect
    function getSubmissions() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
      } catch (_) {
        return [];
      }
    }

    function saveSubmissions(list) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    }

    if (signupForm) {
      signupForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        var firstName = document.getElementById('firstName');
        var lastName = document.getElementById('lastName');
        var email = document.getElementById('email');
        var phone = document.getElementById('phone');
        var firstVal = firstName?.value?.trim();
        var lastVal = lastName?.value?.trim();
        var emailVal = email?.value?.trim();
        var phoneVal = phone?.value?.trim();

        if (!firstVal) {
          showValidationModal('Please enter your first name.');
          if (firstName) firstName.focus();
          return;
        }
        if (!lastVal) {
          showValidationModal('Please enter your last name.');
          if (lastName) lastName.focus();
          return;
        }
        if (!emailVal) {
          showValidationModal('Please enter your email address.');
          if (email) email.focus();
          return;
        }
        if (!isValidEmail(emailVal)) {
          showValidationModal('Please enter a valid email address (e.g. name@example.com).');
          if (email) email.focus();
          return;
        }
        if (!phoneVal) {
          showValidationModal('Please enter your phone number.');
          if (phone) phone.focus();
          return;
        }
        if (!isValidPhone(phoneVal)) {
          showValidationModal('Please enter a valid phone number (at least 10 digits).');
          if (phone) phone.focus();
          return;
        }

        var value = document.querySelector('input[name="businessOwner"]:checked')?.value;
        if (!value) {
          showValidationModal('Please select whether you are a business owner (Yes or No).');
          return;
        }
        if (value === 'yes') {
          var bt = businessTypeSelect?.value?.trim();
          if (!bt) {
            showValidationModal('Please select your business type.');
            if (businessTypeSelect) businessTypeSelect.focus();
            return;
          }
          if (bt === 'others') {
            var otherVal = businessTypeOtherInput?.value?.trim();
            if (!otherVal) {
              showValidationModal('Please specify what business you are doing.');
              if (businessTypeOtherInput) businessTypeOtherInput.focus();
              return;
            }
          }
        }
        if (value === 'no') {
          var w2 = document.querySelector('input[name="w2Income"]:checked')?.value;
          if (!w2) {
            showValidationModal('Please answer: Do you make $750k+ yearly in W2? (Yes or No).');
            return;
          }
        }

        // Check duplicate (same email + phone already submitted)
        var submitBtn = document.getElementById('btnSubmit');
        try {
          var checkUrl = new URL('/api/check-duplicate', window.location.origin).href;
          var checkRes = await fetch(checkUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: emailVal, phone: phoneVal })
          });
          var checkData = await checkRes.json().catch(function () { return {}; });
          if (checkData.duplicate) {
            showValidationModal('This email and phone number is already registered for the lucky prize draw.');
            return;
          }
        } catch (_) {
          showValidationModal('Could not verify your submission. Please try again.');
          return;
        }

        const entry = {
          id: Date.now().toString(36) + Math.random().toString(36).slice(2),
          firstName: firstVal,
          lastName: lastVal,
          email: emailVal,
          phone: phoneVal,
          businessOwner: value,
          businessType: value === 'yes' ? (businessTypeSelect?.value || '') : '',
          businessTypeOther: value === 'yes' && businessTypeSelect?.value === 'others' ? (businessTypeOtherInput?.value?.trim() || '') : '',
          w2Income: value === 'no' ? document.querySelector('input[name="w2Income"]:checked')?.value : '',
          createdAt: new Date().toISOString()
        };

        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.textContent = 'Submitting…';
        }

        try {
          var submitUrl = new URL('/api/submit', window.location.origin).href;
          var res = await fetch(submitUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(entry)
          });
          var data = await res.json().catch(function () { return {}; });
          if (res.ok && data.ok) {
            closeForm();
            window.location.href = 'thank-you.html';
            if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Submit'; }
            return;
          }
          var errMsg = (data && data.error) ? data.error : ('Server error (' + res.status + ')');
          if (data && data.details) errMsg += ': ' + data.details;
          showValidationModal('Could not save to server: ' + errMsg + '. Please try again later.');
          if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Submit'; }
          return;
        } catch (err) {
          console.warn('API submit failed:', err);
          showValidationModal('Could not reach the server. Check your connection and try again.');
        }

        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Submit';
        }
      });
    }
  }

  function boot() {
    function run() {
      initLogo('welcomeLogo', 'welcomeLogoFallback');
      initLogo('formModalLogo', 'formModalLogoFallback');
      initForm();
      runWelcomeAnimations();
    }
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', run);
    } else {
      run();
    }
  }
  boot();
})();
