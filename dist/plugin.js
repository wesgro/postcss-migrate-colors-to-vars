var __create = Object.create;
var __defProp = Object.defineProperty;
var __getProtoOf = Object.getPrototypeOf;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __toESM = (mod, isNodeMode, target) => {
  target = mod != null ? __create(__getProtoOf(mod)) : {};
  const to = isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target;
  for (let key of __getOwnPropNames(mod))
    if (!__hasOwnProp.call(to, key))
      __defProp(to, key, {
        get: () => mod[key],
        enumerable: true
      });
  return to;
};
var __commonJS = (cb, mod) => () => (mod || cb((mod = { exports: {} }).exports, mod), mod.exports);

// node_modules/postcss-value-parser/lib/parse.js
var require_parse = __commonJS((exports, module) => {
  var openParentheses = "(".charCodeAt(0);
  var closeParentheses = ")".charCodeAt(0);
  var singleQuote = "'".charCodeAt(0);
  var doubleQuote = '"'.charCodeAt(0);
  var backslash = "\\".charCodeAt(0);
  var slash = "/".charCodeAt(0);
  var comma = ",".charCodeAt(0);
  var colon = ":".charCodeAt(0);
  var star = "*".charCodeAt(0);
  var uLower = "u".charCodeAt(0);
  var uUpper = "U".charCodeAt(0);
  var plus = "+".charCodeAt(0);
  var isUnicodeRange = /^[a-f0-9?-]+$/i;
  module.exports = function(input) {
    var tokens = [];
    var value = input;
    var next, quote, prev, token, escape, escapePos, whitespacePos, parenthesesOpenPos;
    var pos = 0;
    var code = value.charCodeAt(pos);
    var max = value.length;
    var stack = [{ nodes: tokens }];
    var balanced = 0;
    var parent;
    var name = "";
    var before = "";
    var after = "";
    while (pos < max) {
      if (code <= 32) {
        next = pos;
        do {
          next += 1;
          code = value.charCodeAt(next);
        } while (code <= 32);
        token = value.slice(pos, next);
        prev = tokens[tokens.length - 1];
        if (code === closeParentheses && balanced) {
          after = token;
        } else if (prev && prev.type === "div") {
          prev.after = token;
          prev.sourceEndIndex += token.length;
        } else if (code === comma || code === colon || code === slash && value.charCodeAt(next + 1) !== star && (!parent || parent && parent.type === "function" && parent.value !== "calc")) {
          before = token;
        } else {
          tokens.push({
            type: "space",
            sourceIndex: pos,
            sourceEndIndex: next,
            value: token
          });
        }
        pos = next;
      } else if (code === singleQuote || code === doubleQuote) {
        next = pos;
        quote = code === singleQuote ? "'" : '"';
        token = {
          type: "string",
          sourceIndex: pos,
          quote
        };
        do {
          escape = false;
          next = value.indexOf(quote, next + 1);
          if (~next) {
            escapePos = next;
            while (value.charCodeAt(escapePos - 1) === backslash) {
              escapePos -= 1;
              escape = !escape;
            }
          } else {
            value += quote;
            next = value.length - 1;
            token.unclosed = true;
          }
        } while (escape);
        token.value = value.slice(pos + 1, next);
        token.sourceEndIndex = token.unclosed ? next : next + 1;
        tokens.push(token);
        pos = next + 1;
        code = value.charCodeAt(pos);
      } else if (code === slash && value.charCodeAt(pos + 1) === star) {
        next = value.indexOf("*/", pos);
        token = {
          type: "comment",
          sourceIndex: pos,
          sourceEndIndex: next + 2
        };
        if (next === -1) {
          token.unclosed = true;
          next = value.length;
          token.sourceEndIndex = next;
        }
        token.value = value.slice(pos + 2, next);
        tokens.push(token);
        pos = next + 2;
        code = value.charCodeAt(pos);
      } else if ((code === slash || code === star) && parent && parent.type === "function" && parent.value === "calc") {
        token = value[pos];
        tokens.push({
          type: "word",
          sourceIndex: pos - before.length,
          sourceEndIndex: pos + token.length,
          value: token
        });
        pos += 1;
        code = value.charCodeAt(pos);
      } else if (code === slash || code === comma || code === colon) {
        token = value[pos];
        tokens.push({
          type: "div",
          sourceIndex: pos - before.length,
          sourceEndIndex: pos + token.length,
          value: token,
          before,
          after: ""
        });
        before = "";
        pos += 1;
        code = value.charCodeAt(pos);
      } else if (openParentheses === code) {
        next = pos;
        do {
          next += 1;
          code = value.charCodeAt(next);
        } while (code <= 32);
        parenthesesOpenPos = pos;
        token = {
          type: "function",
          sourceIndex: pos - name.length,
          value: name,
          before: value.slice(parenthesesOpenPos + 1, next)
        };
        pos = next;
        if (name === "url" && code !== singleQuote && code !== doubleQuote) {
          next -= 1;
          do {
            escape = false;
            next = value.indexOf(")", next + 1);
            if (~next) {
              escapePos = next;
              while (value.charCodeAt(escapePos - 1) === backslash) {
                escapePos -= 1;
                escape = !escape;
              }
            } else {
              value += ")";
              next = value.length - 1;
              token.unclosed = true;
            }
          } while (escape);
          whitespacePos = next;
          do {
            whitespacePos -= 1;
            code = value.charCodeAt(whitespacePos);
          } while (code <= 32);
          if (parenthesesOpenPos < whitespacePos) {
            if (pos !== whitespacePos + 1) {
              token.nodes = [
                {
                  type: "word",
                  sourceIndex: pos,
                  sourceEndIndex: whitespacePos + 1,
                  value: value.slice(pos, whitespacePos + 1)
                }
              ];
            } else {
              token.nodes = [];
            }
            if (token.unclosed && whitespacePos + 1 !== next) {
              token.after = "";
              token.nodes.push({
                type: "space",
                sourceIndex: whitespacePos + 1,
                sourceEndIndex: next,
                value: value.slice(whitespacePos + 1, next)
              });
            } else {
              token.after = value.slice(whitespacePos + 1, next);
              token.sourceEndIndex = next;
            }
          } else {
            token.after = "";
            token.nodes = [];
          }
          pos = next + 1;
          token.sourceEndIndex = token.unclosed ? next : pos;
          code = value.charCodeAt(pos);
          tokens.push(token);
        } else {
          balanced += 1;
          token.after = "";
          token.sourceEndIndex = pos + 1;
          tokens.push(token);
          stack.push(token);
          tokens = token.nodes = [];
          parent = token;
        }
        name = "";
      } else if (closeParentheses === code && balanced) {
        pos += 1;
        code = value.charCodeAt(pos);
        parent.after = after;
        parent.sourceEndIndex += after.length;
        after = "";
        balanced -= 1;
        stack[stack.length - 1].sourceEndIndex = pos;
        stack.pop();
        parent = stack[balanced];
        tokens = parent.nodes;
      } else {
        next = pos;
        do {
          if (code === backslash) {
            next += 1;
          }
          next += 1;
          code = value.charCodeAt(next);
        } while (next < max && !(code <= 32 || code === singleQuote || code === doubleQuote || code === comma || code === colon || code === slash || code === openParentheses || code === star && parent && parent.type === "function" && parent.value === "calc" || code === slash && parent.type === "function" && parent.value === "calc" || code === closeParentheses && balanced));
        token = value.slice(pos, next);
        if (openParentheses === code) {
          name = token;
        } else if ((uLower === token.charCodeAt(0) || uUpper === token.charCodeAt(0)) && plus === token.charCodeAt(1) && isUnicodeRange.test(token.slice(2))) {
          tokens.push({
            type: "unicode-range",
            sourceIndex: pos,
            sourceEndIndex: next,
            value: token
          });
        } else {
          tokens.push({
            type: "word",
            sourceIndex: pos,
            sourceEndIndex: next,
            value: token
          });
        }
        pos = next;
      }
    }
    for (pos = stack.length - 1;pos; pos -= 1) {
      stack[pos].unclosed = true;
      stack[pos].sourceEndIndex = value.length;
    }
    return stack[0].nodes;
  };
});

