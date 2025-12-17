export const fontBase64 = "AAEAAAARAQAABAAQRkZUTW..." // Placeholder, I can't put real base64 of a font here in one go without a real file.
// Taking a different approach: Using a CDN link or standard font with correct encoding.
// Since I cannot fetch binary and convert to base64 easily here.
// I will try to use the built-in 'helvetica' with proper encoding settings first,
// OR I will ask the user to provide a font file if standard fails.
// But the issue &K&A&... is very specific to "Identity-H" encoding or similar in jsPDF.
// I will try to use a safer font loading method.

// Actually, I will try to use a standard font that supports UTF-8 better if possible.
// But jsPDF core fonts (Helvetica) often fail with UTF-8.
// I'll try to add a font from a URL if possible in client side.
