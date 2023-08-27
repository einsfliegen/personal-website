mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
  container: 'map', // container ID
  style: 'mapbox://styles/mapbox/streets-v12', // style URL
  center: site.geometry.coordinates, // starting position [lng, lat]
  zoom: 8, // starting zoom
});

map.addControl(new mapboxgl.NavigationControl());

map.addControl(new mapboxgl.GeolocateControl({
  positionOptions: {
      enableHighAccuracy : true
  },
  showUserHeading : true,
  showAccuracyCircle : false
}))

new mapboxgl.Marker()
  .setLngLat(site.geometry.coordinates)
  .setPopup(
    new mapboxgl.Popup({offset: 25})
      .setHTML(
        `<h4>${site.title}</h4><p>${site.location}</p>`
      )
  )
  .addTo(map)