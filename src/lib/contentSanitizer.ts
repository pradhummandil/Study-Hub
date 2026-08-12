/**
 * Content sanitizer for user-generated HTML/Markdown.
 * Prevents XSS by stripping dangerous tags and attributes.
 * Never use dangerouslySetInnerHTML on arbitrary content without running through this.
 */

const DANGEROUS_PROTOCOLS = /^(javascript:|data:|vbscript:|file:)/i;

/**
 * Sanitize an HTML string — removes dangerous tags and attributes.
 * For use before dangerouslySetInnerHTML on user content.
 */
export function sanitizeHtml(html: string): string {
  // Simple regex-based sanitizer for client-side use
  // For production, consider DOMPurify if you add it as a dependency
  return html
    // Remove script tags and content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Remove style tags and content
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    // Remove event handlers
    .replace(/\son\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    // Remove javascript: in href/src
    .replace(/href\s*=\s*["']?\s*javascript:[^"'>\s]*/gi, 'href="#"')
    .replace(/src\s*=\s*["']?\s*javascript:[^"'>\s]*/gi, 'src=""')
    .replace(/src\s*=\s*["']?\s*data:[^"'>\s]*/gi, 'src=""')
    // Remove potentially dangerous attributes
    .replace(/\s(srcdoc|formaction|xlink:href)\s*=[^>\s]*/gi, '');
}

/**
 * Validate a URL has a safe protocol.
 * Returns true if the URL is safe to use.
 */
export function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return !DANGEROUS_PROTOCOLS.test(parsed.protocol);
  } catch {
    // Relative URLs are OK
    if (url.startsWith('/') || url.startsWith('./') || url.startsWith('../')) {
      return true;
    }
    return false;
  }
}

/**
 * Sanitize a URL for use in href/src.
 * Returns '#' if the URL is dangerous.
 */
export function sanitizeUrl(url: string): string {
  if (!url) return '#';
  if (DANGEROUS_PROTOCOLS.test(url)) return '#';
  try {
    const parsed = new URL(url);
    if (DANGEROUS_PROTOCOLS.test(parsed.protocol)) return '#';
    return url;
  } catch {
    // Allow relative URLs
    if (url.startsWith('/') || url.startsWith('./') || url.startsWith('#')) {
      return url;
    }
    return '#';
  }
}

/**
 * Strip all HTML from a string and return plain text.
 * Use for displaying user-entered text in non-HTML contexts.
 */
export function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, '').trim();
}

/**
 * Truncate text to a maximum length with ellipsis.
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trimEnd() + '…';
}

/**
 * Validate that admin redirect targets are internal (prevent open redirect).
 */
export function isSafeRedirectPath(path: string): boolean {
  // Must start with / and not contain ://
  return path.startsWith('/') && !path.includes('://') && !path.startsWith('//');
}
