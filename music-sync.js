/* ===================== SHARED BACKGROUND MUSIC HELPER =====================
   Used by both birthday.html and message.html.
   - Starts playing as soon as the page opens (not on a button click).
   - Remembers the exact playback position and mute state in
     sessionStorage, so moving from birthday.html -> message.html (and
     back) continues the same song instead of restarting it.
   - If the browser blocks autoplay-with-sound, it falls back to
     starting on the very first tap/click/keypress anywhere on the page.
============================================================================ */
(function () {
  const TIME_KEY = 'bgMusicTime';
  const MUTED_KEY = 'bgMusicMuted';

  // Some browsers (private-browsing modes, certain mobile WebViews, some
  // file:// contexts) throw a SecurityError just from *touching*
  // sessionStorage. If that happens, fall back to a plain in-memory store
  // so the rest of the site still works - it just won't remember the
  // song position across pages in that browser.
  function makeSafeStorage(realStorageGetter) {
    const mem = {};
    const memStore = {
      getItem: (k) => (k in mem ? mem[k] : null),
      setItem: (k, v) => { mem[k] = String(v); },
      removeItem: (k) => { delete mem[k]; }
    };
    try {
      const real = realStorageGetter();
      const testKey = '__bgmusic_test__';
      real.setItem(testKey, '1');
      real.removeItem(testKey);
      return real;
    } catch (err) {
      return memStore;
    }
  }

  const store = makeSafeStorage(() => window.sessionStorage);

  window.initBgMusic = function initBgMusic(audioId, toggleId) {
    try {
      const audio = document.getElementById(audioId);
      const toggle = document.getElementById(toggleId);
      if (!audio || !toggle) return null;

      audio.volume = 0.6;

      const savedTime = parseFloat(store.getItem(TIME_KEY));
      const savedMuted = store.getItem(MUTED_KEY) === '1';

      if (!Number.isNaN(savedTime) && savedTime > 0) {
        const restorePosition = () => { try { audio.currentTime = savedTime; } catch (e) {} };
        if (audio.readyState >= 1) {
          restorePosition();
        } else {
          audio.addEventListener('loadedmetadata', restorePosition, { once: true });
        }
      }

      function applyMutedUI(muted) {
        toggle.textContent = muted ? '🔇' : '🔊';
        toggle.classList.toggle('muted', muted);
      }
      applyMutedUI(savedMuted);

      function attemptAutoplay() {
        if (savedMuted) return; // respect her last mute choice, don't force it back on
        audio.play().catch(() => {
          // Autoplay-with-sound was blocked by the browser.
          toggle.textContent = '🔈';
          const resume = () => {
            audio.play().then(() => applyMutedUI(false)).catch(() => {});
          };
          ['click', 'touchstart', 'keydown'].forEach((evt) =>
            document.addEventListener(evt, resume, { once: true })
          );
        });
      }
      attemptAutoplay();

      toggle.addEventListener('click', () => {
        if (audio.paused) {
          audio.play().catch(() => {});
          applyMutedUI(false);
          store.setItem(MUTED_KEY, '0');
        } else {
          audio.pause();
          applyMutedUI(true);
          store.setItem(MUTED_KEY, '1');
        }
      });

      audio.addEventListener('error', () => {
        console.error('Music failed to load. Make sure "song_mp3.mp3" is in the same folder.');
        toggle.textContent = '⚠️';
        toggle.title = 'Music file not found - check that song_mp3.mp3 is in this folder';
      });

      // Keep saving the position as it plays, so a refresh or a slow
      // navigation still lands close to the right spot.
      audio.addEventListener('timeupdate', () => {
        store.setItem(TIME_KEY, audio.currentTime);
      });

      // Final save right before the page is left (covers link navigation).
      window.addEventListener('pagehide', () => {
        store.setItem(TIME_KEY, audio.currentTime);
        store.setItem(MUTED_KEY, audio.paused ? '1' : '0');
      });

      return audio;
    } catch (err) {
      // Never let a music/storage hiccup break the rest of the page.
      console.error('initBgMusic failed safely:', err);
      return document.getElementById(audioId) || null;
    }
  };
})();