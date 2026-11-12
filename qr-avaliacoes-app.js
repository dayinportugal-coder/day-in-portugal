
(function () {
  var I18N = {
    pt: {
      crumb: "QR de avaliações",
      kicker: "Ferramenta grátis · avaliações no Google",
      h1: "QR e cartaz para pedir avaliações no Google",
      lead: "Cole o Place ID ou o link do Google Maps do seu negócio. Esta página gera, só no seu navegador, o link oficial para escrever a avaliação e um cartaz A6 pronto a imprimir para o balcão. Sem pagamento, sem conta e sem enviar o Place ID para os nossos servidores.",
      label_nome: "Nome do negócio (aparece no cartaz)",
      label_input: "Link do Google Maps ou Place ID",
      ph_input: "Cole aqui o Place ID ou o link do Google Maps",
      btn_gerar: "Gerar QR e cartaz A6",
      ok: "Cartaz pronto. Teste o link antes de imprimir, para confirmar que abre a ficha certa no Google.",
      preview_cap: "Pré-visualização do cartaz A6",
      preview_alt: "Pré-visualização do cartaz A6 com o QR para avaliação no Google",
      link_lbl: "Link para escrever a avaliação:",
      btn_open: "Abrir o link de avaliação",
      btn_copy: "Copiar o link",
      btn_copied: "Link copiado.",
      btn_copy_fail: "Não foi possível copiar. Selecione o link e copie-o manualmente.",
      btn_png: "Descarregar PNG",
      btn_pdf: "Descarregar PDF A6",
      help_sum: "Como encontrar o Place ID",
      help_1: "Abra a ficha do seu negócio no Google Maps (na pesquisa, escolha a ficha oficial, não um resultado genérico do mapa).",
      help_2: "Clique em «Partilhar» e copie o link. Se for um link curto (maps.app.goo.gl), abra-o no navegador, espere que o endereço completo apareça na barra e copie esse endereço. Cole-o no campo acima.",
      help_3: "Se o link não trouxer o Place ID, use o localizador oficial da Google: abra a ferramenta, procure o seu negócio e copie o Place ID (começa muitas vezes por «ChIJ»).",
      help_finder: "Abrir o localizador oficial de Place ID da Google",
      help_note: "Não somos o Google e esta página não está afiliada com a Google. O link gerado é o endereço público com que o Google abre o formulário «escrever avaliação». O nome e o Place ID ficam só no seu navegador, a não ser que depois se inscreva na lista de espera.",
      cta_h2: "Quer receber os pedidos de avaliação automáticos por SMS/email?",
      cta_p: "Esta ferramenta entrega o QR e o cartaz. Se quiser mensagens prontas e o envio dos pedidos de avaliação aos seus clientes, pode entrar na lista de espera do serviço completo, sem pagamento e sem compromisso, e reservar o preço de lançamento de 79 €.",
      cta_link: "Ver a lista de espera em /avaliacoes-google",
      wl_negocio: "Nome do negócio",
      wl_email: "Email",
      wl_reserva: "<strong>Quero reservar o preço de lançamento</strong> (79 €), sem pagamento e sem compromisso de compra.",
      wl_aviso: "<strong>Aceito receber um único email com o aviso de lançamento</strong> deste serviço e, se o lançamento atrasar, um aviso de atraso. Não envio outras campanhas.",
      wl_btn: "Entrar na lista de espera",
      wl_privacy: "Quem trata os dados: Pedro Carvalho (Day in Portugal), <a href=\"mailto:dayinportugal@gmail.com\">dayinportugal@gmail.com</a>. O gerador de QR corre só no seu navegador e não nos envia o nome nem o Place ID. Se preencher este formulário, usamos o nome do negócio e o email só para gerir a sua reserva de preço e, se o aceitou, para lhe enviar o aviso de lançamento. Base legal: as diligências que pediu antes de um eventual contrato (RGPD, art. 6.º, n.º 1, al. b)) e, para o email de aviso, o seu consentimento (al. a)), que pode retirar a qualquer momento. Guardamos os dados até 14 dias depois do aviso de lançamento, ou até 30/06/2027 se não houver lançamento, e depois apagamo-los. Pode sair da lista, retirar o consentimento, pedir acesso, correção ou apagamento respondendo SAIR para <a href=\"mailto:dayinportugal@gmail.com\">dayinportugal@gmail.com</a>, e pode reclamar à CNPD. Mais informação: <a href=\"PRIVACY_HREF\" data-privacy-href=\"1\">https://dayinportugal.com/privacidade-servicos</a>",
      priv_lbl: "Privacidade:",
      err_empty: "Cole o Place ID ou o link do Google Maps.",
      err_short: "Este é um link curto do Google Maps. Abra-o no navegador, copie o endereço completo que aparece na barra e cole-o aqui. Se ainda não aparecer o Place ID, use o localizador oficial indicado abaixo.",
      err_name: "Para gerar o QR precisamos do Place ID, não só do nome. Siga os passos em «Como encontrar o Place ID», ou cole o link completo do Google Maps.",
      err_noid: "Neste texto não aparece um Place ID. Se colou um link, abra-o, copie o endereço completo da barra e tente de novo, ou use o localizador oficial da Google indicado abaixo.",
      err_fid: "Isso parece um identificador interno do mapa (0x…), não o Place ID. Use o localizador oficial da Google indicado abaixo, ou cole o link completo da ficha depois de o abrir no navegador.",
      poster_title: "A sua avaliação no Google",
      poster_sub: "Leave us a Google review",
      poster_scan: "Aponte a câmara do telemóvel para este código",
      poster_scan_en: "Point your phone camera at this code",
      poster_foot: "Cartaz gerado em dayinportugal.com/qr-avaliacoes",
      fallback_name: "A sua avaliação"
    },
    en: {
      crumb: "Review QR",
      kicker: "Free tool · Google reviews",
      h1: "A QR code and a poster to ask for Google reviews",
      lead: "Paste your business’s Place ID or Google Maps link. This page creates, only in your browser, the official “write a review” link and an A6 poster ready to print for the counter. No payment, no account, and the Place ID is not sent to our servers.",
      label_nome: "Business name (shown on the poster)",
      label_input: "Google Maps link or Place ID",
      ph_input: "Paste the Place ID or the Google Maps link",
      btn_gerar: "Create the QR and A6 poster",
      ok: "The poster is ready. Test the link before you print, to check that it opens the right Google listing.",
      preview_cap: "A6 poster preview",
      preview_alt: "Preview of the A6 poster with the QR code for a Google review",
      link_lbl: "Link to write the review:",
      btn_open: "Open the review link",
      btn_copy: "Copy the link",
      btn_copied: "Link copied.",
      btn_copy_fail: "Could not copy. Select the link and copy it yourself.",
      btn_png: "Download PNG",
      btn_pdf: "Download A6 PDF",
      help_sum: "How to find the Place ID",
      help_1: "Open your business listing on Google Maps (pick the official listing, not a generic map result).",
      help_2: "Click “Share” and copy the link. If it is a short link (maps.app.goo.gl), open it in the browser, wait until the full address appears in the bar, and copy that address. Paste it in the field above.",
      help_3: "If the link does not contain a Place ID, use Google’s official finder: open the tool, search for your business and copy the Place ID (it often starts with “ChIJ”).",
      help_finder: "Open Google’s official Place ID finder",
      help_note: "We are not Google and this page is not affiliated with Google. The link we generate is Google’s public “write a review” address. The name and Place ID stay in your browser, unless you later join the waitlist.",
      cta_h2: "Want review requests sent automatically by SMS or email?",
      cta_p: "This tool gives you the QR and the poster. If you also want ready-made messages and a way to send review requests to your customers, you can join the waitlist for the full service, with no payment and no obligation, and reserve the launch price of €79.",
      cta_link: "See the waitlist at /avaliacoes-google",
      wl_negocio: "Business name",
      wl_email: "Email",
      wl_reserva: "<strong>I want to reserve the launch price</strong> (€79), with no payment and no obligation to buy.",
      wl_aviso: "<strong>I agree to receive a single email with the launch notice</strong> for this service and, if the launch is delayed, a delay notice. We will not send other campaigns.",
      wl_btn: "Join the waitlist",
      wl_privacy: "Controller: Pedro Carvalho (Day in Portugal), <a href=\"mailto:dayinportugal@gmail.com\">dayinportugal@gmail.com</a>. The QR generator runs only in your browser and does not send us the name or the Place ID. If you fill in this form, we use the business name and email only to manage your price reservation and, if you agreed, to send you the launch notice. Legal basis: the steps you asked us to take before a possible contract (GDPR art. 6(1)(b)) and, for the launch email, your consent (art. 6(1)(a)), which you can withdraw at any time. We keep the data until 14 days after the launch notice, or until 30 June 2027 if there is no launch, and then we delete it. You can leave the list, withdraw consent, or ask for access, correction or erasure by replying SAIR to <a href=\"mailto:dayinportugal@gmail.com\">dayinportugal@gmail.com</a>, and you may complain to the CNPD. More information: <a href=\"PRIVACY_HREF\" data-privacy-href=\"1\">https://dayinportugal.com/privacidade-servicos</a>",
      priv_lbl: "Privacy:",
      err_empty: "Paste the Place ID or the Google Maps link.",
      err_short: "This is a short Google Maps link. Open it in the browser, copy the full address from the bar and paste it here. If a Place ID still does not appear, use the official finder below.",
      err_name: "To build the QR we need the Place ID, not only the name. Follow the steps under “How to find the Place ID”, or paste the full Google Maps link.",
      err_noid: "There is no Place ID in this text. If you pasted a link, open it, copy the full address from the bar and try again, or use Google’s official finder below.",
      err_fid: "That looks like an internal map identifier (0x…), not a Place ID. Use Google’s official finder below, or paste the full listing URL after you open it in the browser.",
      poster_title: "Leave us a Google review",
      poster_sub: "A sua avaliação no Google",
      poster_scan: "Point your phone camera at this code",
      poster_scan_en: "Aponte a câmara do telemóvel para este código",
      poster_foot: "Poster made at dayinportugal.com/qr-avaliacoes",
      fallback_name: "Your review"
    }
  };

  var lang = "pt";
  var last = { url: "", name: "", placeId: "", png: null, fileBase: "cartaz-avaliacao-google" };
  var privacyHref = (document.querySelector("[data-privacy-href]") && document.querySelector("[data-privacy-href]").getAttribute("href")) || "/privacidade-servicos";

  function t(key) { return (I18N[lang] && I18N[lang][key]) || I18N.pt[key] || ""; }

  function applyLang(next) {
    lang = next === "en" ? "en" : "pt";
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      el.textContent = t(el.getAttribute("data-i18n"));
    });
    document.querySelectorAll("[data-i18n-html]").forEach(function (el) {
      el.innerHTML = t(el.getAttribute("data-i18n-html")).replace(/PRIVACY_HREF/g, privacyHref);
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach(function (el) {
      el.setAttribute("placeholder", t(el.getAttribute("data-i18n-placeholder")));
    });
    document.querySelectorAll("[data-set-lang]").forEach(function (btn) {
      var on = btn.getAttribute("data-set-lang") === lang;
      btn.classList.toggle("is-on", on);
      btn.setAttribute("aria-pressed", on ? "true" : "false");
    });
    var img = document.getElementById("qr-preview");
    if (img) img.alt = t("preview_alt");
    if (last.placeId) {
      drawPoster(last.name, last.url, function (dataUrl) {
        last.png = dataUrl;
        if (img) img.src = dataUrl;
      });
    }
    try { history.replaceState(null, "", "?lang=" + lang + location.hash); } catch (e) {}
  }

  function extractPlaceId(raw) {
    var s = String(raw || "").trim();
    if (!s) return { kind: "empty" };
    try { s = decodeURIComponent(s); } catch (e) {}
    var compact = s.replace(/\s+/g, "");
    if (/^0x[0-9a-f]+:0x[0-9a-f]+$/i.test(compact)) {
      return { kind: "fid" };
    }
    if (/^(maps\.app\.goo\.gl|goo\.gl\/maps|g\.page)\b/i.test(compact) || /https?:\/\/(maps\.app\.goo\.gl|goo\.gl\/maps|g\.page)\//i.test(s)) {
      var fromShort = fromText(s);
      if (fromShort) return { kind: "id", id: fromShort };
      return { kind: "short" };
    }
    var id = fromText(s);
    if (id) return { kind: "id", id: id };
    if (!/^https?:\/\//i.test(s) && !/google\.[^/]*\/maps/i.test(s) && s.length <= 80) {
      return { kind: "name" };
    }
    return { kind: "none" };
  }

  function fromText(s) {
    var found = [];
    function add(v) {
      if (!v) return;
      v = String(v).trim();
      if (isPlaceId(v) && found.indexOf(v) === -1) found.push(v);
    }
    try {
      var u = new URL(s, "https://dayinportugal.com");
      ["placeid", "place_id", "query_place_id", "destination_place_id"].forEach(function (k) { add(u.searchParams.get(k)); });
      var q = u.searchParams.get("q") || u.searchParams.get("query") || "";
      var m = q.match(/place_id:([A-Za-z0-9_-]+)/i);
      if (m) add(m[1]);
      addFromData(u.href, add);
    } catch (e) {
      addFromData(s, add);
    }
    var m2 = s.match(/(?:place[_-]?id=|place_id:)([A-Za-z0-9_-]+)/i);
    if (m2) add(m2[1]);
    if (isPlaceId(s.trim())) add(s.trim());
    var loose = s.match(/\b((?:ChIJ|GhIJ|EhIJ)[A-Za-z0-9_-]{10,})\b/);
    if (loose) add(loose[1]);
    return found[0] || null;
  }

  function addFromData(s, add) {
    var re = /(?:!1s|!3m\d+!1s)((?:ChIJ|GhIJ|EhIJ)[A-Za-z0-9_-]{10,})/g;
    var m;
    while ((m = re.exec(s))) add(m[1]);
  }

  function isPlaceId(v) {
    if (!v) return false;
    if (/^0x[0-9a-f]+:0x[0-9a-f]+$/i.test(v)) return false;
    return /^(ChIJ|GhIJ|EhIJ)[A-Za-z0-9_-]{10,}$/.test(v);
  }

  function reviewUrl(id) {
    return "https://search.google.com/local/writereview?placeid=" + encodeURIComponent(id);
  }

  function showError(key) {
    var el = document.getElementById("qr-error");
    el.hidden = false;
    el.textContent = t(key);
    document.getElementById("qr-result").hidden = true;
  }

  function qrDataUrl(text, size, cb) {
    var box = document.getElementById("qr-hidden");
    box.innerHTML = "";
    var hold = document.createElement("div");
    box.appendChild(hold);
    var q = new QRCode(hold, {
      text: text,
      width: size,
      height: size,
      colorDark: "#1b2a24",
      colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel.M
    });
    setTimeout(function () {
      var canvas = hold.querySelector("canvas");
      var img = hold.querySelector("img");
      if (canvas) cb(canvas);
      else if (img) {
        var c = document.createElement("canvas");
        c.width = size; c.height = size;
        var ctx = c.getContext("2d");
        var tmp = new Image();
        tmp.onload = function () { ctx.drawImage(tmp, 0, 0, size, size); cb(c); };
        tmp.src = img.src;
      }
    }, 40);
  }

  function wrapText(ctx, text, x, y, maxWidth, lineHeight, maxLines) {
    var words = String(text || "").split(/\s+/);
    var line = "";
    var lines = [];
    for (var i = 0; i < words.length; i++) {
      var test = line ? line + " " + words[i] : words[i];
      if (ctx.measureText(test).width > maxWidth && line) {
        lines.push(line);
        line = words[i];
      } else line = test;
    }
    if (line) lines.push(line);
    if (maxLines && lines.length > maxLines) {
      lines = lines.slice(0, maxLines);
      var last = lines[maxLines - 1];
      while (ctx.measureText(last + "…").width > maxWidth && last.length) last = last.slice(0, -1);
      lines[maxLines - 1] = last + "…";
    }
    var start = y - ((lines.length - 1) * lineHeight) / 2;
    lines.forEach(function (ln, idx) { ctx.fillText(ln, x, start + idx * lineHeight); });
    return lines.length;
  }

  function drawPoster(name, url, cb) {
    var mm = 11.811; // px at 300 dpi? 1mm at 300dpi = 11.811
    // Use 150 dpi-ish for preview speed but high enough to print: 10 px/mm ≈ 254 dpi
    var px = 10;
    var w = Math.round(105 * px);
    var h = Math.round(148 * px);
    var canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    qrDataUrl(url, 900, function (qrCanvas) {
      var ctx = canvas.getContext("2d");
      ctx.fillStyle = "#f7f4ee";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#2f4a40";
      ctx.fillRect(0, 0, w, Math.round(8 * px));
      ctx.fillRect(0, h - Math.round(8 * px), w, Math.round(8 * px));

      var margin = Math.round(9 * px);
      var y = Math.round(16 * px);
      ctx.fillStyle = "#2f4a40";
      ctx.textAlign = "center";
      ctx.font = "600 " + Math.round(4.6 * px) + "px Georgia, 'Times New Roman', serif";
      wrapText(ctx, name || t("fallback_name"), w / 2, y, w - margin * 2, Math.round(6 * px), 3);
      y += Math.round(16 * px);
      ctx.font = "700 " + Math.round(6.2 * px) + "px Georgia, 'Times New Roman', serif";
      wrapText(ctx, t("poster_title"), w / 2, y, w - margin * 2, Math.round(7.2 * px), 2);
      y += Math.round(12 * px);
      ctx.font = "italic " + Math.round(4 * px) + "px Georgia, 'Times New Roman', serif";
      ctx.fillStyle = "#4a5f56";
      ctx.fillText(t("poster_sub"), w / 2, y);

      var qrSize = Math.round(68 * px);
      var qrX = Math.round((w - qrSize) / 2);
      var qrY = Math.round(52 * px);
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(qrX - 10, qrY - 10, qrSize + 20, qrSize + 20);
      ctx.strokeStyle = "#2f4a40";
      ctx.lineWidth = 2;
      ctx.strokeRect(qrX - 10.5, qrY - 10.5, qrSize + 21, qrSize + 21);
      ctx.drawImage(qrCanvas, qrX, qrY, qrSize, qrSize);

      ctx.fillStyle = "#2f4a40";
      ctx.font = "600 " + Math.round(3.8 * px) + "px system-ui, -apple-system, Segoe UI, sans-serif";
      ctx.fillText(t("poster_scan"), w / 2, qrY + qrSize + Math.round(10 * px));
      ctx.font = "italic " + Math.round(3.3 * px) + "px Georgia, 'Times New Roman', serif";
      ctx.fillStyle = "#4a5f56";
      ctx.fillText(t("poster_scan_en"), w / 2, qrY + qrSize + Math.round(15 * px));

      ctx.fillStyle = "#2f4a40";
      ctx.font = "500 " + Math.round(2.6 * px) + "px system-ui, -apple-system, Segoe UI, sans-serif";
      ctx.fillText(t("poster_foot"), w / 2, h - Math.round(11 * px));
      cb(canvas.toDataURL("image/png"));
    });
  }

  function slug(s) {
    return String(s || "cartaz-avaliacao-google")
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
      .slice(0, 40) || "cartaz-avaliacao-google";
  }

  function downloadDataUrl(dataUrl, filename) {
    var a = document.createElement("a");
    a.href = dataUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  function pngToPdfA6(dataUrl, filename) {
    var raw = atob(dataUrl.split(",")[1]);
    var bytes = new Uint8Array(raw.length);
    for (var i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
    // Convert PNG to JPEG via canvas for simpler PDF embedding
    var img = new Image();
    img.onload = function () {
      var c = document.createElement("canvas");
      c.width = img.width; c.height = img.height;
      var ctx = c.getContext("2d");
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, c.width, c.height);
      ctx.drawImage(img, 0, 0);
      var jpegUrl = c.toDataURL("image/jpeg", 0.92);
      var jraw = atob(jpegUrl.split(",")[1]);
      var jpg = new Uint8Array(jraw.length);
      for (var j = 0; j < jraw.length; j++) jpg[j] = jraw.charCodeAt(j);
      var pageW = 297.64, pageH = 419.53; // A6 in points
      var imgObj = "<<" +
        "/Type /XObject /Subtype /Image /Width " + c.width +
        " /Height " + c.height + " /ColorSpace /DeviceRGB /BitsPerComponent 8 " +
        "/Filter /DCTDecode /Length " + jpg.length + ">>";
      var streamStart = 0;
      function obj(n, body) { return n + " 0 obj\n" + body + "\nendobj\n"; }
      var parts = [];
      parts.push("%PDF-1.4\n%\xE2\xE3\xCF\xD3\n");
      var xref = [];
      function push(s) {
        if (typeof s === "string") {
          var out = "";
          for (var k = 0; k < s.length; k++) out += s[k];
          parts.push(s);
        } else parts.push(s);
      }
      // We'll build binary later
      var objects = [];
      objects[1] = "<< /Type /Catalog /Pages 2 0 R >>";
      objects[2] = "<< /Type /Pages /Kids [3 0 R] /Count 1 >>";
      objects[3] = "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 " + pageW + " " + pageH + "] " +
        "/Resources << /XObject << /Im0 5 0 R >> >> /Contents 4 0 R >>";
      objects[4] = "<< /Length 46 >>\nstream\nq " + pageW + " 0 0 " + pageH + " 0 0 cm /Im0 Do Q\nendstream";
      objects[5] = imgObj + "\nstream";
      // assemble
      var encoder = function (str) {
        var a = new Uint8Array(str.length);
        for (var i = 0; i < str.length; i++) a[i] = str.charCodeAt(i) & 255;
        return a;
      };
      var chunks = [encoder("%PDF-1.4\n%\x80\x80\x80\x80\n")];
      var offsets = [0];
      var pos = chunks[0].length;
      function addBytes(arr) { chunks.push(arr); pos += arr.length; }
      function addStr(s) { addBytes(encoder(s)); }
      for (var n = 1; n <= 5; n++) {
        offsets[n] = pos;
        if (n === 5) {
          addStr("5 0 obj\n" + imgObj + "\nstream\n");
          addBytes(jpg);
          addStr("\nendstream\nendobj\n");
        } else {
          addStr(n + " 0 obj\n" + objects[n] + "\nendobj\n");
        }
      }
      var xrefPos = pos;
      addStr("xref\n0 6\n0000000000 65535 f \n");
      for (var n = 1; n <= 5; n++) {
        var off = String(offsets[n]);
        while (off.length < 10) off = "0" + off;
        addStr(off + " 00000 n \n");
      }
      addStr("trailer << /Size 6 /Root 1 0 R >>\nstartxref\n" + xrefPos + "\n%%EOF");
      var total = 0;
      chunks.forEach(function (c) { total += c.length; });
      var out = new Uint8Array(total);
      var o = 0;
      chunks.forEach(function (c) { out.set(c, o); o += c.length; });
      var blob = new Blob([out], { type: "application/pdf" });
      var a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
    };
    img.src = dataUrl;
  }

  document.getElementById("qr-form").addEventListener("submit", function (e) {
    e.preventDefault();
    var raw = (document.getElementById("qr-input").value || "").trim();
    var name = (document.getElementById("qr-nome").value || "").trim();
    var parsed = extractPlaceId(raw);
    if (parsed.kind === "empty") return showError("err_empty");
    if (parsed.kind === "short") return showError("err_short");
    if (parsed.kind === "name") {
      if (!name) document.getElementById("qr-nome").value = raw;
      return showError("err_name");
    }
    if (parsed.kind === "fid") return showError("err_fid");
    if (parsed.kind !== "id") return showError("err_noid");
    document.getElementById("qr-error").hidden = true;
    var url = reviewUrl(parsed.id);
    last = { url: url, name: name, placeId: parsed.id, png: null, fileBase: slug(name) };
    var link = document.getElementById("qr-link");
    link.href = url;
    link.textContent = url;
    drawPoster(name, url, function (dataUrl) {
      last.png = dataUrl;
      var img = document.getElementById("qr-preview");
      img.src = dataUrl;
      img.alt = t("preview_alt");
      document.getElementById("qr-result").hidden = false;
      document.getElementById("qr-result").scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  document.getElementById("qr-open").addEventListener("click", function () {
    if (last.url) window.open(last.url, "_blank", "noopener");
  });
  document.getElementById("qr-copy").addEventListener("click", function () {
    var status = document.getElementById("qr-copy-status");
    function done(ok) {
      status.hidden = false;
      status.textContent = t(ok ? "btn_copied" : "btn_copy_fail");
    }
    if (!last.url) return;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(last.url).then(function () { done(true); }, function () { done(false); });
    } else done(false);
  });
  document.getElementById("qr-png").addEventListener("click", function () {
    if (last.png) downloadDataUrl(last.png, last.fileBase + "-a6.png");
  });
  document.getElementById("qr-pdf").addEventListener("click", function () {
    if (last.png) pngToPdfA6(last.png, last.fileBase + "-a6.pdf");
  });

  var form = document.getElementById("ag-form");
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var reserva = document.getElementById("ag-reserva");
    var aviso = document.getElementById("ag-aviso");
    var negocio = document.getElementById("ag-negocio");
    var email = document.getElementById("ag-email");
    if (!reserva || !reserva.checked) return;
    var nl = String.fromCharCode(10);
    var body = "Nome do negócio: " + (negocio && negocio.value ? negocio.value.trim() : "") +
      nl + "Email: " + (email && email.value ? email.value.trim() : "") +
      nl + nl + "Quero reservar o preço de lançamento.";
    if (aviso && aviso.checked) {
      body += nl + "Aceito receber um email com o aviso de lançamento.";
    }
    body += nl + nl + "Origem: ferramenta grátis /qr-avaliacoes";
    var url = "mailto:dayinportugal@gmail.com?subject=" +
      encodeURIComponent("Avaliações Google - reserva do preço de lançamento") + "&body=" + encodeURIComponent(body);
    window.location.href = url;
  });

  document.querySelectorAll("[data-set-lang]").forEach(function (btn) {
    btn.addEventListener("click", function () { applyLang(btn.getAttribute("data-set-lang")); });
  });

  var start = "pt";
  try {
    var q = new URLSearchParams(location.search).get("lang");
    if (q === "en" || q === "pt") start = q;
  } catch (e) {}
  applyLang(start);
})();
