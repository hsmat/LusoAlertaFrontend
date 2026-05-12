import L from "leaflet";
import { useMap } from "react-leaflet";
import { useEffect, useRef } from "react";

export default function MapControl({ onToggle, isActive, isLoading }) {
  const map = useMap();
  const divRef = useRef(null);
  const onToggleRef = useRef(onToggle);

  // Keep track of the latest onToggle function without destroying the button
  useEffect(() => {
    onToggleRef.current = onToggle;
  }, [onToggle]);

  useEffect(() => {
    const control = L.control({ position: "topright" });

    control.onAdd = () => {
      const div = L.DomUtil.create("div", "leaflet-bar custom-vci-control");

      L.DomEvent.on(div, 'click', function (e) {
        L.DomEvent.stopPropagation(e); 
        // We don't manually toggle the class here anymore.
        // We let React State drive the UI changes safely.
        if (onToggleRef.current) onToggleRef.current();
      });

      L.DomEvent.disableClickPropagation(div);
      divRef.current = div;

      return div;
    };

    control.addTo(map);

    return () => {
        map.removeControl(control);
        divRef.current = null;
    };
  }, [map]); // Removed onToggle from dependencies so it doesn't constantly destroy the button!

  // Update the button's DOM safely when props change
  useEffect(() => {
    if (divRef.current) {
        divRef.current.innerHTML = isLoading ? "A carregar..." : "VCI";
        
        if (isActive) divRef.current.classList.add("active");
        else divRef.current.classList.remove("active");
        
        if (isLoading) divRef.current.classList.add("loading");
        else divRef.current.classList.remove("loading");
    }
  }, [isActive, isLoading]);

  return null;
}