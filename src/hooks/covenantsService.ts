import { getConfig } from '../configs/sistemaConfig';
import { message } from 'antd';
import { APICovenants } from './baseService/baseService';

interface Covenants {
  source: any;
  year: any;
  amendmentNumber: any;
  agreementNumber: any;
  processNumber: any;
  transferAmount: any;
  counterpartValue: any;
  globalValue: any;
  description: any;
  balance: any;
  grantor: any;
}

export async function getCovenants(url: any) {
  try {
    const response = await APICovenants.get(url, getConfig('priv'));
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
      `An unexpected error occurred while retrieving the covenants list.${error}`,
    );
  }
  return false;
}
export async function postCovenants(covenants: Covenants) {
  try {
    const response = await APICovenants.post(
      '/covenants',
      covenants,
      getConfig('priv'),
    );
    message.success('Convênio cadastrado com sucesso!');
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
      `An unexpected error occurred while creating a new covenants. ${error}`,
    );
    throw error;
  }
}

export const updateCovenants = async (covenants: Covenants, id: any) => {
  try {
    await APICovenants.put(`/covenants/${id}`, covenants, getConfig('priv'));
    message.success('Convênio atualizado com sucesso!');
  } catch (error) {
    if (error === 500) {
      message.info('O tempo da sua sessão expirou, faça o login novamente');
    } else if (error !== 401) {
      message.error(
        'Não foi possivel atualizar o convênio. Tente novamente mais tarde.',
      );
    }
    console.error(
      'error',
      `An unexpected error occurred while updating the covenants.${error}`,
    );
  }
};

export async function getOneCovenants(id: any) {
  try {
    const response = await APICovenants.get(
      `covenants/${id}`,
      getConfig('priv'),
    );
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
      `An unexpected error occurred while retrieving the covenants list.${error}`,
    );
  }
  return false;
}

export async function deleteCovenants(id: any) {
  try {
    await APICovenants.delete(`covenants/${id}`, getConfig('priv'));
  } catch (error) {
    if (error === 500) {
      message.error('O tempo da sua sessão expirou, faça o login novamente');
    } else if (error !== 401) {
      message.error(`Não foi possivel deletar o convênio.\n${error}`);
    }
    console.error(error);
  }
}
