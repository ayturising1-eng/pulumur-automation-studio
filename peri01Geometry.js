(function(){
  function rect(x,y,w,h, layer='0', color=7){ return {type:'rect',x,y,w,h,layer,color}; }
  function line(x1,y1,x2,y2, layer='0', color=7){ return {type:'line',x1,y1,x2,y2,layer,color}; }
  function text(x,y,h,value,layer='0', color=7, align='L'){ return {type:'text',x,y,h,value,layer,color,align}; }
  function drawTable(items, page1){
    const ents=[]; const t=page1.table; let x=t.x, y=t.y; const rh=t.rowH; const w1=t.c1, w2=t.c2;
    ents.push(rect(x,y,w1+w2,rh*items.length,'TABLE',8));
    for(let i=1;i<items.length;i++) ents.push(line(x,y+i*rh,x+w1+w2,y+i*rh,'TABLE',8));
    ents.push(line(x+w1,y,x+w1,y+rh*items.length,'TABLE',8));
    items.forEach((it,i)=>{ ents.push(text(x+12,y+rh*(i+.67),page1.text.textH,it.label,'TABLE',7)); ents.push(text(x+w1+12,y+rh*(i+.67),page1.text.textH,it.value,'TABLE',7)); });
    return ents;
  }
  function drawBottomTable(page1, baseY){
    const x=page1.table.x, y=baseY, h=page1.table.bottomH, cols=page1.table.bottomCols; const total=cols.reduce((a,b)=>a+b,0); const ents=[rect(x,y,total,h*2,'TABLE',8)];
    ents.push(line(x,y+h,x+total,y+h,'TABLE',8)); let cx=x; for(let i=0;i<cols.length-1;i++){ cx+=cols[i]; ents.push(line(cx,y,cx,y+h*2,'TABLE',8)); }
    const labels1=['CUSTOMER', page1.customer, 'VERSION', page1.version, 'DATE', page1.date||''];
    const labels2=['PROJECT', page1.project, 'DRAWN BY', page1.drawnBy, '', ''];
    let pos=x; for(let i=0;i<6;i++){ const cw=cols[i]; if(labels1[i]) ents.push(text(pos+8,y+h*.63,11,labels1[i],'TABLE',7)); if(labels2[i]) ents.push(text(pos+8,y+h*1.63,11,labels2[i],'TABLE',7)); pos+=cw; }
    return ents;
  }
  function buildModel(page1){
    const ents=[];
    const topItems=[
      {label:'STRUCTURE COLOR',value:page1.structureColor},{label:'FABRIC',value:page1.fabric},{label:'FABRIC PROFILES COLOR',value:page1.fabricProfiles},
      {label:'MOTOR',value:page1.motor},{label:'REMOTE',value:page1.remote},{label:'LED',value:page1.led},{label:'DIMMER',value:page1.dimmer},{label:'EXTRAS',value:page1.extras}
    ];
    let tableEnts=drawTable(topItems,page1); ents.push(...tableEnts);
    const triangleShift = String(page1.triangleJoinery).toUpperCase()==='EVET' ? 120 : 0;
    const topX=720, topY=120 + triangleShift;
    let currentX=topX;
    const topBaseY=topY;
    const glassColor = String(page1.fabricProfiles||'').toUpperCase().includes('1013') ? 6 : 7; // requested to follow peri01 text; color proxy
    page1.widths.forEach((w,idx)=>{
      const drawW=page1.page1Widths[idx]; const depth=page1.openings[idx];
      const startX=currentX; const endX=startX+drawW;
      ents.push(rect(startX,topBaseY,drawW,depth,'TOP',7));
      // rails
      const rays=page1.rayCounts[idx]; const pitch = rays===1?0:drawW/(rays-1);
      for(let r=0;r<rays;r++){ const rx=startX + (rays===1?drawW/2:r*pitch); ents.push(rect(rx-6,topBaseY+12,12,depth-24,'TOP',5)); }
      // posts as simple top view; no gutter/profile connection blocks in top view
      ents.push(rect(startX-50, topBaseY+depth-50, 100,100,'POST',6)); ents.push(rect(endX-50, topBaseY+depth-50, 100,100,'POST',6));
      // top dimensions
      ents.push(line(startX, topBaseY-24, endX, topBaseY-24,'DIM',8)); ents.push(text((startX+endX)/2-20, topBaseY-34, 16, String(w),'DIM',7));
      ents.push(line(startX-30, topBaseY, startX-30, topBaseY+depth,'DIM',8)); ents.push(text(startX-68, topBaseY+depth/2, 16, String(depth),'DIM',7));
      // cam track rectangles instead of blocks in top if needed
      if(String(page1.glassTrack).toUpperCase()==='EVET'){ ents.push(rect(startX+18, topBaseY+18, drawW-36, 18,'GLASS',glassColor)); }
      currentX=endX + (page1.gaps[idx]||0);
    });
    ents.push(text(topX+180, topBaseY+page1.openings[0]/2, 28, 'PERGO RISE','TITLE',3));

    // front view under top view
    const maxRear=Math.max(...page1.rears); const frontBaseX=760, frontBaseY=topBaseY+Math.max(...page1.openings)+140;
    // wall
    ents.push(rect(frontBaseX-120, frontBaseY-maxRear, 90, maxRear,'WALL',8));
    // profile outline, no ON/KARSI label and no gutter block
    const len=page1.page1Widths.reduce((a,b)=>a+b,0)+page1.gaps.reduce((a,b)=>a+b,0);
    const roofStartX=frontBaseX, roofEndX=frontBaseX+len;
    const rearH=maxRear, frontH=page1.fronts[0]||0;
    ents.push(line(roofStartX, frontBaseY-rearH, roofEndX, frontBaseY-frontH,'VIEW',5));
    ents.push(line(roofStartX, frontBaseY-rearH-24, roofEndX, frontBaseY-frontH-24,'VIEW',5));
    // posts in front
    let px=frontBaseX; const postPositions=[frontBaseX, roofEndX];
    postPositions.forEach(x=>{ ents.push(rect(x-9, frontBaseY-frontH, 18, frontH,'POST',6)); });
    // dims
    ents.push(line(frontBaseX-40, frontBaseY-rearH, frontBaseX-40, frontBaseY,'DIM',8)); ents.push(text(frontBaseX-78, frontBaseY-rearH/2, 16, String(rearH),'DIM',7));
    ents.push(line(roofEndX+30, frontBaseY-frontH, roofEndX+30, frontBaseY,'DIM',8)); ents.push(text(roofEndX+40, frontBaseY-frontH/2, 16, String(frontH),'DIM',7));
    ents.push(text((roofStartX+roofEndX)/2-35, frontBaseY-rearH-36, 16, (page1.angleDeg[0]||0).toFixed(2)+'°','DIM',7));

    // side view, no labels, no roof profile blocks, no car sets
    const sideBaseX=roofEndX+140, sideBaseY=frontBaseY;
    const sideDepth=page1.openings[0], sideRear=page1.rears[0], sideFront=page1.fronts[0];
    function drawSide(xbase, mirror){
      const x0=xbase, x1=xbase+(mirror?-sideDepth:sideDepth);
      ents.push(line(x0, sideBaseY-sideRear, x1, sideBaseY-sideFront,'SIDE',5));
      ents.push(line(x0, sideBaseY-sideRear-24, x1, sideBaseY-sideFront-24,'SIDE',5));
      ents.push(rect(x1-9, sideBaseY-sideFront, 18, sideFront,'POST',6));
    }
    drawSide(sideBaseX,false);
    if(String(page1.sideTrack).toUpperCase()==='EVET') drawSide(sideBaseX+page1.openings[0]+80,true);

    // bottom title table
    ents.push(...drawBottomTable(page1, frontBaseY+60));
    return { entities: ents, extents: {minX:0,minY:0,maxX:Math.max(currentX+150, sideBaseX+page1.openings[0]*2+300), maxY:frontBaseY+220} };
  }
  window.PLMRGeometry = { buildModel };
})();
