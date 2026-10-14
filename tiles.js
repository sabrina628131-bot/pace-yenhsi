// Base map for every page: OpenStreetMap standard tiles, the same source as the original campus map.
// Light use only. For school-wide or many-class use, switch to a school-hosted or licensed tile service
// and keep the attribution text.
window.PACE_TILE={
  maxZoom:19,
  attribution:'© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  layers:[
    {url:'https://tile.openstreetmap.org/{z}/{x}/{y}.png'}
  ]
};
// Adds the base layers to a map and returns the first (base) tile layer so callers can listen for tile errors.
window.addBaseMap=function(map){
  const T=window.PACE_TILE;
  let base=null;
  T.layers.forEach((l,i)=>{const layer=L.tileLayer(l.url,{maxZoom:T.maxZoom,maxNativeZoom:l.maxNativeZoom,attribution:i===0?T.attribution:''}).addTo(map);if(i===0)base=layer;});
  return base;
};
