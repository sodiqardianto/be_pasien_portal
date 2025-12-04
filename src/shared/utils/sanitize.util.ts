import xss from 'xss';
import validator from 'validator';

export class SanitizeUtil {
  /**
   * Sanitize string to prevent XSS attacks
   */
  static sanitizeString(input: string): string {
    if (!input) return input;
    
    // Remove XSS attempts
    let sanitized = xss(input);
    
    // Trim whitespace
    sanitized = validator.trim(sanitized);
    
    return sanitized;
  }

  /**
   * Sanitize email
   */
  static sanitizeEmail(email: string): string {
    if (!email) return email;
    
    // Normalize and sanitize email
    return validator.normalizeEmail(email) || email;
  }

  /**
   * Sanitize object - recursively sanitize all string values
   */
  static sanitizeObject<T extends Record<string, any>>(obj: T): T {
    const sanitized = { ...obj };
    
    for (const key in sanitized) {
      const value = sanitized[key];
      
      if (typeof value === 'string') {
        sanitized[key] = this.sanitizeString(value) as any;
      } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        sanitized[key] = this.sanitizeObject(value) as any;
      } else if (Array.isArray(value)) {
        sanitized[key] = value.map((item: any) => 
          typeof item === 'string' ? this.sanitizeString(item) : item
        ) as any;
      }
    }
    
    return sanitized;
  }

  /**
   * Escape HTML entities
   */
  static escapeHtml(input: string): string {
    if (!input) return input;
    return validator.escape(input);
  }

  /**
   * Validate and sanitize URL
   */
  static sanitizeUrl(url: string): string | null {
    if (!url) return null;
    
    // Check if valid URL
    if (!validator.isURL(url, { protocols: ['http', 'https'], require_protocol: true })) {
      return null;
    }
    
    return xss(url);
  }
}
