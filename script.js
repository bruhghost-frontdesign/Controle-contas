// Controle Contas v2.1 - Gás mês a mês + Comprovante + Sem PIX
let contas = JSON.parse(localStorage.getItem('contas_v2_gas')||'[]');
let anoAtual = new Date().getFullYear();
let mesAtual = new Date().getMonth();

function salvar(){ localStorage.setItem('contas_v2_gas', JSON.stringify(contas)); }

function mudarMes(d){
  mesAtual+=d;
  if(mesAtual>11){mesAtual=0;anoAtual++;}
  if(mesAtual<0){mesAtual=11;anoAtual--;}
  render();
}
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
  const ref = document.getElementById('fRef').value.trim();
  const vencInput = document.getElementById('fVenc').value;
  const valorInput = document.getElementById('fValor').value;
  const cat = document.getElementById('fCat').value;
  const fileInput = document.getElementById('fComprovante');

  if(!nome) return alert('Digite o nome! Ex: Gás Naturgy');
  if(!vencInput) return alert('Selecione o vencimento!');
  if(!valorInput) return alert('Digite o valor!');

  let dataVenc = new Date(vencInput+'T12:00:00');
  let valor = parseFloat(valorInput.replace(',','.'));

  const salvarConta = (base64)=>{
    contas.push({
      id: Date.now()+Math.random(),
      nome: nome,
      ref: ref || `${dataVenc.getMonth()+1}/${dataVenc.getFullYear()}`,
      valor: valor,
      diaVenc: dataVenc.getDate(),
      mes: dataVenc.getMonth(),
      ano: dataVenc.getFullYear(),
      vencISO: vencInput,
      vencBR: dataVenc.toLocaleDateString('pt-BR'),
      categoria: cat,
      comprovante: base64,
      quitado: false
    });
    salvar(); render();
    document.getElementById('fNome').value='';
    document.getElementById('fRef').value='';
    document.getElementById('fValor').value='';
    document.getElementById('fComprovante').value='';
    alert(`Conta salva só em ${dataVenc.toLocaleDateString('pt-BR',{month:'long', year:'numeric'})}! Use o botão Replicar para o próximo mês.`);
  };

  if(fileInput.files[0]){
    let reader = new FileReader();
    reader.onload = e=> salvarConta(e.target.result);
    reader.readAsDataURL(fileInput.files[0]);
  } else {
    salvarConta(null);
  }
}

// BOTÃO QUE VOCÊ PEDIU - REPLICA MÊS A MÊS
function replicarConta(id){
  let original = contas.find(x=>String(x.id)===String(id));
  if(!original) return;
  
  let novoValor = prompt(`Replicar "${original.nome}" para o próximo mês?\n\nValor atual: R$ ${original.valor.toFixed(2)}\nDigite o novo valor (pode mudar, igual seu Gás):`, original.valor);
  if(novoValor===null) return;
  
  let proximoMes = new Date(original.ano, original.mes+1, original.diaVenc);
  let sugVenc = proximoMes.toISOString().slice(0,10);
  let novoVenc = prompt(`Novo vencimento (AAAA-MM-DD):`, sugVenc);
  if(novoVenc===null) return;

  let dt = new Date(novoVenc+'T12:00:00');
  if(isNaN(dt)) dt = proximoMes;

  contas.push({
    id: Date.now()+Math.random(),
    nome: original.nome,
    ref: `${dt.getMonth()+1}/${dt.getFullYear()}`,
    valor: parseFloat(novoValor.replace(',','.')) || original.valor,
    diaVenc: dt.getDate(),
    mes: dt.getMonth(),
    ano: dt.getFullYear(),
    vencISO: dt.toISOString().slice(0,10),
    vencBR: dt.toLocaleDateString('pt-BR'),
    categoria: original.categoria,
    comprovante: null,
    quitado: false
  });

  salvar();
  anoAtual = dt.getFullYear();
  mesAtual = dt.getMonth();
  render();
  alert(`Replicado para ${dt.toLocaleDateString('pt-BR',{month:'long', year:'numeric'})} com R$ ${parseFloat(novoValor.replace(',','.')).toFixed(2)}`);
}

function editarConta(id){
  let c = contas.find(x=>String(x.id)===String(id));
  if(!c) return;
  let novoValor = prompt('Novo valor:', c.valor);
  if(novoValor===null) return;
  let novoDia = prompt('Novo dia de vencimento (1-31):', c.diaVenc);
  if(novoDia===null) return;
  c.valor = parseFloat(novoValor.replace(',','.'))||c.valor;
  c.diaVenc = parseInt(novoDia)||c.diaVenc;
  salvar(); render();
}

