export type ThemeConfig = {
  primary: string;
  radius: string;
  fontFamily: string;
};

export const defaultTheme: ThemeConfig = {
  primary: '220 50% 10%',
  radius: '0.5rem',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
};

/**
 * Mocks fetching a tenant's theme configuration.
 * In a real app, this would come from the database based on the subdomain.
 */
export function getTenantTheme(subdomain: string): ThemeConfig {
  // Mock logic
  if (subdomain === 'demo') {
    return {
      primary: '262 83% 58%', // Purple for Demo
      radius: '1rem',
      fontFamily: 'Inter, sans-serif'
    };
  }
  return defaultTheme;
}
