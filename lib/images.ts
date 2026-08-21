/**
 * Merkezi görsel yapılandırması.
 * Restoran kendi fotoğraflarını eklediğinde yalnızca bu dosyayı güncelleyin.
 */
const u = (id: string, extra = "") =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1400&q=80${extra}`;

export const IMAGES = {
  hero: u("photo-1558030006-450675393462"),
  grillEmbers: u("photo-1529193591184-b1d58069ecdd"),
  interior: "/images/about/interior-1.jpg",
  interior2: "/images/about/interior-2.jpg",
  interior3: "/images/about/interior-3.jpg",
  interior4: "/images/about/interior-4.jpg",
  tableSetting: u("photo-1517248135467-4c7edcad34c4"),
  qrStand: u("photo-1559339352-11d035aa65de"),
  social: [
    u("photo-1544025162-d76694265947"),
    u("photo-1600891964092-4316c288032e"),
    u("photo-1603360946369-dc9bb6259378"),
    u("photo-1555939594-58d7cb561ad1"),
  ],
  food: {
    karisikIzgara: u("photo-1544025162-d76694265947"),
    danaAntrikot: u("photo-1600891964092-4316c288032e"),
    kuzuPirzola: u("photo-1529692236671-f1f6cf9683ba"),
    tbone: u("photo-1558030006-450675393462"),
    ribeye: u("photo-1600891962237-74d0c0d1d0c5"),
    bonfile: u("photo-1615937691194-97dbd3f3dc29"),
    adana: u("photo-1603360946369-dc9bb6259378"),
    urfa: u("photo-1599487488170-d11ec9c172f0"),
    kuzuSis: u("photo-1604503468506-a8da13d82791"),
    tavukSis: u("photo-1598103442097-8b74394b95c6"),
    kanat: u("photo-1527477396000-e27163b481c2"),
    sucuk: u("photo-1529193591184-b1d58069ecdd"),
    kofte: u("photo-1529042410759-befb1204b468"),
    beyti: u("photo-1644364935906-792b2245a2c7"),
    ciger: u("photo-1432139509613-5c4255815697"),
    pideKiymali: u("photo-1594007654729-407eedc4be65"),
    pideKasarli: u("photo-1513104890138-7c749659a591"),
    lahmacun: u("photo-1633321702518-7feccafb94d5"),
    coban: u("photo-1540189549336-e6e99c3679fe"),
    mevsim: u("photo-1512621776951-a57141f2eefd"),
    patates: u("photo-1576107232684-1279f390859f"),
    haydari: u("photo-1505253758473-96ef23732ac0"),
    ezme: u("photo-1473093295043-cdd812d0e601"),
    cacik: u("photo-1485921325833-c519f76c2230"),
    kunefe: u("photo-1571877227200-a0d98ea607e9"),
    katmer: u("photo-1551024506-0bccd828d307"),
    baklava: u("photo-1519676867240-f03562e64548"),
    sutlac: u("photo-1488477183342-2102569ae349"),
    ayran: u("photo-1623065422902-30a2d299bbe4"),
    kola: u("photo-1622483767028-3f66f32aef97"),
    salgam: u("photo-1613478223719-2ab802602423"),
    kahve: u("photo-1514432324607-a09d9b4aefdd"),
    cay: u("photo-1576092768241-dec231879fc3"),
    su: u("photo-1548839140-29a749e1cf4d"),
    corba: u("photo-1547592166-23acba8886da"),
  },
} as const;

export const LOGO_SRC = "/images/logo/logo.png";
