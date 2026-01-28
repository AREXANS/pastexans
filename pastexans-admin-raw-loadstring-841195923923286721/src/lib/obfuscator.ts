// Helper function to generate random string
const rStr = (len: number): string => {
  const c = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const a = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let s = c.charAt(Math.floor(Math.random() * c.length));
  for (let i = 0; i < len - 1; i++) s += a.charAt(Math.floor(Math.random() * a.length));
  return s;
};

// Helper to generate a random charset for encoding
const getRandomCharset = (): string => {
  const chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!#$%()*+,-.:;=?@[]^_{|}~";
  const shuffled = chars.split('').sort(() => 0.5 - Math.random()).join('');
  return shuffled.substring(0, 16); // We need exactly 16 chars for nibble encoding
};

// Helper to encode string/bytes into a custom randomized hex-like string
const encodeString = (str: string, charset: string): string => {
  let res = "";
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    const high = (code >> 4) & 0xF;
    const low = code & 0xF;
    res += charset[high] + charset[low];
  }
  return res;
};

// Generate Lua decoder function for the custom encoding
// Returns { decoderCode, decoderName, charsetVarName }
const getDecoderLua = (charset: string) => {
  const vFunc = rStr(6);
  const vCharset = rStr(6);
  const vStr = rStr(6);
  const vRes = rStr(6);
  const vI = rStr(6);
  const vH = rStr(6);
  const vL = rStr(6);
  const vSub = rStr(6);
  const vFind = rStr(6);
  const vChar = rStr(6);

  // Lua code to decode:
  // function decode(str) ... end
  // Added a space after 'end' to avoid 'endlocal' syntax error
  const code = `local ${vCharset}="${charset}";local ${vSub}=string.sub;local ${vFind}=string.find;local ${vChar}=string.char;local function ${vFunc}(${vStr}) local ${vRes}={} for ${vI}=1,#${vStr},2 do local ${vH}=${vFind}(${vCharset},${vSub}(${vStr},${vI},${vI}),1,true)-1;local ${vL}=${vFind}(${vCharset},${vSub}(${vStr},${vI}+1,${vI}+1),1,true)-1;table.insert(${vRes},${vChar}(${vH}*16+${vL})) end return table.concat(${vRes}) end `;
  
  return { code, name: vFunc };
};

// Robust LUA expiry check generator
export const getExpiryCheckLua = (unixTime: number | null): string => {
  if (!unixTime) return "";

  const vOs = rStr(6);
  const vFunc = rStr(6);
  const vNow = rStr(6);
  
  // Obfuscate the target timestamp
  const k = Math.floor(Math.random() * 999999);
  const target = unixTime + k;
  
  // Create a dedicated decoder for the expiry numbers to keep it self-contained
  const charset = getRandomCharset();
  const { code: decoderCode, name: decoderName } = getDecoderLua(charset);
  
  const targetStr = target.toString();
  const kStr = k.toString();
  
  const encodedTarget = encodeString(targetStr, charset);
  const encodedK = encodeString(kStr, charset);

  // Message encoding
  const msgExpired = "[PASTEXANS] EXPIRED";
  const msgTimeout = "SESSION_TIMEOUT: ";
  const encodedMsgExpired = encodeString(msgExpired, charset);
  const encodedMsgTimeout = encodeString(msgTimeout, charset);

  return `${decoderCode}local ${vOs}=string.char;local ${vFunc}=getfenv()[${vOs}(111,115)][${vOs}(116,105,109,101)];local ${vNow}=${vFunc}();local vTarget=tonumber(${decoderName}("${encodedTarget}"));local vK=tonumber(${decoderName}("${encodedK}"));if ${vNow}>(vTarget-vK)then getfenv()[${vOs}(119,97,114,110)](${decoderName}("${encodedMsgExpired}"));getfenv()[${vOs}(101,114,114,111,114)](${decoderName}("${encodedMsgTimeout}")..(${vNow}),0)end;`;
};

