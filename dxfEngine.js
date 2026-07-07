(function(){
  function num(n){ return Number(n).toFixed(4).replace(/\.?0+$/,''); }
  function pair(c,v){ return `${c}\n${v}\n`; }
  function emitLine(e){ return `0\nLINE\n8\n${e.layer||'0'}\n62\n${e.color||7}\n10\n${num(e.x1)}\n20\n${num(-e.y1)}\n30\n0\n11\n${num(e.x2)}\n21\n${num(-e.y2)}\n31\n0\n`; }
  function emitRect(e){ const x=e.x,y=e.y,w=e.w,h=e.h; return emitPolyline([{x,y},{x:x+w,y},{x:x+w,y:y+h},{x,y:y+h},{x,y}],e.layer,e.color); }
  function emitPolyline(pts,layer,color){ let s=`0\nPOLYLINE\n8\n${layer||'0'}\n62\n${color||7}\n66\n1\n70\n0\n`; pts.forEach(p=>{ s+=`0\nVERTEX\n8\n${layer||'0'}\n10\n${num(p.x)}\n20\n${num(-p.y)}\n30\n0\n`; }); s+=`0\nSEQEND\n`; return s; }
  function emitText(e){ return `0\nTEXT\n8\n${e.layer||'0'}\n62\n${e.color||7}\n10\n${num(e.x)}\n20\n${num(-e.y)}\n30\n0\n40\n${num(e.h||10)}\n1\n${String(e.value).replace(/\n/g,' ')}\n7\nPERI01\n`; }
  function makeDxf(model){
    let out='0\nSECTION\n2\nHEADER\n0\nENDSEC\n';
    out+='0\nSECTION\n2\nTABLES\n';
    out+='0\nTABLE\n2\nSTYLE\n70\n1\n0\nSTYLE\n2\nPERI01\n70\n0\n40\n0\n41\n1\n50\n0\n71\n0\n42\n2.5\n3\nArial.ttf\n4\n\n0\nENDTAB\n';
    out+='0\nENDSEC\n';
    out+='0\nSECTION\n2\nENTITIES\n';
    for(const e of model.entities){
      if(e.type==='line') out+=emitLine(e); else if(e.type==='rect') out+=emitRect(e); else if(e.type==='text') out+=emitText(e);
    }
    out+='0\nENDSEC\n0\nEOF\n';
    return out;
  }
  function download(name, content){ const blob=new Blob([content],{type:'application/dxf'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=name; document.body.appendChild(a); a.click(); setTimeout(()=>{URL.revokeObjectURL(url); a.remove();},500); }
  window.PLMRDXF = { makeDxf, download };
})();
