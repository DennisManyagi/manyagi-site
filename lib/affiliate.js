// /lib/affiliate.js
export function rememberAffiliateFromURL() {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location.href);
  const ref = url.searchParams.get('ref');
  if (ref) {
    // keep simple string like "INF001"
    window.localStorage.setItem('affiliate_ref', ref);
  }
}

export function getRememberedAffiliate() {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem('affiliate_ref');
}
