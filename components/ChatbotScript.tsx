'use client';

import { useEffect } from 'react';

declare global {
  interface Window {
    ChatBotUiLoader: any;
  }
}

const ChatbotScript: React.FC = () => {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://d3pnlpse6k7596.cloudfront.net/lex-web-ui-loader.min.js';
    script.async = true;
    script.onload = () => {
      const loaderOpts = {
        baseUrl: 'https://d3pnlpse6k7596.cloudfront.net/',
        shouldLoadMinDeps: true
      };
      const loader = new window.ChatBotUiLoader.IframeLoader(loaderOpts);
      const chatbotUiConfig = {
        /* Example of setting session attributes on parent page
        lex: {
          sessionAttributes: {
            userAgent: navigator.userAgent,
            QNAClientFilter: ''
          }
        }
        */
      };
      loader.load(chatbotUiConfig)
        .catch((error: Error) => { console.error(error); });
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return null;
};

export default ChatbotScript;