// node_modules/postcss-value-parser/lib/walk.js
var require_walk = __commonJS((exports, module) => {
  module.exports = function walk(nodes, cb, bubble) {
    var i, max, node, result;
    for (i = 0, max = nodes.length;i < max; i += 1) {
      node = nodes[i];
      if (!bubble) {
        result = cb(node, i, nodes);
      }
      if (result !== false && node.type === "function" && Array.isArray(node.nodes)) {
        walk(node.nodes, cb, bubble);
      }
      if (bubble) {
        cb(node, i, nodes);
      }
    }
  };
});

// node_modules/postcss-value-parser/lib/stringify.js
var require_stringify = __commonJS((exports, module) => {
  var stringifyNode = function(node, custom) {
    var type = node.type;
    var value = node.value;
    var buf;
    var customResult;
    if (custom && (customResult = custom(node)) !== undefined) {
      return customResult;
    } else if (type === "word" || type === "space") {
      return value;
    } else if (type === "string") {
      buf = node.quote || "";
      return buf + value + (node.unclosed ? "" : buf);
    } else if (type === "comment") {
      return "/*" + value + (node.unclosed ? "" : "*/");
    } else if (type === "div") {
      return (node.before || "") + value + (node.after || "");
    } else if (Array.isArray(node.nodes)) {
      buf = stringify(node.nodes, custom);
      if (type !== "function") {
        return buf;
      }
      return value + "(" + (node.before || "") + buf + (node.after || "") + (node.unclosed ? "" : ")");
    }
    return value;
  };
  var stringify = function(nodes, custom) {
    var result, i;
    if (Array.isArray(nodes)) {
      result = "";
      for (i = nodes.length - 1;~i; i -= 1) {
        result = stringifyNode(nodes[i], custom) + result;
      }
      return result;
    }
    return stringifyNode(nodes, custom);
  };
  module.exports = stringify;
});

