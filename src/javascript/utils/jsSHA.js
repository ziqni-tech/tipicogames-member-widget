/**
 * Simple SHA encoding
 *  - left to support IE11 implementation
 */
try {
  !function (n) {
    function e(n, e, t) {
      var f = 0, b = [0], c = "", s = null;
      if ("UTF8" !== (c = t || "UTF8") && "UTF16" !== c) throw"encoding must be UTF8 or UTF16";
      if ("HEX" === e) {
        if (0 != n.length % 2) throw"srcString of HEX type must be in byte increments";
        s = a(n), f = s.binLen, b = s.value
      } else if ("ASCII" === e || "TEXT" === e) s = r(n, c), f = s.binLen, b = s.value; else {
        if ("B64" !== e) throw"inputFormat must be HEX, TEXT, ASCII, or B64";
        s = o(n), f = s.binLen, b = s.value
      }
      this.getHash = function (n, e, t, r) {
        var a, o = null, c = b.slice(), s = f;
        if (3 === arguments.length ? "number" != typeof t && (r = t, t = 1) : 2 === arguments.length && (t = 1), t !== parseInt(t, 10) || 1 > t) throw"numRounds must a integer >= 1";
        switch (e) {
          case"HEX":
            o = w;
            break;
          case"B64":
            o = i;
            break;
          default:
            throw"format must be HEX or B64"
        }
        if ("SHA-1" === n) for (a = 0; a < t; a++) c = L(c, s), s = 160; else if ("SHA-224" === n) for (a = 0; a < t; a++) c = P(c, s, n), s = 224; else if ("SHA-256" === n) for (a = 0; a < t; a++) c = P(c, s, n), s = 256; else if ("SHA-384" === n) for (a = 0; a < t; a++) c = P(c, s, n), s = 384; else {
          if ("SHA-512" !== n) throw"Chosen SHA variant is not supported";
          for (a = 0; a < t; a++) c = P(c, s, n), s = 512
        }
        return o(c, u(r))
      }, this.getHMAC = function (n, e, t, s, l) {
        var p, h, H, d, v = [], A = [];
        switch (p = null, s) {
          case"HEX":
            s = w;
            break;
          case"B64":
            s = i;
            break;
          default:
            throw"outputFormat must be HEX or B64"
        }
        if ("SHA-1" === t) h = 64, d = 160; else if ("SHA-224" === t) h = 64, d = 224; else if ("SHA-256" === t) h = 64, d = 256; else if ("SHA-384" === t) h = 128, d = 384; else {
          if ("SHA-512" !== t) throw"Chosen SHA variant is not supported";
          h = 128, d = 512
        }
        if ("HEX" === e) H = (p = a(n)).binLen, p = p.value; else if ("ASCII" === e || "TEXT" === e) H = (p = r(n, c)).binLen, p = p.value; else {
          if ("B64" !== e) throw"inputFormat must be HEX, TEXT, ASCII, or B64";
          H = (p = o(n)).binLen, p = p.value
        }
        for (n = 8 * h, e = h / 4 - 1, h < H / 8 ? (p = "SHA-1" === t ? L(p, H) : P(p, H, t))[e] &= 4294967040 : h > H / 8 && (p[e] &= 4294967040), h = 0; h <= e; h += 1) v[h] = 909522486 ^ p[h], A[h] = 1549556828 ^ p[h];
        return s(t = "SHA-1" === t ? L(A.concat(L(v.concat(b), n + f)), n + d) : P(A.concat(P(v.concat(b), n + f, t)), n + d, t), u(l))
      }
    }

    function t(n, e) {
      this.a = n, this.b = e
    }

    function r(n, e) {
      var t, r, a = [], o = [], w = 0;
      if ("UTF8" === e) for (r = 0; r < n.length; r += 1) for (o = [], 2048 < (t = n.charCodeAt(r)) ? (o[0] = 224 | (61440 & t) >>> 12, o[1] = 128 | (4032 & t) >>> 6, o[2] = 128 | 63 & t) : 128 < t ? (o[0] = 192 | (1984 & t) >>> 6, o[1] = 128 | 63 & t) : o[0] = t, t = 0; t < o.length; t += 1) a[w >>> 2] |= o[t] << 24 - w % 4 * 8, w += 1; else if ("UTF16" === e) for (r = 0; r < n.length; r += 1) a[w >>> 2] |= n.charCodeAt(r) << 16 - w % 4 * 8, w += 2;
      return {value: a, binLen: 8 * w}
    }

    function a(n) {
      var e, t, r = [], a = n.length;
      if (0 != a % 2) throw"String of HEX type must be in byte increments";
      for (e = 0; e < a; e += 2) {
        if (t = parseInt(n.substr(e, 2), 16), isNaN(t)) throw"String of HEX type contains invalid characters";
        r[e >>> 3] |= t << 24 - e % 8 * 4
      }
      return {value: r, binLen: 4 * a}
    }

    function o(n) {
      var e, t, r, a, o, w = [], i = 0;
      if (-1 === n.search(/^[a-zA-Z0-9=+\/]+$/)) throw"Invalid character in base-64 string";
      if (e = n.indexOf("="), n = n.replace(/\=/g, ""), -1 !== e && e < n.length) throw"Invalid '=' found in base-64 string";
      for (t = 0; t < n.length; t += 4) {
        for (o = n.substr(t, 4), r = a = 0; r < o.length; r += 1) a |= (e = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".indexOf(o[r])) << 18 - 6 * r;
        for (r = 0; r < o.length - 1; r += 1) w[i >> 2] |= (a >>> 16 - 8 * r & 255) << 24 - i % 4 * 8, i += 1
      }
      return {value: w, binLen: 8 * i}
    }

    function w(n, e) {
      var t, r, a = "", o = 4 * n.length;
      for (t = 0; t < o; t += 1) r = n[t >>> 2] >>> 8 * (3 - t % 4), a += "0123456789abcdef".charAt(r >>> 4 & 15) + "0123456789abcdef".charAt(15 & r);
      return e.outputUpper ? a.toUpperCase() : a
    }

    function i(n, e) {
      var t, r, a, o = "", w = 4 * n.length;
      for (t = 0; t < w; t += 3) for (a = (n[t >>> 2] >>> 8 * (3 - t % 4) & 255) << 16 | (n[t + 1 >>> 2] >>> 8 * (3 - (t + 1) % 4) & 255) << 8 | n[t + 2 >>> 2] >>> 8 * (3 - (t + 2) % 4) & 255, r = 0; 4 > r; r += 1) o = 8 * t + 6 * r <= 32 * n.length ? o + "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".charAt(a >>> 6 * (3 - r) & 63) : o + e.b64Pad;
      return o
    }

    function u(n) {
      var e = {outputUpper: !1, b64Pad: "="};
      try {
        n.hasOwnProperty("outputUpper") && (e.outputUpper = n.outputUpper), n.hasOwnProperty("b64Pad") && (e.b64Pad = n.b64Pad)
      } catch (n) {
      }
      if ("boolean" != typeof e.outputUpper) throw"Invalid outputUpper formatting option";
      if ("string" != typeof e.b64Pad) throw"Invalid b64Pad formatting option";
      return e
    }

    function f(n, e) {
      return n << e | n >>> 32 - e
    }

    function b(n, e) {
      return n >>> e | n << 32 - e
    }

    function c(n, e) {
      var r = null;
      r = new t(n.a, n.b);
      return 32 >= e ? new t(r.a >>> e | r.b << 32 - e & 4294967295, r.b >>> e | r.a << 32 - e & 4294967295) : new t(r.b >>> e - 32 | r.a << 64 - e & 4294967295, r.a >>> e - 32 | r.b << 64 - e & 4294967295)
    }

    function s(n, e) {
      return 32 >= e ? new t(n.a >>> e, n.b >>> e | n.a << 32 - e & 4294967295) : new t(0, n.a >>> e - 32)
    }

    function l(n, e, t) {
      return n ^ e ^ t
    }

    function p(n, e, t) {
      return n & e ^ ~n & t
    }

    function h(n, e, r) {
      return new t(n.a & e.a ^ ~n.a & r.a, n.b & e.b ^ ~n.b & r.b)
    }

    function H(n, e, t) {
      return n & e ^ n & t ^ e & t
    }

    function d(n, e, r) {
      return new t(n.a & e.a ^ n.a & r.a ^ e.a & r.a, n.b & e.b ^ n.b & r.b ^ e.b & r.b)
    }

    function v(n) {
      return b(n, 2) ^ b(n, 13) ^ b(n, 22)
    }

    function A(n) {
      var e = c(n, 28), r = c(n, 34);
      return n = c(n, 39), new t(e.a ^ r.a ^ n.a, e.b ^ r.b ^ n.b)
    }

    function S(n) {
      return b(n, 6) ^ b(n, 11) ^ b(n, 25)
    }

    function g(n) {
      var e = c(n, 14), r = c(n, 18);
      return n = c(n, 41), new t(e.a ^ r.a ^ n.a, e.b ^ r.b ^ n.b)
    }

    function m(n) {
      return b(n, 7) ^ b(n, 18) ^ n >>> 3
    }

    function U(n) {
      var e = c(n, 1), r = c(n, 8);
      return n = s(n, 7), new t(e.a ^ r.a ^ n.a, e.b ^ r.b ^ n.b)
    }

    function E(n) {
      return b(n, 17) ^ b(n, 19) ^ n >>> 10
    }

    function T(n) {
      var e = c(n, 19), r = c(n, 61);
      return n = s(n, 6), new t(e.a ^ r.a ^ n.a, e.b ^ r.b ^ n.b)
    }

    function X(n, e) {
      var t = (65535 & n) + (65535 & e);
      return ((n >>> 16) + (e >>> 16) + (t >>> 16) & 65535) << 16 | 65535 & t
    }

    function y(n, e, t, r) {
      var a = (65535 & n) + (65535 & e) + (65535 & t) + (65535 & r);
      return ((n >>> 16) + (e >>> 16) + (t >>> 16) + (r >>> 16) + (a >>> 16) & 65535) << 16 | 65535 & a
    }

    function I(n, e, t, r, a) {
      var o = (65535 & n) + (65535 & e) + (65535 & t) + (65535 & r) + (65535 & a);
      return ((n >>> 16) + (e >>> 16) + (t >>> 16) + (r >>> 16) + (a >>> 16) + (o >>> 16) & 65535) << 16 | 65535 & o
    }

    function C(n, e) {
      var r, a, o;
      return r = (65535 & n.b) + (65535 & e.b), o = (65535 & (a = (n.b >>> 16) + (e.b >>> 16) + (r >>> 16))) << 16 | 65535 & r, r = (65535 & n.a) + (65535 & e.a) + (a >>> 16), new t((65535 & (a = (n.a >>> 16) + (e.a >>> 16) + (r >>> 16))) << 16 | 65535 & r, o)
    }

    function F(n, e, r, a) {
      var o, w, i;
      return o = (65535 & n.b) + (65535 & e.b) + (65535 & r.b) + (65535 & a.b), i = (65535 & (w = (n.b >>> 16) + (e.b >>> 16) + (r.b >>> 16) + (a.b >>> 16) + (o >>> 16))) << 16 | 65535 & o, o = (65535 & n.a) + (65535 & e.a) + (65535 & r.a) + (65535 & a.a) + (w >>> 16), new t((65535 & (w = (n.a >>> 16) + (e.a >>> 16) + (r.a >>> 16) + (a.a >>> 16) + (o >>> 16))) << 16 | 65535 & o, i)
    }

    function x(n, e, r, a, o) {
      var w, i, u;
      return w = (65535 & n.b) + (65535 & e.b) + (65535 & r.b) + (65535 & a.b) + (65535 & o.b), u = (65535 & (i = (n.b >>> 16) + (e.b >>> 16) + (r.b >>> 16) + (a.b >>> 16) + (o.b >>> 16) + (w >>> 16))) << 16 | 65535 & w, w = (65535 & n.a) + (65535 & e.a) + (65535 & r.a) + (65535 & a.a) + (65535 & o.a) + (i >>> 16), new t((65535 & (i = (n.a >>> 16) + (e.a >>> 16) + (r.a >>> 16) + (a.a >>> 16) + (o.a >>> 16) + (w >>> 16))) << 16 | 65535 & w, u)
    }

    function L(n, e) {
      var t, r, a, o, w, i, u, b, c, s = [], h = p, d = l, v = H, A = f, S = X, g = I,
        m = [1732584193, 4023233417, 2562383102, 271733878, 3285377520];
      for (n[e >>> 5] |= 128 << 24 - e % 32, n[15 + (e + 65 >>> 9 << 4)] = e, c = n.length, u = 0; u < c; u += 16) {
        for (t = m[0], r = m[1], a = m[2], o = m[3], w = m[4], b = 0; 80 > b; b += 1) s[b] = 16 > b ? n[b + u] : A(s[b - 3] ^ s[b - 8] ^ s[b - 14] ^ s[b - 16], 1), i = 20 > b ? g(A(t, 5), h(r, a, o), w, 1518500249, s[b]) : 40 > b ? g(A(t, 5), d(r, a, o), w, 1859775393, s[b]) : 60 > b ? g(A(t, 5), v(r, a, o), w, 2400959708, s[b]) : g(A(t, 5), d(r, a, o), w, 3395469782, s[b]), w = o, o = a, a = A(r, 30), r = t, t = i;
        m[0] = S(t, m[0]), m[1] = S(r, m[1]), m[2] = S(a, m[2]), m[3] = S(o, m[3]), m[4] = S(w, m[4])
      }
      return m
    }

    function P(n, e, r) {
      var a, o, w, i, u, f, b, c, s, l, L, P, B, k, O, N, j, z, M, R, Z, q, D, G, J, K, Q = [],
        V = [1116352408, 1899447441, 3049323471, 3921009573, 961987163, 1508970993, 2453635748, 2870763221, 3624381080, 310598401, 607225278, 1426881987, 1925078388, 2162078206, 2614888103, 3248222580, 3835390401, 4022224774, 264347078, 604807628, 770255983, 1249150122, 1555081692, 1996064986, 2554220882, 2821834349, 2952996808, 3210313671, 3336571891, 3584528711, 113926993, 338241895, 666307205, 773529912, 1294757372, 1396182291, 1695183700, 1986661051, 2177026350, 2456956037, 2730485921, 2820302411, 3259730800, 3345764771, 3516065817, 3600352804, 4094571909, 275423344, 430227734, 506948616, 659060556, 883997877, 958139571, 1322822218, 1537002063, 1747873779, 1955562222, 2024104815, 2227730452, 2361852424, 2428436474, 2756734187, 3204031479, 3329325298];
      if (l = [3238371032, 914150663, 812702999, 4144912697, 4290775857, 1750603025, 1694076839, 3204075428], o = [1779033703, 3144134277, 1013904242, 2773480762, 1359893119, 2600822924, 528734635, 1541459225], "SHA-224" === r || "SHA-256" === r) L = 64, a = 15 + (e + 65 >>> 9 << 4), k = 16, O = 1, J = Number, N = X, j = y, z = I, M = m, R = E, Z = v, q = S, G = H, D = p, l = "SHA-224" === r ? l : o; else {
        if ("SHA-384" !== r && "SHA-512" !== r) throw"Unexpected error in SHA-2 implementation";
        L = 80, a = 31 + (e + 128 >>> 10 << 5), k = 32, O = 2, N = C, j = F, z = x, M = U, R = T, Z = A, q = g, G = d, D = h, V = [new (J = t)(V[0], 3609767458), new J(V[1], 602891725), new J(V[2], 3964484399), new J(V[3], 2173295548), new J(V[4], 4081628472), new J(V[5], 3053834265), new J(V[6], 2937671579), new J(V[7], 3664609560), new J(V[8], 2734883394), new J(V[9], 1164996542), new J(V[10], 1323610764), new J(V[11], 3590304994), new J(V[12], 4068182383), new J(V[13], 991336113), new J(V[14], 633803317), new J(V[15], 3479774868), new J(V[16], 2666613458), new J(V[17], 944711139), new J(V[18], 2341262773), new J(V[19], 2007800933), new J(V[20], 1495990901), new J(V[21], 1856431235), new J(V[22], 3175218132), new J(V[23], 2198950837), new J(V[24], 3999719339), new J(V[25], 766784016), new J(V[26], 2566594879), new J(V[27], 3203337956), new J(V[28], 1034457026), new J(V[29], 2466948901), new J(V[30], 3758326383), new J(V[31], 168717936), new J(V[32], 1188179964), new J(V[33], 1546045734), new J(V[34], 1522805485), new J(V[35], 2643833823), new J(V[36], 2343527390), new J(V[37], 1014477480), new J(V[38], 1206759142), new J(V[39], 344077627), new J(V[40], 1290863460), new J(V[41], 3158454273), new J(V[42], 3505952657), new J(V[43], 106217008), new J(V[44], 3606008344), new J(V[45], 1432725776), new J(V[46], 1467031594), new J(V[47], 851169720), new J(V[48], 3100823752), new J(V[49], 1363258195), new J(V[50], 3750685593), new J(V[51], 3785050280), new J(V[52], 3318307427), new J(V[53], 3812723403), new J(V[54], 2003034995), new J(V[55], 3602036899), new J(V[56], 1575990012), new J(V[57], 1125592928), new J(V[58], 2716904306), new J(V[59], 442776044), new J(V[60], 593698344), new J(V[61], 3733110249), new J(V[62], 2999351573), new J(V[63], 3815920427), new J(3391569614, 3928383900), new J(3515267271, 566280711), new J(3940187606, 3454069534), new J(4118630271, 4000239992), new J(116418474, 1914138554), new J(174292421, 2731055270), new J(289380356, 3203993006), new J(460393269, 320620315), new J(685471733, 587496836), new J(852142971, 1086792851), new J(1017036298, 365543100), new J(1126000580, 2618297676), new J(1288033470, 3409855158), new J(1501505948, 4234509866), new J(1607167915, 987167468), new J(1816402316, 1246189591)], l = "SHA-384" === r ? [new J(3418070365, l[0]), new J(1654270250, l[1]), new J(2438529370, l[2]), new J(355462360, l[3]), new J(1731405415, l[4]), new J(41048885895, l[5]), new J(3675008525, l[6]), new J(1203062813, l[7])] : [new J(o[0], 4089235720), new J(o[1], 2227873595), new J(o[2], 4271175723), new J(o[3], 1595750129), new J(o[4], 2917565137), new J(o[5], 725511199), new J(o[6], 4215389547), new J(o[7], 327033209)]
      }
      for (n[e >>> 5] |= 128 << 24 - e % 32, n[a] = e, K = n.length, P = 0; P < K; P += k) {
        for (e = l[0], a = l[1], o = l[2], w = l[3], i = l[4], u = l[5], f = l[6], b = l[7], B = 0; B < L; B += 1) Q[B] = 16 > B ? new J(n[B * O + P], n[B * O + P + 1]) : j(R(Q[B - 2]), Q[B - 7], M(Q[B - 15]), Q[B - 16]), c = z(b, q(i), D(i, u, f), V[B], Q[B]), s = N(Z(e), G(e, a, o)), b = f, f = u, u = i, i = N(w, c), w = o, o = a, a = e, e = N(c, s);
        l[0] = N(e, l[0]), l[1] = N(a, l[1]), l[2] = N(o, l[2]), l[3] = N(w, l[3]), l[4] = N(i, l[4]), l[5] = N(u, l[5]), l[6] = N(f, l[6]), l[7] = N(b, l[7])
      }
      if ("SHA-224" === r) n = [l[0], l[1], l[2], l[3], l[4], l[5], l[6]]; else if ("SHA-256" === r) n = l; else if ("SHA-384" === r) n = [l[0].a, l[0].b, l[1].a, l[1].b, l[2].a, l[2].b, l[3].a, l[3].b, l[4].a, l[4].b, l[5].a, l[5].b]; else {
        if ("SHA-512" !== r) throw"Unexpected error in SHA-2 implementation";
        n = [l[0].a, l[0].b, l[1].a, l[1].b, l[2].a, l[2].b, l[3].a, l[3].b, l[4].a, l[4].b, l[5].a, l[5].b, l[6].a, l[6].b, l[7].a, l[7].b]
      }
      return n
    }

    "function" == typeof define && (define.amd, 1) ? define(function () {
      return e
    }) : "undefined" != typeof exports ? "undefined" != typeof module && module.exports ? module.exports = exports = e : exports = e : n.jsSHA = e
  }(window);
} catch (e) {
}

export default jsSHA;