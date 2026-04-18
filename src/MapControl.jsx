import L from "leaflet";
import { useMap } from "react-leaflet";
import { useEffect } from "react";

export default function MapControl({ onToggle }) {
  const map = useMap();

  useEffect(() => {
    const control = L.control({ position: "topright" });

    control.onAdd = () => {
      const div = L.DomUtil.create("div", "leaflet-bar custom-vci-control");
      div.innerHTML = "VCI";

      L.DomEvent.on(div, 'click', function (e) {
        L.DomEvent.stopPropagation(e); 
        div.classList.toggle("active");
        if (onToggle) onToggle();
      });

      L.DomEvent.disableClickPropagation(div);

      return div;
    };

    control.addTo(map);

    return () => map.removeControl(control);
  }, [map, onToggle]);

  return null;
}