let contas = JSON.parse(localStorage.getItem('contas_v2_gas')||'[]');
let templates = JSON.parse(localStorage.getItem('templates_contas')||'[]');
let logs = JSON.parse(localStorage.getItem('logs_mod')||'[]');
let users = JSON.parse(localStorage.getItem('app_users')||'[]');
let currentUser = JSON.parse(localStorage.getItem('current_user')||'null');
let anoAtual = new Date().getFullYear();
let mesAtual = new Date().getMonth();
const ADMIN_PASS = 'Sofia919521*';

function showToast(m){let t=document.getElementById('toast');if(!t)return;t.textContent=m;t.style.display='block';setTimeout(()=>t.style.display='none',2500);}
function addLog(a){let n=new Date();logs.unshift({data:n.toLocaleDateString('pt-BR'),hora:n.toLocaleTimeString('pt-BR'),acao:a});if(logs.length>200)logs.pop();localStorage.setItem('logs_mod',JSON.stringify(logs));}
function salvar(){localStorage.setItem('contas_v2_gas',JSON.stringify(contas));localStorage.setItem('templates_contas',JSON.stringify(templates));}
function mostrarLogin(){document.getElementById('formLogin').style.display='block';document.getElementById('formCadastro').style.display='none';document.getElementById('formEsqueci').style.display='none';}
function mostrarCadastro(){document.getElementById('formLogin').style.display='none';document.getElementById('formCadastro').style.display='block';document.getElementById('formEsqueci').style.display='none';}
function mostrarEsqueci(){document.getElementById('formLogin').style.display='none';document.getElementById('formCadastro').style.display='none';document.getElementById('formEsqueci').style.display='block';}
function fazerCadastro(){
  let user=document.getElementById('cadUser').value.trim();
  let email=document.getElementById('cadEmail').value.trim().toLowerCase();
  let cel=document.getElementById('cadCel').value.trim();
  let pass=document.getElementById('cadPass').value;
  let pass2=document.getElementById('cadPass2').value;
  if(!user||!email||!cel||!pass){appAlert('Preencha todos os campos obrigatórios!','Campos faltando','⚠️');return;}
  if(pass!==pass2){appAlert('As senhas não conferem!','Erro','❌');return;}
  if(users.find(u=>u.email===email)){appAlert('E-mail já cadastrado!','Já existe','⚠️');return;}
  if(users.find(u=>u.user===user)){appAlert('Usuário já existe!','Já existe','⚠️');return;}
  users.push({user,email,cel,pass,criado:new Date().toISOString()});
  localStorage.setItem('app_users',JSON.stringify(users));
  addLog('Novo cadastro: '+user);
  appAlert('Conta criada com sucesso! Faça login agora.','Sucesso','✅');
  mostrarLogin();
}
function fazerLogin(){
  let u=document.getElementById('loginUser').value.trim().toLowerCase();
  let p=document.getElementById('loginPass').value;
  if(!u||!p){appAlert('Digite usuário e senha!','Falta info','⚠️');return;}
  if(p===ADMIN_PASS){localStorage.setItem('is_admin','true');currentUser={user:'Administrador',email:'admin',admin:true};localStorage.setItem('current_user',JSON.stringify(currentUser));addLog('Login ADMIN');entrarApp();return;}
  let found=users.find(x=>(x.user.toLowerCase()===u||x.email===u)&&x.pass===p);
  if(!found){appAlert('Usuário ou senha incorretos!','Erro no login','❌');return;}
  currentUser=found;localStorage.setItem('current_user',JSON.stringify(currentUser));addLog('Login: '+found.user);entrarApp();
}
function enviarReset(){
  let email=document.getElementById('recEmail').value.trim().toLowerCase();
  let user=users.find(u=>u.email===email);
  let msg=document.getElementById('msgReset');
  if(!user){msg.innerHTML='<span style="color:#dc2626">E-mail não encontrado</span>';return;}
  let token=Math.random().toString(36).slice(2)+Date.now();
  localStorage.setItem('reset_'+email,token);
  let link=location.href.split('?')[0]+'?reset='+token+'&email='+encodeURIComponent(email);
  msg.innerHTML='<span style="color:#16a34a">Link gerado!</span><br><small><a href="'+link+'">'+link+'</a></small>';
}
function entrarApp(){document.getElementById('telaLogin').style.display='none';document.getElementById('telaApp').style.display='block';let info=document.getElementById('userLogadoInfo');if(info)info.textContent=currentUser?currentUser.user:'';irHoje();}
function fazerLogout(){localStorage.removeItem('current_user');localStorage.removeItem('is_admin');location.reload();}
function initSelects(){
  let mesSel=document.getElementById('selMes');let anoSel=document.getElementById('selAno');
  let fMesRef=document.getElementById('fMesRef');let fAnoRef=document.getElementById('fAnoRef');
  if(mesSel&&mesSel.options.length===0){mesSel.innerHTML=Array.from({length:12},(_,i)=>'<option value="'+i+'" '+(i===mesAtual?'selected':'')+'>'+new Date(0,i).toLocaleDateString('pt-BR',{month:'long'})+'</option>').join('');anoSel.innerHTML=Array.from({length:26},(_,i)=>{let ano=2025+i;return '<option value="'+ano+'" '+(ano===anoAtual?'selected':'')+'>'+ano+'</option>';}).join('');}
  if(fMesRef&&fMesRef.options.length===0){fMesRef.innerHTML=Array.from({length:12},(_,i)=>'<option value="'+(i+1)+'" '+(i===mesAtual?'selected':'')+'>'+String(i+1).padStart(2,'0')+' - '+new Date(0,i).toLocaleDateString('pt-BR',{month:'long'})+'</option>').join('');fAnoRef.innerHTML=Array.from({length:26},(_,i)=>{let ano=2025+i;return '<option value="'+ano+'" '+(ano===anoAtual?'selected':'')+'>'+ano+'</option>';}).join('');let rep=document.getElementById('fRepetir');if(rep){rep.onchange=function(){document.getElementById('fRepetirCustom').style.display=this.value==='custom'?'block':'none';};}}
}
function irParaMesAno(){anoAtual=parseInt(document.getElementById('selAno').value);mesAtual=parseInt(document.getElementById('selMes').value);render();}
function mudarMes(d){mesAtual+=d;if(mesAtual>11){mesAtual=0;anoAtual++;}if(mesAtual<0){mesAtual=11;anoAtual--;}render();}
function irHoje(){anoAtual=new Date().getFullYear();mesAtual=new Date().getMonth();render();}
function aba(t){document.getElementById('abaMes').style.display=t==='mes'?'block':'none';document.getElementById('abaCal').style.display=t==='cal'?'block':'none';document.getElementById('abaAnual').style.display=t==='anual'?'block':'none';document.getElementById('abaLog').style.display=t==='log'?'block':'none';document.querySelectorAll('.tab').forEach(el=>el.classList.remove('ativo'));let id=t==='mes'?'tMes':t==='cal'?'tCal':t==='anual'?'tAnual':'tLog';let el=document.getElementById(id);if(el)el.classList.add('ativo');render();}
function addConta(){
  const nome=document.getElementById('fNome').value.trim();
  const mesRef=document.getElementById('fMesRef').value;
  const anoRef=document.getElementById('fAnoRef').value;
  const vencInput=document.getElementById('fVenc').value;
  const valorInput=document.getElementById('fValor').value;
  const cat=document.getElementById('fCat').value;
  const repetirSel=document.getElementById('fRepetir').value;
  const repetirCustom=document.getElementById('fRepetirCustom').value;
  const fileInput=document.getElementById('fComprovante');
  if(!nome){appAlert('Digite o nome da conta!','Campo obrigatório','📝');return;}
  if(!vencInput){appAlert('Selecione a data de vencimento!','Falta data','📅');return;}
  if(!valorInput){appAlert('Digite o valor!','Falta valor','💰');return;}
  let repetir=repetirSel==='custom'?parseInt(repetirCustom)||1:parseInt(repetirSel)||1;
  let dataVenc=new Date(vencInput+'T12:00:00');
  let valor=parseFloat(valorInput.replace(',','.'));
  let refStr=String(mesRef).padStart(2,'0')+'/'+anoRef;
  if(!templates.find(t=>t.nome.toLowerCase()===nome.toLowerCase())){templates.push({nome,categoria:cat});}
  const salvarConta=(base64)=>{
    for(let i=0;i<repetir;i++){let d=new Date(dataVenc);d.setMonth(d.getMonth()+i);contas.push({id:Date.now()+Math.random()+i,nome,ref:refStr,valor,diaVenc:d.getDate(),mes:d.getMonth(),ano:d.getFullYear(),vencISO:d.toISOString().slice(0,10),vencBR:d.toLocaleDateString('pt-BR'),categoria:cat,comprovante:i===0?base64:null,quitado:false});}
    salvar();addLog('Adicionou: '+nome+' R$ '+valor);render();
    document.getElementById('fValor').value='';document.getElementById('fComprovante').value='';
    showToast('Conta adicionada!');
  };
  if(fileInput.files[0]){let r=new FileReader();r.onload=e=>salvarConta(e.target.result);r.readAsDataURL(fileInput.files[0]);}else salvarConta(null);
}
function usarTemplate(nome){let t=templates.find(x=>x.nome===nome);if(!t)return;document.getElementById('fNome').value=t.nome;document.getElementById('fCat').value=t.categoria;document.getElementById('fMesRef').value=mesAtual+1;document.getElementById('fAnoRef').value=anoAtual;showToast('Usando '+nome);}
function toggleQuitado(id){let c=contas.find(x=>String(x.id)===String(id));if(c){c.quitado=!c.quitado;salvar();addLog((c.quitado?'Quitou ':'Desquitou ')+c.nome);render();showToast(c.quitado?'Pago! ✅':'Pendente');}}
function remover(id){let c=contas.find(x=>String(x.id)===String(id));contas=contas.filter(x=>String(x.id)!==String(id));salvar();addLog('Excluiu '+(c?c.nome:''));render();showToast('Excluído!');}
function loadGasNaturgy(){const dados=[{ref:'10/2026',valor:45.76,venc:'2026-11-04'},{ref:'09/2026',valor:62.20,venc:'2026-10-05'},{ref:'08/2026',valor:52.92,venc:'2026-09-03'},{ref:'07/2026',valor:53.00,venc:'2026-08-03'},{ref:'06/2026',valor:57.54,venc:'2026-07-03'},{ref:'05/2026',valor:44.39,venc:'2026-06-03'},{ref:'04/2026',valor:53.53,venc:'2026-05-05'},{ref:'03/2026',valor:44.39,venc:'2026-04-03'},{ref:'02/2026',valor:46.67,venc:'2026-03-07'},{ref:'01/2026',valor:37.95,venc:'2026-02-03'},{ref:'12/2025',valor:52.04,venc:'2026-01-07'},{ref:'11/2025',valor:51.24,venc:'2025-12-03'},{ref:'10/2025',valor:31.30,venc:'2025-11-03'}];dados.forEach(d=>{let dt=new Date(d.venc+'T12:00:00');contas.push({id:Date.now()+Math.random(),nome:'Gás Naturgy',ref:d.ref,valor:d.valor,diaVenc:dt.getDate(),mes:dt.getMonth(),ano:dt.getFullYear(),vencISO:d.venc,vencBR:dt.toLocaleDateString('pt-BR'),categoria:'Gás',comprovante:null,quitado:false});});if(!templates.find(t=>t.nome==='Gás Naturgy'))templates.push({nome:'Gás Naturgy',categoria:'Gás'});salvar();render();showToast('Importado!');}
function render(){
  initSelects();
  if(currentUser){let l=document.getElementById('telaLogin');let a=document.getElementById('telaApp');if(l)l.style.display='none';if(a)a.style.display='block';}
  const label=new Date(anoAtual,mesAtual,1).toLocaleDateString('pt-BR',{month:'long',year:'numeric'});
  let mesSel=document.getElementById('selMes');if(mesSel)mesSel.value=mesAtual;
  let anoSel=document.getElementById('selAno');if(anoSel)anoSel.value=anoAtual;
  let hojeInfo=document.getElementById('hojeInfo');if(hojeInfo)hojeInfo.textContent=new Date().toLocaleDateString('pt-BR');
  let titulo=document.getElementById('tituloLista');if(titulo)titulo.textContent='Contas de '+label;
  let lista=contas.filter(c=>c.ano===anoAtual&&c.mes===mesAtual);
  let filtro=document.getElementById('filtro')?.value||'todas';
  if(filtro==='pendentes')lista=lista.filter(c=>!c.quitado);
  if(filtro==='quitadas')lista=lista.filter(c=>c.quitado);
  let el;
  el=document.getElementById('sTotal');if(el)el.textContent='R$ '+lista.reduce((s,c)=>s+c.valor,0).toFixed(2);
  el=document.getElementById('sPendente');if(el)el.textContent='R$ '+lista.filter(c=>!c.quitado).reduce((s,c)=>s+c.valor,0).toFixed(2);
  el=document.getElementById('sPago');if(el)el.textContent='R$ '+lista.filter(c=>c.quitado).reduce((s,c)=>s+c.valor,0).toFixed(2);
  el=document.getElementById('sQtd');if(el)el.textContent=lista.length;
  let tmplDiv=document.getElementById('templatesSalvos');if(tmplDiv){tmplDiv.innerHTML=templates.length===0?'<small>Nenhum</small>':templates.map(t=>'<button onclick="usarTemplate(\''+t.nome+'\')" style="background:#fff;border:1px solid #cbd5e1;padding:6px 10px;border-radius:20px;font-size:11px;margin:2px">⚡ '+t.nome+'</button>').join('');}
  let datalist=document.getElementById('listaTemplates');if(datalist)datalist.innerHTML=templates.map(t=>'<option value="'+t.nome+'">').join('');
  let listaEl=document.getElementById('lista');
  if(listaEl){listaEl.innerHTML=lista.length===0?'<p style="text-align:center;color:#64748b;padding:20px">Nenhuma conta neste mês.</p>':lista.map(c=>'<div class="item '+(c.quitado?'q':'')+'" style="padding:12px"><div style="display:flex;justify-content:space-between;gap:8px"><div><b>'+c.nome+'</b> <small>Ref: '+c.ref+'</small><br><small>Venc: '+c.vencBR+' • <b>R$ '+c.valor.toFixed(2)+'</b></small></div><div style="display:flex;flex-direction:column;gap:4px;align-items:end"><label style="font-size:11px"><input type="checkbox" '+(c.quitado?'checked':'')+' onchange="toggleQuitado(\''+c.id+'\')"> Pago</label><button onclick="remover(\''+c.id+'\')" style="padding:3px 6px;font-size:10px;color:#dc2626">Excluir</button></div></div></div>').join('');}
  let aTotalEl=document.getElementById('aTotal');
  if(aTotalEl){let anoContas=contas.filter(c=>c.ano===anoAtual);aTotalEl.textContent='R$ '+anoContas.reduce((s,c)=>s+c.valor,0).toFixed(2);let aPago=document.getElementById('aPago');if(aPago)aPago.textContent='R$ '+anoContas.filter(c=>c.quitado).reduce((s,c)=>s+c.valor,0).toFixed(2);let aFalta=document.getElementById('aFalta');if(aFalta)aFalta.textContent='R$ '+anoContas.filter(c=>!c.quitado).reduce((s,c)=>s+c.valor,0).toFixed(2);let aMedia=document.getElementById('aMedia');if(aMedia)aMedia.textContent='R$ '+(anoContas.reduce((s,c)=>s+c.valor,0)/12).toFixed(2);let grid=document.getElementById('gridAnual');if(grid)grid.innerHTML=Array.from({length:12},(_,m)=>{let mc=contas.filter(c=>c.ano===anoAtual&&c.mes===m);let tot=mc.reduce((s,c)=>s+c.valor,0);let nomeMes=new Date(anoAtual,m,1).toLocaleDateString('pt-BR',{month:'short'});return '<div class="mes-box" onclick="anoAtual='+anoAtual+';mesAtual='+m+';aba(\'mes\')"><b>'+nomeMes+'</b><br>R$ '+tot.toFixed(0)+'</div>';}).join('');}
  let calGrid=document.getElementById('calGrid');if(calGrid)calGrid.innerHTML='<div style="display:grid;grid-template-columns:repeat(7,1fr);gap:4px">'+Array.from({length:new Date(anoAtual,mesAtual+1,0).getDate()},(_,i)=>{let dia=i+1;let cd=lista.filter(c=>c.diaVenc===dia);return '<div style="border:1px solid #e2e8f0;border-radius:8px;padding:4px;min-height:50px">'+dia+(cd.length?'<br><span style="background:#ea580c;color:#fff;font-size:9px;padding:1px 4px;border-radius:4px">'+cd.length+'</span>':'')+'</div>';}).join('')+'</div>';
  let logDiv=document.getElementById('logLista');if(logDiv){logDiv.innerHTML=logs.length===0?'<small>Nenhum log</small>':logs.map(l=>'<div class="log-item"><b>'+l.data+' '+l.hora+'</b> - '+l.acao+'</div>').join('');}
}
let deferredPrompt;window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredPrompt=e;});
function instalarPWA(){if(deferredPrompt){deferredPrompt.prompt();}else{appAlert('iPhone: compartilhar > Adicionar à Tela de Início\nAndroid: menu ⋮ > Instalar app','Como instalar','📲');}}
function verificarResetURL(){let params=new URLSearchParams(location.search);let token=params.get('reset');let email=params.get('email');if(token&&email){let saved=localStorage.getItem('reset_'+email);if(saved===token){appAlert('Use a tela de cadastro para criar nova senha com este e-mail','Reset','🔑');}}}
verificarResetURL();
if(currentUser){entrarApp();}else{let l=document.getElementById('telaLogin');let a=document.getElementById('telaApp');if(l)l.style.display='flex';if(a)a.style.display='none';}
irHoje();render();
