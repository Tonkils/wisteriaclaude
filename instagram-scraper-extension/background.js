// Service worker — orchestrates autonomous account evaluation, aggregates
// intercepted Instagram data, and syncs to the Wisteria Google Sheet.

const SPREADSHEET_ID = '1_JDzmZUDyuhwDT61VzDQvjKIN-FTScRS6u5imn8MkXw';
const SHEETS_API = 'https://sheets.googleapis.com/v4/spreadsheets';

// Pre-loaded test bed — full list of ~350 cannabis accounts.
const INITIAL_QUEUE = [
  'itsrosamotta','mistahgump','pad.jungle','harvest_honey','hannaheastmann',
  'geek.thcx','lonnys.jungle','jonkhoe','kineracks','sonia_bedoyaa',
  'hashstash.co','ale_loz__','gettingchill','dabolio710','itsbongmarley',
  'greenleafkingston','111ranch','yourstrulykillacam2.0','baked_shakespeare',
  'livingthelifeofangel','releafmo','xoticflavorz._','scw_nutt','itsher.ashley',
  'dymeexoticz','thebloomverseexpo','chylleanddestiny','calirootsfest',
  'philemerson','shoppreferredgardens','mainstagecali','likemikerolls',
  'castiiizyretail','nowave.nini','fiforosin','mrhothoneydabs','prettyabbs_',
  'wenwinsituation','ff.texas214','hightimes.cup','largebaj','cannaquestt',
  'trillavisuals_','makingmymark_ent_llc','chris_startsmallmovebig','colecultures',
  'stoops.nyc','oldfriendscultivation','stonerzboutique','lilhappyhippie',
  'ghc_official423','gudessence','trenellemonet','cloud_9_baby','wilderthanthewind_',
  'moodtrays','lowtemplauren','highna415','magnifeye13','adultingwithsuz',
  'sheeatsandsmokes','smokingonclouds','growprossolutions','cheesyplants',
  'verano_hold','valstonee','plursta','vgrahamm','green_goods__','steffsliger',
  'maviferreirabr','doped','toptree','smoke','cana_sylmar','canasylmar',
  'ithinkitsaz','push_trees_','stoner_dottie','rosslynofficial','pax_official',
  'liz_with_pax','muhriesuh','kadeja.fitness','im__ontu','tladler',
  'simplyleonfinds','greenlifedc','stonedfriend','hearts.glass','puffcon_la',
  'streamteamco','crf.mp4','izzeicreates','mrs.greensclouds','blackbear.mn',
  'blackbear.pa','carrie.ophyllene','hashboardconfessional','sluggersny',
  'mariahcuratesny','rawkandroll','bryttanyowen','just.coco._','queeneedakritic',
  'notfunnyjustfinney','dacannasseurs','madhousemelin','outerspacejenny',
  '_theterpqueen_','chronicguru.nc','_chassbabes','_jimmyzzz_','geneticstv',
  'mattlove_juicejoint','flynnstonednorthsyracuse','jettyextracts','kevin_puffco',
  'leftcoast','lissamelts','green.mamaaa','sluggersswag','olio_ny','honeybehigh',
  'genericaf_official','centralprocessorsnys','mayhem_ny','highpeaks_social',
  'hibuenasvibras','angelievsworld','megdubclub','dabnessa','carlyssesh',
  'ellaboojazz','sarahrejahella','yourfavoriteza','chronicgurueats','chronicgurufl',
  'thebunnyfae2','emilythefairyy','onlythraxyt','dazedlyss','everydeatailofmini',
  'em.hashh','_cartisan_','jenny.wichman','smokingpaperus','menanados',
  'th0ughtdau9hter','milehighdave420','theauntmaryj','shaybabyx0x','dab_puffin_710',
  'greenwithceleste','smokehouseohio','yagirlzaina','thegnarlymum','cannacarton',
  'marijuana','herb','blackcannabismagazine','cashcolorcannabis','high_sunshine86',
  'prettyhighclub','strainxhtx','cityboycoyy','sydnie_leann','errlywyatt',
  'toolittmama','goeasyshop','natashahasthemunchies','bakedchaoswitch2628',
  'dab.berella','frostytokefairy','sammwithtwomm','papasherb','highitsne',
  'sunnytienlounge','medicatedbarbies','pleaselookatmyari','rizanwithme',
  '2heady_stories','potions.tv','i.am.amirahjanelle','stonedtotheedge',
  'cannabisnewsdc','smokeonthewatermd','ooohblue','ms.blazeandbloom',
  'eastcoast_bottlebongs','maryland.cannabis.club','grassroots_healingmd',
  'chesacanna_wellness','chesacanna_deli','ilovejuicejoint','twogirlshash',
  'm.r.d.o.n.a.l.d.s.o.n','lillybearedibles','crabcakescannabis','mdmj2018',
  'smokeart.md','canna_b_eeshh','exploremarylandcnbs','cannatracker',
  'remedy_maryland','funkypiecebethesda','libbylandrace_410','jovawellnesscenter',
  'canna_britt_','cannasoeurs','yeson4md','splifcity','select.better','rovebrand',
  'bmore420llc','sweettalkedibles','mpx_davidg','mdcannabisreviews','keefbrands',
  'gettothejoint','the.legacy.dc','phdank','justflowerbrands','fadecoofficial',
  'storyofmaryland','murphs_ganja_clouds','hayleyshoots.u','marylandleaf',
  'rolling_bouqes','noshameinmyflowergame','curatedbynep','superiorlex',
  'liftedliftingofficial','elysecamilleofficial','pinkleafvibes','emerald_blaze.1',
  'jungledropzwyorks','tiaabunny','nug','louiebagz','magical.seduction','isa6ianca',
  'kannabaddies','domii.theflowerprincess','camryynnicoleee','blazeddgyal',
  'wizkhalifa','ganja.jazzy','daydreaming.society.2','mp4.eliza','blvckpearl24000',
  'halfbakedheather','cannamommaa','officialmilkywayglass','kloudykarin',
  'flowerr.fog','canna.heals','redheadedstranger94','zach_scheels',
  'discovermaryandjane','homsie_420','herbculture420','_.biggiceee','reelasreal',
  'rissarolls.up','jayblazedd','live.w.trin','roll.wit.rory','themininail',
  'stay4stasi','sluggersugc','litmissleoo','hadrlanus','boomheadshop','mamastemsdabs',
  'drinkdayzed','iin_swaggu_we_trust','the_ston_ers','hurleygrown','ashcloudssss',
  'muhmuhmuhmyshanoa','sesh_with_queenee','terpy_jade','mccartergetshigh',
  'thedoseclinic','bgrowz','naturesheritage_','seed.talent','bonnigoldsteinmd',
  'blunttalkswithwillow','ang4roaches','bearquartz','jojosmhighles','its.dreanaaa',
  'wegotbigfun','benpostedthat','missclaramay0914','birdandmouseglass','_toriffic_',
  'spacebuds_dispensary','groovycindy','amethystlikethestone',
  'budtender_college_official','getliftedlemonade','hihikez','planet.nugg',
  'essielovezu','munchies','drdabber','tobaccohutofficial','smokewildhemp',
  'smokebox','hitokilaser','blazysusan','proper.roots','hemperco','kingpalm',
  'najiannasogroovy','heretoevolve','shaunna.jpg','lifewithadisa','floraflex',
  'terpyaki','highheauxx','spad3e.artt','papaglobs','_ms.roberts55','juug',
  'tsunamithc','the.cana.baddie','birthcodes','blazzedang','tokin.mama','glitzndabz',
  'tokkiethehuman','happylilhippiee','jimilikehenny','baked_by_bae','lewis120621',
  'meetmeinthegardenx10','blazyyladyy','rollinwgrisssiii','danisativada',
  'thatmomwhogardens','stuffeezllc','shortandst0ned','stiiizy','brendaagracee',
  'hicoryn','und3rcov3rjad3n','kirarussells','mambadolly','red_eye_skye',
  'elevatedthoughtscandypacks','madiarielle','kushqueenshop','artby_mozart',
  'hybridherbalgal','midwestdazed_','discopuffmick','beccabarbie420','hazy_gracee',
  'happyeddie__','jcitsrove','leaflymaryland','thatsahgmtayyy','blxckcannababe',
  'quincypoet__','theforestmd','cannachris__','0_lyndore_0','cosmickitties420',
  'blembrat','canna__court','terpsmut','prerollpapito','taylorsmokes','bikoflower',
  'fattyrnomore','mrs.puffsalot','jaydacaryophyllene','districtcannabismattyr',
  '0unceofoyin','creed_the_stampede','420jayde_','thisisclarajane','wizard_trees',
  'empire.smokes','empireglassworks','mushy.michelelee','itstokeytime','networkingjay',
  'shopwizardtrees','ratedgasmedia','ratedgas','wodljournal','trywday',
  'alexkprescott4','freezertarps','chef_munchyz','wizardtreesgenetics',
  'propersmokeleague','wizardtreez','bettercall_britt','fl_can_official','tokenkeeks',
  'kushy_land','puffcosocials','highgirlsclubtv','jarilynfrommaryland','_fineechynna',
  'artbyabaynesh','cannakayla_','chanelrozayy','hustlehumble100','alchemistmd_',
  '_stonerstuff','alchemistlabsmd','thehighmagazine','immortalflame192',
  'highnotesbyjen','indohgoddess','kibeehi','tblazeitt','highitsflo','bakedblankets',
  'ms_vic20','dmvleek','sty_error','supanov444','sparkwnova','zlaaly',
  'yourcorporatebestie','highnessmel','bennytea18_','thebrooklynbudtender',
  'jesssaland','fairybud.mother','aspenparc','kozystoner','versesuniverse_',
  'kaya.bliss.nyc','releafelevated','hightimesmagazine','hopp_to','indoor_gwleafnj',
  '_breee_14','bcbmastermind','ktmaesec','doobie_daily','wholetmebeamom','gwgwevents',
  'the_madd_baker_exotics421','therollingcards','camiraddddd','highmaha','vibewithchu',
  'koala.puffss','hiiimag','daisy_dewdrops','sadgirlsdub','iconikmgmt','lifewithfani',
  'kanhabliss','churryxclouds','psychedelicalpha','harvardundergradpsychedelics',
  'caligrownn_','jhpsychedelics','cannausaofficial','libertycannabis','blazybrands',
  'womengrow','the_mjconnect','thcsmokersclub509','drugpolicyalliance','waavemedical',
  'merryjane','smokefiends','leafly','weedtrends_','weedfeed','weedhumor',
  'maryland.connoisseur','zenleafdispensaries','revolution_releaf1','cookiesmediala',
  'cookiessf'
];

