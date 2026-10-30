const EMAILJS_PUBLIC_KEY = 'SUA_PUBLIC_KEY';
const EMAILJS_SERVICE_ID = 'SUA_SERVICE_ID';
const EMAILJS_TEMPLATE_ID = 'SUA_TEMPLATE_ID';

var contas = JSON.parse(localStorage.getItem('contas_GH_V7') || '[]');
var pagamentos = JSON.parse(localStorage.getItem('pag_GH_V7') || '{}');
var config = JSON.parse(localStorage.getItem('config_GH_V7') || '{"email":"","horaEmail":"09:00","ntfy":""}');
var view = new Date();
var deferredPrompt = null;
if(window.emailjs && EMAILJS_PUBLIC_KEY!=='SUA_PUBLIC_KEY'){ emailjs.init(EMAILJS_PUBLIC_KEY); }
function chavePag(id,ano,mes){return ano+'-'+mes+'-'+id;}
function salvar(){localStorage.setItem('contas_GH_V7',JSON.stringify(contas));localStorage.setItem('pag_GH_V7',JSON.stringify(pagamentos));localStorage.setItem('config_GH_V7',JSON.stringify(config));}
function mudarMes(d){view.setMonth(view.getMonth()+d);updHeader();render();renderCal();renderAnual();}
function irHoje(){view=new Date();updHeader();render();renderCal();renderAnual();}
function updHeader(){var meses=['Janeiro','Fevereiro','Marco','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];document.getElementById('mesLabel').textContent=meses[view.getMonth()]+' de '+view.getFullYear();document.getElementById('tituloLista').textContent='Contas de '+meses[view.getMonth()];document.getElementById('hojeInfo').textContent=new Date().toLocaleDateString('pt-BR');}
function aba(t){document.getElementById('abaMes').style.display=t==='mes'?'block':'none';document.getElementById('abaCal').style.display=t==='cal'?'block':'none';document.getElementById('abaAnual').style.display=t==='anual'?'block':'none';document.getElementById('abaNotif').style.display=t==='notif'?'block':'none';document.getElementById('tMes').classList.toggle('ativo',t==='mes');document.getElementById('tCal').classList.toggle('ativo',t==='cal');document.getElementById('tAnual').classList.toggle('ativo',t==='anual');document.getElementById('tNotif').classList.toggle('ativo',t==='notif'); if(t==='cal')renderCal(); if(t==='anual')renderAnual();}
function toggleTipo(){document.getElementById('boxParcelas').style.display=document.getElementById('fTipo').value==='parcelada'?'block':'none';}
window.addConta=function(){var nome=document.getElementById('fNome').value.trim();var dia=parseInt(document.getElementById('fDia').value);var valor=parseFloat(document.getElementById('fValor').value);var tipo=document.getElementById('fTipo').value;var cat=document.getElementById('fCat').value;var pix=document.getElementById('fPix').value.trim();var qtdParc=parseInt(document.getElementById('fParcelas').value)||12;var parcAtual=parseInt(document.getElementById('fParcelaAtual').value)||1;if(!nome){alert('Nome obrigatorio');return;}if(isNaN(dia)||dia<1||dia>31){alert('Dia 1-31');return;}var obj={id:Date.now()+Math.random(),nome:nome,diaVenc:dia,valor:isNaN(valor)?0:valor,tipo:tipo,categoria:cat,pix:pix};if(tipo==='parcelada'){obj.totalParcelas=qtdParc;obj.parcelaInicio=parcAtual;obj.anoInicio=view.getFullYear();obj.mesInicio=view.getMonth();}if(tipo==='unica'){obj.anoUnico=view.getFullYear();obj.mesUnico=view.getMonth();}contas.push(obj);salvar();document.getElementById('fNome').value='';document.getElementById('fDia').value='';document.getElementById('fValor').value='';document.getElementById('fPix').value='';render();renderCal();renderAnual();alert('Conta '+nome+' adicionada! O aviso inteligente JA vai considerar ela automaticamente.');}
window.loadPadrao=function(){var base=[{nome:'Condominio',dia:10,valor:458},{nome:'Parcela do apartamento',dia:15,valor:1850},{nome:'Parcela da moto',dia:20,valor:420},{nome:'Parcela do gas',dia:5,valor:110},{nome:'IPTU',dia:12,valor:180}];var add=0;base.forEach(function(b){if(!contas.find(function(c){return c.nome.toLowerCase()===b.nome.toLowerCase()})){contas.push({id:Date.now()+Math.random(),nome:b.nome,diaVenc:b.dia,valor:b.valor,tipo:'fixa',categoria:'Moradia',pix:''});add++;}});salvar();render();renderCal();renderAnual();}
function deveAparecerNoMes(c,ano,mes){if(c.tipo==='fixa')return true;if(c.tipo==='unica')return c.anoUnico===ano&&c.mesUnico===mes;if(c.tipo==='parcelada'){var inicio=new Date(c.anoInicio,c.mesInicio,1);var alvo=new Date(ano,mes,1);var diff=(alvo.getFullYear()-inicio.getFullYear())*12+(alvo.getMonth()-inicio.getMonth());var num=c.parcelaInicio+diff;return num>=1&&num<=c.totalParcelas;}return true;}
function getParcelaInfo(c,ano,mes){if(c.tipo!=='parcelada')return'';var inicio=new Date(c.anoInicio,c.mesInicio,1);var alvo=new Date(ano,mes,1);var diff=(alvo.getFullYear()-inicio.getFullYear())*12+(alvo.getMonth()-inicio.getMonth());var num=c.parcelaInicio+diff;return num+'/'+c.totalParcelas;}
function isQuitado(id,ano,mes){var k=chavePag(id,ano,mes);return pagamentos[k]&&pagamentos[k].quitada;}
window.quitar=function(id){var k=chavePag(id,view.getFullYear(),view.getMonth());pagamentos[k]={quitada:true,data:new Date().toISOString(),comp:pagamentos[k]?pagamentos[k].comp:null,nomeArq:pagamentos[k]?pagamentos[k].nomeArq:null};salvar();render();renderCal();renderAnual();}
window.desquitar=function(id){var k=chavePag(id,view.getFullYear(),view.getMonth());if(pagamentos[k]){pagamentos[k].quitada=false;salvar();render();renderCal();renderAnual();}}
window.remover=function(id){if(!confirm('Excluir de todos os meses?'))return;contas=contas.filter(function(c){return c.id!==id});Object.keys(pagamentos).forEach(function(k){if(k.endsWith('-'+id))delete pagamentos[k];});salvar();render();renderCal();renderAnual();}
window.anexar=function(id,input){var file=input.files[0];if(!file)return;var r=new FileReader();r.onload=function(e){var k=chavePag(id,view.getFullYear(),view.getMonth());if(!pagamentos[k])pagamentos[k]={quitada:false};pagamentos[k].comp=e.target.result;pagamentos[k].nomeArq=file.name;salvar();render();alert('Comprovante anexado!');};r.readAsDataURL(file);}
window.verComp=function(id){var k=chavePag(id,view.getFullYear(),view.getMonth());var p=pagamentos[k];if(p&&p.comp){var w=window.open();w.document.write('<img src="'+p.comp+'" style="max-width:100%">');}}
window.render=function(){
  var filtro=document.getElementById('filtro').value;var lista=document.getElementById('lista');var ano=view.getFullYear(),mes=view.getMonth();
  var visiveis=contas.filter(function(c){return deveAparecerNoMes(c,ano,mes)}).sort(function(a,b){return a.diaVenc-b.diaVenc});
  var filtradas=visiveis;if(filtro==='pendentes')filtradas=filtradas.filter(function(c){return!isQuitado(c.id,ano,mes)});if(filtro==='quitadas')filtradas=filtradas.filter(function(c){return isQuitado(c.id,ano,mes)});
  var total=0,pago=0;visiveis.forEach(function(c){total+=(c.valor||0);if(isQuitado(c.id,ano,mes))pago+=(c.valor||0);});
  document.getElementById('sTotal').textContent='R$ '+total.toLocaleString('pt-BR',{minimumFractionDigits:2});
  document.getElementById('sPendente').textContent='R$ '+(total-pago).toLocaleString('pt-BR',{minimumFractionDigits:2});
  document.getElementById('sPago').textContent='R$ '+pago.toLocaleString('pt-BR',{minimumFractionDigits:2});
  document.getElementById('sQtd').textContent=visiveis.length;
  if(filtradas.length===0){lista.innerHTML='<div style="text-align:center;padding:20px;color:#94a3b8">Nenhuma conta neste mes.</div>';return;}
  var html='';filtradas.forEach(function(c){
    var quit=isQuitado(c.id,ano,mes);var diff=(function(d){var h=new Date();if(ano!==h.getFullYear()||mes!==h.getMonth())return 99;var venc=new Date(ano,mes,d);var hojeZero=new Date(ano,mes,h.getDate());return Math.ceil((venc-hojeZero)/86400000);})(c.diaVenc);
    var classe='',badge='',texto='';if(quit){classe='q';texto='QUITADA';badge='b-quitada';}else if(diff===0){classe='hoje';texto='VENCE HOJE';badge='b-hoje';}else if(diff===1){classe='amanha';texto='VENCE AMANHA';badge='b-amanha';}else if(diff<0){classe='atraso';texto='ATRASADA '+Math.abs(diff)+'d';badge='b-atraso';}else{texto='Dia '+c.diaVenc;badge='b-ok';}
    var parcInfo=getParcelaInfo(c,ano,mes);var k=chavePag(c.id,ano,mes);
    html+='<div class="item '+classe+'"><div style="display:flex;justify-content:space-between"><div><b>'+c.nome+'</b> '+(c.tipo==='parcelada'?'<span class="badge b-parc">'+parcInfo+'</span>':'')+'</div><span class="badge '+badge+'">'+texto+'</span></div><div style="font-size:11px;color:#475569;margin:4px 0">R$ '+(c.valor||0)+' | Dia '+c.diaVenc+(parcInfo?' | '+parcInfo:'')+'</div><div style="display:flex;gap:4px;flex-wrap:wrap">'+(quit?'<button class="btn-ghost btn-s" onclick="desquitar('+c.id+')">Desfazer</button>':'<button class="btn-navy btn-s" onclick="quitar('+c.id+')">Quitar</button>')+'<label class="btn-ghost btn-s" style="cursor:pointer">Comprovante<input type=file hidden onchange="anexar('+c.id+',this)"></label><button class="btn-ghost btn-s" style="color:#dc2626" onclick="remover('+c.id+')">Excluir</button></div></div>';
  });lista.innerHTML=html;
}
function renderCal(){
  var ano=view.getFullYear(),mes=view.getMonth();var primeiro=new Date(ano,mes,1);var ultimo=new Date(ano,mes+1,0);var startDay=primeiro.getDay();var diasNoMes=ultimo.getDate();
  var html='<div style="display:grid;grid-template-columns:repeat(7,1fr);gap:4px"><div style="font-size:9px;text-align:center;color:#64748b">Dom</div><div style="font-size:9px;text-align:center;color:#64748b">Seg</div><div style="font-size:9px;text-align:center;color:#64748b">Ter</div><div style="font-size:9px;text-align:center;color:#64748b">Qua</div><div style="font-size:9px;text-align:center;color:#64748b">Qui</div><div style="font-size:9px;text-align:center;color:#64748b">Sex</div><div style="font-size:9px;text-align:center;color:#64748b">Sab</div>';
  for(var i=0;i<startDay;i++){html+='<div></div>';}
  for(var d=1;d<=diasNoMes;d++){var ehHoje=(new Date().getDate()===d&&new Date().getMonth()===mes&&new Date().getFullYear()===ano);html+='<div class="cal-day '+(ehHoje?'hoje':'')+'"><div style="font-weight:800;font-size:11px">'+d+'</div>';contas.forEach(function(c){if(!deveAparecerNoMes(c,ano,mes))return;if(c.diaVenc!==d)return;var quit=isQuitado(c.id,ano,mes);var cls=quit?'dot-pago':'dot-pend';html+='<div style="font-size:8px"><span class="cal-dot '+cls+'"></span>'+c.nome.substring(0,10)+'</div>';});html+='</div>';}
  html+='</div>';document.getElementById('calGrid').innerHTML=html;
}
function renderAnual(){
  var ano=view.getFullYear();var grid=document.getElementById('gridAnual');var mesesN=['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];var totalAno=0,pagoAno=0;var html='';
  for(var m=0;m<12;m++){var totalM=0,pagoM=0;contas.forEach(function(c){if(!deveAparecerNoMes(c,ano,m))return;totalM+=(c.valor||0);if(isQuitado(c.id,ano,m))pagoM+=(c.valor||0);});totalAno+=totalM;pagoAno+=pagoM;var perc=totalM>0?Math.round(pagoM/totalM*100):0;html+='<div class="mes-box"><div style="font-size:10px;font-weight:700;color:#64748b">'+mesesN[m]+'</div><div style="font-size:12px;font-weight:800">R$ '+pagoM.toLocaleString('pt-BR',{minimumFractionDigits:0})+' / '+totalM.toLocaleString('pt-BR',{minimumFractionDigits:0})+'</div><div style="font-size:9px">'+perc+'% pago</div></div>';}
  grid.innerHTML=html;document.getElementById('aTotal').textContent='R$ '+totalAno.toLocaleString('pt-BR',{minimumFractionDigits:2});document.getElementById('aPago').textContent='R$ '+pagoAno.toLocaleString('pt-BR',{minimumFractionDigits:2});document.getElementById('aFalta').textContent='R$ '+(totalAno-pagoAno).toLocaleString('pt-BR',{minimumFractionDigits:2});document.getElementById('aMedia').textContent='R$ '+(totalAno/12).toLocaleString('pt-BR',{minimumFractionDigits:2});
}
window.excelMes=function(){var ano=view.getFullYear(),mes=view.getMonth();var dados=contas.filter(function(c){return deveAparecerNoMes(c,ano,mes)}).map(function(c){var k=chavePag(c.id,ano,mes);var p=pagamentos[k];return{'Mes':(mes+1)+'/'+ano,'Conta':c.nome,'Valor':c.valor,'Status':p&&p.quitada?'PAGO':'PENDENTE'};});var ws=XLSX.utils.json_to_sheet(dados);var wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,ws,'Mes');XLSX.writeFile(wb,'contas_'+(mes+1)+'_'+ano+'.xlsx');}
window.excelAnual=function(){var ano=view.getFullYear();var dados=[];for(var m=0;m<12;m++){contas.forEach(function(c){if(!deveAparecerNoMes(c,ano,m))return;var k=chavePag(c.id,ano,m);var p=pagamentos[k];dados.push({'Ano':ano,'Mes':m+1,'Conta':c.nome,'Valor':c.valor,'Status':p&&p.quitada?'PAGO':'PENDENTE'});});}var ws=XLSX.utils.json_to_sheet(dados);var wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,ws,'Anual');XLSX.writeFile(wb,'anual_'+ano+'.xlsx');}
function atualizarStatusNotif(){var status=document.getElementById('statusNotif');if(!status)return;var perm=Notification?Notification.permission:'unsupported';status.textContent='Permissao: '+perm;}
window.ativarNotificacaoNavegador=function(){if(!('Notification' in window)){alert('Navegador nao suporta');return;}Notification.requestPermission().then(function(p){atualizarStatusNotif();if(p==='granted'){new Notification('🔔 Avisos ativados!',{body:'Voce recebera aviso 1 dia antes e no dia.'});}});}
window.salvarEmail=function(){var email=document.getElementById('emailUsuario').value.trim();if(!email||!email.includes('@')){alert('E-mail invalido');return;}config.email=email;salvar();alert('E-mail salvo!');}
window.salvarNtfy=function(){var topico=document.getElementById('ntfyTopico').value.trim();if(!topico){alert('Digite topico');return;}config.ntfy=topico;salvar();alert('Topico salvo!');}
function enviarNtfy(mensagem){if(!config.ntfy)return;fetch('https://ntfy.sh/'+config.ntfy,{method:'POST',body:mensagem,headers:{'Title':'Controle de Contas'}}).catch(function(){});}
function checarAvisosReais(){
  var hoje=new Date();var ano=hoje.getFullYear(),mes=hoje.getMonth(),dia=hoje.getDate();
  var pendHoje=[],pendAmanha=[];
  contas.forEach(function(c){if(!deveAparecerNoMes(c,ano,mes))return;if(isQuitado(c.id,ano,mes))return;var diff=c.diaVenc-dia;if(diff===0||diff<0)pendHoje.push(c);if(diff===1)pendAmanha.push(c);});
  if(pendHoje.length>0||pendAmanha.length>0){
    var msg='';if(pendHoje.length>0)msg+='VENCE HOJE: '+pendHoje.map(function(c){return c.nome+' R$ '+(c.valor||0)}).join(', ')+'. ';if(pendAmanha.length>0)msg+='Amanha: '+pendAmanha.map(function(c){return c.nome}).join(', ')+'.';
    if(Notification&&Notification.permission==='granted'){new Notification('💰 Contas a vencer!',{body:msg});}
    enviarNtfy(msg);
  }
}
window.testarAvisos=function(){checarAvisosReais();alert('Teste enviado! Se ativou notificacao, vai aparecer agora.');}
window.addEventListener('beforeinstallprompt',function(e){e.preventDefault();deferredPrompt=e;});
window.instalarPWA=function(){if(deferredPrompt){deferredPrompt.prompt();}else{alert('Chrome: 3 pontinhos > Adicionar a tela inicial. iPhone: compartilhar > Adicionar a tela de inicio.');}}
updHeader();render();renderCal();renderAnual();atualizarStatusNotif();
document.getElementById('emailUsuario').value=config.email||'';document.getElementById('ntfyTopico').value=config.ntfy||'';
checarAvisosReais();setInterval(checarAvisosReais,60*60*1000);
if('serviceWorker' in navigator){navigator.serviceWorker.register('sw.js').catch(function(){});}
