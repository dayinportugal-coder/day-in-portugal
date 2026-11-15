/**
 * Netmend Sheets AI · AI functions inside Google Sheets, with your own free Gemini key.
 * https://netmend.app/sheets-ai/
 * Install: Extensions > Apps Script > paste this file > Save > reload the sheet > Netmend menu > Set Gemini API key.
 * Your key is stored in your Google account's user properties for this script. Nothing goes to Netmend:
 * the only calls are to Google's Gemini API and (for Pro) Gumroad licence verification.
 * Free: NETMEND_AI and NETMEND_TRANSLATE, 50 AI calls a day. Pro (lifetime): every function, no limit,
 * plus "Fill selected cells" which writes plain values (no recalculation, no repeat cost).
 */
var NM_PRODUCT_ID = 'KBC9omd-o9urF_DoRFgHsA=='; // https://portugaldiary.gumroad.com/l/netmend-sheets-ai
var NM_MODELS = ['gemini-3.5-flash-lite', 'gemini-flash-lite-latest', 'gemini-3.5-flash', 'gemini-flash-latest'];
var NM_FREE_DAILY = 50;

function onOpen() {
  SpreadsheetApp.getUi().createMenu('Netmend')
    .addItem('Set Gemini API key', 'nmSetKey')
    .addItem('Activate Pro licence', 'nmActivate')
    .addItem('Fill selected cells with a prompt (Pro)', 'nmFillSelection')
    .addSeparator()
    .addItem('Usage and help', 'nmHelp')
    .addToUi();
}
function onInstall() { onOpen(); }

function nmProps_() { return PropertiesService.getUserProperties(); }
function nmKey_() { return (nmProps_().getProperty('NM_GEMINI_KEY') || '').trim(); }
function nmIsPro_() { return nmProps_().getProperty('NM_PRO') === 'yes'; }
function nmToday_() { return Utilities.formatDate(new Date(), 'UTC', 'yyyy-MM-dd'); }

function nmSetKey() {
  var ui = SpreadsheetApp.getUi();
  var r = ui.prompt('Gemini API key', 'Paste your free key from aistudio.google.com (Get API key). It is stored only in your Google account for this script.', ui.ButtonSet.OK_CANCEL);
  if (r.getSelectedButton() !== ui.Button.OK) return;
  var k = r.getResponseText().trim();
  if (!k) return ui.alert('No key pasted.');
  nmProps_().setProperty('NM_GEMINI_KEY', k);
  ui.alert('Saved. Try =NETMEND_AI("Write a haiku about spreadsheets") in any cell.');
}

function nmVerify_(licence) {
  if (!NM_PRODUCT_ID) return { valid: false, message: 'Pro licences are not on sale yet. Email dayinportugal@gmail.com to be told when they open.' };
  var res = UrlFetchApp.fetch('https://api.gumroad.com/v2/licenses/verify', {
    method: 'post', muteHttpExceptions: true,
    payload: { product_id: NM_PRODUCT_ID, license_key: licence, increment_uses_count: 'false' }
  });
  var d = {}; try { d = JSON.parse(res.getContentText()); } catch (e) {}
  var p = d.purchase || {};
  return { valid: !!d.success && !p.refunded && !p.chargebacked && !p.disputed, message: d.message || 'Invalid licence key' };
}
function nmActivate() {
  var ui = SpreadsheetApp.getUi();
  var r = ui.prompt('Netmend Sheets AI Pro', 'Paste the licence key from your Gumroad receipt.', ui.ButtonSet.OK_CANCEL);
  if (r.getSelectedButton() !== ui.Button.OK) return;
  var v = nmVerify_(r.getResponseText().trim());
  if (v.valid) { nmProps_().setProperties({ NM_PRO: 'yes', NM_LICENCE: r.getResponseText().trim() }); ui.alert('Pro is active. All functions unlocked, no daily limit.'); }
  else ui.alert('Not activated: ' + v.message);
}
function nmHelp() {
  var u = nmUsage_();
  SpreadsheetApp.getUi().alert('Netmend Sheets AI',
    (nmIsPro_() ? 'Pro active: no daily limit.' : 'Free: ' + u.count + ' of ' + NM_FREE_DAILY + ' AI calls used today.') +
    '\n\nFunctions:\n=NETMEND_AI(prompt, [cells])\n=NETMEND_TRANSLATE(text, language)\nPro: =NETMEND_EXTRACT(text, what) · =NETMEND_CLASSIFY(text, "a,b,c") · =NETMEND_SENTIMENT(text) · =NETMEND_LIST(prompt, [n])\n\nGuide: https://netmend.app/sheets-ai/', SpreadsheetApp.getUi().ButtonSet.OK);
}

