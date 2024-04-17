import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";

function Popup({ position, children }) {
    const map = useMap();
  
    useEffect(() => {
      if (position) {
        const popup = L.popup().setLatLng(position).setContent(children).openOn(map);
  
        return () => {
          map.closePopup(popup);
        };
      }
    }, [map, position, children]);
  
    return null;
  }
  

  export {Popup};