// node_modules/postcss-value-parser/lib/unit.js
var require_unit = __commonJS((exports, module) => {
  var likeNumber = function(value) {
    var code = value.charCodeAt(0);
    var nextCode;
    if (code === plus || code === minus) {
      nextCode = value.charCodeAt(1);
      if (nextCode >= 48 && nextCode <= 57) {
        return true;
      }
      var nextNextCode = value.charCodeAt(2);
      if (nextCode === dot && nextNextCode >= 48 && nextNextCode <= 57) {
        return true;
      }
      return false;
    }
    if (code === dot) {
      nextCode = value.charCodeAt(1);
      if (nextCode >= 48 && nextCode <= 57) {
        return true;
      }
      return false;
    }
    if (code >= 48 && code <= 57) {
      return true;
    }
    return false;
  };
  var minus = "-".charCodeAt(0);
  var plus = "+".charCodeAt(0);
  var dot = ".".charCodeAt(0);
  var exp = "e".charCodeAt(0);
  var EXP = "E".charCodeAt(0);
  module.exports = function(value) {
    var pos = 0;
    var length = value.length;
    var code;
    var nextCode;
    var nextNextCode;
    if (length === 0 || !likeNumber(value)) {
      return false;
    }
    code = value.charCodeAt(pos);
    if (code === plus || code === minus) {
      pos++;
    }
    while (pos < length) {
      code = value.charCodeAt(pos);
      if (code < 48 || code > 57) {
        break;
      }
      pos += 1;
    }
    code = value.charCodeAt(pos);
    nextCode = value.charCodeAt(pos + 1);
    if (code === dot && nextCode >= 48 && nextCode <= 57) {
      pos += 2;
      while (pos < length) {
        code = value.charCodeAt(pos);
        if (code < 48 || code > 57) {
          break;
        }
        pos += 1;
      }
    }
    code = value.charCodeAt(pos);
    nextCode = value.charCodeAt(pos + 1);
    nextNextCode = value.charCodeAt(pos + 2);
    if ((code === exp || code === EXP) && (nextCode >= 48 && nextCode <= 57 || (nextCode === plus || nextCode === minus) && nextNextCode >= 48 && nextNextCode <= 57)) {
      pos += nextCode === plus || nextCode === minus ? 3 : 2;
      while (pos < length) {
        code = value.charCodeAt(pos);
        if (code < 48 || code > 57) {
          break;
        }
        pos += 1;
      }
    }
    return {
      number: value.slice(0, pos),
      unit: value.slice(pos)
    };
  };
});

// node_modules/postcss-value-parser/lib/index.js
var require_lib = __commonJS((exports, module) => {
  var ValueParser = function(value) {
    if (this instanceof ValueParser) {
      this.nodes = parse(value);
      return this;
    }
    return new ValueParser(value);
  };
  var parse = require_parse();
  var walk = require_walk();
  var stringify = require_stringify();
  ValueParser.prototype.toString = function() {
    return Array.isArray(this.nodes) ? stringify(this.nodes) : "";
  };
  ValueParser.prototype.walk = function(cb, bubble) {
    walk(this.nodes, cb, bubble);
    return this;
  };
  ValueParser.unit = require_unit();
  ValueParser.walk = walk;
  ValueParser.stringify = stringify;
  module.exports = ValueParser;
});

// src/plugin.ts
var import_postcss_value_parser = __toESM(require_lib(), 1);

