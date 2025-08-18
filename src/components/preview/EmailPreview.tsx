import React, { useRef, useEffect } from 'react';
import { Template } from '../../types';

interface EmailPreviewProps {
  template: Template | null;
}

const EmailPreview: React.FC<EmailPreviewProps> = ({ template }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  if (!template) {
    return null; // Don't render anything if no template is selected
  }

  // Construct a full, valid HTML document for the iframe's srcDoc.
  // This ensures your email HTML is rendered in a clean, isolated environment.
  const iframeContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          /* Basic reset to ensure the body fills the iframe */
          body { 
            margin: 0; 
            padding: 0; 
            font-family: sans-serif; /* A default font if none is specified */
          }
        </style>
      </head>
      <body>
        ${template.body || '<p style="padding: 1rem; color: #9ca3af;">(No body content)</p>'}
      </body>
    </html>
  `;

  // This function is called when the iframe content has finished loading.
  const adjustIframeHeight = () => {
    const iframe = iframeRef.current;
    if (iframe && iframe.contentWindow) {
      // Calculate the height of the content within the iframe
      const contentHeight = iframe.contentWindow.document.body.scrollHeight;
      // Set the iframe's height to match its content, removing the scrollbar
      iframe.style.height = `${contentHeight}px`;
    }
  };

  // We use useEffect to re-run the height adjustment whenever the template body changes.
  // The onLoad event on the iframe will trigger this function automatically.
  useEffect(() => {
    const iframe = iframeRef.current;
    if (iframe) {
      // The `load` event fires after the srcDoc has been parsed and rendered.
      iframe.addEventListener('load', adjustIframeHeight);

      // Cleanup function to remove the event listener when the component unmounts
      return () => {
        iframe.removeEventListener('load', adjustIframeHeight);
      };
    }
  }, [template.body]); // Re-attach listener if the template reference changes

  return (
    <div className="bg-white shadow-lg rounded-xl overflow-hidden">
      <div className="p-6 border-b border-gray-200 bg-gray-50/70">
        <h2 className="text-xl font-bold text-gray-800">Email Preview</h2>
      </div>
      
      {/* Subject Line Display */}
      <div className="p-6 border-b border-gray-200">
        <p className="text-sm">
          <span className="font-medium text-gray-500">Subject: </span>
          <span className="font-semibold text-gray-800">{template.subject || '(No subject)'}</span>
        </p>
      </div>

      {/* Iframe Container - No padding here to allow the iframe to be full-width */}
      <div className="w-full">
        <iframe
          ref={iframeRef}
          srcDoc={iframeContent}
          title="Email Preview"
          onLoad={adjustIframeHeight} // Also call here for initial load
          style={{
            width: '100%',
            border: 'none',
            minHeight: '100px', // A minimum height while it loads
            display: 'block', // Ensures no extra space below the iframe
            transition: 'height 0.2s ease-out', // Optional: for a smooth resize effect
          }}
        />
      </div>
    </div>
  );
};

export default EmailPreview;