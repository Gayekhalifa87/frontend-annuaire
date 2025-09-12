/**
 * Utilitaires pour la manipulation des chaînes de caractères
 */

export function getInitials(fullName: string): string {
  return fullName
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .substring(0, 2);
}

export function capitalizeFirst(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

export function formatPhoneNumber(phone: string): string {
  // Format français : 01.23.45.67.89
  return phone.replace(/(\d{2})(?=\d)/g, '$1.');
}

export function sanitizeEmail(email: string): string {
  return email.toLowerCase().trim();
}