// node_modules/colord/index.mjs
var r = { grad: 0.9, turn: 360, rad: 360 / (2 * Math.PI) };
var t = function(r2) {
  return typeof r2 == "string" ? r2.length > 0 : typeof r2 == "number";
};
var n = function(r2, t2, n2) {
  return t2 === undefined && (t2 = 0), n2 === undefined && (n2 = Math.pow(10, t2)), Math.round(n2 * r2) / n2 + 0;
};
var e = function(r2, t2, n2) {
  return t2 === undefined && (t2 = 0), n2 === undefined && (n2 = 1), r2 > n2 ? n2 : r2 > t2 ? r2 : t2;
};
var u = function(r2) {
  return (r2 = isFinite(r2) ? r2 % 360 : 0) > 0 ? r2 : r2 + 360;
};
var a = function(r2) {
  return { r: e(r2.r, 0, 255), g: e(r2.g, 0, 255), b: e(r2.b, 0, 255), a: e(r2.a) };
};
var o = function(r2) {
  return { r: n(r2.r), g: n(r2.g), b: n(r2.b), a: n(r2.a, 3) };
};
var i = /^#([0-9a-f]{3,8})$/i;
var s = function(r2) {
  var t2 = r2.toString(16);
  return t2.length < 2 ? "0" + t2 : t2;
};
var h = function(r2) {
  var { r: t2, g: n2, b: e2, a: u2 } = r2, a2 = Math.max(t2, n2, e2), o2 = a2 - Math.min(t2, n2, e2), i2 = o2 ? a2 === t2 ? (n2 - e2) / o2 : a2 === n2 ? 2 + (e2 - t2) / o2 : 4 + (t2 - n2) / o2 : 0;
  return { h: 60 * (i2 < 0 ? i2 + 6 : i2), s: a2 ? o2 / a2 * 100 : 0, v: a2 / 255 * 100, a: u2 };
};
var b = function(r2) {
  var { h: t2, s: n2, v: e2, a: u2 } = r2;
  t2 = t2 / 360 * 6, n2 /= 100, e2 /= 100;
  var a2 = Math.floor(t2), o2 = e2 * (1 - n2), i2 = e2 * (1 - (t2 - a2) * n2), s2 = e2 * (1 - (1 - t2 + a2) * n2), h2 = a2 % 6;
  return { r: 255 * [e2, i2, o2, o2, s2, e2][h2], g: 255 * [s2, e2, e2, i2, o2, o2][h2], b: 255 * [o2, o2, s2, e2, e2, i2][h2], a: u2 };
};
var g = function(r2) {
  return { h: u(r2.h), s: e(r2.s, 0, 100), l: e(r2.l, 0, 100), a: e(r2.a) };
};
var d = function(r2) {
  return { h: n(r2.h), s: n(r2.s), l: n(r2.l), a: n(r2.a, 3) };
};
var f = function(r2) {
  return b((n2 = (t2 = r2).s, { h: t2.h, s: (n2 *= ((e2 = t2.l) < 50 ? e2 : 100 - e2) / 100) > 0 ? 2 * n2 / (e2 + n2) * 100 : 0, v: e2 + n2, a: t2.a }));
  var t2, n2, e2;
};
var c = function(r2) {
  return { h: (t2 = h(r2)).h, s: (u2 = (200 - (n2 = t2.s)) * (e2 = t2.v) / 100) > 0 && u2 < 200 ? n2 * e2 / 100 / (u2 <= 100 ? u2 : 200 - u2) * 100 : 0, l: u2 / 2, a: t2.a };
  var t2, n2, e2, u2;
};
var l = /^hsla?\(\s*([+-]?\d*\.?\d+)(deg|rad|grad|turn)?\s*,\s*([+-]?\d*\.?\d+)%\s*,\s*([+-]?\d*\.?\d+)%\s*(?:,\s*([+-]?\d*\.?\d+)(%)?\s*)?\)$/i;
var p = /^hsla?\(\s*([+-]?\d*\.?\d+)(deg|rad|grad|turn)?\s+([+-]?\d*\.?\d+)%\s+([+-]?\d*\.?\d+)%\s*(?:\/\s*([+-]?\d*\.?\d+)(%)?\s*)?\)$/i;
var v = /^rgba?\(\s*([+-]?\d*\.?\d+)(%)?\s*,\s*([+-]?\d*\.?\d+)(%)?\s*,\s*([+-]?\d*\.?\d+)(%)?\s*(?:,\s*([+-]?\d*\.?\d+)(%)?\s*)?\)$/i;
var m = /^rgba?\(\s*([+-]?\d*\.?\d+)(%)?\s+([+-]?\d*\.?\d+)(%)?\s+([+-]?\d*\.?\d+)(%)?\s*(?:\/\s*([+-]?\d*\.?\d+)(%)?\s*)?\)$/i;
var y = { string: [[function(r2) {
  var t2 = i.exec(r2);
  return t2 ? (r2 = t2[1]).length <= 4 ? { r: parseInt(r2[0] + r2[0], 16), g: parseInt(r2[1] + r2[1], 16), b: parseInt(r2[2] + r2[2], 16), a: r2.length === 4 ? n(parseInt(r2[3] + r2[3], 16) / 255, 2) : 1 } : r2.length === 6 || r2.length === 8 ? { r: parseInt(r2.substr(0, 2), 16), g: parseInt(r2.substr(2, 2), 16), b: parseInt(r2.substr(4, 2), 16), a: r2.length === 8 ? n(parseInt(r2.substr(6, 2), 16) / 255, 2) : 1 } : null : null;
}, "hex"], [function(r2) {
  var t2 = v.exec(r2) || m.exec(r2);
  return t2 ? t2[2] !== t2[4] || t2[4] !== t2[6] ? null : a({ r: Number(t2[1]) / (t2[2] ? 100 / 255 : 1), g: Number(t2[3]) / (t2[4] ? 100 / 255 : 1), b: Number(t2[5]) / (t2[6] ? 100 / 255 : 1), a: t2[7] === undefined ? 1 : Number(t2[7]) / (t2[8] ? 100 : 1) }) : null;
}, "rgb"], [function(t2) {
  var n2 = l.exec(t2) || p.exec(t2);
  if (!n2)
    return null;
  var e2, u2, a2 = g({ h: (e2 = n2[1], u2 = n2[2], u2 === undefined && (u2 = "deg"), Number(e2) * (r[u2] || 1)), s: Number(n2[3]), l: Number(n2[4]), a: n2[5] === undefined ? 1 : Number(n2[5]) / (n2[6] ? 100 : 1) });
  return f(a2);
}, "hsl"]], object: [[function(r2) {
  var { r: n2, g: e2, b: u2, a: o2 } = r2, i2 = o2 === undefined ? 1 : o2;
  return t(n2) && t(e2) && t(u2) ? a({ r: Number(n2), g: Number(e2), b: Number(u2), a: Number(i2) }) : null;
}, "rgb"], [function(r2) {
  var { h: n2, s: e2, l: u2, a: a2 } = r2, o2 = a2 === undefined ? 1 : a2;
  if (!t(n2) || !t(e2) || !t(u2))
    return null;
  var i2 = g({ h: Number(n2), s: Number(e2), l: Number(u2), a: Number(o2) });
  return f(i2);
}, "hsl"], [function(r2) {
  var { h: n2, s: a2, v: o2, a: i2 } = r2, s2 = i2 === undefined ? 1 : i2;
  if (!t(n2) || !t(a2) || !t(o2))
    return null;
  var h2 = function(r3) {
    return { h: u(r3.h), s: e(r3.s, 0, 100), v: e(r3.v, 0, 100), a: e(r3.a) };
  }({ h: Number(n2), s: Number(a2), v: Number(o2), a: Number(s2) });
  return b(h2);
}, "hsv"]] };
var N = function(r2, t2) {
  for (var n2 = 0;n2 < t2.length; n2++) {
    var e2 = t2[n2][0](r2);
    if (e2)
      return [e2, t2[n2][1]];
  }
  return [null, undefined];
};
var x = function(r2) {
  return typeof r2 == "string" ? N(r2.trim(), y.string) : typeof r2 == "object" && r2 !== null ? N(r2, y.object) : [null, undefined];
};
var M = function(r2, t2) {
  var n2 = c(r2);
  return { h: n2.h, s: e(n2.s + 100 * t2, 0, 100), l: n2.l, a: n2.a };
};
var H = function(r2) {
  return (299 * r2.r + 587 * r2.g + 114 * r2.b) / 1000 / 255;
};
var $ = function(r2, t2) {
  var n2 = c(r2);
  return { h: n2.h, s: n2.s, l: e(n2.l + 100 * t2, 0, 100), a: n2.a };
};
var j = function() {
  function r2(r3) {
    this.parsed = x(r3)[0], this.rgba = this.parsed || { r: 0, g: 0, b: 0, a: 1 };
  }
  return r2.prototype.isValid = function() {
    return this.parsed !== null;
  }, r2.prototype.brightness = function() {
    return n(H(this.rgba), 2);
  }, r2.prototype.isDark = function() {
    return H(this.rgba) < 0.5;
  }, r2.prototype.isLight = function() {
    return H(this.rgba) >= 0.5;
  }, r2.prototype.toHex = function() {
    return r3 = o(this.rgba), t2 = r3.r, e2 = r3.g, u2 = r3.b, i2 = (a2 = r3.a) < 1 ? s(n(255 * a2)) : "", "#" + s(t2) + s(e2) + s(u2) + i2;
    var r3, t2, e2, u2, a2, i2;
  }, r2.prototype.toRgb = function() {
    return o(this.rgba);
  }, r2.prototype.toRgbString = function() {
    return r3 = o(this.rgba), t2 = r3.r, n2 = r3.g, e2 = r3.b, (u2 = r3.a) < 1 ? "rgba(" + t2 + ", " + n2 + ", " + e2 + ", " + u2 + ")" : "rgb(" + t2 + ", " + n2 + ", " + e2 + ")";
    var r3, t2, n2, e2, u2;
  }, r2.prototype.toHsl = function() {
    return d(c(this.rgba));
  }, r2.prototype.toHslString = function() {
    return r3 = d(c(this.rgba)), t2 = r3.h, n2 = r3.s, e2 = r3.l, (u2 = r3.a) < 1 ? "hsla(" + t2 + ", " + n2 + "%, " + e2 + "%, " + u2 + ")" : "hsl(" + t2 + ", " + n2 + "%, " + e2 + "%)";
    var r3, t2, n2, e2, u2;
  }, r2.prototype.toHsv = function() {
    return r3 = h(this.rgba), { h: n(r3.h), s: n(r3.s), v: n(r3.v), a: n(r3.a, 3) };
    var r3;
  }, r2.prototype.invert = function() {
    return w({ r: 255 - (r3 = this.rgba).r, g: 255 - r3.g, b: 255 - r3.b, a: r3.a });
    var r3;
  }, r2.prototype.saturate = function(r3) {
    return r3 === undefined && (r3 = 0.1), w(M(this.rgba, r3));
  }, r2.prototype.desaturate = function(r3) {
    return r3 === undefined && (r3 = 0.1), w(M(this.rgba, -r3));
  }, r2.prototype.grayscale = function() {
    return w(M(this.rgba, -1));
  }, r2.prototype.lighten = function(r3) {
    return r3 === undefined && (r3 = 0.1), w($(this.rgba, r3));
  }, r2.prototype.darken = function(r3) {
    return r3 === undefined && (r3 = 0.1), w($(this.rgba, -r3));
  }, r2.prototype.rotate = function(r3) {
    return r3 === undefined && (r3 = 15), this.hue(this.hue() + r3);
  }, r2.prototype.alpha = function(r3) {
    return typeof r3 == "number" ? w({ r: (t2 = this.rgba).r, g: t2.g, b: t2.b, a: r3 }) : n(this.rgba.a, 3);
    var t2;
  }, r2.prototype.hue = function(r3) {
    var t2 = c(this.rgba);
    return typeof r3 == "number" ? w({ h: r3, s: t2.s, l: t2.l, a: t2.a }) : n(t2.h);
  }, r2.prototype.isEqual = function(r3) {
    return this.toHex() === w(r3).toHex();
  }, r2;
}();
var w = function(r2) {
  return r2 instanceof j ? r2 : new j(r2);
};
var S = [];
var k = function(r2) {
  r2.forEach(function(r3) {
    S.indexOf(r3) < 0 && (r3(j, y), S.push(r3));
  });
};

