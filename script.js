let contas = JSON.parse(localStorage.getItem('contas_v2_gas')||'[]');
let templates = JSON.parse(localStorage.getItem('templates_contas')||'[]');
let anoAtual = new Date().getFullYear();
let mesAtual = new Date().getMonth();

function salvar(){ 
  localStorage.setItem('contas_v2_gas', JSON.stringify(contas));
  localStorage.setItem('templates_contas', JSON.stringify(templates));
}

function initSelects(){
  let mesSel = document.getElementById('fMesRef');
  let anoSel = document.getElementById('fAnoRef');
  if(!mesSel) return;
  mesSel.innerHTML = Array.from({length:12},(_,i)=>`<option value="${i+1}" ${i===mesAtual?'selected':''}>${String(i+1).padStart(2,'0')} - ${new Date(0,i).toLocaleDateString('pt-BR',{month:'long'})}</option>`).join('');
  anoSel.innerHTML = Array.from({length:26},(_,i)=>{let ano=2025+i; return `<option value="${ano}" ${ano===anoAtual?'selected':''}>${ano}</option>`;}).join(''); // até 2050
  document.getElementById('fRepetir').addEventListener('change', function(){
    document.getElementById('fRepetirCustom').style.display = this.value==='custom'?'block':'none';
  });
}

function mudarMes(d){ mesAtual+=d; if(mesAtual>11){mesAtual=0;anoAtual++;} if(mesAtual<0){mesAtual=11;anoAtual--;} render(); }
function irHoje(){ anoAtual=new Date().getFullYear(); mesAtual=new Date().getMonth(); render(); }
function aba(t){
  document.getElementById('abaMes').style.display=t==='mes'?'block':'none';
  document.getElementById('abaCal').style.display=t==='cal'?'block':'none';
  document.getElementById('abaAnual').style.display=t==='anual'?'block':'none';
  document.querySelectorAll('.tab').forEach(el=>el.classList.remove('ativo'));
  if(t==='mes') document.getElementById('tMes').classList.add('ativo');
  if(t==='cal') document.getElementById('tCal').classList.add('ativo');
  if(t==='anual') document.getElementById('tAnual').classList.add('ativo');
  render();
}

function addConta(){
  const nome = document.getElementById('fNome').value.trim();
  const mesRef = document.getElementById('fMesRef').value;
  const anoRef = document.getElementById('fAnoRef').value;
  const vencInput = document.getElementById('fVenc').value;
  const valorInput = document.getElementById('fValor').value;
  const cat = document.getElementById('fCat').value;
  const repetirSel = document.getElementById('fRepetir').value;
  const repetirCustom = document.getElementById('fRepetirCustom').value;
  const fileInput = document.getElementById('fComprovante');

  if(!nome) return alert('Digite o nome!');
  if(!vencInput) return alert('Selecione o vencimento!');
  if(!valorInput) return alert('Digite o valor!');

  let repetir = repetirSel==='custom' ? parseInt(repetirCustom)||1 : parseInt(repetirSel)||1;
  let dataVenc = new Date(vencInput+'T12:00:00');
  let valor = parseFloat(valorInput.replace(',','.'));
  let refStr = `${String(mesRef).padStart(2,'0')}/${anoRef}`;

  // SALVA COMO TEMPLATE - para não precisar cadastrar de novo
  if(!templates.find(t=>t.nome.toLowerCase()===nome.toLowerCase())){
    templates.push({nome, categoria:cat});
  }

  const salvarConta = (base64)=>{
    for(let i=0;i<repetir;i++){
      let d = new Date(dataVenc); d.setMonth(d.getMonth()+i);
      contas.push({
        id: Date.now()+Math.random()+i,
        nome, ref: refStr, valor,
        diaVenc: d.getDate(), mes: d.getMonth(), ano: d.getFullYear(),
        vencISO: d.toISOString().slice(0,10), vencBR: d.toLocaleDateString('pt-BR'),
        categoria: cat, comprovante: i===0?base64:null, quitado:false
      });
    }
    salvar(); render();
    document.getElementById('fValor').value='';
    document.getElementById('fComprovante').value='';
    alert(repetir===1 ? `Salvo só em ${dataVenc.toLocaleDateString('pt-BR',{month:'long', year:'numeric'})} (Ref ${refStr})!` : `Criado para ${repetir} meses!`);
  };

  if(fileInput.files[0]){
    let r=new FileReader(); r.onload=e=>salvarConta(e.target.result); r.readAsDataURL(fileInput.files[0]);
  } else salvarConta(null);
}

function usarTemplate(nome){
  let t = templates.find(x=>x.nome===nome);
  if(!t) return;
  document.getElementById('fNome').value = t.nome;
  document.getElementById('fCat').value = t.categoria;
  document.getElementById('fMesRef').value = mesAtual+1;
  document.getElementById('fAnoRef').value = anoAtual;
  // já foca no vencimento
  document.getElementById('fVenc').focus();
}

