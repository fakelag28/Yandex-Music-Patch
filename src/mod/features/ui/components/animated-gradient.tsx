import { useEffect } from "react";

interface AnimatedGradientProps {
  enabled: boolean;
}

export function AnimatedGradient({ enabled }: AnimatedGradientProps) {
  useEffect(() => {
    const fullscreenModalSelector = '[data-test-id="FULLSCREEN_PLAYER_MODAL"]';
    const gradientStyleId = "fullscreen-gradient-styles";

    const checkAndApplyGradient = () => {
      const fullscreenModal = document.querySelector(fullscreenModalSelector) as HTMLElement;
      let styleElement = document.getElementById(gradientStyleId) as HTMLStyleElement;

      if (fullscreenModal && enabled) {
        let playerAverageColor = '';
        
        const computedStyle = window.getComputedStyle(fullscreenModal);
        playerAverageColor = computedStyle.getPropertyValue('--player-average-color-background').trim();
        
        if (!playerAverageColor) {
          const rootStyle = window.getComputedStyle(document.documentElement);
          playerAverageColor = rootStyle.getPropertyValue('--player-average-color-background').trim();
        }
        
        if (!playerAverageColor) {
          const bodyStyle = window.getComputedStyle(document.body);
          playerAverageColor = bodyStyle.getPropertyValue('--player-average-color-background').trim();
        }

        console.log('[AnimatedGradient] Found player average color:', playerAverageColor);

        const styleAttr = fullscreenModal.getAttribute('style') || '';
        if (styleAttr.includes('translate(-50%, -50%)')) {
          fullscreenModal.style.setProperty('transform', 'translate(-50%, -100%)', 'important');
          console.log('[AnimatedGradient] Applied transform fix: translate(-50%, -100%)');
        }

        const colors = extractAndVariateColors(playerAverageColor);

        if (!styleElement) {
          styleElement = document.createElement('style');
          styleElement.id = gradientStyleId;
          document.head.appendChild(styleElement);
        }

        styleElement.textContent = `
          [data-test-id="FULLSCREEN_PLAYER_MODAL"]::before {
            content: '';
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(45deg, ${colors.join(', ')});
            background-size: 400% 400%;
            animation: gradientShift 15s ease infinite;
            z-index: -1;
            pointer-events: none;
          }

          [data-test-id="FULLSCREEN_PLAYER_MODAL"] {
            position: relative;
          }

          /* Скрываем фоновые элементы swiper при активном градиенте */
          .SyncLyrics_content__lbkWP::before,
          .SyncLyrics_content__lbkWP::after {
            background: none !important;
          }
        `;

      } else {
        if (styleElement) {
          styleElement.remove();
        }

        if (fullscreenModal) {
          const styleAttr = fullscreenModal.getAttribute('style') || '';
          if (styleAttr.includes('translate(-50%, -100%)')) {
            fullscreenModal.style.removeProperty('transform');
            setTimeout(() => {
              if (fullscreenModal.style.transform !== 'translate(-50%, -50%)') {
                fullscreenModal.style.setProperty('transform', 'translate(-50%, -50%)');
              }
            }, 10);
            console.log('[AnimatedGradient] Restored default transform: translate(-50%, -50%)');
          }
        }
      }
    };

    checkAndApplyGradient();

    const observer = new MutationObserver(checkAndApplyGradient);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style']
    });

    return () => {
      observer.disconnect();
      const styleElement = document.getElementById(gradientStyleId);
      if (styleElement) {
        styleElement.remove();
      }

      const fullscreenModal = document.querySelector(fullscreenModalSelector) as HTMLElement;
      if (fullscreenModal) {
        const styleAttr = fullscreenModal.getAttribute('style') || '';
        if (styleAttr.includes('translate(-50%, -100%)')) {
          fullscreenModal.style.removeProperty('transform');
          fullscreenModal.style.setProperty('transform', 'translate(-50%, -50%)');
        }
      }
    };
  }, [enabled]);

  const extractAndVariateColors = (playerAverageColor: string): string[] => {
    if (!playerAverageColor) {
      console.log('[AnimatedGradient] Using default colors');
      return ['hsl(0, 0%, 15%)', 'hsl(0, 0%, 25%)', 'hsl(0, 0%, 10%)', 'hsl(240, 20%, 30%)'];
    }

    let baseHue = 0;
    let baseSaturation = 0;
    let baseLightness = 20;

    const hslMatch = playerAverageColor.match(/hsl\((\d+(?:\.\d+)?),\s*(\d+(?:\.\d+)?)%,\s*(\d+(?:\.\d+)?)%\)/);
    if (hslMatch) {
      baseHue = parseFloat(hslMatch[1]);
      baseSaturation = parseFloat(hslMatch[2]);
      baseLightness = parseFloat(hslMatch[3]);
      console.log('[AnimatedGradient] Parsed HSL:', { baseHue, baseSaturation, baseLightness });
    } else {
      const rgbMatch = playerAverageColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
      if (rgbMatch) {
        const [, r, g, b] = rgbMatch.map(Number);
        const hsl = rgbToHsl(r, g, b);
        baseHue = hsl.h;
        baseSaturation = hsl.s;
        baseLightness = hsl.l;
        console.log('[AnimatedGradient] Converted RGB to HSL:', { baseHue, baseSaturation, baseLightness });
      }
    }

    const baseColor = `hsl(${baseHue}, ${baseSaturation}%, ${baseLightness}%)`;
    const lighterColor = `hsl(${baseHue}, ${Math.min(100, baseSaturation + 10)}%, ${Math.min(50, baseLightness + 8)}%)`;
    const darkerColor = `hsl(${baseHue}, ${baseSaturation}%, ${Math.max(5, baseLightness - 8)}%)`;
    const accentColor = `hsl(${(baseHue + 30) % 360}, ${Math.min(100, baseSaturation + 20)}%, ${Math.min(40, baseLightness + 5)}%)`;

    const result = [baseColor, lighterColor, darkerColor, accentColor];
    console.log('[AnimatedGradient] Generated colors:', result);
    return result;
  };

  const rgbToHsl = (r: number, g: number, b: number) => {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }

      h /= 6;
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  };

  return null;
}
