/**
 * Real clipboard utility with fallbacks for iframe sandboxes and unsecure contexts
 */

export interface CopyResult {
  success: boolean;
  url: string;
  fallbackNeeded: boolean;
}

export async function copyWidgetLinkToClipboard(
  projectId: string,
  onSuccess?: (url: string) => void,
  onFallback?: (url: string) => void
): Promise<CopyResult> {
  const url = new URL(
    `/widget/${encodeURIComponent(projectId)}`,
    window.location.origin
  ).href;

  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(url);
      onSuccess?.(url);
      return { success: true, url, fallbackNeeded: false };
    }
  } catch (err) {
    console.warn('Standard navigator.clipboard.writeText failed, trying execCommand fallback:', err);
  }

  // Fallback 1: Hidden textarea with document.execCommand('copy')
  try {
    const textarea = document.createElement('textarea');
    textarea.value = url;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    textarea.style.top = '0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textarea);

    if (successful) {
      onSuccess?.(url);
      return { success: true, url, fallbackNeeded: false };
    }
  } catch (fallbackErr) {
    console.warn('execCommand fallback failed as well:', fallbackErr);
  }

  // Fallback 2: Notify app to render the selectable copy modal
  onFallback?.(url);
  return { success: false, url, fallbackNeeded: true };
}
