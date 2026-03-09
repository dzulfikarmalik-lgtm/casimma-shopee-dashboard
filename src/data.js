// ─────────────────────────────────────────────────────────────
//  DATA SHOPEE — Update file ini setiap bulan
//  Format: index 0 = Jan, index 1 = Feb, ... index 11 = Des
//  Gunakan null untuk bulan yang belum ada datanya
// ─────────────────────────────────────────────────────────────

export const RAW_DATA = {
  2023: {
    revenue:      [null,null,null,null,null,null,null,null,1826269,4458020,2127843,3760800],
    traffic:      [null,null,null,null,null,null,null,null,5073,10199,6046,7701],
    productViews: [null,null,null,null,null,null,null,null,12669,27249,16589,22951],
    cvrToko:      [null,null,null,null,null,null,null,null,null,null,null,null],
    aov:          [null,null,null,null,null,null,null,null,182627,247668,212784,313400],
    budgetAds:    [null,null,null,null,null,null,null,null,null,null,null,null],
    crAds:        [null,null,null,null,null,null,null,null,null,null,null,null],
    roi:          [null,null,null,null,null,null,null,null,null,null,null,null],
  },
  2024: {
    revenue:      [2246946,1419997,5402248,4709345,4241299,8314124,10187404,11343012,14701617,10906018,11231631,12686386],
    traffic:      [8214,5191,8902,4782,7364,8022,7159,8584,12029,10602,10180,10388],
    productViews: [24121,13329,24794,17912,30094,27013,21879,26287,48039,43319,39338,36724],
    cvrToko:      [0.07,0.10,0.16,0.44,0.31,0.47,0.43,0.31,0.48,0.38,0.36,0.49],
    aov:          [374491,283999,385875,224255,184404,218793,328626,420112,253476,272650,303558,248753],
    budgetAds:    [3000000,3000000,3000000,6000000,6000000,6000000,6000000,6000000,6000000,6000000,6000000,6000000],
    crAds:        [133.51,211.27,55.53,127.41,141.47,72.17,58.90,52.90,40.81,55.02,53.42,47.29],
    roi:          [0.75,0.47,1.80,0.78,0.71,1.39,1.70,1.89,2.45,1.82,1.87,2.11],
  },
  2025: {
    revenue:      [8087609,20684652,79655401,15812730,9432591,11506837,24396949,12738938,25448974,31045312,35665776,28619379],
    traffic:      [9637,14133,24500,11043,9450,7585,14668,8701,8105,8092,12332,11222],
    productViews: [30373,48993,98972,41295,33624,25083,49125,27997,35091,35742,45403,27608],
    cvrToko:      [0.33,0.54,1.08,0.54,0.41,0.66,0.65,0.55,1.21,1.37,0.96,0.80],
    aov:          [252738,272166,301725,263546,241861,230137,256810,265395,259683,279687,299712,317993],
    budgetAds:    [4253823,8706319,8774513,5525777,4527787,3019112,8617144,3896565,3699236,4128105,7050109,5486175],
    crAds:        [52.60,42.09,11.02,34.95,48.00,26.24,35.32,30.59,14.54,13.30,19.77,19.17],
    roi:          [1.90,2.38,9.08,2.86,2.08,3.81,2.83,3.27,6.88,7.52,5.06,5.22],
  },
  2026: {
    revenue:      [40371039,90865216,56510917,null,null,null,null,null,null,null,null,null],
    traffic:      [15804,31112,11727,null,null,null,null,null,null,null,null,null],
    productViews: [59681,117062,37139,null,null,null,null,null,null,null,null,null],
    cvrToko:      [0.78,0.78,0.97,null,null,null,null,null,null,null,null,null],
    aov:          [325573,375476,495710,null,null,null,null,null,null,null,null,null],
    budgetAds:    [5100000,14172484,2402970,null,null,null,null,null,null,null,null,null],
    crAds:        [12.63,15.60,4.25,null,null,null,null,null,null,null,null,null],
    roi:          [7.92,6.41,23.52,null,null,null,null,null,null,null,null,null],
  },
};

export const YEARS = [2023, 2024, 2025, 2026];
export const ALL_MONTHS = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];
