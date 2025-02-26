import {Dot, Line} from '../utils/types'

export const saveLines = async (mapID: number, lines: Line[]) => {
  
    try {
      const response = await fetch(`http://localhost:5000/maps/${mapID}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ line_list: lines }),
      });
  
      if (response.ok) {
        console.log('Vetores salvas com sucesso!');
      } else {
        console.error('Erro ao salvar vetores:', response.statusText);
      }
    } catch (error) {
      console.error('Erro ao salvar vetores:', error);
    }
  };   

  export const saveDots = async (mapID: number, dots: Dot[]) => {
    try {
      const response = await fetch(`http://localhost:5000/maps/${mapID}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ point_list: dots }),
      });
  
      if (response.ok) {
        console.log('Pontos salvos com sucesso!');
      } else {
        console.error('Erro ao salvar pontos:', response.statusText);
      }
    } catch (error) {
      console.error('Erro ao salvar pontos:', error);
    }
  };

  export const saveZones = async (mapID: number, zoneLength: Dot[]) => {
    try {
      const response = await fetch(`http://localhost:5000/maps/${mapID}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ zone_list: zoneLength }),
      });
  
      if (response.ok) {
        console.log('Zonas salvos com sucesso!');
      } else {
        console.error('Erro ao salvar zonas:', response.statusText);
      }
    } catch (error) {
      console.error('Erro ao salvar zonas:', error);
    }
  };