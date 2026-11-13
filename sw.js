/* CookFlow — service worker : tout fonctionne hors ligne */
const CACHE = 'cookflow-mwfe7s5l';
const PHOTOS = 'cookflow-photos';
const PHOTO_LIST = ["rec_2.jpg","rec_3.jpg","rec_5.jpg","rec_8.jpg","rec_9.jpg","rec_10.jpg","rec_11.jpg","rec_12.jpg","rec_14.jpg","rec_15.jpg","fr_daube.jpg","fr_bourguignon.jpg","fr_ratatouille.jpg","fr_quiche.jpg","fr_parmentier.jpg","fr_basquaise.jpg","fr_oignon.jpg","fr_croque.jpg","fr_mousse.jpg","w_bolo.jpg","w_carbo.jpg","w_chili.jpg","w_butter.jpg","w_lasagnes.jpg","w_pizza.jpg","w_guac.jpg","w_gaspacho.jpg","w_pancakes.jpg","w_tiramisu.jpg","w_naan.jpg","p_taboule.jpg","p_samoussas.jpg","p_frites.jpg","p_mayo.jpg","p_pesto.jpg","p_hollandaise.jpg","p_pain.jpg","p_creme_anglaise.jpg","p_fondant.jpg","p_tarte_pommes.jpg","p_rizaulait.jpg","p_patissiere.jpg","p_brownie.jpg","p_bananabread.jpg","p_gougeres.jpg","p_granola.jpg","p_yaourts.jpg","p_confiture.jpg","p_smoothie.jpg","p_chocochaud.jpg","p_citronnade.jpg","f_coqauvin.jpg","f_pouletcreme.jpg","f_navarin.jpg","f_marengo.jpg","f_petitsale.jpg","f_tartiflette.jpg","f_endives.jpg","f_brandade.jpg","f_moules.jpg","f_lapin.jpg","f_macaroni.jpg","f_pissaladiere.jpg","f_pistou.jpg","f_bouillabaisse.jpg","f_poireaux.jpg","f_mimosa.jpg","f_celeri.jpg","f_souffle.jpg","f_galettes.jpg","f_far.jpg","f_flan.jpg","f_tartecitron.jpg","f_ileflottante.jpg","f_financiers.jpg","f_caramel.jpg","f_belleh.jpg","f_tatin.jpg","f_yaourt.jpg","f_quatrequarts.jpg","f_gaufres.jpg","l2_potaufeu.jpg","l2_pouleaupot.jpg","l2_choucroute.jpg","l2_vallee_auge.jpg","l2_tomates_farcies.jpg","l2_sole_meuniere.jpg","l2_quenelles_nantua.jpg","l2_carbonade.jpg","l2_potee.jpg","l2_axoa.jpg","l2_poulet_vinaigre.jpg","l2_quiche_saumon.jpg","l2_salade_lyonnaise.jpg","l2_chevre_chaud.jpg","l2_oeufs_meurette.jpg","l2_garbure.jpg","l2_aligot.jpg","l2_sarladaises.jpg","l2_gratin_savoyard.jpg","l2_tian.jpg","l2_cervelle_canut.jpg","l3_bravas.jpg","l3_gyros.jpg","l3_nems.jpg","l3_tao.jpg","l3_onion_rings.jpg","l3_agneau_soleil.jpg","l3_roti_boeuf.jpg","l3_oeufs_durs.jpg","l3_arancini.jpg","l3_accras.jpg","l3_tandoori.jpg","l3_moussaka.jpg","l3_pulled_pork.jpg","l3_kottbullar.jpg","l3_biryani.jpg","l3_couscous.jpg","l3_chakchouka.jpg","l3_paella.jpg","l3_tzatziki.jpg","l3_salsa.jpg","l3_pho.jpg","l3_porc_caramel.jpg","l3_minestrone.jpg","l3_chili_sin.jpg","l3_tortilla.jpg","l3_bobun.jpg","l4_tarte_fraises.jpg","l4_bourdaloue.jpg","l4_tarte_choco.jpg","l4_charlotte.jpg","l4_marbre.jpg","l4_muffins.jpg","l4_meringues.jpg","l4_sables.jpg","l4_canneles.jpg","l4_galette_rois.jpg","l4_churros.jpg","l4_sorbet_mangue.jpg","l4_poires_vin.jpg","l4_gateau_basque.jpg","l4_baguettes.jpg","l4_pain_complet.jpg","l4_fougasse.jpg","l4_pita.jpg","l4_pains_lait.jpg","l4_bagels.jpg","l4_feuilletee.jpg","l4_pate_sablee.jpg","l4_pate_choux.jpg","l4_bearnaise.jpg","l4_pate_tartiner.jpg","l4_milkshake.jpg","l4_lait_avoine.jpg","l4_bircher.jpg","l4_oeufs_brouilles.jpg","l4_beurre_maison.jpg","l4_bebe_poire.jpg","fr_blanquette.jpg","fr_clafoutis.jpg","w_falafel.jpg","p_riz.jpg","p_creme_brulee.jpg","p_tapenade.jpg","p_amande.jpg","f_cassoulet.jpg","f_flammekueche.jpg","f_nicoise.jpg","f_profiteroles.jpg","f_painperdu.jpg","l2_truite_amandes.jpg","l2_tarte_tomate.jpg","l2_feuilletes_saucisse.jpg","l3_mozza_sticks.jpg","l3_parmigiana.jpg","l3_mafe.jpg","l4_pannacotta.jpg","l4_pain_epices.jpg","l4_buns.jpg","l4_sauce_tomate.jpg","l4_bebe_carotte.jpg"];
const ASSETS = ['./', './index.html', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png', './icons/icon-maskable-512.png', './icons/apple-touch-icon.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE && k !== PHOTOS).map(k => caches.delete(k)))).then(() => self.clients.claim()));
  // Photos : téléchargées une fois en arrière-plan, gardées d'une version à l'autre
  caches.open(PHOTOS).then(async c => {
    const have = new Set((await c.keys()).map(k => new URL(k.url).pathname.split('/').pop()));
    for (const f of PHOTO_LIST) if (!have.has(f)) { try { const res = await fetch('./img/' + f); if (res.ok) await c.put('./img/' + f, res); } catch (e) {} }
  });
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  const page = req.mode === 'navigate' || /\/(index\.html)?$/.test(new URL(req.url).pathname);
  if (page) {
    // Page : réseau d'abord (mises à jour), sinon la copie gardée sur l'appareil
    e.respondWith(fetch(req).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put('./index.html', copy)); }
      return res;
    }).catch(() => caches.match('./index.html')));
    return;
  }
  if (/\/img\/[^/]+\.jpg$/.test(new URL(req.url).pathname)) {
    e.respondWith(caches.open(PHOTOS).then(c => c.match(req, { ignoreSearch: true }).then(hit => hit || fetch(req).then(res => {
      if (res.ok) c.put(req, res.clone());
      return res;
    }))).catch(() => Response.error()));
    return;
  }
  e.respondWith(
    caches.match(req, { ignoreSearch: true }).then(hit => hit || fetch(req).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
      return res;
    }).catch(() => Response.error()))
  );
});
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: 'window' }).then(list => list.length ? list[0].focus() : self.clients.openWindow('./')));
});
