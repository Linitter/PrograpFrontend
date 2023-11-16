import { getConfig } from '../configs/sistemaConfig';
import { message } from 'antd';
import { APIStateTreasury } from './baseService/baseService';

interface StateTreasury {
  source: any;
  year: any;
}

export async function getStateTreasury(url: any) {
  try {
    const response = await APIStateTreasury.get(url, getConfig('priv'));
    return response;
  } catch (error) {
    if (error === 500) {
      message.info('O tempo da sua sessão expirou, faça o login novamente');
    } else if (error !== 401) {
      message.error(
        'Não foi possível obter a lista de tesouro estadual, tente novamente mais tarde.',
      );
    }
    console.error(
      `An unexpected error occurred while retrieving the StateTreasury list.${error}`,
    );
  }
  return false;
}
export async function postStateTreasury(stateTreasury: StateTreasury) {
  try {
    await APIStateTreasury.post(
      '/stateTreasury',
      stateTreasury,
      getConfig('priv'),
    );
    message.success('Tesouro estadual cadastrado com sucesso!');
  } catch (error) {
    if (error === 500) {
      message.info('O tempo da sua sessão expirou, faça o login novamente');
    } else if (error !== 401) {
      message.warning(
        'Não foi possível criar um novo tesouro estadual, tente novamente mais tarde.',
      );
    }
    console.error(
      `An unexpected error occurred while creating a new StateTreasury. ${error}`,
    );
    throw error;
  }
}

export const updateStateTreasury = async (
  stateTreasury: StateTreasury,
  id: any,
) => {
  try {
    await APIStateTreasury.put(
      `/stateTreasury/${id}`,
      stateTreasury,
      getConfig('priv'),
    );
    message.success('Tesouro estadual atualizado com sucesso!');
  } catch (error) {
    if (error === 500) {
      message.info('O tempo da sua sessão expirou, faça o login novamente');
    } else if (error !== 401) {
      message.error(
        'Não foi possivel atualizar o tesouro estadual. Tente novamente mais tarde.',
      );
    }
    console.error(
      'error',
      `An unexpected error occurred while updating the StateTreasury.${error}`,
    );
  }
};

export async function getOneStateTreasury(id: any) {
  try {
    const response = await APIStateTreasury.get(
      `stateTreasury/${id}`,
      getConfig('priv'),
    );
    return response;
  } catch (error) {
    if (error === 500) {
      message.info('O tempo da sua sessão expirou, faça o login novamente');
    } else if (error !== 401) {
      message.error(
        'Não foi possível obter a lista de tesouro estadual, tente novamente mais tarde.',
      );
    }
    console.error(
      `An unexpected error occurred while retrieving the StateTreasury list.${error}`,
    );
  }
  return false;
}

export async function deleteStateTreasury(id: any) {
  try {
    await APIStateTreasury.delete(`stateTreasury/${id}`, getConfig('priv'));
  } catch (error) {
    if (error === 500) {
      message.error('O tempo da sua sessão expirou, faça o login novamente');
    } else if (error !== 401) {
      message.error(`Não foi possivel deletar a tesouro estadual.\n${error}`);
    }
    console.error(error);
  }
}
