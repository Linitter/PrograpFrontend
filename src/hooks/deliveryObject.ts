import axios from 'axios';
import { getConfig } from '../configs/sistemaConfig';
import { urlsServices } from '../configs/urlsConfig';
import { APIDeliveryObject } from './baseService/baseService';
import { message } from 'antd';

interface DeliveryObject {
  unitId: number;
  amount: string;
  deliveryDate: string;
  settlementDate: string;
  resourceObjects: string;
}
export async function getDeliveryObject(url: any) {
  try {
    const response = await APIDeliveryObject.get(url, getConfig('priv'));
    return response;
  } catch (error) {
    if (error === 500) {
      message.info('O tempo da sua sessão expirou, faça o login novamente');
    } else if (error !== 401) {
      message.error(
        'Não foi possível obter a lista de entregas, tente novamente mais tarde.',
      );
    }
    console.error(
      `An unexpected error occurred while retrieving the delivery list.${error}`,
    );
  }
  return false;
}

export async function postDelivery(DeliveryObject: DeliveryObject) {
  try {
    await APIDeliveryObject.post(
      '/delivery',
      DeliveryObject,
      getConfig('priv'),
    );
    message.success('Entrega cadastrada com sucesso!');
  } catch (error) {
    if (error === 500) {
      message.info('O tempo da sua sessão expirou, faça o login novamente');
    } else if (error !== 401) {
      message.warning(
        'Não foi possível criar uma nova entrega, tente novamente mais tarde.',
      );
    }
    console.error(
      `An unexpected error ocourred while creating a new delivery object.${error}`,
    );
  }
}

export const updateDeliveryObject = async (
  DeliveryObject: DeliveryObject,
  id: any,
) => {
  try {
    await APIDeliveryObject.put(
      `/delivery/${id}`,
      DeliveryObject,
      getConfig('priv'),
    );
    message.success('Entrega atualizado com sucesso!');
  } catch (error) {
    if (error === 500) {
      message.info('O tempo da sua sessão expirou, faça o login novamente');
    } else if (error !== 401) {
      message.error(
        'Não foi possivel atualizar a entrega. Tente novamente mais tarde.',
      );
    }
    console.error(
      'error',
      `An unexpected error occurred while updating the delivery object.${error}`,
    );
  }
};

export async function deleteDeliveryObject(id: any) {
  try {
    await APIDeliveryObject.delete(`delivery/${id}`, getConfig('priv'));
  } catch (error) {
    if (error === 500) {
      message.error('O tempo da sua sessão expirou, faça o login novamente');
    } else if (error !== 401) {
      message.error(`Não foi possivel deletar a entrega.\n${error}`);
    }
    console.error(error);
  }
}

export const apiDestination = axios.create({
  baseURL: urlsServices.LEGADOWS,
});
