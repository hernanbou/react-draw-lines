import React from "react";
import '../styles/mapselector.scss'

interface Map {
  id: number;
  owner: string;
  name: string;
  image: string;
}

interface MapSelectorProps {
  maps: Map[];
  onSelectMap: (mapId: number) => void;
}

const MapSelector: React.FC<MapSelectorProps> = ({ maps, onSelectMap }) => {
  return (
    <div>
      <h2>Selecione um mapa:</h2>
      <ul>
        {maps.map((map) => (
          <li key={map.id}>
            <button onClick={() => onSelectMap(map.id)}>
              {map.name} - {map.owner}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MapSelector;