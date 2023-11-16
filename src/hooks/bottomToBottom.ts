import { getConfig } from '../configs/sistemaConfig';
import { APIBottomToBottom, APIObject } from './baseService/baseService';
import { message } from 'antd';

interface bottomToBottom {
  source: any;
  year: any;
  amount: any;
  balance: any;
}
export async function getBottomToBottom(url: any) {
  try {
    const response = await APIBottomToBottom.get(url, getConfig('priv'));
    return response;
  } catch (error) {
    if (error === 500) {
      message.info('O tempo da sua sessão expirou, faça o login novamente');
    } else if (error !== 401) {
      message.error(
        'Não foi possível obter a lista fundo a fundo, tente novamente mais tarde.',
      );
    }
    console.error(
      `An unexpected error occurred while retrieving the bottom to bottom list.${error}`,
    );
  }
  return false;
}

export async function postBottomToBottom(object: bottomToBottom) {
  try {
    await APIObject.post('/bottomToBottom', object, getConfig('priv'));
    message.success('Fundo a fundo cadastrado com sucesso!');
  } catch (error) {
    if (error === 500) {
      message.info('O tempo da sua sessão expirou, faça o login novamente');
    } else if (error !== 401) {
      message.warning(
        'Não foi possível criar um novo fundo a fundo, tente novamente mais tarde.',
      );
    }
    console.error(
      `An unexpected error ocourred while creating a new bottom to bottom.${error}`,
    );
  }
}

export const updateBottomToBottom = async (
  bottomToBottom: bottomToBottom,
  id: any,
) => {
  try {
    await APIObject.put(
      `/bottomToBottom/${id}`,
      bottomToBottom,
      getConfig('priv'),
    );
    message.success('Fundo a fundo atualizado com sucesso!');
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
      `An unexpected error occurred while updating the bottom to bottom.${error}`,
    );
  }
};

export async function deleteBottomToBottom(id: any) {
  try {
    await APIObject.delete(`bottomToBottom/${id}`, getConfig('priv'));
  } catch (error) {
    if (error === 500) {
      message.error('O tempo da sua sessão expirou, faça o login novamente');
    } else if (error !== 401) {
      message.error(`Não foi possivel deletar o fundo a fundo.\n${error}`);
    }
    console.error(error);
  }
}