function toggleQuitado(id){
  let c=contas.find(x=>String(x.id)===String(id));
  if(c){c.quitado=!c.quitado; salvar(); render();}
}
function remover(id){
  if(confirm('Excluir esta conta?')){
    contas=contas.filter(c=>String(c.id)!==String(id));
    salvar(); render();
  }
}
function anexar(id, input){
  let c=contas.find(x=>String(x.id)===String(id));
  if(!c||!input.files[0]) return;
  let r=new FileReader();
  r.onload=e=>{c.comprovante=e.target.result; salvar(); render();};
  r.readAsDataURL(input.files[0]);
}

// IMPORTA SEU PRINT DA NATURGY
function loadGasNaturgy(){
  if(contas.length>0 && !confirm('Importar exemplo do Gás da imagem? Isso vai adicionar 13 contas.')) return;
  const dados = [
    {ref:'10/2026', valor:45.76, venc:'2026-11-04'},
    {ref:'09/2026', valor:62.20, venc:'2026-10-05'},
    {ref:'08/2026', valor:52.92, venc:'2026-09-03'},
    {ref:'07/2026', valor:53.00, venc:'2026-08-03'},
    {ref:'06/2026', valor:57.54, venc:'2026-07-03'},
    {ref:'05/2026', valor:44.39, venc:'2026-06-03'},
    {ref:'04/2026', valor:53.53, venc:'2026-05-05'},
    {ref:'03/2026', valor:44.39, venc:'2026-04-03'},
    {ref:'02/2026', valor:46.67, venc:'2026-03-07'},
    {ref:'01/2026', valor:37.95, venc:'2026-02-03'},
    {ref:'12/2025', valor:52.04, venc:'2026-01-07'},
    {ref:'11/2025', valor:51.24, venc:'2025-12-03'},
    {ref:'10/2025', valor:31.30, venc:'2025-11-03'},
  ];
  dados.forEach(d=>{
    let dt = new Date(d.venc+'T12:00:00');
    contas.push({
      id: Date.now()+Math.random(),
      nome: 'Gás Naturgy', ref: d.ref, valor: d.valor,
      diaVenc: dt.getDate(), mes: dt.getMonth(), ano: dt.getFullYear(),
      vencISO: d.venc, vencBR: dt.toLocaleDateString('pt-BR'),
      categoria: 'Gás', comprovante: null, quitado: false
    });
  });
  salvar(); render();
}