// node_modules/colord/plugins/lab.mjs
var a2 = function(a3) {
  return typeof a3 == "string" ? a3.length > 0 : typeof a3 == "number";
};
var t2 = function(a3, t3, o2) {
  return t3 === undefined && (t3 = 0), o2 === undefined && (o2 = Math.pow(10, t3)), Math.round(o2 * a3) / o2 + 0;
};
var o2 = function(a3, t3, o3) {
  return t3 === undefined && (t3 = 0), o3 === undefined && (o3 = 1), a3 > o3 ? o3 : a3 > t3 ? a3 : t3;
};
var r2 = function(a3) {
  var t3 = a3 / 255;
  return t3 < 0.04045 ? t3 / 12.92 : Math.pow((t3 + 0.055) / 1.055, 2.4);
};
var h2 = function(a3) {
  return 255 * (a3 > 0.0031308 ? 1.055 * Math.pow(a3, 1 / 2.4) - 0.055 : 12.92 * a3);
};
var n2 = 96.422;
var p2 = 100;
var M2 = 82.521;
var u2 = function(a3) {
  var t3, r3, n3 = { x: 0.9555766 * (t3 = a3).x + -0.0230393 * t3.y + 0.0631636 * t3.z, y: -0.0282895 * t3.x + 1.0099416 * t3.y + 0.0210077 * t3.z, z: 0.0122982 * t3.x + -0.020483 * t3.y + 1.3299098 * t3.z };
  return r3 = { r: h2(0.032404542 * n3.x - 0.015371385 * n3.y - 0.004985314 * n3.z), g: h2(-0.00969266 * n3.x + 0.018760108 * n3.y + 0.00041556 * n3.z), b: h2(0.000556434 * n3.x - 0.002040259 * n3.y + 0.010572252 * n3.z), a: a3.a }, { r: o2(r3.r, 0, 255), g: o2(r3.g, 0, 255), b: o2(r3.b, 0, 255), a: o2(r3.a) };
};
var e2 = function(a3) {
  var t3 = r2(a3.r), h3 = r2(a3.g), u3 = r2(a3.b);
  return function(a4) {
    return { x: o2(a4.x, 0, n2), y: o2(a4.y, 0, p2), z: o2(a4.z, 0, M2), a: o2(a4.a) };
  }(function(a4) {
    return { x: 1.0478112 * a4.x + 0.0228866 * a4.y + -0.050127 * a4.z, y: 0.0295424 * a4.x + 0.9904844 * a4.y + -0.0170491 * a4.z, z: -0.0092345 * a4.x + 0.0150436 * a4.y + 0.7521316 * a4.z, a: a4.a };
  }({ x: 100 * (0.4124564 * t3 + 0.3575761 * h3 + 0.1804375 * u3), y: 100 * (0.2126729 * t3 + 0.7151522 * h3 + 0.072175 * u3), z: 100 * (0.0193339 * t3 + 0.119192 * h3 + 0.9503041 * u3), a: a3.a }));
};
var w2 = 216 / 24389;
var b2 = 24389 / 27;
var i2 = function(t3) {
  var { l: r3, a: h3, b: n3, alpha: p3 } = t3, M3 = p3 === undefined ? 1 : p3;
  if (!a2(r3) || !a2(h3) || !a2(n3))
    return null;
  var u3 = function(a3) {
    return { l: o2(a3.l, 0, 400), a: a3.a, b: a3.b, alpha: o2(a3.alpha) };
  }({ l: Number(r3), a: Number(h3), b: Number(n3), alpha: Number(M3) });
  return l2(u3);
};
var l2 = function(a3) {
  var t3 = (a3.l + 16) / 116, o3 = a3.a / 500 + t3, r3 = t3 - a3.b / 200;
  return u2({ x: (Math.pow(o3, 3) > w2 ? Math.pow(o3, 3) : (116 * o3 - 16) / b2) * n2, y: (a3.l > 8 ? Math.pow((a3.l + 16) / 116, 3) : a3.l / b2) * p2, z: (Math.pow(r3, 3) > w2 ? Math.pow(r3, 3) : (116 * r3 - 16) / b2) * M2, a: a3.alpha });
};
function lab_default(a3, r3) {
  a3.prototype.toLab = function() {
    return o3 = e2(this.rgba), h3 = o3.y / p2, u3 = o3.z / M2, r4 = (r4 = o3.x / n2) > w2 ? Math.cbrt(r4) : (b2 * r4 + 16) / 116, a4 = { l: 116 * (h3 = h3 > w2 ? Math.cbrt(h3) : (b2 * h3 + 16) / 116) - 16, a: 500 * (r4 - h3), b: 200 * (h3 - (u3 = u3 > w2 ? Math.cbrt(u3) : (b2 * u3 + 16) / 116)), alpha: o3.a }, { l: t2(a4.l, 2), a: t2(a4.a, 2), b: t2(a4.b, 2), alpha: t2(a4.alpha, 3) };
    var a4, o3, r4, h3, u3;
  }, a3.prototype.delta = function(r4) {
    r4 === undefined && (r4 = "#FFF");
    var h3 = r4 instanceof a3 ? r4 : new a3(r4), n3 = function(a4, t3) {
      var { l: o3, a: r5, b: h4 } = a4, n4 = t3.l, p3 = t3.a, M3 = t3.b, u3 = 180 / Math.PI, e3 = Math.PI / 180, w3 = Math.pow(Math.pow(r5, 2) + Math.pow(h4, 2), 0.5), b3 = Math.pow(Math.pow(p3, 2) + Math.pow(M3, 2), 0.5), i3 = (o3 + n4) / 2, l3 = Math.pow((w3 + b3) / 2, 7), c2 = 0.5 * (1 - Math.pow(l3 / (l3 + Math.pow(25, 7)), 0.5)), f2 = r5 * (1 + c2), y2 = p3 * (1 + c2), v2 = Math.pow(Math.pow(f2, 2) + Math.pow(h4, 2), 0.5), x2 = Math.pow(Math.pow(y2, 2) + Math.pow(M3, 2), 0.5), z = (v2 + x2) / 2, s2 = f2 === 0 && h4 === 0 ? 0 : Math.atan2(h4, f2) * u3, d2 = y2 === 0 && M3 === 0 ? 0 : Math.atan2(M3, y2) * u3;
      s2 < 0 && (s2 += 360), d2 < 0 && (d2 += 360);
      var g2 = d2 - s2, m2 = Math.abs(d2 - s2);
      m2 > 180 && d2 <= s2 ? g2 += 360 : m2 > 180 && d2 > s2 && (g2 -= 360);
      var N2 = s2 + d2;
      m2 <= 180 ? N2 /= 2 : N2 = (s2 + d2 < 360 ? N2 + 360 : N2 - 360) / 2;
      var F = 1 - 0.17 * Math.cos(e3 * (N2 - 30)) + 0.24 * Math.cos(2 * e3 * N2) + 0.32 * Math.cos(e3 * (3 * N2 + 6)) - 0.2 * Math.cos(e3 * (4 * N2 - 63)), L = n4 - o3, I = x2 - v2, P = 2 * Math.sin(e3 * g2 / 2) * Math.pow(v2 * x2, 0.5), j2 = 1 + 0.015 * Math.pow(i3 - 50, 2) / Math.pow(20 + Math.pow(i3 - 50, 2), 0.5), k2 = 1 + 0.045 * z, q = 1 + 0.015 * z * F, A = 30 * Math.exp(-1 * Math.pow((N2 - 275) / 25, 2)), B = -2 * Math.pow(l3 / (l3 + Math.pow(25, 7)), 0.5) * Math.sin(2 * e3 * A);
      return Math.pow(Math.pow(L / 1 / j2, 2) + Math.pow(I / 1 / k2, 2) + Math.pow(P / 1 / q, 2) + B * I * P / (1 * k2 * 1 * q), 0.5);
    }(this.toLab(), h3.toLab()) / 100;
    return o2(t2(n3, 3));
  }, r3.object.push([i2, "lab"]);
}

