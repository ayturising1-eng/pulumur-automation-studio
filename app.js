(function(){
  const ids=['customer','project','version','drawnBy','date','systemCount','width','opening','rearHeight','frontHeight','rayCount','postCount','parapet','parapetHeight','glassTrack','sideTrack','structureColor','fabric','fabricProfiles','motor','remote','led','dimmer','extras','triangleJoinery','waterStandard'];
  const $=id=>document.getElementById(id);
  const today=new Date(); $('date').value = today.toISOString().slice(0,10);
  function formData(){ const o={}; ids.forEach(id=>o[id]=$(id).value); return o; }
  function refreshComputed(page1){ if(!$('rayCount').value.trim()) $('rayCount').placeholder = page1.rayCountsString || 'otomatik'; if(!$('postCount').value.trim()) $('postCount').placeholder = page1.totalPostsString; $('statusText').textContent=`Hazır: ${page1.page1Widths.join(' + ')} mm, ray ${page1.rayCountsString}, dikme ${page1.totalPostsString}`; }
  function render(){
    const page1=window.PLMRBridge.buildPage1Data(formData()); refreshComputed(page1);
    const model=window.PLMRGeometry.buildModel(page1); const ex=model.extents; const pad=20; const w=Math.max(800, ex.maxX-ex.minX+pad*2); const h=Math.max(600, ex.maxY-ex.minY+pad*2);
    let svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="100%" height="100%">`;
    svg+='<rect x="0" y="0" width="100%" height="100%" fill="#ffffff"/>';
    const colorMap={3:'#16c05c',5:'#4169e1',6:'#ff00ff',7:'#111',8:'#777'};
    for(const e of model.entities){
      if(e.type==='line') svg+=`<line x1="${e.x1+pad}" y1="${e.y1+pad}" x2="${e.x2+pad}" y2="${e.y2+pad}" stroke="${colorMap[e.color]||'#111'}" stroke-width="2" />`;
      else if(e.type==='rect') svg+=`<rect x="${e.x+pad}" y="${e.y+pad}" width="${e.w}" height="${e.h}" fill="none" stroke="${colorMap[e.color]||'#111'}" stroke-width="2" />`;
      else if(e.type==='text') svg+=`<text class="svgtext" x="${e.x+pad}" y="${e.y+pad}" font-size="${e.h}" fill="${colorMap[e.color]||'#111'}">${String(e.value).replace(/&/g,'&amp;')}</text>`;
    }
    svg+='</svg>'; $('preview').innerHTML=svg; return {page1,model};
  }
  function generate(){ try{ const {page1,model}=render(); const dxf=window.PLMRDXF.makeDxf(model); const stamp=(page1.project||'pergo-rise').replace(/[^a-z0-9_-]+/gi,'-'); window.PLMRDXF.download(`${stamp}-v8_3.dxf`, dxf); } catch(err){ alert('DXF oluşturma hatası: '+err.message); console.error(err); } }
  $('previewBtn').addEventListener('click', render); $('generateBtn').addEventListener('click', generate); $('resetBtn').addEventListener('click', ()=>location.reload());
  ids.forEach(id=>$(id).addEventListener('input', ()=>{ try{render();}catch(e){} })); ids.forEach(id=>$(id).addEventListener('change', ()=>{ try{render();}catch(e){} }));
  $('helpBtn').addEventListener('click', ()=>{ $('helpContent').textContent = window.PLMRBridge.helpText; $('helpDialog').showModal(); });
  $('calcBtn').addEventListener('click', ()=> $('calculatorDialog').showModal());
  $('calcComputeBtn').addEventListener('click', ()=>{
    const res = window.PLMRBridge.computeCalculator($('calcAngle').value,$('calcOpening').value,$('calcRear').value,$('calcFront').value);
    $('calcResult').textContent = res.map((r,i)=>r.error?`Poz ${i+1}: ${r.error}`:`Poz ${i+1}: Açı=${r.a?.toFixed?.(2)??''} Açılım=${r.o?.toFixed?.(1)??''} Arka=${r.r?.toFixed?.(1)??''} Ön=${r.f?.toFixed?.(1)??''}`).join(' | ');
    $('calcResult').dataset.results = JSON.stringify(res);
  });
  $('calcTransferBtn').addEventListener('click', ()=>{
    const res = JSON.parse($('calcResult').dataset.results||'[]'); if(!res.length) return;
    $('opening').value = res.map(r=>r.o!=null?Math.round(r.o):'').join(';'); $('rearHeight').value = res.map(r=>r.r!=null?Math.round(r.r):'').join(';'); $('frontHeight').value = res.map(r=>r.f!=null?Math.round(r.f):'').join(';'); render(); $('calculatorDialog').close();
  });
  $('calcClearBtn').addEventListener('click', ()=>{ ['calcAngle','calcOpening','calcRear','calcFront'].forEach(id=>$(id).value=''); $('calcResult').textContent='Sonuç bekleniyor.'; });
  render();
})();
