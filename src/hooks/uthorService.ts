import { getConfig } from '../configs/sistemaConfig';
import { message, notification } from 'antd';
import { APIAuthor } from './baseService/baseService';

interface Author {
  name: any;
  contributionValue: string;
}

export async function getAuthor(url: any) {
  try {
    const response = await APIAuthor.get(url, getConfig('priv'));
    return response;
  } catch (error) {
    if (error === 500) {
      message.info('O tempo da sua sessão expirou, faça o login novamente');
    } else if (error !== 401) {
      message.error(
        'Não foi possível obter a lista de autor, tente novamente mais tarde.',
      );
    }
    console.error(
      `An unexpected error occurred while retrieving the author list.${error}`,
    );
  }
  return false;
}

export async function postAuthor(author: Author) {
  try {
    await APIAuthor.post('/author', author, getConfig('priv'));
    message.success('Autor cadastrado com sucesso!');
  } catch (error) {
    if (error === 500) {
      message.info('O tempo da sua sessão expirou, faça o login novamente');
    } else if (error !== 401) {
      message.warning(
        'Não foi possível criar um novo autor, tente novamente mais tarde.',
      );
    }
    console.error(
      `An unexpected error ocourred while creating a new author.${error}`,
    );
  }
}

export const updateAuthor = async (author: Author, id: any) => {
  try {
    await APIAuthor.put(`/author/${id}`, author, getConfig('priv'));
    message.success('Autor atualizado com sucesso!');
  } catch (error) {
    if (error === 500) {
      message.info('O tempo da sua sessão expirou, faça o login novamente');
    } else if (error !== 401) {
      message.error(
        'Não foi possivel atualizar o autor. Tente novamente mais tarde.',
      );
    }
    console.error(
      'error',
      `An unexpected error occurred while updating the author.${error}`,
    );
  }
};

export async function deleteauthors(id: any) {
  try {
    await APIAuthor.delete(`author/${id}`, getConfig('priv'));
  } catch (error) {
    if (error === 500) {
      message.error('O tempo da sua sessão expirou, faça o login novamente');
    } else if (error !== 401) {
      message.error(`Não foi possivel deletar o autor.\n${error}`);
    }
    console.error(error);
  }
}