function replicarConta(id){
  let original = contas.find(x=>String(x.id)===String(id));
  if(!original) return;
  let novoValor = prompt(`Replicar "${original.nome}" (Ref ${original.ref})?\nValor atual: R$ ${original.valor.toFixed(2)}\nNovo valor:`, original.valor);
  if(novoValor===null) return;
  let proximoMes = new Date(original.ano, original.mes+1, original.diaVenc);
  let sug = proximoMes.toISOString().slice(0,10);
  let novoVenc = prompt(`Novo vencimento:`, sug);
  if(novoVenc===null) return;
  let dt = new Date(novoVenc+'T12:00:00');
  contas.push({
    id: Date.now()+Math.random(),
    nome: original.nome, ref: `${String(dt.getMonth()+1).padStart(2,'0')}/${dt.getFullYear()}`,
    valor: parseFloat(novoValor.replace(',','.'))||original.valor,
    diaVenc: dt.getDate(), mes: dt.getMonth(), ano: dt.getFullYear(),
    vencISO: dt.toISOString().slice(0,10), vencBR: dt.toLocaleDateString('pt-BR'),
    categoria: original.categoria, comprovante:null, quitado:false
  });
  salvar(); anoAtual=dt.getFullYear(); mesAtual=dt.getMonth(); render();
}

function editarConta(id){ let c=contas.find(x=>String(x.id)===String(id)); if(!c) return; let v=prompt('Novo valor:',c.valor); if(v===null) return; let d=prompt('Novo dia:',c.diaVenc); if(d===null) return; c.valor=parseFloat(v.replace(',','.'))||c.valor; c.diaVenc=parseInt(d)||c.diaVenc; salvar(); render(); }
function toggleQuitado(id){ let c=contas.find(x=>String(x.id)===String(id)); if(c){c.quitado=!c.quitado; salvar(); render();} }
function remover(id){ if(confirm('Excluir?')){ contas=contas.filter(c=>String(c.id)!==String(id)); salvar(); render(); } }
function anexar(id,input){ let c=contas.find(x=>String(x.id)===String(id)); if(!c||!input.files[0]) return; let r=new FileReader(); r.onload=e=>{c.comprovante=e.target.result; salvar(); render();}; r.readAsDataURL(input.files[0]); }

function loadGasNaturgy(){
  if(!confirm('Importar Gás do seu print? (13 contas)')) return;
  const dados=[{ref:'10/2026',valor:45.76,venc:'2026-11-04'},{ref:'09/2026',valor:62.20,venc:'2026-10-05'},{ref:'08/2026',valor:52.92,venc:'2026-09-03'},{ref:'07/2026',valor:53.00,venc:'2026-08-03'},{ref:'06/2026',valor:57.54,venc:'2026-07-03'},{ref:'05/2026',valor:44.39,venc:'2026-06-03'},{ref:'04/2026',valor:53.53,venc:'2026-05-05'},{ref:'03/2026',valor:44.39,venc:'2026-04-03'},{ref:'02/2026',valor:46.67,venc:'2026-03-07'},{ref:'01/2026',valor:37.95,venc:'2026-02-03'},{ref:'12/2025',valor:52.04,venc:'2026-01-07'},{ref:'11/2025',valor:51.24,venc:'2025-12-03'},{ref:'10/2025',valor:31.30,venc:'2025-11-03'}];
  dados.forEach(d=>{let dt=new Date(d.venc+'T12:00:00'); contas.push({id:Date.now()+Math.random(),nome:'Gás Naturgy',ref:d.ref,valor:d.valor,diaVenc:dt.getDate(),mes:dt.getMonth(),ano:dt.getFullYear(),vencISO:d.venc,vencBR:dt.toLocaleDateString('pt-BR'),categoria:'Gás',comprovante:null,quitado:false});});
  if(!templates.find(t=>t.nome==='Gás Naturgy')) templates.push({nome:'Gás Naturgy',categoria:'Gás'});
  salvar(); render();
}

