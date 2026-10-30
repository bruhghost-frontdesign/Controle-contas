function render(){
  const label = new Date(anoAtual, mesAtual, 1).toLocaleDateString('pt-BR',{month:'long', year:'numeric'});
  document.getElementById('mesLabel').textContent = label;
  document.getElementById('tituloLista').textContent = `Contas de ${label}`;

  let lista = contas.filter(c=>c.ano===anoAtual && c.mes===mesAtual);
  const filtro = document.getElementById('filtro').value;
  if(filtro==='pendentes') lista = lista.filter(c=>!c.quitado);
  if(filtro==='quitadas') lista = lista.filter(c=>c.quitado);

  let total = lista.reduce((s,c)=>s+c.valor,0);
  document.getElementById('sTotal').textContent = `R$ ${total.toFixed(2)}`;
  document.getElementById('sPendente').textContent = `R$ ${lista.filter(c=>!c.quitado).reduce((s,c)=>s+c.valor,0).toFixed(2)}`;
  document.getElementById('sPago').textContent = `R$ ${lista.filter(c=>c.quitado).reduce((s,c)=>s+c.valor,0).toFixed(2)}`;
  document.getElementById('sQtd').textContent = lista.length;

  document.getElementById('lista').innerHTML = lista.length===0 ? `<p style="text-align:center;color:#64748b;padding:20px">Nenhuma conta neste mês.<br>Adicione com o botão ao lado.</p>` :
  lista.map(c=>`
    <div class="item ${c.quitado?'q':''}" style="padding:12px">
      <div style="display:flex;justify-content:space-between;align-items:start">
        <div>
          <b>${c.nome}</b> <small>Ref: ${c.ref}</small><br>
          <small>Venc: ${c.vencBR} • <b>R$ ${c.valor.toFixed(2)}</b></small><br>
          ${c.comprovante ? `<a href="${c.comprovante}" target="_blank" style="font-size:11px">📎 Ver comprovante</a>` : `<label style="font-size:11px;color:#2563eb;cursor:pointer">📎 Anexar comprovante<input type="file" style="display:none" onchange="anexar('${c.id}',this)"></label>`}
        </div>
        <div style="display:flex;flex-direction:column;gap:4px;align-items:end">
          <label style="font-size:11px"><input type="checkbox" ${c.quitado?'checked':''} onchange="toggleQuitado('${c.id}')"> Pago</label>
          <button onclick="replicarConta('${c.id}')" style="background:#f1f5f9;border:1px solid #cbd5e1;padding:4px 8px;border-radius:6px;font-size:10px;font-weight:700">➕ Replicar p/ próx. mês</button>
          <div style="display:flex;gap:4px">
            <button onclick="editarConta('${c.id}')" style="padding:2px 6px;font-size:10px">✏️ Editar</button>
            <button onclick="remover('${c.id}')" style="padding:2px 6px;font-size:10px;color:#dc2626">Excluir</button>
          </div>
        </div>
      </div>
    </div>
  `).join('');
}

// NOVA FUNÇÃO - BOTÃO QUE VOCÊ PEDIU
function replicarConta(id){
  let original = contas.find(x=>String(x.id)===String(id));
  if(!original) return;
  
  let novoValor = prompt(`Replicar "${original.nome}" para o próximo mês?\n\nValor atual: R$ ${original.valor}\nDigite o novo valor (se mudou):`, original.valor);
  if(novoValor===null) return;
  
  let novoVenc = prompt(`Novo vencimento (DD/MM/AAAA):`, (()=>{ let d=new Date(original.ano, original.mes+1, original.diaVenc); return d.toLocaleDateString('pt-BR'); })());
  if(novoVenc===null) return;

  let partes = novoVenc.split('/');
  let dt = new Date(partes[2], partes[1]-1, partes[0]);

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
  alert(`Conta replicada para ${dt.toLocaleDateString('pt-BR',{month:'long', year:'numeric'})}! Vá para o próximo mês para editar se precisar.`);
  // vai automaticamente pro mês replicado
  anoAtual = dt.getFullYear();
  mesAtual = dt.getMonth();
  render();
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
