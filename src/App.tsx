import React, { useState, useEffect } from "react";
import MapSelector from "./pages/MapSelector";
import Canvas from "./components/Canvas";
import './styles/global.scss'
import './styles/app.scss'

interface Map {
  id: number;
  owner: string;
  name: string;
  image: string;
}

const App: React.FC = () => {
  const [maps, setMaps] = useState<Map[]>([]);
  const [selectedMapId, setSelectedMapId] = useState<number | null>(null);

  useEffect(() => {
    fetch("http://localhost:5000/maps")
      .then((response) => response.json())
      .then((data) => setMaps(data))
      .catch((error) => console.error("Erro ao carregar mapas:", error));
  }, []);

  const selectedMap = maps.find((map) => map.id === selectedMapId);

  return (
    <div className="container">
      <h1>Visualizador de Mapas</h1>
      <MapSelector maps={maps} onSelectMap={setSelectedMapId} />
      {selectedMap && (
        <div>
          <h2>{selectedMap.name}</h2>
          <h3>Proprietário: {selectedMap.owner}</h3>
          <menu>
            <h4>Menu:</h4>
            <p>Aperte &#91; Z &#93; para alterar Zona</p>
            <p>Aperte &#91; X &#93; para parar de desenhar</p>
            <p>Aperte &#91; C &#93; para adicionar um Ponto de Calibração</p>
          </menu>
          <Canvas mapID={selectedMap.id} />
        </div>
      )}
    </div>
  );
};

export default App;