import { useEffect } from "react";
import { useMap } from "react-leaflet";

function MapClickHandler({ onClick }) {
    const map = useMap();
  
    useEffect(() => {
      const handleClick = (e) => {
        onClick(e);
      };
  
      map.on("click", handleClick);
  
      return () => {
        map.off("click", handleClick);
      };
    }, [map, onClick]);
  
    return null;
}

export {MapClickHandler};
  