// src/findClosestColor.ts
var convertToClosestColor = function(input, options) {
  const instance = w(input);
  if (!instance.isValid()) {
    return input;
  }
  const cssVar = closestColor(instance, options.replacementColors, options?.maxDelta);
  return cssVar ? `var(${cssVar}, ${input})` : input;
};
k([lab_default]);
var closestColor = (targetColor, colors, maxDelta = 1) => {
  let closestCssVar = null;
  let closestDelta = 1;
  let cssVar;
  for (cssVar in colors) {
    if (colors.hasOwnProperty(cssVar)) {
      const hex = colors[cssVar];
      const delta = w(targetColor).delta(hex);
      if (delta <= maxDelta && (closestCssVar === null || delta < closestDelta)) {
        closestCssVar = cssVar;
        closestDelta = delta;
      }
      if (delta === 0) {
        return cssVar;
      }
    }
  }
  return closestCssVar;
};

// src/plugin.ts
var walk = function(parent, callback) {
  parent.nodes.forEach((node, index) => {
    const bubble = callback(node, index, parent);
    if (node.type === "function" && bubble !== false) {
      walk(node, callback);
    }
  });
};
var isMathFunctionNode = function(node) {
  if (node.type !== "function") {
    return false;
  }
  return mathFunctions.has(node.value.toLowerCase());
};
var transform = function(value, options) {
  const parsed = import_postcss_value_parser.default(value);
  walk(parsed, (node, index, parent) => {
    if (options?.ignoreRule && options.ignoreRule(node, index, parent)) {
      return false;
    } else if (node.type === "function") {
      if (/^(rgb|hsl)a?$/i.test(node.value)) {
        node.value = convertToClosestColor(import_postcss_value_parser.default.stringify(node), options);
      } else if (isMathFunctionNode(node)) {
        return false;
      }
    } else if (node.type === "word") {
      node.value = convertToClosestColor(node.value, options);
    }
  });
  return parsed.toString();
};
var mathFunctions = new Set(["calc", "min", "max", "clamp"]);
var plugin = (config) => {
  if (!config || !config.replacementColors) {
    throw new Error("pass a config with replacementColors");
  }
  return {
    postcssPlugin: "color-migrate",
    prepare() {
      const cache = new Map;
      return {
        OnceExit(css) {
          css.walkDecls((decl) => {
            if (/^(composes|font|src$|filter|-webkit-tap-highlight-color)/i.test(decl.prop)) {
              return;
            }
            const value = decl.value;
            if (!value) {
              return;
            }
            const cacheKey = JSON.stringify({
              value,
              config: { maxDelta: config.maxDelta }
            });
            if (cache.has(cacheKey)) {
              decl.value = cache.get(cacheKey);
              return;
            }
            const newValue = transform(value, config);
            decl.value = newValue;
            cache.set(cacheKey, newValue);
          });
        }
      };
    }
  };
};
plugin.postcss = true;
var plugin_default = plugin;
export {
  plugin_default as default
};