// Implementation of MoonSec V3 style obfuscator
export const moonsecV3Obfuscate = (script: string): string => {
  // 1. Minify script (basic)
  let minified = script.trim();
  
  // 2. Encrypt with strong algorithm (Rolling XOR + Rotation)
  const key = Math.floor(Math.random() * 255);
  const rot = Math.floor(Math.random() * 7) + 1;
  
  let encrypted = "";
  for (let i = 0; i < minified.length; i++) {
    let code = minified.charCodeAt(i);
    // XOR
    code = code ^ key;
    // Rotate Right
    code = ((code >> rot) | (code << (8 - rot))) & 0xFF;
    encrypted += String.fromCharCode(code);
  }
  
  // 3. Encode to custom charset (MoonSec lookalike use lots of byte manipulations)
  // We'll use a large table of bytes in the lua script
  const charset = getRandomCharset();
  const encoded = encodeString(encrypted, charset);
  
  // Generate random variable names
  const vTable = rStr(12);
  const vStr = rStr(12);
  const vFunc = rStr(12);
  const vI = rStr(6);
  const vV = rStr(6);
  const vRes = rStr(12);
  const vByte = rStr(12);
  const vKey = rStr(12);
  const vRot = rStr(12);
  const vBit = rStr(8);
  
  // Generate the Lua Deobfuscator
  const { code: decoderCode, name: decoderName } = getDecoderLua(charset);
  
  // Heavily obfuscated runner
  // It decrypts the string, then reverses the XOR+ROT logic
  // ROT R undo -> ROT L
  
  const vChar = rStr(6);

  const runner = `
${decoderCode}
local ${vStr} = ${decoderName}("${encoded}")
local ${vKey} = ${key}
local ${vRot} = ${rot}
local ${vBit} = bit32 or require('bit')
local ${vRes} = {}
local ${vByte} = string.byte
local ${vChar} = string.char

for ${vI} = 1, #${vStr} do
    local ${vV} = ${vByte}(${vStr}, ${vI}, ${vI})
    -- Undo Rotation (Rotate Left by rot)
    ${vV} = ${vBit}.bor(${vBit}.lshift(${vV}, ${vRot}), ${vBit}.rshift(${vV}, 8 - ${vRot}))
    ${vV} = ${vBit}.band(${vV}, 0xFF)
    -- Undo XOR
    ${vV} = ${vBit}.bxor(${vV}, ${vKey})
    table.insert(${vRes}, ${vChar}(${vV}))
end

local ${vFunc} = loadstring(table.concat(${vRes}))
${vFunc}()
`;

  // Wrap in an anonymous function call for scope isolation
  return `--[[ \n   MoonSec V3 Protection \n   Generated by PasteXans \n]]\n\n(function() ${runner} end)()`;
};

// Visual obfuscator (UI only)
export const simpleObfuscator = (text: string, level: number = 1): string => {
  // Header
  const header = `--[[ \n   PROTECTED CONTENT \n   Obfuscated by PasteXans Auto-Shield (Level ${level}) \n]]\n\n`;

  if (level === 1) {
    // 1x: Simple byte array
    const bytes: number[] = [];
    for (let i = 0; i < text.length; i++) bytes.push(text.charCodeAt(i));
    return `${header}local v0 = {${bytes.join(',')}}\nlocal v1 = ""\nfor i=1,#v0 do v1=v1..string.char(v0[i]) end\nloadstring(v1)()`;
  } else if (level === 2) {
    // 2x: String encoding
    const charset = getRandomCharset();
    const encoded = encodeString(text, charset);
    const { code, name } = getDecoderLua(charset);
    const vExec = rStr(8);
    return `${header}${code}local ${vExec}=${name}("${encoded}");loadstring(${vExec})()`;
  } else {
    // 3x: MoonSec V3 Style (Replaces old Level 3)
    return moonsecV3Obfuscate(text);
  }
};

// Long/Heavy loadstring obfuscator - Obfuscates the entire loader script
export const longLoadstringObfuscate = (lua: string): string => {
  return moonsecV3Obfuscate(lua);
};

// Helper for Short obfuscator encryption (Reverse + Shift)
const compactEncrypt = (str: string, shift: number): string => {
  // Logic: Reverse string, then add shift to each char code
  const reversed = str.split('').reverse().join('');
  let encrypted = "";
  for (let i = 0; i < reversed.length; i++) {
    encrypted += String.fromCharCode(reversed.charCodeAt(i) + shift);
  }
  return encrypted;
};

// Helper to escape Lua string literals properly
const escapeLuaString = (str: string): string => {
  // Escapes backslashes, double quotes, newlines, etc.
  // We are putting this inside a double-quoted string "..."
  // STRICT MODE: Escape anything outside printable ASCII 32-126
  let res = "";
  for (let i = 0; i < str.length; i++) {
    const c = str.charAt(i);
    const code = str.charCodeAt(i);
    if (c === '"') res += '\\"';
    else if (c === '\\') res += '\\\\';
    else if (c === '\n') res += '\\n';
    else if (c === '\r') res += '\\r';
    else if (code < 32 || code > 126) {
        // Escape non-printable and high bytes to avoid UTF-8 mangling
        // Use decimal escape \ddd
        let decimal = code.toString();
        while (decimal.length < 3) decimal = "0" + decimal;
        res += "\\" + decimal;
    } else {
        res += c;
    }
  }
  return res;
};

