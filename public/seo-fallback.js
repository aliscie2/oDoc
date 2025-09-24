// SEO fallback script that runs immediately when the page loads
// This ensures social media crawlers always have meta tags to read
(function() {
  'use strict';
  
  const DEFAULT_THUMBNAIL = 'https://raw.githubusercontent.com/aliscie2/oDoc/refs/heads/dev2/public/thumnail.png';
  const SITE_NAME = 'ICPJOBS';
  
  function updateMeta(property, content) {
    if (!content) return;
    
    let meta = document.querySelector('meta[property="' + property + '"], meta[name="' + property + '"]');
    if (!meta) {
      meta = document.createElement('meta');
      if (property.startsWith('og:') || property.startsWith('article:')) {
        meta.setAttribute('property', property);
      } else {
        meta.setAttribute('name', property);
      }
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', content);
  }
  
  // Check if this is a job page
  const urlParams = new URLSearchParams(window.location.search);
  const jobId = urlParams.get('id');
  const isJobPage = window.location.pathname.includes('/job') || jobId;
  
  if (isJobPage && jobId) {
    // Set immediate fallback meta tags for job pages
    updateMeta('og:title', 'Job Opportunity | ' + SITE_NAME);
    updateMeta('og:description', 'Explore this job opportunity on ' + SITE_NAME + ' - AI job matching & crypto payments.');
    updateMeta('og:image', DEFAULT_THUMBNAIL);
    updateMeta('og:url', window.location.href);
    updateMeta('og:type', 'article');
    
    updateMeta('twitter:title', 'Job Opportunity | ' + SITE_NAME);
    updateMeta('twitter:description', 'Explore this job opportunity on ' + SITE_NAME + ' - AI job matching & crypto payments.');
    updateMeta('twitter:image', DEFAULT_THUMBNAIL);
    updateMeta('twitter:card', 'summary_large_image');
    
    // Store job ID for React to use later
    window.__JOB_ID__ = jobId;
    
    console.log('SEO fallback: Set default meta tags for job page', jobId);
  }
})();