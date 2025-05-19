// Define the Google Translate global types
declare global {
  interface Window {
    googleTranslateElementInit: () => void;
    google: {
      translate: {
        TranslateElement: {
          new (options: object, elementId: string): void;
          InlineLayout: {
            NO_IFRAME: number;
            SIMPLE: number;
            HORIZONTAL: number;
            VERTICAL: number;
          };
        };
      };
    };
  }
}

/**
 * Gets the language name from language code
 * @param code The language code
 * @returns The language name
 */
export const getLanguageName = (code: string): string => {
  const languages: Record<string, string> = {
    es: 'Español',
    en: 'English',
    it: 'Italiano'
  };
  return languages[code] || 'Español';
};

/**
 * Loads the Google Translate script
 * @returns Promise that resolves when the script is loaded
 */
export const loadGoogleTranslateScript = (): Promise<void> => {
  return new Promise((resolve) => {
    // Check if script is already loaded
    if (document.querySelector('script[src*="translate.google.com"]')) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      resolve();
    };
    
    document.body.appendChild(script);
  });
};

/**
 * Initializes the Google Translate element
 */
export const initGoogleTranslate = (): Promise<void> => {
  return new Promise((resolve) => {
    // Create the translation element if it doesn't exist
    let translateElement = document.getElementById('google_translate_element');
    if (!translateElement) {
      translateElement = document.createElement('div');
      translateElement.id = 'google_translate_element';
      translateElement.style.display = 'none';
      document.body.appendChild(translateElement);
    }

    // Initialize Google Translate
    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement(
        {
          pageLanguage: 'es',
          includedLanguages: 'en,it,es',
          autoDisplay: false,
          layout: window.google.translate.TranslateElement.InlineLayout.NO_IFRAME
        },
        'google_translate_element'
      );
      resolve();
    };
  });
};

/**
 * Changes the page language
 * @param language The language code to change to ('es', 'en', or 'it')
 * @returns Promise that resolves when the language is changed
 */
export const changeLanguage = async (language: string): Promise<boolean> => {
  try {
    // Wait for Google Translate to be ready
    await loadGoogleTranslateScript();
    
    // Find the Google Translate selector
    const select = document.querySelector('.goog-te-combo') as HTMLSelectElement;
    
    if (select) {
      // Change the language
      select.value = language;
      select.dispatchEvent(new Event('change'));
      
      // Apply styles again after language change
      setTimeout(() => {
        addTranslateStyles();
      }, 300);
      
      return true;
    } else {
      console.error('Google Translate selector not found');
      return false;
    }
  } catch (error) {
    console.error('Error changing language:', error);
    return false;
  }
};

/**
 * Adds CSS to hide Google Translate widget
 */
export const addTranslateStyles = (): void => {
  // Remove any existing translate styles to avoid duplicates
  const existingStyle = document.getElementById('google-translate-hide-styles');
  if (existingStyle) {
    existingStyle.remove();
  }

  const style = document.createElement('style');
  style.id = 'google-translate-hide-styles';
  style.textContent = `
    /* Hide Google Translate banner */
    .goog-te-banner-frame { 
      display: none !important; 
      visibility: hidden !important;
    }
    
    /* Remove the top margin added by Google Translate */
    body { 
      top: 0px !important; 
      position: static !important;
    }
    
    /* Hide all Google Translate widgets */
    .goog-te-gadget { 
      display: none !important; 
      height: 0 !important;
      visibility: hidden !important;
    }
    
    /* Hide the tooltip/popup */
    .VIpgJd-ZVi9od-l4eHX-hSRGPd,
    .skiptranslate,
    .goog-te-balloon-frame, 
    #goog-gt-tt, 
    .goog-te-menu-value,
    div#goog-gt-,
    .goog-tooltip,
    .goog-tooltip:hover,
    .goog-text-highlight,
    .goog-te-menu2 { 
      display: none !important; 
      visibility: hidden !important;
    }
    
    /* Hide all Google elements */
    #google_translate_element {
      display: none !important;
      visibility: hidden !important;
      width: 0 !important;
      height: 0 !important;
      overflow: hidden !important;
    }
    
    /* Ensure iframes are hidden too */
    .goog-te-menu-frame,
    iframe[id=":1.container"],
    iframe.skiptranslate {
      display: none !important;
      visibility: hidden !important;
    }
  `;
  document.head.appendChild(style);
  
  // Handle body top property which Google Translate often changes
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.attributeName === 'style') {
        const body = document.body;
        if (body.style.top && body.style.top !== '0px') {
          body.style.top = '0px';
        }
      }
    });
  });
  
  observer.observe(document.body, { attributes: true });
};

/**
 * Gets the current language from Google Translate
 * @returns The current language code
 */
export const getCurrentLanguage = (): string => {
  const html = document.querySelector('html');
  if (html && html.lang) {
    return html.lang.substring(0, 2);
  }
  
  // Check for Google Translate cookie
  const match = document.cookie.match(/googtrans=\/[^\/]*\/([^;]*)/);
  if (match && match[1]) {
    return match[1];
  }
  
  return 'es'; // Default to Spanish
}; 