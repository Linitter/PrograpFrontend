import { APIObjectResource } from './baseService/baseService';
import { message } from 'antd';
import { getConfig } from '../configs/sistemaConfig';

interface ObjectResource {
  amount: any;
  unitaryValue: any;
  totalValue: any;
  status: any;
  progress: any;
  balance: any;
  processNumber: any;
  natureExpense: any;
  estimatedValue: any;
  dateCommitted: any;
  executedValue: any;
  deliveryDate: any;
  settlementDate: any;
}

export async function getObjectResource(url: any) {
  try {
    const response = await APIObjectResource.get(url, getConfig('priv'));
    return response;
  } catch (error) {
    if (error === 500) {
      message.info('O tempo da sua sessão expirou, faça o login novamente');
    } else if (error !== 401) {
      message.error(
        'Não foi possível carregar o recurso, tente novamente mais tarde.',
      );
    }
    console.error(
      'Erro do sistema: ',
      `An unexpected error occurred while retrieving the Object resource list.${error}`,
    );
  }
  return false;
}

export async function postObjectResource(ObjectResource: ObjectResource) {
  try {
    const response = await APIObjectResource.post(
      '/resourceobjects',
      ObjectResource,
      getConfig('priv'),
    );
    message.success('Objeto do recurso cadastrado com sucesso!');
    return response.data; // Retorne os dados do convênio salvo
  } catch (error) {
    if (error === 500) {
      message.info('O tempo da sua sessão expirou, faça o login novamente');
    } else if (error !== 401) {
      message.warning(
        'Não foi possível criar um novo objeto no recurso, tente novamente mais tarde.',
      );
    }
    console.error(
      `An unexpected error ocourred while creating a new Object resource.`,
      error,
    );
    throw error;
  }
}

export const updateObjectResource = async (
  ObjectResource: ObjectResource,
  id: any,
) => {
  try {
    await APIObjectResource.put(
      `/resourceobjects/${id}`,
      ObjectResource,
      getConfig('priv'),
    );
    message.success('Objeto do recurso atualizado com sucesso!');
  } catch (error) {
    if (error === 500) {
      message.info('O tempo da sua sessão expirou, faça o login novamente');
    } else if (error !== 401) {
      message.error(
        'Não foi possivel atualizar o objetos do recurso. Tente novamente mais tarde.',
      );
    }
    console.error(
      'error',
      `An unexpected error occurred while updating the Object resource.${error}`,
    );
  }
};

export async function deleteObjectResource(id: any) {
  try {
    await APIObjectResource.delete(`resourceobjects/${id}`, getConfig('priv'));
  } catch (error) {
    if (error === 500) {
      message.error('O tempo da sua sessão expirou, faça o login novamente');
    } else if (error !== 401) {
      message.error(`Não foi possivel deletar o eixos.\n${error}`);
    }
    console.error(error);
  }
}

export async function getOneResourceobjects(id: any) {
  try {
    const response = await APIObjectResource.get(
      `resourceobjects/${id}`,
      getConfig('priv'),
    );
    return response;
  } catch (error) {
    if (error === 500) {
      message.info('O tempo da sua sessão expirou, faça o login novamente');
    } else if (error !== 401) {
      message.error(
        'Não foi possível obter a objeto do recurso, tente novamente mais tarde.',
      );
    }
    console.error(
      `An unexpected error occurred while retrieving the resource Objects.${error}`,
    );
  }
  return false;
}