function nmUsage_() {
  var raw = nmProps_().getProperty('NM_USAGE');
  var u = raw ? JSON.parse(raw) : {};
  if (u.date !== nmToday_()) u = { date: nmToday_(), count: 0 };
  return u;
}
function nmCount_() {
  if (nmIsPro_()) return;
  var u = nmUsage_();
  if (u.count >= NM_FREE_DAILY) throw new Error('Free limit of ' + NM_FREE_DAILY + ' AI calls today reached. Pro (lifetime) removes it: netmend.app/sheets-ai');
  u.count++;
  try { nmProps_().setProperty('NM_USAGE', JSON.stringify(u)); } catch (e) {}
}
function nmNeedPro_(name) {
  if (!nmIsPro_()) throw new Error(name + ' is a Pro function. Free: NETMEND_AI and NETMEND_TRANSLATE. Pro: netmend.app/sheets-ai');
}
function nmFlat_(v) {
  if (v === undefined || v === null || v === '') return '';
  if (Array.isArray(v)) return v.map(function (r) { return Array.isArray(r) ? r.join('\t') : r; }).join('\n');
  return String(v);
}

/** Core call with cache (identical prompts are not paid twice for 6 h). */
function nmGemini_(prompt, temperature) {
  var key = nmKey_();
  if (!key) throw new Error('Set your Gemini key first: Netmend menu > Set Gemini API key.');
  var cache = CacheService.getUserCache();
  var ck = 'nm' + Utilities.base64Encode(Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, prompt + '|' + temperature));
  var hit = cache.get(ck); if (hit !== null) return hit;
  nmCount_();
  var last = '';
  for (var i = 0; i < NM_MODELS.length; i++) {
    var res = UrlFetchApp.fetch('https://generativelanguage.googleapis.com/v1beta/models/' + NM_MODELS[i] + ':generateContent', {
      method: 'post', contentType: 'application/json', muteHttpExceptions: true, headers: { 'x-goog-api-key': key },
      payload: JSON.stringify({
        systemInstruction: { parts: [{ text: 'You answer inside a single spreadsheet cell. Reply with the answer only: no preamble, no markdown, no quotes around it. Be concise.' }] },
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { temperature: temperature == null ? 0.4 : temperature }
      })
    });
    var code = res.getResponseCode(), body = {};
    try { body = JSON.parse(res.getContentText()); } catch (e) {}
    if (code === 200) {
      var parts = (((body.candidates || [])[0] || {}).content || {}).parts || [];
      var text = parts.filter(function (p) { return !p.thought; }).map(function (p) { return p.text || ''; }).join('').trim();
      if (text.length > 49000) text = text.slice(0, 49000);
      try { cache.put(ck, text, 21600); } catch (e) {}
      return text;
    }
    last = (body.error && body.error.message) || ('HTTP ' + code);
    if ([404, 429, 500, 503].indexOf(code) < 0) break;
  }
  if (/API key not valid/i.test(last)) throw new Error('Google rejected the Gemini key. Set it again from the Netmend menu.');
  throw new Error('Gemini error: ' + last);
}

/**
 * Ask AI anything, optionally about some cells.
 * @param {string} prompt What you want, e.g. "Write a product title for".
 * @param {any} [cells] Optional cell or range to include as context.
 * @return The AI answer.
 * @customfunction
 */
