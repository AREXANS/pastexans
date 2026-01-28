export const isObfuscatedOrEncrypted = (content: string): boolean => {
  // Check for Lua Bytecode signature (ESC Lua)
  if (content.startsWith("\x1bLua")) return true;

  // Check for common obfuscation functions and patterns
  const suspiciousPatterns = [
    /loadstring\s*\(/,
    /getfenv\s*\(/,
    /string\.dump\s*\(/,
    /bit\.bxor/,
    /bit32\.bxor/,
    // Excessive hex escapes (e.g. \xAB\xCD...) - typical in many obfuscators
    /(\\x[0-9a-fA-F]{2}){4,}/,
    // Excessive decimal escapes (e.g. \123\045...)
    /(\\[0-9]{1,3}){4,}/,
  ];

  // Weighting system
  let score = 0;

  // loadstring and getfenv are highly suspicious in user uploads if not allowed
  if (suspiciousPatterns[0].test(content)) score += 5;
  if (suspiciousPatterns[1].test(content)) score += 5;

  if (suspiciousPatterns[2].test(content)) score += 3;
  if (suspiciousPatterns[3].test(content)) score += 2;
  if (suspiciousPatterns[4].test(content)) score += 2;

  // Check for long strings of escapes which usually indicate hidden payload
  // If we find a long chain of escapes, it's very likely obfuscated, so score 5.
  if (suspiciousPatterns[5].test(content)) score += 5;
  if (suspiciousPatterns[6].test(content)) score += 5;

  return score >= 5;
};
