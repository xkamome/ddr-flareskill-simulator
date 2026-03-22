// DDR フレアスキル シミュレータ - ブックマークレット (readable source)
// 手順:
// 1. SIMULATOR_URL と SUPABASE_URL / SUPABASE_ANON_KEY を埋める
// 2. jsmin / terser 等でminify
// 3. 先頭に javascript:void( 末尾に ) を付けてブックマークに登録

(function () {
  var SIMULATOR_URL    = 'https://harug5152.github.io/ddr-flareskill-simulator/';
  var SUPABASE_URL     = 'https://ddxzgrknjvxtvcukwngm.supabase.co';     // TODO
  var SUPABASE_ANON_KEY= 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkeHpncmtuanZ4dHZjdWt3bmdtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM1ODM3MDMsImV4cCI6MjA4OTE1OTcwM30.UjWJWhI6g_j54qpr4okmwmGOna2bA33QGwULv1G-neM';                // TODO
  var LS_KEY           = 'ddr_flare_uuid';

  // ---- Extract data ----
  var CATS = {
    flareskill_classic_table: 'CLASSIC',
    flareskill_white_table:   'WHITE',
    flareskill_gold_table:    'GOLD',
  };
  function imgToRankIdx(src) {
    if (!src) return 0;
    if (src.indexOf('flare_ex') >= 0) return 10;
    var m = src.match(/flare_(\d+)/);
    return m ? parseInt(m[1]) : 0;
  }
  var DIFF_PREFIX={BEGINNER:'b',BASIC:'B',DIFFICULT:'D',EXPERT:'E',CHALLENGE:'C'};
  var style=location.href.includes('flare_data_double')?'DP':'SP';

  var result = {CLASSIC:[],WHITE:[],GOLD:[]};
  for (var cls in CATS) {
    var cat = CATS[cls];
    var rows = document.querySelectorAll('tr.' + cls);
    for (var i=0; i<rows.length; i++) {
      var tds = rows[i].querySelectorAll('td');
      if (tds.length < 4) continue;
      var name = (tds[0].querySelector('a')||{}).textContent||'不明';
      name = name.trim();
      if (name.indexOf('Steps to the Star') >= 0) continue;
      var txt = tds[1].textContent;
      var dm  = txt.match(/(BEGINNER|BASIC|DIFFICULT|EXPERT|CHALLENGE)/i);
      if (!dm) continue;
      var diff = dm[1].toUpperCase();
      if (!DIFF_PREFIX[diff]) continue;
      var lm  = txt.match(/Lv\.?(\d+)/i);
      var level = lm ? parseInt(lm[1]) : 1;
      var img   = tds[2].querySelector('img');
      var rankIdx = imgToRankIdx(img ? img.src : '');
      var fs    = parseInt((tds[3]||{}).textContent||'0')||0;
      var date  = ((tds[4]||{}).textContent||'').trim().split(' ')[0]||'0000-00-00';
      result[cat].push({name:name,diff:diff,style:style,level:level,rankIdx:rankIdx,fs:fs,date:date});
    }
  }

  var total = result.CLASSIC.length + result.WHITE.length + result.GOLD.length;
  if (total === 0) {
    alert('フレアスキルデータが見つかりません。\nフレアスキルページで実行してください。');
    return;
  }

  // ---- Save to Supabase (INSERT only, immutable records) ----
  var url = SUPABASE_URL + '/rest/v1/skill_data';
  var headers = {
    'Content-Type': 'application/json',
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
    'Prefer': 'return=representation',
  };

  fetch(url, {
    method: 'POST',
    headers: headers,
    body: JSON.stringify({data: result}),
  }).then(function(r) { return r.json(); })
  .then(function(d) {
    var uuid = Array.isArray(d) ? d[0].uuid : d.uuid;
    if (!uuid) { alert('UUID取得失敗'); return; }
    window.open(SIMULATOR_URL + '?id=' + uuid, '_blank');
  }).catch(function(e) { alert('通信エラー: ' + e.message); });
}());
