(() => {
  window.rsShowAnalysis = text => {
    document.getElementById('rs-analysis')?.remove();
    const panel = document.createElement('div'); panel.id = 'rs-analysis';
    panel.style.cssText='position:fixed;inset:5%;z-index:100;background:#15241e;color:#eee;padding:24px;display:flex;flex-direction:column;gap:12px;font:18px sans-serif';
    const status=document.createElement('div');status.textContent='コピーしています…';
    const area=document.createElement('textarea');area.value=text;area.readOnly=true;area.setAttribute('aria-label','AI分析用データ全文');area.style.cssText='flex:1;min-height:0;font:16px monospace;touch-action:pan-y';
    const select=document.createElement('button');select.textContent='全文を選択';select.style.cssText='min-height:44px;font:16px sans-serif';select.onclick=()=>{area.focus();area.select();area.setSelectionRange(0,area.value.length);status.textContent='全文を選択しました。長押しメニューの「コピー」、またはCtrl+Cでコピーできます。';};
    const close=document.createElement('button');close.style.cssText='min-height:44px;font:16px sans-serif';close.textContent='閉じる（Esc／○）';close.onclick=()=>{panel.remove();document.getElementById('canvas')?.focus();};
    panel.append(status,area,select,close);document.body.append(panel);area.focus();area.select();
    const timer=setTimeout(()=>{status.textContent='自動コピーの応答を待っています。「全文を選択」から手動コピーすることもできます。';panel.dataset.copy='manual';},2500);
    const failed=()=>{clearTimeout(timer);status.textContent='ブラウザの制限により自動コピーできません。「全文を選択」から手動コピーしてください。';panel.dataset.copy='failed';};
    if(navigator.clipboard?.writeText)navigator.clipboard.writeText(text).then(()=>{clearTimeout(timer);status.textContent='AI分析用データをコピーしました。全文も下に表示しています。';panel.dataset.copy='success';},failed);else failed();
    panel.addEventListener('keydown',e=>{e.stopPropagation();if(e.key==='Escape'){e.preventDefault();close.click();}});
  };
})();
