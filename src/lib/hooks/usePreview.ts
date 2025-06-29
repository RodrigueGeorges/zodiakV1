import { useEffect } from 'react';

export function usePreview() {
  useEffect(() => {
    // Prevent zooming on iOS
    const viewportMeta = document.querySelector('meta[name="viewport"]');
    if (viewportMeta) {
      viewportMeta.setAttribute('content', 
        'width=device-width, initial-scale=1.0, viewport-fit=cover, user-scalable=no, maximum-scale=1'
      );
    }

    // Add safe area insets for iOS
    document.body.classList.add('safe-area-inset-top', 'safe-area-inset-bottom');

    // Enable smooth scrolling
    document.documentElement.classList.add('scroll-smooth');

    // Disable text selection on interactive elements
    const style = document.createElement('style');
    style.textContent = `
      button, a, [role="button"] {
        -webkit-tap-highlight-color: transparent;
        -webkit-touch-callout: none;
        user-select: none;
      }

      input, textarea {
        font-size: 16px !important;
      }

      .safe-area-inset-top {
        padding-top: env(safe-area-inset-top);
      }

      .safe-area-inset-bottom {
        padding-bottom: env(safe-area-inset-bottom);
      }

      /* Improve scrolling performance */
      * {
        -webkit-overflow-scrolling: touch;
      }

      /* Prevent content shifting */
      html {
        scroll-behavior: smooth;
        height: -webkit-fill-available;
      }

      body {
        min-height: 100vh;
        min-height: -webkit-fill-available;
      }
    `;
    document.head.appendChild(style);

    // Log debug info
    console.log('Preview mode initialized');
    console.log('User agent:', navigator.userAgent);
    console.log('Screen size:', window.innerWidth, 'x', window.innerHeight);

    return () => {
      document.head.removeChild(style);
    };
  }, []);
}