import { useEffect, useState } from "react";

export function FullscreenButton() {
  const [isInjected, setIsInjected] = useState(false);

  useEffect(() => {
    const headerSelector = '.FullscreenPlayerDesktop_header__OBhzq';
    const closeButtonSelector = '.FullscreenPlayerDesktop_closeButton__MQ64s';
    
    const injectFullscreenButton = () => {
      const header = document.querySelector(headerSelector);
      const closeButton = document.querySelector(closeButtonSelector);
      
      if (header && closeButton && !document.getElementById('custom-fullscreen-button')) {
        const fullscreenButton = document.createElement('button');
        fullscreenButton.id = 'custom-fullscreen-button';
        fullscreenButton.type = 'button';
        fullscreenButton.setAttribute('aria-label', 'Полноэкранный режим');
        fullscreenButton.setAttribute('data-test-id', 'FULLSCREEN_TOGGLE_BUTTON');
        
        fullscreenButton.className = closeButton.className.replace(
          'FullscreenPlayerDesktop_closeButton__MQ64s', 
          'FullscreenPlayerDesktop_fullscreenButton__custom'
        );
        
        fullscreenButton.innerHTML = `
        <span class="JjlbHZ4FaP9EAcR_1DxF">
            <svg class="J9wTKytjOWG73QMoN5WP UwnL5AJBMMAp6NwMDdZk custom-fullscreen-icon" focusable="false" aria-hidden="true" viewBox="0 0 24 24">
                <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
            </svg>
        </span>
        `;
        
        fullscreenButton.addEventListener('click', () => {
          window.yandexMusicMod.setStorageValue("fullscreen/toggle", Date.now());
        });
        
        header.insertBefore(fullscreenButton, closeButton);
        setIsInjected(true);
      }
    };

    const removeFullscreenButton = () => {
      const existingButton = document.getElementById('custom-fullscreen-button');
      if (existingButton) {
        existingButton.remove();
        setIsInjected(false);
      }
    };

    injectFullscreenButton();

    const observer = new MutationObserver(() => {
      const header = document.querySelector(headerSelector);
      if (header && !document.getElementById('custom-fullscreen-button')) {
        injectFullscreenButton();
      } else if (!header) {
        removeFullscreenButton();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      observer.disconnect();
      removeFullscreenButton();
    };
  }, []);

  return null;
}
