import { getConfig } from '../configs/sistemaConfig';
import { message } from 'antd';
import { APIDestinationObjects } from './baseService/baseService';

export async function getDestinationObjects(url: any) {
  try {
    const response = await APIDestinationObjects.get(url, getConfig('priv'));
    return response;
  } catch (error) {
    if (error === 500) {
      message.info('O tempo da sua sessão expirou, faça o login novamente');
    } else if (error !== 401) {
      message.error(
        'Não foi possível obter a lista de o convênio_concedentes, tente novamente mais tarde.',
      );
    }
    console.error(
      `An unexpected error occurred while retrieving the axle list.${error}`,
    );
  }
  return false;
}

export async function deleteDestinationObjects(id: any) {
  try {
    await APIDestinationObjects.delete(
      `destinationObjects/${id}`,
      getConfig('priv'),
    );
  } catch (error) {
    if (error === 500) {
      message.error('O tempo da sua sessão expirou, faça o login novamente');
    } else if (error !== 401) {
      message.error(`Não foi possivel deletar .\n${error}`);
    }
    console.error(error);
  }
}
