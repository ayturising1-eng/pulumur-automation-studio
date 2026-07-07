(function(){
  function splitRaw(v){return String(v??'').split(';').map(s=>s.trim()).filter(s=>s!=='');}
  function toNum(s){ const n = parseFloat(String(s).replace(',', '.')); return Number.isFinite(n)?n:null; }
  function parseNumberSeries(v){ return splitRaw(v).map(toNum).filter(n=>n!==null); }
  function parseWidthProgram(v){ const raw=splitRaw(v); const isNo = raw.length && raw[raw.length-1].toUpperCase()==='NO'; const arr=isNo?raw.slice(0,-1):raw; const nums=arr.map(toNum).filter(n=>n!==null); if(!isNo) return {mode:'normal', widths:nums, gaps:[]}; const widths=[], gaps=[]; nums.forEach((n,i)=>{if(i%2===0) widths.push(n); else gaps.push(n);}); return {mode:'NO', widths, gaps}; }
  function expand(list, count){ if(list.length===0) return Array(count).fill(null); if(list.length>=count) return list.slice(0,count); const out=[]; for(let i=0;i<count;i++) out.push(list[Math.min(i,list.length-1)]); return out; }
  function autoRayForWidth(w){ if(w<=4000) return 2; if(w<=8000) return 3; return 4; }
  function seriesString(arr){ return arr.map(v=>Number.isFinite(v)?String(v):'').join(';'); }
  function computeCalculator(angleTxt, openingTxt, rearTxt, frontTxt){
    const angles=parseNumberSeries(angleTxt), openings=parseNumberSeries(openingTxt), rears=parseNumberSeries(rearTxt), fronts=parseNumberSeries(frontTxt);
    const count=Math.max(angles.length, openings.length, rears.length, fronts.length,1);
    const A=expand(angles,count), O=expand(openings,count), R=expand(rears,count), F=expand(fronts,count); const results=[];
    for(let i=0;i<count;i++){
      let a=A[i], o=O[i], r=R[i], f=F[i];
      const missing=[a,o,r,f].filter(v=>v==null).length;
      if(missing!==1){ results.push({a,o,r,f,error:'Her pozda tam 1 değer boş olmalı.'}); continue; }
      if(a==null && o!=null && r!=null && f!=null) a=Math.atan((r-f-278)/(o-71.1))*180/Math.PI;
      else if(o==null && a!=null && r!=null && f!=null) o=((r-f-278)/Math.tan(a*Math.PI/180))+71.1;
      else if(r==null && a!=null && o!=null && f!=null) r=((o-71.1)*Math.tan(a*Math.PI/180))+f+278;
      else if(f==null && a!=null && o!=null && r!=null) f=r-278-((o-71.1)*Math.tan(a*Math.PI/180));
      results.push({a,o,r,f});
    }
    return results;
  }
  function buildPage1Data(form){
    const widthProgram=parseWidthProgram(form.width);
    const widthsInput=widthProgram.widths;
    const openingsInput=parseNumberSeries(form.opening);
    const rearsInput=parseNumberSeries(form.rearHeight);
    const frontsInput=parseNumberSeries(form.frontHeight);
    const explicitRays=parseNumberSeries(form.rayCount);
    const explicitPosts=parseNumberSeries(form.postCount);
    let systemCount=toNum(form.systemCount)||Math.max(widthsInput.length, openingsInput.length, rearsInput.length, frontsInput.length, explicitRays.length, 1);
    const widths=expand(widthsInput, systemCount).map(v=>v??0);
    const openings=expand(openingsInput, systemCount).map(v=>v??0);
    const rears=expand(rearsInput, systemCount).map(v=>v??0);
    const fronts=expand(frontsInput, systemCount).map(v=>v??0);
    const gaps = widthProgram.mode==='NO' ? expand(widthProgram.gaps, Math.max(systemCount-1,0)).map(v=>(v??0)+12) : Array(Math.max(systemCount-1,0)).fill(25);
    const rayCounts=(explicitRays.length?expand(explicitRays,systemCount):widths.map(autoRayForWidth)).map(v=>Math.max(1,Math.round(v||2)));
    const allFrontZero=fronts.every(v=>Math.abs(v||0)<0.001);
    let totalPosts;
    if(explicitPosts.length){ totalPosts = Math.round(explicitPosts[0]||0); }
    else totalPosts = allFrontZero ? 0 : Math.max(0, rayCounts.reduce((a,b)=>a+b,0)-(systemCount-1));
    const page1Widths = widths.map((w,i)=>{
      let x = w - 12; // Page1 B1 type trim
      if(String(form.glassTrack).toUpperCase()==='EVET'){
        if(systemCount===1) x = w - 132; else { if(i===0 || i===systemCount-1) x = w - 78; }
      }
      return x;
    });
    const page1 = {
      systemCount, widths, openings, rears, fronts, gaps, rayCounts, totalPosts,
      page1Widths,
      structureColor: form.structureColor||'-', fabric: form.fabric||'-', fabricProfiles: form.fabricProfiles||'-',
      motor: form.motor||'-', remote: form.remote||'-', led: form.led||'-', dimmer: form.dimmer||'-',
      customer: form.customer||'', project: form.project||'', version: form.version||'', drawnBy: form.drawnBy||'', date: form.date||'',
      parapet: form.parapet||'HAYIR', parapetHeight: toNum(form.parapetHeight)||0,
      glassTrack: form.glassTrack||'HAYIR', sideTrack: form.sideTrack||'HAYIR', triangleJoinery: form.triangleJoinery||'HAYIR', waterStandard: form.waterStandard||'EVET',
      extras: form.extras||'-', noGapMode: widthProgram.mode==='NO',
      text: { style:'PERI01', titleH:16, textH:12, smallH:10, giantH:22 },
      table: { x:30, y:30, rowH:52, c1:240, c2:370, bottomY:760, bottomH:56, bottomCols:[110,340,130,320,110,180] }
    };
    page1.rayCountsString=seriesString(rayCounts); page1.totalPostsString=String(totalPosts);
    page1.angleDeg = openings.map((o,i)=>{ const den=(o-71.1); return den? (Math.atan((rears[i]-fronts[i]-278)/den)*180/Math.PI):0; });
    return page1;
  }
  const helpText = [
    'Pülümür Automation Studio Yardım',
    '',
    '• Genişlik, Açılım, Arka Yükseklik, Ön Yükseklik ve Ray Sayısı alanlarında ; ile çoklu poz girişi yapılabilir.',
    '• Genişlik alanında NO modu için örnek: 3000;100;2500;NO',
    '• Ray Sayısı boş bırakılırsa otomatik hesaplanır.',
    '• Dikme Sayısı boş bırakılırsa PERI01 mantığıyla otomatik hesaplanır.',
    '• Pülümür Hesaplayıcı: 4 değerden 3 tanesini gir, boş olan hesaplanır.',
    '• Yan Kayıt EVET ise yan görünüş ayna (mirror) mantığıyla çizilir.'
  ].join('\n');
  window.PLMRBridge = { splitRaw, parseNumberSeries, parseWidthProgram, buildPage1Data, computeCalculator, helpText };
})();
