import { getConfig } from '../configs/sistemaConfig';
import { message } from 'antd';
import { APIStateAmendment } from './baseService/baseService';

interface StateAmendment {
  source: any;
  year: any;
  amendmentNumber: any;
  transferAmount: any;
  description: any;
  balance: any;
}

export async function getStateAmendment(url: any) {
  try {
    const response = await APIStateAmendment.get(url, getConfig('priv'));
    return response;
  } catch (error) {
    if (error === 500) {
      message.info('O tempo da sua sessão expirou, faça o login novamente');
    } else if (error !== 401) {
      message.error(
        'Não foi possível obter a lista de convênio, tente novamente mais tarde.',
      );
    }
    console.error(
      `An unexpected error occurred while retrieving the StateAmendment list.${error}`,
    );
  }
  return false;
}
export async function postStateAmendment(stateAmendment: StateAmendment) {
  try {
    const response = await APIStateAmendment.post(
      '/stateAmendment',
      stateAmendment,
      getConfig('priv'),
    );
    message.success('Emenda Estadual cadastrado com sucesso!');
    return response.data; // Retorne os dados do convênio salvo
  } catch (error) {
    if (error === 500) {
      message.info('O tempo da sua sessão expirou, faça o login novamente');
    } else if (error !== 401) {
      message.warning(
        'Não foi possível criar um novo convênio, tente novamente mais tarde.',
      );
    }
    console.error(
      `An unexpected error occurred while creating a new StateAmendment. ${error}`,
    );
    throw error;
  }
}

export const updateStateAmendment = async (
  stateAmendment: StateAmendment,
  id: any,
) => {
  try {
    await APIStateAmendment.put(
      `/stateAmendment/${id}`,
      stateAmendment,
      getConfig('priv'),
    );
    message.success('Emenda Estadual atualizado com sucesso!');
  } catch (error) {
    if (error === 500) {
      message.info('O tempo da sua sessão expirou, faça o login novamente');
    } else if (error !== 401) {
      message.error(
        'Não foi possivel atualizar o Emenda Estadual. Tente novamente mais tarde.',
      );
    }
    console.error(
      'error',
      `An unexpected error occurred while updating the StateAmendment.${error}`,
    );
  }
};

export async function getOneStateAmendment(id: any) {
  try {
    const response = await APIStateAmendment.get(
      `stateAmendment/${id}`,
      getConfig('priv'),
    );
    return response;
  } catch (error) {
    if (error === 500) {
      message.info('O tempo da sua sessão expirou, faça o login novamente');
    } else if (error !== 401) {
      message.error(
        'Não foi possível obter a lista de Emenda Estadual, tente novamente mais tarde.',
      );
    }
    console.error(
      `An unexpected error occurred while retrieving the StateAmendment list.${error}`,
    );
  }
  return false;
}

export async function deleteStateAmendment(id: any) {
  try {
    await APIStateAmendment.delete(`stateAmendment/${id}`, getConfig('priv'));
  } catch (error) {
    if (error === 500) {
      message.error('O tempo da sua sessão expirou, faça o login novamente');
    } else if (error !== 401) {
      message.error(`Não foi possivel deletar a Emenda Estadual.\n${error}`);
    }
    console.error(error);
  }
}
