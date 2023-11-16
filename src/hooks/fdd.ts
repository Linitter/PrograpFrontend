import { getConfig } from '../configs/sistemaConfig';
import { message } from 'antd';
import { APIFdd } from './baseService/baseService';

interface FDD {
  source: any;
  year: any;
  agreementNumber: any;
  processNumber: any;
  transferAmount: any;
  counterpartValue: any;
  globalValue: any;
  description: any;
  balance: any;
}

export async function getFdd(url: any) {
  try {
    const response = await APIFdd.get(url, getConfig('priv'));
    return response;
  } catch (error) {
    if (error === 500) {
      message.info('O tempo da sua sessão expirou, faça o login novamente');
    } else if (error !== 401) {
      message.error(
        'Não foi possível obter a lista de FDD, tente novamente mais tarde.',
      );
    }
    console.error(
      `An unexpected error occurred while retrieving the FDD list.${error}`,
    );
  }
  return false;
}
export async function postFdd(fdd: FDD) {
  try {
    await APIFdd.post('/fdd', fdd, getConfig('priv'));
    message.success('FDD cadastrado com sucesso!');
  } catch (error) {
    if (error === 500) {
      message.info('O tempo da sua sessão expirou, faça o login novamente');
    } else if (error !== 401) {
      message.warning(
        'Não foi possível criar um novo FDD, tente novamente mais tarde.',
      );
    }
    console.error(
      `An unexpected error occurred while creating a new FDD. ${error}`,
    );
    throw error;
  }
}

export const updateFdd = async (fdd: FDD, id: any) => {
  try {
    await APIFdd.put(`/fdd/${id}`, fdd, getConfig('priv'));
    message.success('FDD atualizado com sucesso!');
  } catch (error) {
    if (error === 500) {
      message.info('O tempo da sua sessão expirou, faça o login novamente');
    } else if (error !== 401) {
      message.error(
        'Não foi possivel atualizar o FDD. Tente novamente mais tarde.',
      );
    }
    console.error(
      'error',
      `An unexpected error occurred while updating the FDD.${error}`,
    );
  }
};

export async function getOneFdd(id: any) {
  try {
    const response = await APIFdd.get(`fdd/${id}`, getConfig('priv'));
    return response;
  } catch (error) {
    if (error === 500) {
      message.info('O tempo da sua sessão expirou, faça o login novamente');
    } else if (error !== 401) {
      message.error(
        'Não foi possível obter a lista de FDD, tente novamente mais tarde.',
      );
    }
    console.error(
      `An unexpected error occurred while retrieving the FDD list.${error}`,
    );
  }
  return false;
}

export async function deleteFdd(id: any) {
  try {
    await APIFdd.delete(`fdd/${id}`, getConfig('priv'));
  } catch (error) {
    if (error === 500) {
      message.error('O tempo da sua sessão expirou, faça o login novamente');
    } else if (error !== 401) {
      message.error(`Não foi possivel deletar a FDD.\n${error}`);
    }
    console.error(error);
  }
}
