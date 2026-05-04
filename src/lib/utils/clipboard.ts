export async function copyToClipboard(text: string): Promise<boolean> {
	// Try 1: Clipboard API (works in secure context)
	if (navigator.clipboard && window.isSecureContext) {
		try {
			await navigator.clipboard.writeText(text);
			return true;
		} catch {
			// Clipboard API failed, try fallback
		}
	}
	
	// Try 2: execCommand fallback (works on HTTP/mobile)
	return copyToClipboardLegacy(text);
}

export function copyToClipboardLegacy(text: string): boolean {
	const textarea = document.createElement('textarea');
	textarea.value = text;
	textarea.style.position = 'fixed';
	textarea.style.left = '-9999px';
	textarea.style.top = '0';
	textarea.style.opacity = '0';
	document.body.appendChild(textarea);
	textarea.focus();
	textarea.select();
	
	try {
		const success = document.execCommand('copy');
		document.body.removeChild(textarea);
		return success;
	} catch {
		document.body.removeChild(textarea);
		return false;
	}
}

export async function shareOrCopy(title: string, text: string): Promise<'shared' | 'copied' | 'manual' | 'error'> {
	// Check for secure context - HTTPS or localhost
	const isSecure = window.isSecureContext || 
		window.location.hostname === 'localhost' || 
		window.location.hostname === '127.0.0.1';
	
	// Try 1: Share API (secure context + mobile)
	if (navigator.share && isSecure) {
		try {
			await navigator.share({ title, text });
			return 'shared';
		} catch (error) {
			// User cancelled share
			if (error instanceof Error && error.name === 'AbortError') {
				return 'manual';
			}
			// Share failed, try clipboard
		}
	}
	
	// Try 2: Clipboard (with fallbacks)
	const success = await copyToClipboard(text);
	return success ? 'copied' : 'manual';
}