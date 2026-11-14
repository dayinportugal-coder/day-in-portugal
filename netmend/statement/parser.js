/* Netmend Statement parser. Pure functions: works in the browser and in Node tests.
   Turns pdf.js text items into transaction rows (date, description, debit, credit, amount, balance). */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.NMStatement = factory();
})(typeof window !== "undefined" ? window : globalThis, function () {
  var DATE_RE = /^(\d{1,2}[\/.\-]\d{1,2}([\/.\-]\d{2,4})?|\d{4}-\d{2}-\d{2}|\d{1,2}\s?(de\s+)?(jan|feb|fev|mar|apr|abr|may|mai|jun|jul|aug|ago|sep|set|oct|out|nov|dec|dez)[a-z]*\.?(\s+\d{2,4})?)$/i;
  var AMT_RE = /^[-+−]?\(?[€$£]?\s?\d{1,3}([.,\s ]\d{3})*([.,]\d{2})\)?\s?(€|eur|usd|gbp|cr|dr|d|c|-)?$/i;
  var DEB = /^(d[ée]bito|debit|debits|withdrawals?|paid out|money out|sa[íi]das?|cargos?|soll|montant d[ée]bit|levantamentos?|payments?|out)$/i;
  var CRE = /^(cr[ée]dito|credit|credits|deposits?|paid in|money in|entradas?|abonos?|haben|montant cr[ée]dit|dep[óo]sitos?|receipts?|in)$/i;
  var BAL = /^(saldo|balance|solde|kontostand|saldo final|running balance|saldo actual|saldo atual|available)$/i;
  var SKIP_DESC = /^(opening balance|closing balance|saldo inicial|saldo de abertura|saldo final|saldo de fecho|saldo anterior|brought forward|carried forward|transporte|a transporte|saldo de abertura da conta|balance (brought|carried) forward)$/i;

  function parseAmount(s, fmt) {
    if (s == null) return null;
    var t = String(s).replace(/[€$£\s]|eur|usd|gbp/gi, "");
    var neg = /^[-−]|\(|-$|dr$|d$/i.test(t);
    t = t.replace(/[()+−\-]|cr$|dr$|c$|d$/gi, "");
    if (!t) return null;
    var eu = fmt === "eu" || (fmt === "auto" && /,\d{2}$/.test(t));
    t = eu ? t.replace(/\./g, "").replace(",", ".") : t.replace(/,/g, "");
    var n = parseFloat(t);
    if (isNaN(n)) return null;
    return neg ? -n : n;
  }

  function isDateToken(s) {
    s = String(s || "").trim();
    if (!s) return false;
    if (DATE_RE.test(s)) return true;
    var parts = s.split(/\s+/);
    return parts.length >= 2 && DATE_RE.test(parts[0] + " " + parts[1]);
  }

  function itemsToRows(items, page) {
    var lines = [];
    items.forEach(function (it) {
      var s = String(it.str || "").trim();
      if (!s) return;
      var x = it.transform[4], y = it.transform[5], w = it.width;
      var L = lines.find(function (l) { return Math.abs(l.y - y) < 3; });
      if (!L) { L = { y: y, items: [] }; lines.push(L); }
      L.items.push({ x: x, w: w, s: s });
    });
    lines.sort(function (a, b) { return b.y - a.y; });
    return lines.map(function (l) {
      l.items.sort(function (a, b) { return a.x - b.x; });
      var cells = [], cur = null;
      l.items.forEach(function (it) {
        if (cur && it.x - (cur.x + cur.w) < 4) {
          cur.s += " " + it.s;
          cur.w = it.x + it.w - cur.x;
        } else {
          cur = { x: it.x, w: it.w, s: it.s };
          cells.push(cur);
        }
      });
      return { page: page, cells: cells.map(function (c) { return c.s; }), xs: cells.map(function (c) { return c.x + c.w; }) };
    });
  }

  function findCols(rows) {
    for (var i = 0; i < rows.length; i++) {
      var r = rows[i], cols = {};
      r.cells.forEach(function (c, j) {
        var t = c.trim();
        if (DEB.test(t)) cols.deb = r.xs[j];
        else if (CRE.test(t)) cols.cre = r.xs[j];
        else if (BAL.test(t)) cols.bal = r.xs[j];
      });
      if ((cols.deb != null || cols.cre != null) && (cols.deb != null && cols.cre != null || cols.bal != null)) return cols;
      if (cols.deb != null && cols.cre != null) return cols;
    }
    return null;
  }

  function assignByCol(t, values, xs, cols) {
    values.forEach(function (v, k) {
      var x = xs[k], best = null, bd = 1e9;
      ["deb", "cre", "bal"].forEach(function (n) {
        if (cols[n] != null && Math.abs(cols[n] - x) < bd) { bd = Math.abs(cols[n] - x); best = n; }
      });
      if (best === "bal") t.balance = v;
      else if (best === "deb") { t.debit = Math.abs(v); t.amount = -Math.abs(v); }
      else if (best === "cre") { t.credit = Math.abs(v); t.amount = Math.abs(v); }
    });
  }

  function assignFallback(t, values) {
    if (values.length === 1) t.amount = values[0];
    else if (values.length === 2) { t.amount = values[0]; t.balance = values[1]; }
    else if (values.length >= 3) {
      t.debit = Math.abs(values[0]);
      t.credit = Math.abs(values[1]);
      t.balance = values[values.length - 1];
      if (t.debit && !t.credit) t.amount = -t.debit;
      else if (t.credit && !t.debit) t.amount = t.credit;
      else t.amount = (t.credit || 0) - (t.debit || 0);
    }
  }

  function isNoiseText(s) {
    s = String(s || "").replace(/\s+/g, " ").trim();
    if (!s) return true;
    if (/page\s+\d+\s+of\s+\d+|p[áa]gina\s+\d+\s+de\s+\d+/i.test(s)) return true;
    if (/continued on next page|continua na p[áa]gina|account statement|extrato de conta/i.test(s)) return true;
    if (/fictional demo|extrato fict[ií]cio|invented names|documento de demonstra/i.test(s)) return true;
    if (/^(northshore community bank|banco exemplo)/i.test(s)) return true;
    if (/^(closing balance|saldo final|opening balance|saldo inicial)\s*:/i.test(s)) return true;
    if (/^(date|data)\b/i.test(s) && /(description|descri[cç][aã]o|withdrawals|deposits|balance|d[ée]bito|cr[ée]dito|saldo)/i.test(s)) return true;
    return false;
  }

  function toTransactions(rows, fmt) {
    var tx = [], last = null, cols = findCols(rows);
    fmt = fmt || "auto";
    rows.forEach(function (r) {
      var c = r.cells.slice(), xs = r.xs.slice();
      if (!c.length) return;
      if (isNoiseText(c.join(" "))) return;
      var d = null;
      if (DATE_RE.test(c[0])) { d = c.shift(); xs.shift(); }
      else {
        var first = c[0].split(/\s+/);
        if (first.length > 1 && DATE_RE.test(first[0])) {
          d = first[0];
          c[0] = first.slice(1).join(" ");
        }
      }
      if (d) {
        if (c.length && DATE_RE.test(c[0])) { c.shift(); xs.shift(); }
        var amts = [], ax = [];
        while (c.length && AMT_RE.test(c[c.length - 1])) { amts.unshift(c.pop()); ax.unshift(xs.pop()); }
        var t = { date: d, description: c.join(" ").replace(/\s+/g, " ").trim(), debit: null, credit: null, amount: null, balance: null, page: r.page };
        var values = amts.map(function (a) { return parseAmount(a, fmt); });
        if (cols && amts.length) assignByCol(t, values, ax, cols);
        else if (amts.length) assignFallback(t, values);
        if (t.amount == null) {
          if (t.debit != null && !(t.credit > 0)) t.amount = -Math.abs(t.debit);
          else if (t.credit != null && !(t.debit > 0)) t.amount = Math.abs(t.credit);
        }
        last = t;
        tx.push(t);
      } else if (last && c.every(function (x) { return !AMT_RE.test(x); }) && c.join(" ").length < 90 && last.description.length < 240) {
        last.description = (last.description + " " + c.join(" ")).replace(/\s+/g, " ").trim();
      }
    });
    return tx.filter(function (t) {
      if (t.amount == null && t.balance == null && t.debit == null && t.credit == null) return false;
      if (SKIP_DESC.test(t.description) && t.debit == null && t.credit == null && (t.amount == null || t.amount === 0)) return false;
      return true;
    });
  }

  async function extractRows(pdfjs, data, opts) {
    opts = opts || {};
    var pdf = await pdfjs.getDocument({ data: data }).promise;
    var max = opts.maxPages && opts.maxPages > 0 ? Math.min(opts.maxPages, pdf.numPages) : pdf.numPages;
    var rows = [];
    for (var p = 1; p <= max; p++) {
      var page = await pdf.getPage(p);
      var tc = await page.getTextContent();
      rows = rows.concat(itemsToRows(tc.items, p));
    }
    return { rows: rows, numPages: pdf.numPages, readPages: max };
  }

  function csvEscape(v, sep) {
    v = v == null ? "" : String(v);
    return /["\n\r]/.test(v) || v.indexOf(sep) >= 0 ? '"' + v.replace(/"/g, '""') + '"' : v;
  }
  function numOut(n, dec) {
    if (n == null || n === "") return "";
    var s = Number(n).toFixed(2);
    return dec === "," ? s.replace(".", ",") : s;
  }
  function tableFrom(tx, opts) {
    opts = opts || {};
    var dec = opts.dec || ".";
    var rows = [["Date", "Description", "Debit", "Credit", "Amount", "Balance"]];
    if (opts.withFile) rows[0].unshift("File");
    if (opts.withPage) rows[0].push("Page");
    tx.forEach(function (t) {
      var r = [t.date, t.description, numOut(t.debit, dec), numOut(t.credit, dec), numOut(t.amount, dec), numOut(t.balance, dec)];
      if (opts.withFile) r.unshift(t.file || "");
      if (opts.withPage) r.push(t.page == null ? "" : t.page);
      rows.push(r);
    });
    return rows;
  }
  function toCsv(table, sep) {
    sep = sep || ",";
    return "\ufeff" + table.map(function (r) {
      return r.map(function (v) { return csvEscape(v, sep); }).join(sep);
    }).join("\r\n");
  }

  return {
    DATE_RE: DATE_RE,
    AMT_RE: AMT_RE,
    parseAmount: parseAmount,
    itemsToRows: itemsToRows,
    findCols: findCols,
    toTransactions: toTransactions,
    extractRows: extractRows,
    tableFrom: tableFrom,
    toCsv: toCsv,
    numOut: numOut
  };
});
