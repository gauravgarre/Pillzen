export const GA_TRACKING_ID = "G-3NRV2J1NL0";

// https://developers.google.com/analytics/devguides/collection/gtagjs/pages
export const pageview = (url) => {
  // @ts-expect-error
  window.gtag("config", GA_TRACKING_ID, {
    page_path: url,
  });
};

// https://developers.google.com/analytics/devguides/collection/gtagjs/events
export const event = ({ action, category, label, value }) => {
  // @ts-expect-error
  window.gtag("event", action, {
    event_category: category,
    event_label: label,
    value: value,
  });
};
