/**
 * Robust JSON parsing utilities for handling malformed JSON from AI APIs
 */

export interface JSONParseResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  originalLength: number;
  cleanedLength: number;
}

/**
 * Advanced JSON parser with multiple fallback strategies
 */
export class RobustJSONParser {
  private static readonly MAX_RETRIES = 3;
  private static readonly COMMON_PATTERNS = [
    // Gemini API specific patterns
    /"([^"]*)\\\",\s*\\\\"([^"]*)"([^"]*):/g,
    /"([^"]*)\\\":\s*([^,}]+),\s*\\\\"([^"]*)"([^"]*):/g,
    /"([^"]*)\\\"\s*}/g,
    /\\\\"/g,
    /\\"/g,
  ];

  /**
   * Parse JSON with multiple fallback strategies
   */
  static parse<T = any>(jsonString: string): JSONParseResult<T> {
    const originalLength = jsonString.length;
    
    // Strategy 1: Try parsing as-is
    try {
      const data = JSON.parse(jsonString);
      return {
        success: true,
        data,
        originalLength,
        cleanedLength: jsonString.length,
      };
    } catch (error) {
    }

    // Strategy 2: Clean and repair
    const cleaned = this.cleanAndRepair(jsonString);
    try {
      const data = JSON.parse(cleaned);
      return {
        success: true,
        data,
        originalLength,
        cleanedLength: cleaned.length,
      };
    } catch (error) {
    }

    // Strategy 3: Extract valid JSON array/object
    const extracted = this.extractValidJSON(cleaned);
    if (extracted) {
      try {
        const data = JSON.parse(extracted);
        return {
          success: true,
          data,
          originalLength,
          cleanedLength: extracted.length,
        };
      } catch (error) {
      }
    }

    // Strategy 4: Reconstruct from fragments
    const reconstructed = this.reconstructFromFragments(cleaned);
    if (reconstructed) {
      try {
        const data = JSON.parse(reconstructed);
        return {
          success: true,
          data,
          originalLength,
          cleanedLength: reconstructed.length,
        };
      } catch (error) {
      }
    }

    return {
      success: false,
      error: 'All parsing strategies failed',
      originalLength,
      cleanedLength: cleaned.length,
    };
  }

  /**
   * Clean and repair common JSON issues
   */
  private static cleanAndRepair(jsonString: string): string {
    let cleaned = jsonString.trim();

    // Remove markdown code blocks
    cleaned = cleaned
      .replace(/^```json\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();

    // Remove control characters
    cleaned = cleaned
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
      .replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    // Fix common Gemini API issues
    cleaned = this.fixGeminiAPIIssues(cleaned);

    // Fix unquoted property names
    cleaned = cleaned.replace(/([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g, '$1"$2":');

    // Fix single quotes to double quotes
    cleaned = cleaned
      .replace(/'/g, '"')
      .replace(/""/g, '"');

    // Fix trailing commas
    cleaned = cleaned
      .replace(/,(\s*[}\]])/g, '$1')
      .replace(/,(\s*$)/g, '');

    return cleaned;
  }

  /**
   * Fix specific Gemini API JSON issues
   */
  private static fixGeminiAPIIssues(jsonString: string): string {
    let fixed = jsonString;

    // Fix double-escaped quotes
    fixed = fixed
      .replace(/\\\\"/g, '"')
      .replace(/\\"/g, '"');

    // Fix malformed property patterns
    fixed = fixed
      .replace(/"([^"]*)\\\",\s*\\\\"([^"]*)"([^"]*):/g, '"$1", "$2$3":')
      .replace(/"([^"]*)\\\":\s*([^,}]+),\s*\\\\"([^"]*)"([^"]*):/g, '"$1": $2, "$3$4":')
      .replace(/"([^"]*)\\\"\s*}/g, '"$1" }');

    // Fix incomplete objects
    fixed = fixed
      .replace(/\{[^}]*$/, '') // Remove incomplete objects at end
      .replace(/,\s*$/, '') // Remove trailing commas
      .replace(/,\s*\]/, ']'); // Remove comma before closing bracket

    return fixed;
  }

  /**
   * Extract valid JSON array or object from malformed string
   */
  private static extractValidJSON(jsonString: string): string | null {
    // Try to find complete JSON array
    const arrayMatch = jsonString.match(/\[[\s\S]*\]/);
    if (arrayMatch) {
      const extracted = arrayMatch[0];
      try {
        JSON.parse(extracted);
        return extracted;
      } catch (error) {
        // Try to fix the extracted array
        const fixed = this.fixArrayStructure(extracted);
        try {
          JSON.parse(fixed);
          return fixed;
        } catch (error) {
          // Continue to next strategy
        }
      }
    }

    // Try to find complete JSON object
    const objectMatch = jsonString.match(/\{[\s\S]*\}/);
    if (objectMatch) {
      const extracted = objectMatch[0];
      try {
        JSON.parse(extracted);
        return extracted;
      } catch (error) {
        // Try to fix the extracted object
        const fixed = this.fixObjectStructure(extracted);
        try {
          JSON.parse(fixed);
          return fixed;
        } catch (error) {
          // Continue to next strategy
        }
      }
    }

    return null;
  }

  /**
   * Fix array structure issues
   */
  private static fixArrayStructure(arrayString: string): string {
    let fixed = arrayString;

    // Remove incomplete objects at the end
    fixed = fixed.replace(/,\s*\{[^}]*$/, '');

    // Fix trailing commas
    fixed = fixed.replace(/,\s*\]/, ']');

    // Ensure proper array structure
    if (!fixed.startsWith('[')) {
      fixed = '[' + fixed;
    }
    if (!fixed.endsWith(']')) {
      fixed = fixed + ']';
    }

    return fixed;
  }

  /**
   * Fix object structure issues
   */
  private static fixObjectStructure(objectString: string): string {
    let fixed = objectString;

    // Remove incomplete properties
    fixed = fixed.replace(/,\s*"[^"]*":\s*[^,}]*$/, '');

    // Fix trailing commas
    fixed = fixed.replace(/,\s*\}/, '}');

    // Ensure proper object structure
    if (!fixed.startsWith('{')) {
      fixed = '{' + fixed;
    }
    if (!fixed.endsWith('}')) {
      fixed = fixed + '}';
    }

    return fixed;
  }

  /**
   * Reconstruct JSON from fragments using pattern matching
   */
  private static reconstructFromFragments(jsonString: string): string | null {
    // This is a more advanced strategy that would analyze the structure
    // and attempt to reconstruct valid JSON from fragments
    // For now, return null to indicate this strategy isn't implemented
    return null;
  }

  /**
   * Parse with retry mechanism
   */
  static parseWithRetry<T = any>(
    jsonString: string,
    maxRetries: number = this.MAX_RETRIES
  ): JSONParseResult<T> {
    let lastError: string = '';

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      
      const result = this.parse<T>(jsonString);
      
      if (result.success) {
        return result;
      }
      
      lastError = result.error || 'Unknown error';
      
      // Add a small delay between retries
      if (attempt < maxRetries) {
        // In a real implementation, you might want to use setTimeout
        // but for now we'll just continue
      }
    }

    return {
      success: false,
      error: `All ${maxRetries} attempts failed. Last error: ${lastError}`,
      originalLength: jsonString.length,
      cleanedLength: 0,
    };
  }

  /**
   * Validate JSON structure
   */
  static validateStructure(data: any, expectedStructure: any): boolean {
    if (typeof data !== typeof expectedStructure) {
      return false;
    }

    if (Array.isArray(data) && Array.isArray(expectedStructure)) {
      return data.every((item, index) => 
        this.validateStructure(item, expectedStructure[0])
      );
    }

    if (typeof data === 'object' && data !== null) {
      return Object.keys(expectedStructure).every(key => 
        key in data && this.validateStructure(data[key], expectedStructure[key])
      );
    }

    return true;
  }
}

/**
 * Convenience function for parsing JSON with fallback
 */
export function parseJSON<T = any>(jsonString: string): T | null {
  const result = RobustJSONParser.parse<T>(jsonString);
  return result.success ? (result.data ?? null) : null;
}

/**
 * Parse JSON with detailed error information
 */
export function parseJSONWithDetails<T = any>(jsonString: string): JSONParseResult<T> {
  return RobustJSONParser.parse<T>(jsonString);
}

/**
 * Parse JSON with retry mechanism
 */
export function parseJSONWithRetry<T = any>(jsonString: string, maxRetries: number = 3): T | null {
  const result = RobustJSONParser.parseWithRetry<T>(jsonString, maxRetries);
  return result.success ? (result.data ?? null) : null;
}