function NETMEND_AI(prompt, cells) {
  if (!prompt) return '';
  var ctx = nmFlat_(cells);
  return nmGemini_(String(prompt) + (ctx ? '\n\nData:\n' + ctx : ''), 0.5);
}

/**
 * Translate text into a language.
 * @param {string} text Text or cell.
 * @param {string} language Target language, e.g. "Spanish".
 * @return Translation.
 * @customfunction
 */
function NETMEND_TRANSLATE(text, language) {
  text = nmFlat_(text); if (!text) return '';
  return nmGemini_('Translate into ' + (language || 'English') + '. Keep meaning, tone and formatting. Text:\n' + text, 0.2);
}

/**
 * Pull one piece of information out of messy text (Pro).
 * @param {string} text Text or cell.
 * @param {string} what What to extract, e.g. "email", "company name", "price in EUR".
 * @return The extracted value, or empty.
 * @customfunction
 */
function NETMEND_EXTRACT(text, what) {
  nmNeedPro_('NETMEND_EXTRACT'); text = nmFlat_(text); if (!text) return '';
  return nmGemini_('Extract the ' + what + ' from the text. If it is not there, reply with nothing at all. Text:\n' + text, 0);
}

/**
 * Put text into one of your categories (Pro).
 * @param {string} text Text or cell.
 * @param {string} categories Comma-separated categories, or a range of them.
 * @return One category.
 * @customfunction
 */
function NETMEND_CLASSIFY(text, categories) {
  nmNeedPro_('NETMEND_CLASSIFY'); text = nmFlat_(text); if (!text) return '';
  var cats = Array.isArray(categories) ? [].concat.apply([], categories).filter(String).join(', ') : String(categories || '');
  return nmGemini_('Classify the text into exactly one of these categories: ' + cats + '. Reply with the category name only, exactly as written. Text:\n' + text, 0);
}

/**
 * Sentiment of text: Positive, Neutral or Negative (Pro).
 * @param {string} text Text or cell.
 * @return Positive, Neutral or Negative.
 * @customfunction
 */
function NETMEND_SENTIMENT(text) {
  nmNeedPro_('NETMEND_SENTIMENT'); text = nmFlat_(text); if (!text) return '';
  return nmGemini_('Reply with one word, Positive, Neutral or Negative, for the sentiment of:\n' + text, 0);
}

/**
 * A list that spills down the column (Pro).
 * @param {string} prompt e.g. "10 blog post ideas about cork".
 * @param {number} [n] How many items (default 10, max 100).
 * @return One item per row.
 * @customfunction
 */
function NETMEND_LIST(prompt, n) {
  nmNeedPro_('NETMEND_LIST'); if (!prompt) return '';
  n = Math.min(100, Math.max(1, Number(n) || 10));
  var t = nmGemini_('Give exactly ' + n + ' items for: ' + prompt + '\nOne item per line, no numbering, no bullets, nothing else.', 0.7);
  return t.split(/\r?\n/).map(function (s) { return s.replace(/^\s*(?:[-*•]|\d+[.)])\s*/, '').trim(); }).filter(String).slice(0, n).map(function (s) { return [s]; });
}

/** Pro: run one prompt over each selected cell and write the answers as plain values in the next column. */
function nmFillSelection() {
  var ui = SpreadsheetApp.getUi();
  if (!nmIsPro_()) return ui.alert('Fill selected cells is part of Pro (lifetime). See netmend.app/sheets-ai');
  var range = SpreadsheetApp.getActiveRange();
  if (!range) return ui.alert('Select the cells with your input first.');
  var r = ui.prompt('Prompt for each cell', 'e.g. "Write a 1-line product description for". Answers go in the column to the right.', ui.ButtonSet.OK_CANCEL);
  if (r.getSelectedButton() !== ui.Button.OK) return;
  var vals = range.getValues(), out = [];
  for (var i = 0; i < vals.length; i++) out.push([vals[i][0] === '' ? '' : nmGemini_(r.getResponseText() + '\n\nInput:\n' + vals[i][0], 0.5)]);
  range.offset(0, range.getNumColumns(), vals.length, 1).setValues(out);
}
