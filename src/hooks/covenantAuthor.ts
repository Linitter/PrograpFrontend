import { getConfig } from '../configs/sistemaConfig';
import { message } from 'antd';
import { APICovenantAuthor } from './baseService/baseService';

export async function getCovenantAuthor(url: any) {
  try {
    const response = await APICovenantAuthor.get(url, getConfig('priv'));
    return response;
  } catch (error) {
    if (error === 500) {
      message.info('O tempo da sua sessão expirou, faça o login novamente');
    } else if (error !== 401) {
      message.error(
        'Não foi possível obter a lista de o convênio e autor, tente novamente mais tarde.',
      );
    }
    console.error(
      `An unexpected error occurred while retrieving the covenantAuthor list.${error}`,
    );
  }
  return false;
}

export async function deleteCovenantAuthor(id: any) {
  try {
    await APICovenantAuthor.delete(`covenantAuthor/${id}`, getConfig('priv'));
  } catch (error) {
    if (error === 500) {
      message.error('O tempo da sua sessão expirou, faça o login novamente');
    } else if (error !== 401) {
      message.error(`Não foi possivel deletar .\n${error}`);
    }
    console.error(error);
  }
}