function render(){
  const label = new Date(anoAtual, mesAtual, 1).toLocaleDateString('pt-BR',{month:'long', year:'numeric'});
  document.getElementById('mesLabel').textContent = label;
  const hojeInfo = document.getElementById('hojeInfo');
  if(hojeInfo) hojeInfo.textContent = new Date().toLocaleDateString('pt-BR');
  const titulo = document.getElementById('tituloLista');
  if(titulo) titulo.textContent = `Contas de ${label}`;

  let lista = contas.filter(c=>c.ano===anoAtual && c.mes===mesAtual);
  const filtroEl = document.getElementById('filtro');
  const filtro = filtroEl ? filtroEl.value : 'todas';
  if(filtro==='pendentes') lista = lista.filter(c=>!c.quitado);
  if(filtro==='quitadas') lista = lista.filter(c=>c.quitado);

  let total = lista.reduce((s,c)=>s+c.valor,0);
  let pend = lista.filter(c=>!c.quitado).reduce((s,c)=>s+c.valor,0);
  let pago = lista.filter(c=>c.quitado).reduce((s,c)=>s+c.valor,0);

  document.getElementById('sTotal').textContent = `R$ ${total.toFixed(2)}`;
  document.getElementById('sPendente').textContent = `R$ ${pend.toFixed(2)}`;
  document.getElementById('sPago').textContent = `R$ ${pago.toFixed(2)}`;
  document.getElementById('sQtd').textContent = lista.length;

  // Anual
  let aTotalEl = document.getElementById('aTotal');
  if(aTotalEl){
    let anoContas = contas.filter(c=>c.ano===anoAtual);
    aTotalEl.textContent = `R$ ${anoContas.reduce((s,c)=>s+c.valor,0).toFixed(2)}`;
    document.getElementById('aPago').textContent = `R$ ${anoContas.filter(c=>c.quitado).reduce((s,c)=>s+c.valor,0).toFixed(2)}`;
    document.getElementById('aFalta').textContent = `R$ ${anoContas.filter(c=>!c.quitado).reduce((s,c)=>s+c.valor,0).toFixed(2)}`;
    document.getElementById('aMedia').textContent = `R$ ${(anoContas.reduce((s,c)=>s+c.valor,0)/12).toFixed(2)}`;
    let gridAnual = document.getElementById('gridAnual');
    gridAnual.innerHTML = Array.from({length:12},(_,m)=>{
      let mc = contas.filter(c=>c.ano===anoAtual && c.mes===m);
      let tot = mc.reduce((s,c)=>s+c.valor,0);
      let nomeMes = new Date(anoAtual,m,1).toLocaleDateString('pt-BR',{month:'short'});
      return `<div class="mes-box" onclick="anoAtual=${anoAtual};mesAtual=${m};aba('mes')"><b>${nomeMes}</b><br>R$ ${tot.toFixed(0)}<br><small>${mc.length} contas</small></div>`;
    }).join('');
  }

  // Calendário simples
  let calGrid = document.getElementById('calGrid');
  if(calGrid){
    calGrid.innerHTML = lista.length===0 ? `<p style="color:#64748b;text-align:center">Nenhuma conta neste mês</p>` :
    `<div style="display:grid;grid-template-columns:repeat(7,1fr);gap:4px">` + 
    Array.from({length: new Date(anoAtual, mesAtual+1, 0).getDate()}, (_,i)=>{
      let dia = i+1;
      let contasDia = lista.filter(c=>c.diaVenc===dia);
      return `<div class="cal-day" style="border:1px solid #e2e8f0;border-radius:8px;padding:4px;min-height:50px">${dia}${contasDia.length?`<br><span style="background:#ea580c;color:#fff;font-size:9px;padding:1px 4px;border-radius:4px">${contasDia.length}</span>`:''}</div>`;
    }).join('') + `</div>`;
  }

  document.getElementById('lista').innerHTML = lista.length===0 ? `<p style="text-align:center;color:#64748b;padding:20px">Nenhuma conta neste mês.<br><small>Clique em "Importar exemplo Gás da imagem" para testar</small></p>` :
  lista.map(c=>`
    <div class="item ${c.quitado?'q':''}" style="padding:12px">
      <div style="display:flex;justify-content:space-between;align-items:start;gap:8px">
        <div>
          <b>${c.nome}</b> <small style="color:#64748b">Ref: ${c.ref}</small><br>
          <small>Venc: ${c.vencBR} • <b>R$ ${c.valor.toFixed(2)}</b> • ${c.categoria}</small><br>
          ${c.comprovante ? `<a href="${c.comprovante}" target="_blank" style="font-size:11px">📎 Ver comprovante</a>` : `<label style="font-size:11px;color:#2563eb;cursor:pointer">📎 Anexar comprovante<input type="file" style="display:none" accept="image/*,.pdf" onchange="anexar('${c.id}',this)"></label>`}
        </div>
        <div style="display:flex;flex-direction:column;gap:4px;align-items:end">
          <label style="font-size:11px;display:flex;align-items:center;gap:4px"><input type="checkbox" ${c.quitado?'checked':''} onchange="toggleQuitado('${c.id}')"> Pago</label>
          <button onclick="replicarConta('${c.id}')" style="background:#0f172a;color:#fff;border:none;padding:5px 8px;border-radius:6px;font-size:10px;font-weight:700;cursor:pointer">➕ Replicar p/ próx. mês</button>
          <div style="display:flex;gap:4px">
            <button onclick="editarConta('${c.id}')" style="padding:3px 6px;font-size:10px;background:#f1f5f9;border:1px solid #e2e8f0;border-radius:5px">✏️ Editar</button>
            <button onclick="remover('${c.id}')" style="padding:3px 6px;font-size:10px;background:#fef2f2;border:1px solid #fecaca;color:#dc2626;border-radius:5px">Excluir</button>
          </div>
        </div>
      </div>
    </div>
  `).join('');
}

function excelMes(){
  let lista = contas.filter(c=>c.ano===anoAtual && c.mes===mesAtual);
  if(lista.length===0) return alert('Nenhuma conta neste mês');
  let ws = XLSX.utils.json_to_sheet(lista.map(c=>({Nome:c.nome, Referencia:c.ref, Vencimento:c.vencBR, Valor:c.valor, Categoria:c.categoria, Pago:c.quitado?'Sim':'Não'})));
  let wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Mes");
  XLSX.writeFile(wb, `contas-${mesAtual+1}-${anoAtual}.xlsx`);
}

render();
