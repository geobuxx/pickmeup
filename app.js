import Map from 'https://cdn.skypack.dev/ol/Map.js';
import View from 'https://cdn.skypack.dev/ol/View.js';
import TileLayer from 'https://cdn.skypack.dev/ol/layer/Tile.js';
import OSM from 'https://cdn.skypack.dev/ol/source/OSM.js';
import Overlay from 'https://cdn.skypack.dev/ol/Overlay.js';
import { toLonLat, fromLonLat } from 'https://cdn.skypack.dev/ol/proj.js';
import Feature from 'https://cdn.skypack.dev/ol/Feature.js';
import Point from 'https://cdn.skypack.dev/ol/geom/Point.js';
import VectorSource from 'https://cdn.skypack.dev/ol/source/Vector.js';
import VectorLayer from 'https://cdn.skypack.dev/ol/layer/Vector.js';
import { Style, Icon } from 'https://cdn.skypack.dev/ol/style.js';

const map = new Map({
  target: 'map',
  layers: [new TileLayer({ source: new OSM() })],
  view: new View({
    center: fromLonLat([0, 0]),
    zoom: 2,
  }),
});

const popup = document.createElement('div');
popup.className = 'popup';
document.body.appendChild(popup);

const overlay = new Overlay({
  element: popup,
  autoPan: true,
});
map.addOverlay(overlay);

const markerSource = new VectorSource();
map.addLayer(new VectorLayer({ source: markerSource }));

navigator.geolocation.getCurrentPosition(
  ({ coords: { latitude, longitude } }) => {
    const userCoordinates = fromLonLat([longitude, latitude]);
    const view = map.getView();
    view.setCenter(userCoordinates);
    view.setZoom(20);

    const marker = new Feature({
      geometry: new Point(userCoordinates),
    });
    marker.setStyle(
      new Style({
        image: new Icon({
          src: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
          scale: 0.05,
        }),
      })
    );
    markerSource.addFeature(marker);

    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lon=${longitude}&lat=${latitude}`)
      .then((response) => response.json())
      .then((data) => {
        const locationName = data.display_name || 'No location data';
        const streetName = data.address.road || 'Street name not found';
        popup.innerHTML = `
          <div>
            <strong>Your Location:</strong><br />
            ${locationName}<br />
            <strong>Street:</strong> ${streetName}<br />
            <strong>Coordinates:</strong> ${longitude.toFixed(6)}, ${latitude.toFixed(6)}
          </div>`;
        overlay.setPosition(userCoordinates);
      })
      .catch(() => {
        popup.innerHTML = `
          <div>
            <strong>Your Location:</strong><br />
            Location not found!.<br />
            <strong>Coordinates:</strong> ${longitude.toFixed(6)}, ${latitude.toFixed(6)}
          </div>`;
        overlay.setPosition(userCoordinates);
      });
  },
  () => {
    Swal.fire({
      icon: 'error',
      title: 'Cannot find your location',
      text: 'Make sure location permission allowed.',
    });
  }
);