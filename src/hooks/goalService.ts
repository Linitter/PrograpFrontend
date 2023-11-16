import { getConfig } from '../configs/sistemaConfig';
import { message } from 'antd';
import { APIGoal } from './baseService/baseService';

interface Goal {
  description: string;
  predictedValue: string;
  balance: string;
}

export async function getGoals(url: any) {
  try {
    const response = await APIGoal.get(url, getConfig('priv'));
    return response;
  } catch (error) {
    if (error === 500) {
      message.info('O tempo da sua sessão expirou, faça o login novamente');
    } else if (error !== 401) {
      message.error(
        'Não foi possível obter a lista as metas, tente novamente mais tarde.',
      );
    }
    console.error(
      `An unexpected error occurred while retrieving the goal list.${error}`,
    );
  }
  return false;
}

export async function postGoals(goals: Goal) {
  try {
    await APIGoal.post('/goals', goals, getConfig('priv'));
    message.success('Meta cadastrada com sucesso!');
  } catch (error) {
    if (error === 500) {
      message.info('O tempo da sua sessão expirou, faça o login novamente');
    } else if (error !== 401) {
      message.warning(
        'Não foi possível criar uma nova meta, tente novamente mais tarde.',
      );
    }
    console.error(
      `An unexpected error ocourred while creating a new goal.${error}`,
    );
  }
}

export const updateGoals = async (goals: Goal, id: any) => {
  try {
    await APIGoal.put(`/goals/${id}`, goals, getConfig('priv'));
    message.success('Meta atualizada com sucesso!');
  } catch (error) {
    if (error === 500) {
      message.info('O tempo da sua sessão expirou, faça o login novamente');
    } else if (error !== 401) {
      message.error(
        'Não foi possivel atualizar a meta. Tente novamente mais tarde.',
      );
    }
    console.error(
      'error',
      `An unexpected error occurred while updating the meta.${error}`,
    );
  }
};

export async function deleteGoals(id: any) {
  try {
    await APIGoal.delete(`goals/${id}`, getConfig('priv'));
  } catch (error) {
    if (error === 500) {
      message.error('O tempo da sua sessão expirou, faça o login novamente');
    } else if (error !== 401) {
      message.error(`Não foi possivel deletar a meta.\n${error}`);
    }
    console.error(error);
  }
}
