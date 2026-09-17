export const METRIKA_ID = 112726669;

export function injectMetrica() {
  if (METRIKA_ID <= 0) return "";
  return `
    (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};m[i].l=1*new Date();for(var j=0;j<document.scripts.length;j++){if(document.scripts[j].src===r){return;}}k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})(window,document,"script","https://mc.yandex.ru/metrika/tag.js?id=${METRIKA_ID}","ym");
    ym(${METRIKA_ID},"init",{ssr:true,webvisor:true,clickmap:true,ecommerce:"dataLayer",referrer:document.referrer,url:location.href,accurateTrackBounce:true,trackLinks:true});
  `;
}

export function metricaNoscript() {
  if (METRIKA_ID <= 0) return null;
  return (
    <noscript>
      <div>
        <img
          src={`https://mc.yandex.ru/watch/${METRIKA_ID}`}
          style={{ position: "absolute", left: "-9999px" }}
          alt=""
        />
      </div>
    </noscript>
  );
}

export function reachGoal(goal: string) {
  if (typeof window === "undefined" || METRIKA_ID <= 0) return;
  const win = window as unknown as { ym?: ((...args: unknown[]) => void) };
  if (typeof win.ym === "function") {
    win.ym(METRIKA_ID, "reachGoal", goal);
  }
}