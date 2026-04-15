import L from "leaflet";
import { useMap } from "react-leaflet";
import { useEffect } from "react";

export default function MapControl({ onToggle }) {
  const map = useMap();

  useEffect(() => {
    const control = L.control({ position: "topright" });

    control.onAdd = () => {
      const div = L.DomUtil.create("div", "leaflet-bar");
      div.style.background = "white";
      div.style.padding = "5px";
      div.style.cursor = "pointer";
      div.innerHTML = "NDVI";
      div.onclick = onToggle;

      L.DomEvent.disableClickPropagation(div);

      return div;
    };

    control.addTo(map);

    return () => map.removeControl(control);
  }, [map, onToggle]);

  return null;
}