import { api } from '../services/api';
import { Calibration, Zone, Line } from '../utils/types'

export const saveLines = async (mapID: number, lines: Line[]) => {

  try {
    const response = await api.put(`/maps/${mapID}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ line_list: lines }),
    });

    if (response.statusText.toLowerCase() === "ok") {
      console.log('Vetores salvas com sucesso!');
    } else {
      console.error('Erro ao salvar vetores:', response.statusText);
    }
  } catch (error) {
    console.error('Erro ao salvar vetores:', error);
  }
};

export const saveDots = async (mapID: number, dots: Calibration[]) => {
  try {
    const response = await api.put(`/maps/${mapID}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ point_list: dots }),
    });

    if (response.statusText.toLowerCase() === "ok") {
      console.log('Pontos salvos com sucesso!');
    } else {
      console.error('Erro ao salvar pontos:', response.statusText);
    }
  } catch (error) {
    console.error('Erro ao salvar pontos:', error);
  }
};

export const saveZones = async (mapID: number, zoneLength: Zone[]) => {
  try {
    const response = await api.put(`/maps/${mapID}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ zone_list: zoneLength }),
    });

    if (response.statusText.toLowerCase() === "ok") {
      console.log('Zonas salvos com sucesso!');
    } else {
      console.error('Erro ao salvar zonas:', response.statusText);
    }
  } catch (error) {
    console.error('Erro ao salvar zonas:', error);
  }
};
