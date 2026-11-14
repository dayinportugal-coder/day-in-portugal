// Netmend free bank statement converter. Runs 100% in the browser with pdf.js.
pdfjsLib.GlobalWorkerOptions.workerSrc='https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js';
var RES={rows:[],tx:[]};
var DATE_RE=/^(\d{1,2}[\/.\-]\d{1,2}([\/.\-]\d{2,4})?|\d{4}-\d{2}-\d{2}|\d{1,2}\s?(jan|feb|fev|mar|apr|abr|may|mai|jun|jul|aug|ago|sep|set|oct|out|nov|dec|dez)[a-z]*\.?(\s?\d{2,4})?)$/i;
var AMT_RE=/^[-+−]?\(?[€$£]?\s?\d{1,3}([.,\s ]\d{3})*([.,]\d{2})\)?\s?(€|eur|cr|dr|d|c|-)?$/i;
function parseAmount(s,fmt){
  var t=s.replace(/[€$£\s ]|eur/gi,'');var neg=/^[-−]|\(|-$|dr$|d$/i.test(t);
  t=t.replace(/[()+−\-]|cr$|dr$|c$|d$/gi,'');
  var eu=fmt==='eu'||(fmt==='auto'&&/,\d{2}$/.test(t));
  t=eu?t.replace(/\./g,'').replace(',','.'):t.replace(/,/g,'');
  var n=parseFloat(t);if(isNaN(n))return null;return neg?-n:n;
}
async function readPdf(file){
  var buf=await file.arrayBuffer();var pdf=await pdfjsLib.getDocument({data:buf}).promise;var rows=[];
  for(var p=1;p<=pdf.numPages;p++){
    var page=await pdf.getPage(p);var tc=await page.getTextContent();var items=tc.items.filter(function(i){return i.str.trim()!==''});
    var lines=[];
    items.forEach(function(it){var x=it.transform[4],y=it.transform[5];
      var L=lines.find(function(l){return Math.abs(l.y-y)<3});if(!L){L={y:y,items:[]};lines.push(L)}L.items.push({x:x,w:it.width,s:it.str.trim()})});
    lines.sort(function(a,b){return b.y-a.y});
    lines.forEach(function(l){l.items.sort(function(a,b){return a.x-b.x});
      var cells=[],cur=null;
      l.items.forEach(function(it){if(cur&&it.x-(cur.x+cur.w)<4){cur.s+=' '+it.s;cur.w=it.x+it.w-cur.x}else{cur={x:it.x,w:it.w,s:it.s};cells.push(cur)}});
      rows.push({page:p,cells:cells.map(function(c){return c.s}),xs:cells.map(function(c){return c.x+c.w})});});
  }
  return rows;
}
var DEB=/^(d[ée]bito|debit|debits|withdrawals?|paid out|money out|sa[íi]das?|cargos?|soll|d[ée]bit|montant d[ée]bit|levantamentos?)$/i;
var CRE=/^(cr[ée]dito|credit|credits|deposits?|paid in|money in|entradas?|abonos?|haben|cr[ée]dit|montant cr[ée]dit|dep[óo]sitos?)$/i;
var BAL=/^(saldo|balance|solde|kontostand|saldo final|running balance)$/i;
function findCols(rows){
  for(var i=0;i<rows.length;i++){var r=rows[i],cols={};
    r.cells.forEach(function(c,j){var t=c.trim();if(DEB.test(t))cols.deb=r.xs[j];else if(CRE.test(t))cols.cre=r.xs[j];else if(BAL.test(t))cols.bal=r.xs[j]});
    if(cols.deb!=null&&cols.cre!=null)return cols;}
  return null;
}
function toTransactions(rows,fmt){
  var tx=[],last=null,cols=findCols(rows);
  rows.forEach(function(r){
    var c=r.cells.slice(),xs=r.xs.slice();if(!c.length)return;
    var first=c[0].split(/\s+/);var d=null;
    if(DATE_RE.test(c[0])){d=c.shift();xs.shift()}else if(first.length>1&&DATE_RE.test(first[0])){d=first[0];c[0]=first.slice(1).join(' ')}
    if(d){
      if(c.length&&DATE_RE.test(c[0])){c.shift();xs.shift()}
      var amts=[],ax=[];while(c.length&&AMT_RE.test(c[c.length-1])){amts.unshift(c.pop());ax.unshift(xs.pop())}
      var t={date:d,description:c.join(' '),amount:null,balance:null,amounts:amts.map(function(a){return parseAmount(a,fmt)})};
      if(cols&&amts.length){
        t.amounts.forEach(function(v,k){var x=ax[k],best='deb',bd=1e9;['deb','cre','bal'].forEach(function(n){if(cols[n]!=null&&Math.abs(cols[n]-x)<bd){bd=Math.abs(cols[n]-x);best=n}});
          if(best==='bal')t.balance=v;else if(best==='deb')t.amount=-Math.abs(v);else t.amount=Math.abs(v)});
      }else if(amts.length){t.amount=t.amounts[0];if(t.amounts.length>1)t.balance=t.amounts[t.amounts.length-1]}
      last=t;tx.push(t);
    }else if(last&&c.every(function(x){return !AMT_RE.test(x)})&&c.join(' ').length<90&&last.description.length<200){
      last.description+=' '+c.join(' ');
    }
  });
  return tx.filter(function(t){return t.amount!=null||t.balance!=null});
}
function csvEsc(v,sep){v=v==null?'':String(v);return /["\n\r]/.test(v)||v.indexOf(sep)>=0?'"'+v.replace(/"/g,'""')+'"':v}
function numOut(n,dec){if(n==null)return'';var s=n.toFixed(2);return dec===','?s.replace('.',','):s}
function build(){
  var mode=document.getElementById('mode').value,sep=document.getElementById('sep').value,dec=sep===';'?',':'.';
  var out=[];
  if(mode==='tx'){
    out.push(['Date','Description','Amount','Balance']);
    RES.tx.forEach(function(t){out.push([t.date,t.description.trim(),numOut(t.amount,dec),numOut(t.balance,dec)])});
  }else{out.push(['Page','Cells…']);RES.rows.forEach(function(r){out.push([r.page].concat(r.cells))})}
  return {table:out,csv:'\ufeff'+out.map(function(r){return r.map(function(v){return csvEsc(v,sep)}).join(sep)}).join('\r\n')};
}
function render(){
  var b=build(),t=document.getElementById('preview');t.innerHTML='';
  b.table.slice(0,201).forEach(function(r,i){var tr=document.createElement('tr');r.forEach(function(v){var c=document.createElement(i?'td':'th');c.textContent=v;tr.appendChild(c)});t.appendChild(tr)});
  document.getElementById('stats').textContent=(document.getElementById('mode').value==='tx'?RES.tx.length+' transactions found':RES.rows.length+' text rows')+' · '+RES.pages+' page(s). Nothing was uploaded.';
  document.getElementById('dl').disabled=false;document.getElementById('out').hidden=false;
}
async function handle(f){if(!f)return;var st=document.getElementById('stats');document.getElementById('out').hidden=false;st.textContent='Reading '+f.name+'…';
  try{RES.rows=await readPdf(f);RES.pages=RES.rows.length?RES.rows[RES.rows.length-1].page:0;RES.tx=toTransactions(RES.rows,document.getElementById('fmt').value);
    if(!RES.rows.length){st.textContent='No text found. This PDF is probably a scan (an image). Send it to us and we convert it by hand: see below.';return}
    if(!RES.tx.length)document.getElementById('mode').value='all';render();
  }catch(err){st.textContent='Could not read this PDF ('+err.message+'). If it is password-protected, open it and "print to PDF" first.'}
}
document.getElementById('file').addEventListener('change',function(e){handle(e.target.files[0])});
document.getElementById('demo').addEventListener('click',async function(){var src=this.getAttribute('data-src')||'../samples/demo-statement.pdf';var r=await fetch(src);var b=await r.blob();b.name='demo-statement.pdf';handle(b)});
['mode','sep','fmt'].forEach(function(id){document.getElementById(id).addEventListener('change',function(){if(RES.rows.length){RES.tx=toTransactions(RES.rows,document.getElementById('fmt').value);render()}})});
document.getElementById('dl').addEventListener('click',function(){var b=build();var a=document.createElement('a');a.href=URL.createObjectURL(new Blob([b.csv],{type:'text/csv;charset=utf-8'}));a.download='statement-netmend.csv';a.click()});