function render(){
  initSelects();
  const label=new Date(anoAtual,mesAtual,1).toLocaleDateString('pt-BR',{month:'long',year:'numeric'});
  document.getElementById('mesLabel').textContent=label;
  const hojeInfo=document.getElementById('hojeInfo'); if(hojeInfo) hojeInfo.textContent=new Date().toLocaleDateString('pt-BR');
  const titulo=document.getElementById('tituloLista'); if(titulo) titulo.textContent=`Contas de ${label}`;

  let lista=contas.filter(c=>c.ano===anoAtual && c.mes===mesAtual);
  const filtro=document.getElementById('filtro')?.value||'todas';
  if(filtro==='pendentes') lista=lista.filter(c=>!c.quitado);
  if(filtro==='quitadas') lista=lista.filter(c=>c.quitado);

  document.getElementById('sTotal').textContent=`R$ ${lista.reduce((s,c)=>s+c.valor,0).toFixed(2)}`;
  document.getElementById('sPendente').textContent=`R$ ${lista.filter(c=>!c.quitado).reduce((s,c)=>s+c.valor,0).toFixed(2)}`;
  document.getElementById('sPago').textContent=`R$ ${lista.filter(c=>c.quitado).reduce((s,c)=>s+c.valor,0).toFixed(2)}`;
  document.getElementById('sQtd').textContent=lista.length;

  // Templates - botão rápido
  let tmplDiv=document.getElementById('templatesSalvos');
  let datalist=document.getElementById('listaTemplates');
  if(tmplDiv){
    tmplDiv.innerHTML=templates.length===0?`<small>Nenhum ainda. Adicione Gás uma vez.</small>`:
    templates.map(t=>`<button onclick="usarTemplate('${t.nome}')" style="background:#fff;border:1px solid #cbd5e1;padding:6px 10px;border-radius:20px;font-size:11px;margin:2px">⚡ ${t.nome}</button>`).join('');
  }
  if(datalist) datalist.innerHTML=templates.map(t=>`<option value="${t.nome}">`).join('');

  document.getElementById('lista').innerHTML=lista.length===0?`<p style="text-align:center;color:#64748b;padding:20px">Nenhuma conta neste mês.</p>`:
  lista.map(c=>`
    <div class="item ${c.quitado?'q':''}" style="padding:12px">
      <div style="display:flex;justify-content:space-between;gap:8px">
        <div><b>${c.nome}</b> <small>Ref: ${c.ref}</small><br><small>Venc: ${c.vencBR} • <b>R$ ${c.valor.toFixed(2)}</b></small><br>
        ${c.comprovante?`<a href="${c.comprovante}" target="_blank" style="font-size:11px">📎 Ver comprovante</a>`:`<label style="font-size:11px;color:#2563eb;cursor:pointer">📎 Anexar<input type="file" style="display:none" onchange="anexar('${c.id}',this)"></label>`}</div>
        <div style="display:flex;flex-direction:column;gap:4px;align-items:end">
          <label style="font-size:11px"><input type="checkbox" ${c.quitado?'checked':''} onchange="toggleQuitado('${c.id}')"> Pago</label>
          <button onclick="replicarConta('${c.id}')" style="background:#0f172a;color:#fff;border:none;padding:5px 8px;border-radius:6px;font-size:10px;font-weight:700">➕ Replicar p/ próx. mês</button>
          <div style="display:flex;gap:4px"><button onclick="editarConta('${c.id}')" style="padding:3px 6px;font-size:10px">✏️</button><button onclick="remover('${c.id}')" style="padding:3px 6px;font-size:10px;color:#dc2626">X</button></div>
        </div>
      </div>
    </div>
  `).join('');

  let aTotalEl=document.getElementById('aTotal');
  if(aTotalEl){
    let anoContas=contas.filter(c=>c.ano===anoAtual);
    aTotalEl.textContent=`R$ ${anoContas.reduce((s,c)=>s+c.valor,0).toFixed(2)}`;
    document.getElementById('aPago').textContent=`R$ ${anoContas.filter(c=>c.quitado).reduce((s,c)=>s+c.valor,0).toFixed(2)}`;
    document.getElementById('aFalta').textContent=`R$ ${anoContas.filter(c=>!c.quitado).reduce((s,c)=>s+c.valor,0).toFixed(2)}`;
    document.getElementById('aMedia').textContent=`R$ ${(anoContas.reduce((s,c)=>s+c.valor,0)/12).toFixed(2)}`;
    document.getElementById('gridAnual').innerHTML=Array.from({length:12},(_,m)=>{let mc=contas.filter(c=>c.ano===anoAtual && c.mes===m); let tot=mc.reduce((s,c)=>s+c.valor,0); let nomeMes=new Date(anoAtual,m,1).toLocaleDateString('pt-BR',{month:'short'}); return `<div class="mes-box" onclick="anoAtual=${anoAtual};mesAtual=${m};aba('mes')" style="cursor:pointer"><b>${nomeMes}</b><br>R$ ${tot.toFixed(0)}<br><small>${mc.length}</small></div>`;}).join('');
  }
  let calGrid=document.getElementById('calGrid');
  if(calGrid) calGrid.innerHTML=`<div style="display:grid;grid-template-columns:repeat(7,1fr);gap:4px">`+Array.from({length:new Date(anoAtual,mesAtual+1,0).getDate()},(_,i)=>{let dia=i+1; let cd=lista.filter(c=>c.diaVenc===dia); return `<div style="border:1px solid #e2e8f0;border-radius:8px;padding:4px;min-height:50px">${dia}${cd.length?`<br><span style="background:#ea580c;color:#fff;font-size:9px;padding:1px 4px;border-radius:4px">${cd.length}</span>`:''}</div>`;}).join('')+`</div>`;
}

function excelMes(){ let lista=contas.filter(c=>c.ano===anoAtual && c.mes===mesAtual); if(!lista.length) return alert('Nenhuma conta'); let ws=XLSX.utils.json_to_sheet(lista.map(c=>({Nome:c.nome,Ref:c.ref,Venc:c.vencBR,Valor:c.valor,Categoria:c.categoria,Pago:c.quitado?'Sim':'Não'}))); let wb=XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb,ws,"Mes"); XLSX.writeFile(wb,`contas-${mesAtual+1}-${anoAtual}.xlsx`); }

render();
