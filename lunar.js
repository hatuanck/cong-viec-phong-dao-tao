/* Âm lịch Việt Nam (thuật toán Hồ Ngọc Đức, múi giờ +7) */
var Lunar = (function () {
  var TZ = 7, PI = Math.PI, INT = Math.floor;
  function jdFromDate(dd, mm, yy) {
    var a = INT((14 - mm) / 12), y = yy + 4800 - a, m = mm + 12 * a - 3;
    var jd = dd + INT((153 * m + 2) / 5) + 365 * y + INT(y / 4) - INT(y / 100) + INT(y / 400) - 32045;
    if (jd < 2299161) jd = dd + INT((153 * m + 2) / 5) + 365 * y + INT(y / 4) - 32083;
    return jd;
  }
  function jdToDate(jd) {
    var a, b, c;
    if (jd > 2299160) { a = jd + 32044; b = INT((4 * a + 3) / 146097); c = a - INT((b * 146097) / 4); }
    else { b = 0; c = jd + 32082; }
    var d = INT((4 * c + 3) / 1461), e = c - INT((1461 * d) / 4), m = INT((5 * e + 2) / 153);
    return [e - INT((153 * m + 2) / 5) + 1, m + 3 - 12 * INT(m / 10), b * 100 + d - 4800 + INT(m / 10)];
  }
  function newMoon(k) {
    var T = k / 1236.85, T2 = T * T, T3 = T2 * T, dr = PI / 180;
    var Jd1 = 2415020.75933 + 29.53058868 * k + 0.0001178 * T2 - 0.000000155 * T3;
    Jd1 += 0.00033 * Math.sin((166.56 + 132.87 * T - 0.009173 * T2) * dr);
    var M = 359.2242 + 29.10535608 * k - 0.0000333 * T2 - 0.00000347 * T3;
    var Mpr = 306.0253 + 385.81691806 * k + 0.0107306 * T2 + 0.00001236 * T3;
    var F = 21.2964 + 390.67050646 * k - 0.0016528 * T2 - 0.00000239 * T3;
    var C1 = (0.1734 - 0.000393 * T) * Math.sin(M * dr) + 0.0021 * Math.sin(2 * dr * M);
    C1 = C1 - 0.4068 * Math.sin(Mpr * dr) + 0.0161 * Math.sin(dr * 2 * Mpr);
    C1 = C1 - 0.0004 * Math.sin(dr * 3 * Mpr);
    C1 = C1 + 0.0104 * Math.sin(dr * 2 * F) - 0.0051 * Math.sin(dr * (M + Mpr));
    C1 = C1 - 0.0074 * Math.sin(dr * (M - Mpr)) + 0.0004 * Math.sin(dr * (2 * F + M));
    C1 = C1 - 0.0004 * Math.sin(dr * (2 * F - M)) - 0.0006 * Math.sin(dr * (2 * F + Mpr));
    C1 = C1 + 0.0010 * Math.sin(dr * (2 * F - Mpr)) + 0.0005 * Math.sin(dr * (2 * Mpr + M));
    var dt = T < -11 ? 0.001 + 0.000839 * T + 0.0002261 * T2 - 0.00000845 * T3 - 0.000000081 * T * T3
      : -0.000278 + 0.000265 * T + 0.000262 * T2;
    return INT(Jd1 + C1 - dt + 0.5 + TZ / 24);
  }
  function sunLong(jdn) {
    var T = (jdn - 2451545.5 - TZ / 24) / 36525, T2 = T * T, dr = PI / 180;
    var M = 357.52910 + 35999.05030 * T - 0.0001559 * T2 - 0.00000048 * T * T2;
    var L0 = 280.46645 + 36000.76983 * T + 0.0003032 * T2;
    var DL = (1.914600 - 0.004817 * T - 0.000014 * T2) * Math.sin(dr * M);
    DL += (0.019993 - 0.000101 * T) * Math.sin(dr * 2 * M) + 0.000290 * Math.sin(dr * 3 * M);
    var L = (L0 + DL) * dr;
    L = L - PI * 2 * INT(L / (PI * 2));
    return INT(L / PI * 6);
  }
  function month11(yy) {
    var off = jdFromDate(31, 12, yy) - 2415021, k = INT(off / 29.530588853), nm = newMoon(k);
    if (sunLong(nm) >= 9) nm = newMoon(k - 1);
    return nm;
  }
  function leapOffset(a11) {
    var k = INT((a11 - 2415021.076998695) / 29.530588853 + 0.5), last, i = 1, arc = sunLong(newMoon(k + i));
    do { last = arc; i++; arc = sunLong(newMoon(k + i)); } while (arc != last && i < 14);
    return i - 1;
  }
  function toLunar(dd, mm, yy) {
    var day = jdFromDate(dd, mm, yy), k = INT((day - 2415021.076998695) / 29.530588853);
    var ms = newMoon(k + 1); if (ms > day) ms = newMoon(k);
    var a11 = month11(yy), b11 = a11, ly;
    if (a11 >= ms) { ly = yy; a11 = month11(yy - 1); } else { ly = yy + 1; b11 = month11(yy + 1); }
    var ld = day - ms + 1, diff = INT((ms - a11) / 29), leap = 0, lm = diff + 11;
    if (b11 - a11 > 365) { var lmd = leapOffset(a11); if (diff >= lmd) { lm = diff + 10; if (diff == lmd) leap = 1; } }
    if (lm > 12) lm -= 12;
    if (lm >= 11 && diff < 4) ly -= 1;
    return { day: ld, month: lm, year: ly, leap: leap };
  }
  function toSolar(ld, lm, ly, leap) {
    var a11, b11;
    if (lm < 11) { a11 = month11(ly - 1); b11 = month11(ly); } else { a11 = month11(ly); b11 = month11(ly + 1); }
    var off = lm - 11; if (off < 0) off += 12;
    if (b11 - a11 > 365) {
      var lo = leapOffset(a11), lmn = lo - 2; if (lmn < 0) lmn += 12;
      if (leap && lm != lmn) return null; else if (leap || off >= lo) off += 1;
    }
    var k = INT(0.5 + (a11 - 2415021.076998695) / 29.530588853);
    return jdToDate(newMoon(k + off) + ld - 1);
  }
  return { toLunar: toLunar, toSolar: toSolar };
})();
if (typeof module !== 'undefined') module.exports = Lunar;
