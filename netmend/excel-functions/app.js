function idx(l){return LANGS.indexOf(l)}
function translate(f,from,to){
  if(from===to)return f;var fi=idx(from),ti=idx(to),map={};
  FN.forEach(function(r){var k=r[fi].toUpperCase();if(!map[k])map[k]=r[ti]});
  var out='',i=0,unknown=[];
  while(i<f.length){var ch=f[i];
    if(ch==='"'){var j=f.indexOf('"',i+1);if(j<0)j=f.length-1;out+=f.slice(i,j+1);i=j+1;continue}
    var m=f.slice(i).match(/^[A-Za-zÀ-ÿ_][A-Za-zÀ-ÿ0-9_.]*/);
    if(m){var w=m[0],nx=f.slice(i+w.length).match(/^\s*\(/);var W=w.toUpperCase();
      if(nx){if(map[W])out+=map[W];else{out+=w;if(!/^[A-Z]{1,3}[0-9]+$/.test(W))unknown.push(w)}}
      else{var bi=BOOL[from].indexOf(W);out+=bi>=0?BOOL[to][bi]:w}
      i+=w.length;continue}
    var en2o=from==='en'&&to!=='en',o2en=from!=='en'&&to==='en';
    if(ch===','&&en2o){out+=';';i++;continue}
    if(ch==='.'&&en2o&&/\d/.test(f[i-1]||'')&&/\d/.test(f[i+1]||'')){out+=',';i++;continue}
    if(ch===','&&o2en&&/\d/.test(f[i-1]||'')&&/\d/.test(f[i+1]||'')){out+='.';i++;continue}
    if(ch===';'&&o2en){out+=',';i++;continue}
    out+=ch;i++}
  return {f:out,unknown:unknown};
}
function fill(sel,def){LANGS.forEach(function(l){var o=document.createElement('option');o.value=l;o.textContent=LNAME[l];sel.appendChild(o)});sel.value=def}
fill(document.getElementById('from'),'en');fill(document.getElementById('to'),'pt');
function run(){var r=translate(document.getElementById('f').value,document.getElementById('from').value,document.getElementById('to').value);
  document.getElementById('res').value=r.f;document.getElementById('unk').textContent=r.unknown&&r.unknown.length?'Not in our list (left unchanged): '+r.unknown.join(', '):''}
['f','from','to'].forEach(function(i){document.getElementById(i).addEventListener('input',run)});
document.getElementById('swap').addEventListener('click',function(){var a=document.getElementById('from'),b=document.getElementById('to'),t=a.value;a.value=b.value;b.value=t;document.getElementById('f').value=document.getElementById('res').value;run()});
document.getElementById('cp').addEventListener('click',function(){navigator.clipboard&&navigator.clipboard.writeText(document.getElementById('res').value);this.textContent='Copied ✓'});
run();
// table
var tb=document.getElementById('tb'),q=document.getElementById('q');
function table(){var s=q.value.trim().toUpperCase();tb.innerHTML='';FN.forEach(function(r){if(s&&!r.join(' ').toUpperCase().includes(s))return;var tr=document.createElement('tr');r.forEach(function(v,i){var td=document.createElement('td');td.textContent=v;if(i<6)td.style.fontFamily='monospace';tr.appendChild(td)});tb.appendChild(tr)})}
q.addEventListener('input',table);table();