// --- State helpers ---

async function getState() {
  return new Promise(resolve => chrome.storage.local.get([
    'queue', 'evaluated', 'running', 'dailyCount', 'dailyDate',
    'sessionCount', 'settings', 'activeTab', 'pendingProfile'
  ], resolve));
}

async function setState(updates) {
  return new Promise(resolve => chrome.storage.local.set(updates, resolve));
}

async function getSettings() {
  const { settings } = await getState();
  return Object.assign({
    sessionCap: 200,
    dailyCap: 400,
    minDelay: 10000,
    maxDelay: 20000,
    jitterEvery: 10,
    jitterMin: 30000,
    jitterMax: 60000
  }, settings || {});
}

// --- Queue initialization ---

async function initQueue() {
  const { queue, evaluated } = await getState();
  if (queue && queue.length > 0) return; // Already initialized.

  const evaluatedSet = new Set((evaluated || []).map(a => a.username));
  const pending = INITIAL_QUEUE.filter(u => !evaluatedSet.has(u)).map(u => ({
    username: u,
    source: 'initial_list',
    status: 'pending',
    added: Date.now()
  }));
  await setState({ queue: pending });
  console.log(`[Wisteria] Queue initialized with ${pending.length} accounts.`);
}

// --- Delay helpers ---

function randomDelay(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

// --- Daily cap reset ---

async function checkDailyCap() {
  const today = new Date().toDateString();
  const { dailyCount, dailyDate } = await getState();
  if (dailyDate !== today) {
    await setState({ dailyCount: 0, dailyDate: today });
    return 0;
  }
  return dailyCount || 0;
}

// --- Location extraction ---

function extractLocation(user) {
  const city = user.city_name || '';
  const country = user.country_block ? user.country_block.country_code : '';

  // Try to parse state/city from bio for personal accounts.
  let inferredCity = city;
  let inferredState = '';
  let locationSource = city ? 'api' : 'none';

  if (!city && user.biography) {
    const bio = user.biography;
    const statePatterns = [
      { pattern: /\b(MD|Maryland)\b/i, state: 'MD', country: 'US' },
      { pattern: /\b(DC|Washington DC|Washington D\.C\.)\b/i, state: 'DC', country: 'US' },
      { pattern: /\b(VA|Virginia)\b/i, state: 'VA', country: 'US' },
      { pattern: /\b(NY|New York|NYC)\b/i, state: 'NY', country: 'US' },
      { pattern: /\b(CA|California|Cali|LA|Los Angeles|San Francisco|SF|Oakland)\b/i, state: 'CA', country: 'US' },
      { pattern: /\b(TX|Texas|Houston|Dallas|Austin)\b/i, state: 'TX', country: 'US' },
      { pattern: /\b(FL|Florida|Miami|Orlando)\b/i, state: 'FL', country: 'US' },
      { pattern: /\b(CO|Colorado|Denver)\b/i, state: 'CO', country: 'US' },
      { pattern: /\b(IL|Illinois|Chicago)\b/i, state: 'IL', country: 'US' },
      { pattern: /\b(WA|Washington State|Seattle)\b/i, state: 'WA', country: 'US' },
      { pattern: /\b(NC|North Carolina)\b/i, state: 'NC', country: 'US' },
      { pattern: /\b(OH|Ohio)\b/i, state: 'OH', country: 'US' },
      { pattern: /\b(MN|Minnesota)\b/i, state: 'MN', country: 'US' },
      { pattern: /\b(PA|Pennsylvania|Philadelphia|Philly|Pittsburgh)\b/i, state: 'PA', country: 'US' },
      { pattern: /\b(NJ|New Jersey)\b/i, state: 'NJ', country: 'US' },
      { pattern: /\b(NV|Nevada|Vegas|Las Vegas)\b/i, state: 'NV', country: 'US' },
      { pattern: /\b(OR|Oregon|Portland)\b/i, state: 'OR', country: 'US' },
    ];

    for (const { pattern, state, country: c } of statePatterns) {
      if (pattern.test(bio)) {
        inferredState = state;
        locationSource = 'bio_inferred';
        if (!country) inferredState = state; // use inferred
        break;
      }
    }
  }

  return {
    city: inferredCity || '',
    state: user.state || inferredState || '',
    country: country || (inferredState ? 'US' : ''),
    locationSource
  };
}

// --- Data extraction from intercepted payloads ---

function extractProfileData(user) {
  const followers = user.edge_followed_by?.count ?? user.follower_count ?? 0;
  const following = user.edge_follow?.count ?? user.following_count ?? 0;
  const postCount = user.edge_owner_to_timeline_media?.count ?? user.media_count ?? 0;

  const posts = user.edge_owner_to_timeline_media?.edges || [];
  let totalLikes = 0, totalComments = 0, totalViews = 0, videoPosts = 0;
  let lastPostDate = '';

  posts.forEach((edge, i) => {
    const node = edge.node;
    totalLikes += node.edge_liked_by?.count || 0;
    totalComments += node.edge_media_to_comment?.count || 0;
    if (node.video_view_count) {
      totalViews += node.video_view_count;
      videoPosts++;
    }
    if (i === 0 && node.taken_at_timestamp) {
      lastPostDate = new Date(node.taken_at_timestamp * 1000).toISOString().split('T')[0];
    }
  });

  const postSampleSize = posts.length || 1;
  const avgLikes = Math.round(totalLikes / postSampleSize);
  const avgComments = Math.round(totalComments / postSampleSize);
  const avgViews = videoPosts > 0 ? Math.round(totalViews / videoPosts) : 0;
  const engagementRate = followers > 0
    ? ((avgLikes + avgComments) / followers * 100).toFixed(2)
    : '0.00';

  const loc = extractLocation(user);

  return {
    username: user.username || '',
    followers,
    following,
    post_count: postCount,
    avg_likes: avgLikes,
    avg_comments: avgComments,
    avg_video_views: avgViews,
    engagement_rate: parseFloat(engagementRate),
    bio: (user.biography || '').replace(/\n/g, ' '),
    email: user.business_email || user.public_email || '',
    verified: user.is_verified ? 'Yes' : 'No',
    last_post_date: lastPostDate,
    city: loc.city,
    state: loc.state,
    country: loc.country,
    location_source: loc.locationSource,
    profile_url: `https://www.instagram.com/${user.username}/`,
    evaluated_at: new Date().toISOString()
  };
}

// --- Storage ---

async function saveAccount(profile) {
  const { evaluated = [] } = await getState();
  const existing = evaluated.findIndex(a => a.username === profile.username);
  if (existing >= 0) {
    evaluated[existing] = profile;
  } else {
    evaluated.push(profile);
  }
  await setState({ evaluated });
}

// --- Google Sheets integration (service account JWT auth) ---

let _cachedToken = null;
let _cachedTokenExpiry = 0;

function b64url(str) {
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function b64urlFromBuffer(buf) {
  return btoa(String.fromCharCode(...new Uint8Array(buf)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

async function getServiceAccountToken() {
  const now = Math.floor(Date.now() / 1000);
  if (_cachedToken && _cachedTokenExpiry > now + 60) return _cachedToken;

  const { serviceAccountKey } = await getState();
  if (!serviceAccountKey) throw new Error('No service account key saved. Paste it in the extension popup first.');

  const key = typeof serviceAccountKey === 'string' ? JSON.parse(serviceAccountKey) : serviceAccountKey;

  const header = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claims = b64url(JSON.stringify({
    iss: key.client_email,
    scope: 'https://www.googleapis.com/auth/spreadsheets',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600
  }));
  const signingInput = `${header}.${claims}`;

  const pemBody = key.private_key.replace(/-----[^-]+-----/g, '').replace(/\s/g, '');
  const keyDer = Uint8Array.from(atob(pemBody), c => c.charCodeAt(0));
  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8', keyDer.buffer,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false, ['sign']
  );

  const sig = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5', cryptoKey,
    new TextEncoder().encode(signingInput)
  );
  const jwt = `${signingInput}.${b64urlFromBuffer(sig)}`;

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`
  });
  if (!res.ok) throw new Error(`Token exchange failed: ${await res.text()}`);

  const { access_token, expires_in } = await res.json();
  _cachedToken = access_token;
  _cachedTokenExpiry = now + expires_in;
  return access_token;
}

async function sheetsRequest(method, path, body) {
  const token = await getServiceAccountToken();
  const res = await fetch(`${SHEETS_API}/${SPREADSHEET_ID}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: body ? JSON.stringify(body) : undefined
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Sheets API error ${res.status}: ${err}`);
  }
  return res.json();
}

async function ensureSheet(sheetName, headers) {
  const meta = await sheetsRequest('GET', '?fields=sheets.properties.title');
  const exists = meta.sheets.some(s => s.properties.title === sheetName);
  if (!exists) {
    await sheetsRequest('POST', ':batchUpdate', {
      requests: [{
        addSheet: {
          properties: { title: sheetName }
        }
      }]
    });
    // Write header row.
    await sheetsRequest('PUT', `/values/${encodeURIComponent(sheetName + '!A1')}?valueInputOption=USER_ENTERED`, {
      values: [headers]
    });
  }
}

const ACCOUNT_HEADERS = [
  'username','followers','following','post_count','avg_likes','avg_comments',
  'avg_video_views','engagement_rate','bio','email','verified','last_post_date',
  'city','state','country','location_source','profile_url','evaluated_at'
];

async function syncAccountToSheets(profile) {
  await ensureSheet('Accounts', ACCOUNT_HEADERS);
  await ensureSheet('Discovery Queue', ['username','source','status','added_date']);
  await ensureSheet('Edges', ['from_account','to_account','relationship_type','added_date']);

  // Check for existing row to update vs append.
  const existing = await sheetsRequest('GET',
    `/values/${encodeURIComponent('Accounts!A:A')}`);
  const rows = existing.values || [];
  const rowIndex = rows.findIndex((r, i) => i > 0 && r[0] === profile.username);

  const rowData = ACCOUNT_HEADERS.map(h => profile[h] ?? '');

  if (rowIndex >= 0) {
    // Update existing row (1-indexed, +1 for header).
    const range = `Accounts!A${rowIndex + 1}`;
    await sheetsRequest('PUT', `/values/${encodeURIComponent(range)}?valueInputOption=USER_ENTERED`, {
      values: [rowData]
    });
  } else {
    await sheetsRequest('POST', `/values/${encodeURIComponent('Accounts!A:A')}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`, {
      values: [rowData]
    });
  }
}

// --- Pending profile data accumulation ---
// When we navigate to a profile, web_profile_info fires first (top-level data),
// then GraphQL fires with post data. We accumulate both before saving.

let pendingProfileData = {};

async function handleInterceptedData(url, data) {
  // Profile info endpoint.
  if (url.includes('web_profile_info')) {
    const user = data?.data?.user;
    if (!user) return;
    const username = user.username;
    pendingProfileData[username] = pendingProfileData[username] || {};
    Object.assign(pendingProfileData[username], user);
    await maybeFinalize(username);
    return;
  }

  // GraphQL query — could be timeline media, followers, hashtag data, etc.
  if (url.includes('graphql/query')) {
    const user = data?.data?.user;
    if (!user) return;
    const username = user.username;
    if (!username) return;
    pendingProfileData[username] = pendingProfileData[username] || {};
    // Merge timeline media if present.
    if (user.edge_owner_to_timeline_media) {
      pendingProfileData[username].edge_owner_to_timeline_media = user.edge_owner_to_timeline_media;
    }
    await maybeFinalize(username);
  }
}

async function maybeFinalize(username) {
  const data = pendingProfileData[username];
  if (!data || !data.username) return;
  // We have at least a username — extract whatever we have.
  const profile = extractProfileData(data);
  await saveAccount(profile);
  delete pendingProfileData[username];

  // Sync to Sheets.
  try {
    await syncAccountToSheets(profile);
    console.log(`[Wisteria] Synced ${username} to Sheets.`);
  } catch (e) {
    console.error(`[Wisteria] Sheets sync failed for ${username}:`, e.message);
    const { syncErrors = [] } = await getState();
    syncErrors.push({ username, error: e.message, time: Date.now() });
    await setState({ syncErrors });
  }

  // Mark as done in the queue.
  const { queue = [] } = await getState();
  const updated = queue.map(item =>
    item.username === username ? { ...item, status: 'evaluated' } : item
  );
  await setState({ queue: updated });

  // Notify popup/sidepanel.
  chrome.runtime.sendMessage({ type: 'ACCOUNT_EVALUATED', profile }).catch(() => {});
}

// --- Autonomous evaluation loop ---

let evaluationTabId = null;

async function startEvaluation() {
  const { running } = await getState();
  if (running) return;
  await setState({ running: true, sessionCount: 0 });
  console.log('[Wisteria] Evaluation started.');
  evaluationLoop();
}

async function stopEvaluation() {
  await setState({ running: false });
  console.log('[Wisteria] Evaluation stopped.');
  if (evaluationTabId) {
    chrome.tabs.remove(evaluationTabId).catch(() => {});
    evaluationTabId = null;
  }
}

async function evaluationLoop() {
  const settings = await getSettings();

  while (true) {
    const state = await getState();
    if (!state.running) break;

    const dailyCount = await checkDailyCap();
    if (dailyCount >= settings.dailyCap) {
      console.log(`[Wisteria] Daily cap of ${settings.dailyCap} reached. Stopping.`);
      await stopEvaluation();
      break;
    }

    if ((state.sessionCount || 0) >= settings.sessionCap) {
      console.log(`[Wisteria] Session cap of ${settings.sessionCap} reached. Stopping.`);
      await stopEvaluation();
      break;
    }

    const queue = state.queue || [];
    const next = queue.find(item => item.status === 'pending');
    if (!next) {
      console.log('[Wisteria] Queue exhausted.');
      await stopEvaluation();
      break;
    }

    // Mark in-progress.
    const updated = queue.map(item =>
      item.username === next.username ? { ...item, status: 'in_progress' } : item
    );
    await setState({ queue: updated });

    // Navigate to profile.
    const profileUrl = `https://www.instagram.com/${next.username}/`;
    console.log(`[Wisteria] Evaluating: ${next.username}`);

    try {
      if (!evaluationTabId) {
        const tab = await chrome.tabs.create({ url: profileUrl, active: false });
        evaluationTabId = tab.id;
      } else {
        await chrome.tabs.update(evaluationTabId, { url: profileUrl });
      }
    } catch (e) {
      console.error(`[Wisteria] Tab navigation failed for ${next.username}:`, e.message);
      const queueSkip = (await getState()).queue.map(item =>
        item.username === next.username ? { ...item, status: 'skipped' } : item
      );
      await setState({ queue: queueSkip });
      continue;
    }

    // Wait for page to load and data to be intercepted.
    const waitTime = randomDelay(settings.minDelay, settings.maxDelay);
    await sleep(waitTime);

    // Update counts.
    const currentState = await getState();
    const newSessionCount = (currentState.sessionCount || 0) + 1;
    const newDailyCount = ((await checkDailyCap())) + 1;
    await setState({ sessionCount: newSessionCount, dailyCount: newDailyCount });

    // Jitter pause every N accounts.
    if (newSessionCount % settings.jitterEvery === 0) {
      const jitter = randomDelay(settings.jitterMin, settings.jitterMax);
      console.log(`[Wisteria] Jitter pause: ${Math.round(jitter/1000)}s`);
      await sleep(jitter);
    }

    chrome.runtime.sendMessage({
      type: 'PROGRESS',
      sessionCount: newSessionCount,
      dailyCount: newDailyCount,
      queueLength: queue.filter(i => i.status === 'pending').length - 1
    }).catch(() => {});
  }
}

// --- Message router ---

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  (async () => {
    switch (msg.type) {
      case 'IG_INTERCEPT':
        await handleInterceptedData(msg.url, msg.data);
        sendResponse({ ok: true });
        break;

      case 'START_EVALUATION':
        await initQueue();
        await startEvaluation();
        sendResponse({ ok: true });
        break;

      case 'STOP_EVALUATION':
        await stopEvaluation();
        sendResponse({ ok: true });
        break;

      case 'GET_STATE': {
        const state = await getState();
        const evaluated = state.evaluated || [];
        const queue = state.queue || [];
        sendResponse({
          evaluated,
          queue,
          running: state.running || false,
          sessionCount: state.sessionCount || 0,
          dailyCount: state.dailyCount || 0,
          pending: queue.filter(i => i.status === 'pending').length
        });
        break;
      }

      case 'ADD_ACCOUNTS': {
        const { usernames, source } = msg;
        const { queue = [], evaluated = [] } = await getState();
        const evaluatedSet = new Set(evaluated.map(a => a.username));
        const queueSet = new Set(queue.map(a => a.username));
        const newItems = (usernames || [])
          .filter(u => !evaluatedSet.has(u) && !queueSet.has(u))
          .map(u => ({ username: u, source: source || 'manual', status: 'pending', added: Date.now() }));
        await setState({ queue: [...queue, ...newItems] });
        sendResponse({ added: newItems.length });
        break;
      }

      case 'RESET_QUEUE':
        await setState({ queue: [], evaluated: [], sessionCount: 0, dailyCount: 0 });
        sendResponse({ ok: true });
        break;

      case 'SAVE_SERVICE_ACCOUNT_KEY': {
        try {
          const parsed = typeof msg.key === 'string' ? JSON.parse(msg.key) : msg.key;
          if (!parsed.client_email || !parsed.private_key) throw new Error('Invalid key JSON — missing client_email or private_key');
          await setState({ serviceAccountKey: parsed });
          _cachedToken = null; // invalidate any cached token
          sendResponse({ ok: true });
        } catch (e) {
          sendResponse({ ok: false, error: e.message });
        }
        break;
      }

      case 'CONNECT_SHEETS': {
        try {
          await ensureSheet('Accounts', ACCOUNT_HEADERS);
          await ensureSheet('Discovery Queue', ['username','source','status','added_date']);
          await ensureSheet('Edges', ['from_account','to_account','relationship_type','added_date']);
          sendResponse({ ok: true });
        } catch (e) {
          sendResponse({ ok: false, error: e.message });
        }
        break;
      }

      case 'UPDATE_SETTINGS':
        await setState({ settings: msg.settings });
        sendResponse({ ok: true });
        break;

      default:
        sendResponse({ error: 'Unknown message type' });
    }
  })();
  return true; // Keep message channel open for async response.
});

// Initialize on install.
chrome.runtime.onInstalled.addListener(async () => {
  console.log('[Wisteria] Extension installed.');
  await initQueue();
});