// Medium loadstring obfuscator (previously titan)
export const mediumLoadstringObfuscate = (url: string, unixTime: number | null): string => {
  const charset = getRandomCharset();
  const { code, name } = getDecoderLua(charset);
  
  const encodedUrl = encodeString(url, charset);
  const vUrl = rStr(6);
  
  let expiryLua = "";
  if (unixTime) {
    expiryLua = getExpiryCheckLua(unixTime);
  }

  // Stronger loader
  return `${expiryLua}${code}local ${vUrl}=${name}("${encodedUrl}");local s,r=pcall(function() return game:HttpGet(${vUrl}) end);if not s then return end;loadstring(game:GetService("HttpService"):JSONDecode(r).fields.content.stringValue)()`;
};

// Titan Short obfuscator (Medium Encrypt - short1) - IMPROVED
export const shortLoadstringObfuscate = (url: string, unixTime: number | null): string => {
  // This is the simplest and shortest loadstring, with minimal obfuscation
  const expiryLua = unixTime ? `if os.time()>${unixTime} then error("SESSION_EXPIRED") end;` : '';
  return `${expiryLua}loadstring(game:GetService("HttpService"):JSONDecode(game:HttpGet("${url}")).fields.content.stringValue)()`;
};

// Nano obfuscator (Short Encrypt - short2) - IMPROVED
export const nanoObfuscate = (url: string, unixTime: number | null): string => {
  // "Short" means we want it small. But user wants "secure and strict".
  // We will add a basic anti-http-spy check or similar if possible, but keep it short.
  // Actually, let's just make the encryption slightly more annoying to reverse manually.
  
  const shift = Math.floor(Math.random() * 5) + 3;
  const key = Math.floor(Math.random() * 9) + 1; // Secondary key

  // Encrypt: (Char + shift) XOR key
  const encrypt = (s: string) => {
      return s.split('').map(c => String.fromCharCode((c.charCodeAt(0) + shift) ^ key)).reverse().join('');
  };
  
  // Decryptor suffix: :reverse():gsub('.', function(c) return string.char(bit32.bxor(c:byte(), key) - shift) end)
  // But bit32 might not be everywhere (though standard in Roblox).
  // Let's stick to arithmetic if possible to avoid dependencies in one-liner.
  // XOR is hard without bit32.
  // Let's stick to the shift but add a dummy operation.
  
  // New Strategy: Double shift.
  // Char + shift1, then reverse, then Char - shift2.
  
  const shift1 = Math.floor(Math.random() * 5) + 5;
  const shift2 = Math.floor(Math.random() * 3) + 1;
  
  const encrypt2 = (s: string) => {
      let r = "";
      for(let i=0; i<s.length; i++) {
          r += String.fromCharCode(s.charCodeAt(i) + shift1);
      }
      r = r.split('').reverse().join('');
      let r2 = "";
      for(let i=0; i<r.length; i++) {
          r2 += String.fromCharCode(r.charCodeAt(i) - shift2);
      }
      return r2;
  }
  
  // Decryptor in Lua:
  // str:gsub('.', function(c) return string.char(c:byte()+${shift2}) end):reverse():gsub('.', function(c) return string.char(c:byte()-${shift1}) end)
  
  const decryptor = `:gsub('.',function(c)return string.char(c:byte()+${shift2})end):reverse():gsub('.',function(c)return string.char(c:byte()-${shift1})end)`;

  if (unixTime) {
    const expiryLua = `if os.time()>${unixTime} then error("EXP") end;`;
    const encExpiry = encrypt2(expiryLua);
    const escapedExpiry = escapeLuaString(encExpiry);
    
    const encUrl = encrypt2(url);
    const escapedUrl = escapeLuaString(encUrl);
    
    const expiryBlock = `("${escapedExpiry}")${decryptor}`;
    const urlBlock = `("${escapedUrl}")${decryptor}`;
    
    return `loadstring(${expiryBlock}..game:GetService'HttpService':JSONDecode(game:HttpGet(${urlBlock})).fields.content.stringValue)()`;
  } else {
    const encUrl = encrypt2(url);
    const escapedUrl = escapeLuaString(encUrl);
    const urlBlock = `("${escapedUrl}")${decryptor}`;
    return `loadstring(game:GetService'HttpService':JSONDecode(game:HttpGet(${urlBlock})).fields.content.stringValue)()`;
  }
};
