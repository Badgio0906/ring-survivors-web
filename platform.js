(() => {
  window.rsShowAnalysis = text => {
    document.getElementById('rs-analysis')?.remove();
    const panel = document.createElement('div'); panel.id = 'rs-analysis';
    panel.style.cssText='position:fixed;inset:5%;z-index:100;background:#15241e;color:#eee;padding:24px;display:flex;flex-direction:column;gap:12px;font:18px sans-serif';
    const status=document.createElement('div');status.textContent='コピーしています…';
    const area=document.createElement('textarea');area.value=text;area.readOnly=true;area.setAttribute('aria-label','AI分析用データ全文');area.style.cssText='flex:1;min-height:0;font:14px monospace';
    const close=document.createElement('button');close.textContent='閉じる（Esc／○）';close.onclick=()=>{panel.remove();document.getElementById('canvas')?.focus();};
    panel.append(status,area,close);document.body.append(panel);area.focus();area.select();
    const failed=()=>{status.textContent='ブラウザの制限により自動コピーできません。下の全文をCtrl+A、Ctrl+Cでコピーしてください。';panel.dataset.copy='failed';};
    if(navigator.clipboard?.writeText)navigator.clipboard.writeText(text).then(()=>{status.textContent='AI分析用データをコピーしました。全文も下に表示しています。';panel.dataset.copy='success';},failed);else failed();
    panel.addEventListener('keydown',e=>{e.stopPropagation();if(e.key==='Escape'){e.preventDefault();close.click();}});
  };
})();
