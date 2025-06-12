import { checkMaliciousLink } from './api';
import { createLinkProcessor } from './utils/link-processor';
import { createLinkObserver } from './utils/observer';
import { FeatureState } from './types';
import { jsPDF } from 'jspdf';
import { createRoot } from 'react-dom/client';

interface LinkReport {
  url: string;
  classification: string;
  confidence: number;
}

const generatePDFReport = (pageUrl: string, links: LinkReport[]) => {
  const doc = new jsPDF();
  const margin = 20;
  let yPos = margin;
  const pageWidth = doc.internal.pageSize.width;
  const maxWidth = pageWidth - (2 * margin);

  // Add title
  doc.setFontSize(16);
  doc.text('Malinkcious Page Report', margin, yPos);
  yPos += 10;

  // Add page URL
  doc.setFontSize(12);
  doc.text('Page URL:', margin, yPos);
  yPos += 7;
  doc.setFontSize(10);
  const urlLines = doc.splitTextToSize(pageUrl, maxWidth);
  doc.text(urlLines, margin, yPos);
  yPos += (urlLines.length * 5) + 10;

  // Add summary
  doc.setFontSize(12);
  const total = links.length;
  const malicious = links.filter(l => l.classification !== 'benign').length;
  doc.text(`Total Links Analyzed: ${total}`, margin, yPos);
  yPos += 7;
  doc.text(`Malicious Links Found: ${malicious}`, margin, yPos);
  yPos += 15;

  // Add links table header
  doc.setFontSize(12);
  doc.text('Link Analysis Results:', margin, yPos);
  yPos += 10;

  // Process each link
  links.forEach((link, index) => {
    // Check if we need a new page
    if (yPos > doc.internal.pageSize.height - margin) {
      doc.addPage();
      yPos = margin;
    }

    doc.setFontSize(10);
    const linkLines = doc.splitTextToSize(link.url, maxWidth);
    doc.text(linkLines, margin, yPos);
    yPos += (linkLines.length * 5);

    doc.setFontSize(9);
    const classification = link.classification.charAt(0).toUpperCase() + link.classification.slice(1);
    
    // Set color based on classification
    if (link.classification === 'benign') {
      doc.setTextColor(0, 150, 0); // Green for benign
    } else {
      doc.setTextColor(200, 0, 0); // Red for malicious
    }
    
    doc.text(`Classification: ${classification}`, margin + 5, yPos);
    
    // Reset color to black for next text
    doc.setTextColor(0, 0, 0);
    
    yPos += 10;
  });

  // Save the PDF
  doc.save('page-report.pdf');
};

// No visual changes needed for links
const noopLinkAction = () => {};

export const initPageReport = () => {
  const state: FeatureState = {
    container: null,
    reactRoot: null,
    processedLinks: 0,
    maliciousLinks: 0,
    isTooltipVisible: false
  };
  
  let isActive = false;
  const linkReports: LinkReport[] = [];

  // Function to process all links on the page
  const processAllLinks = async () => {
    const links = Array.from(document.getElementsByTagName('a'));
    const results = await Promise.all(
      links.map(async (link) => {
        try {
          const url = link.href;
          const result = await checkMaliciousLink(url);
          
          linkReports.push({
            url,
            classification: result.classification,
            confidence: result.confidence
          });
          
          return result.classification !== 'benign';
        } catch (error) {
          console.error('Error checking link:', error);
          return false;
        }
      })
    );

    state.processedLinks = links.length;
    state.maliciousLinks = results.filter(Boolean).length;
  };

  // Watch for storage changes
  const storageListener = async (changes: { [key: string]: chrome.storage.StorageChange }) => {
    if (changes.isPageReportActive) {
      isActive = changes.isPageReportActive.newValue;
      
      if (isActive) {
        // Clear previous results
        linkReports.length = 0;
        state.isTooltipVisible = true;
        
        // Process all links
        await processAllLinks();
        
        // Generate and download the report
        generatePDFReport(window.location.href, linkReports);
        
        // Reset state
        state.isTooltipVisible = false;
        isActive = false;
        
        // Update storage to indicate we're done
        chrome.storage.local.set({ isPageReportActive: false });
      }
    }
  };

  chrome.storage.onChanged.addListener(storageListener);

  // Check initial state
  chrome.storage.local.get(["isPageReportActive"]).then(result => {
    isActive = result.isPageReportActive || false;
    if (isActive) {
      // Clear previous results
      linkReports.length = 0;
      state.isTooltipVisible = true;
      
      // Process all links
      processAllLinks().then(() => {
        // Generate and download the report
        generatePDFReport(window.location.href, linkReports);
        
        // Reset state
        state.isTooltipVisible = false;
        isActive = false;
        
        // Update storage to indicate we're done
        chrome.storage.local.set({ isPageReportActive: false });
      });
    }
  });

  // Return cleanup function
  return () => {
    chrome.storage.onChanged.removeListener(storageListener);
    state.reactRoot?.unmount();
    state.container?.remove();
  };
}; 