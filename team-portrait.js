document.querySelectorAll('.portrait-motion').forEach(portrait => {
  const video = portrait.querySelector('video');
  let requested = false;
  let activationPointer = '';
  let touchActivated = false;
  let hovering = false;

  function startPortrait() {
    if (requested) return;
    requested = true;
    portrait.setAttribute('aria-pressed', 'true');
    video.muted = true;
    video.play().catch(() => {
      // A pointer may have already left while playback was loading.
      if (video.paused) stopPortrait();
    });
  }

  function stopPortrait() {
    requested = false;
    portrait.removeAttribute('data-playing');
    portrait.setAttribute('aria-pressed', 'false');
    video.pause();
    video.currentTime = 0;
  }

  portrait.addEventListener('pointerenter', event => {
    if (event.pointerType !== 'mouse' || !matchMedia('(any-hover: hover)').matches) return;
    hovering = true;
    startPortrait();
  });
  portrait.addEventListener('pointerleave', event => {
    if (event.pointerType !== 'mouse' || !hovering) return;
    hovering = false;
    stopPortrait();
  });
  portrait.addEventListener('pointerdown', event => {
    activationPointer = event.pointerType;
    touchActivated = false;
  });
  portrait.addEventListener('pointerup', event => {
    if (event.pointerType !== 'touch') return;
    // Touch pointerup provides user activation for inline playback on iOS.
    touchActivated = true;
    hovering = false;
    if (requested) stopPortrait();
    else startPortrait();
  });
  portrait.addEventListener('click', event => {
    if (event.detail !== 0 && touchActivated) {
      touchActivated = false;
      return;
    }
    const pointer = event.detail === 0 ? '' : activationPointer || event.pointerType;
    activationPointer = '';
    if (requested && pointer !== 'mouse') stopPortrait();
    else startPortrait();
  });
  video.addEventListener('playing', () => {
    if (requested) portrait.setAttribute('data-playing', '');
  });
  video.addEventListener('ended', stopPortrait);
  video.addEventListener('error', stopPortrait);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && requested) stopPortrait();
  });
});
