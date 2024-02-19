import React, { useEffect, useState } from 'react';
import {
  Button,
  Space,
  Dropdown,
  Popconfirm,
  MenuProps,
  Row,
  Form,
  message,
  TableColumnsType,
  Input,
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { DownOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { Table } from 'antd';
import {
  deleteBottomToBottom,
  getBottomToBottom,
} from '../../hooks/bottomToBottom';
import ModalBottomToBottom from '../../components/ModalBottomToBottom';
import {
  deleteObjectResource,
  getObjectResource,
} from '../../hooks/objectResourceService';
import ModalObjectResource from '../../components/ModalObjectResource';
import { deleteGoals, getGoals, updateGoals } from '../../hooks/goalService';
import ModalGoal from '../../components/ModalGoal';
import {
  apiDestination,
  deleteDeliveryObject,
  getDeliveryObject,
} from '../../hooks/deliveryObject';
import ModalObjectDelivery from '../../components/ModalObjectDelivery';

interface DataType {
  key: React.Key;
  id: string;
  axleId: string;
  source: string;
  year: string;
  amount: string;
  balance: string;
  goal: any[]; // Alterado para um array de objetos
}
// expação da tabela de metas
interface ExpandedDataTypeGoal {
  key: React.Key;
  id: string;
  description: string;
  predictedValue: string;
  balance: any;
  resourceObjects: any;
  bottomToBottomId: string;
}
// expação da tabela de objetos
interface ExpandedDataTypeObject {
  key: React.Key;
  id: string;
  objectsId: string;
  goalId: string;
  amount: string;
  unitaryValue: string;
  totalValue: string;
  status: string;
  progress: string;
  balance: string;
  processNumber: string;
  natureExpense: string;
  estimatedValue: string;
  dateCommitted: string;
  executedValue: string;
  deliveryDate: string;
  settlementDate: string;
}
// expação da tabela de entregas
interface ExpandedDataTypeDelivery {
  key: React.Key;
  unitId: string;
  amount: string;
  deliveryDate: string;
  settlementDate: string;
  ObjectResourceId: string;
}
//unidades
type UnitsResponse = {
  id: string;
  sigla: string;
  nome: string;
  superior: string;
};

export default function BottomToBottom() {
  const [showModal, setShowModal] = useState(false);
  const [modalGoal, setModalGoal] = useState(false); //metas

  const [modalObjectResource, setModalObjectResourse] = useState(false);
  const [modalDelivery, setModalDelivery] = useState(false);

  const [bottomToBottom, setbottomToBottom] = useState<DataType[]>([]); // fundo a fundo
  const [recordbottomToBottom, setRecordbottomToBottom] = useState<any>({});

  const [goal, setGoal] = useState<any[]>([]); // meta
  const [recordGoal, setRecordGoal] = useState<any>({});

  const [objectResource, setObjectResource] = useState<any[]>([]); // objetos/recursos
  const [recordObjectResource, setRecordObjectResource] = useState<any>({});

  const [delivery, setDelivery] = useState<any[]>([]); // entregas

  const [recordDelivery, setRecordDelivery] = useState<any>({});
  const [units, setUnits] = useState<UnitsResponse[]>([]); // Adicione este estado
  const [selectedGoalId, setSelectedGoalId] = useState<any>({});
  // somando valores re valore previsto e valor executado para trazer o saldo na tela

  // TABELA DE METAS
  const expandedRowRender = (record: any) => {
    //adicionar uma chave única para cada DESTINAÇÃO usando o índice
    const goalWithKeys = goal.map((goal, index) => ({
      ...goal,
      key: `goal_${index}`,
    }));
    // filtra as metas vinculados com um fundo a fundo
    const filteredGoal = goalWithKeys.filter(
      goal => goal.bottomToBottom?.id === record.id,
    );
    // expação de metas vinculados a um fundo a fundo
    const columns: TableColumnsType<ExpandedDataTypeGoal> = [
      {
        title: 'Meta',
        dataIndex: 'description',
        key: 'description',
        width: '50%',
      },
      {
        title: 'Valor previsto',
        dataIndex: 'predictedValue',
        key: 'predictedValue',
        width: '12%',
        render: (value: any) => `R$ ${value}` || '*********',
      },
      {
        title: 'Valor total executado',
        dataIndex: 'executedValue',
        key: 'executedValue',
        width: '12%',
        render: (value: any) => `R$ ${value}` || '*********',
      },
      {
        title: 'Saldo',
        //dataIndex: 'id', // Use 'id' como dataIndex para acessar o valor correto em 'results'
        dataIndex: 'balance', // fiz alteração para balance'
        key: 'balance',
        width: '12%',
        render: (value: any) => `R$ ${value}` || '*********',
      },

      {
        title: 'Ação',
        key: 'operation',
        render: (record: any) => {
          return (
            <Space size="middle">
              <Dropdown
                menu={{
                  items: [
                    {
                      label: (
                        <Popconfirm
                          title="Tem certeza de que desabilitar esta meta ?"
                          onConfirm={() => ClickDeleteGoal(record.id)}
                        >
                          Excluir
                        </Popconfirm>
                      ),
                      key: '1',
                      danger: true,
                    },
                    {
                      label: 'Alterar',
                      key: '2',
                      onClick: () => {
                        setRecordGoal(record);
                      },
                    },
                    {
                      label: (
                        <Space>
                          <PlusOutlined />
                          objeto
                        </Space>
                      ),
                      key: '3',
                      onClick: () => {
                        setSelectedGoalId(record.id); // Defina o ID da meta selecionada
                      },
                    },
                  ],
                  onClick: handleMenuClickGoal,
                }}
              >
                <a onClick={e => e.preventDefault()} className="option">
                  <Space>
                    Mais
                    <DownOutlined />
                  </Space>
                </a>
              </Dropdown>
            </Space>
          );
        },
      },
    ];

    return (
      <Table
        columns={columns}
        dataSource={filteredGoal}
        pagination={false}
        expandable={{
          expandedRowRender: expandedRowRenderObject,
        }}
        rowClassName={() => 'custom-table-destiny'} // Defina o nome da classe para o estilo personalizado
      />
    );
  };

  const expandedRowRenderObject = (record: any) => {
    //adicionar uma chave única para cada objetos do recurso usando o índice
    const objectWithKeys = objectResource.map((objectResource, index) => ({
      ...objectResource,
      key: `objectResource_${index}`,
    }));
    // filtra os objetos vinculado com uma meta
    const filterObjectResource = objectWithKeys.filter(
      object => object.goal?.id === record.id,
    );
    // expação da tabela de obejtos/recursos
    const columns: TableColumnsType<ExpandedDataTypeObject> = [
      {
        title: 'Objeto',
        dataIndex: 'objects',
        key: 'objects',
        width: '12%',
        render: objects => (objects ? objects?.name : ''),
      },

      {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        width: '5%',
        render: (value: any) => value || '*********',
      },
      {
        title: 'Andamento',
        dataIndex: 'progress',
        key: 'progress',
        width: '6%',

        render: (value: any) => value || '*********',
      },
      {
        title: 'Nº processo',
        dataIndex: 'processNumber',
        key: 'processNumber',
        width: '8%',
        render: (value: any) => value || '*********',
      },
      {
        title: 'natureza de despesa',
        dataIndex: 'natureExpense',
        key: 'natureExpense',
        className: 'custom-column', // Adicione a classe CSS personalizada à coluna "Nome"
        width: '7%',

        render: (value: any) => value || '*********',
      },
      {
        title: 'Aquisição',
        dataIndex: 'acquisitionMode',
        key: 'acquisitionMode',
        width: '6%',
        render: (value: any) => value || '*********',
      },
      {
        title: 'Qtde',
        dataIndex: 'amount',
        key: 'amount',
        width: '3%',
        render: (value: any) => value || '*********',
      },
      {
        title: 'Valor unitário',
        dataIndex: 'unitaryValue',
        key: 'unitaryValue',
        width: '8%',
        render: (value: any) => `R$ ${value}` || '*********',
      },
      {
        title: 'Valor total estimado',
        dataIndex: 'estimatedTotalValue',
        key: 'estimatedTotalValue',
        width: '8%',
        render: (value: any) => `R$ ${value}` || '*********',
      },
      {
        title: 'Valor executado',
        dataIndex: 'executedValue',
        key: 'executedValue',
        width: '9%',
        render: (value: any) => `R$ ${value}` || '*********',
      },
      {
        title: 'Data de previsão',
        dataIndex: 'forecastDate',
        key: 'forecastDate',
        width: '10%',
        render: (value: any) => value || '*********',
      },
      {
        title: 'Data do empenho',
        dataIndex: 'commitmentDate',
        key: 'commitmentDate',
        width: '10%',
        render: (value: any) => value || '*********',
      },
      {
        title: 'Ação',
        key: 'operation',
        width: '12%',
        render: (record: any) => {
          return (
            <Space size="middle">
              <Dropdown
                menu={{
                  items: [
                    {
                      label: (
                        <Popconfirm
                          title="Tem certeza de que deseja desabilitar este objeto ?"
                          onConfirm={() => ClickDeleteObjResource(record)}
                        >
                          Excluir
                        </Popconfirm>
                      ),
                      key: '1',
                      danger: true,
                    },
                    {
                      label: 'Alterar',
                      key: '2',
                      onClick: () => {
                        setRecordObjectResource(record);
                        setSelectedGoalId(record.goal.id);
                      },
                    },
                    {
                      label: (
                        <Space>
                          <PlusOutlined />
                          Entregas
                        </Space>
                      ),
                      key: '3',
                      onClick: () => {
                        setRecordObjectResource(record);
                      },
                    },
                  ],
                  onClick: handleMenuObjetc,
                }}
              >
                <a onClick={e => e.preventDefault()} className="option">
                  <Space>
                    Mais
                    <DownOutlined />
                  </Space>
                </a>
              </Dropdown>
            </Space>
          );
        },
      },
    ];

    return (
      <Table
        columns={columns}
        dataSource={filterObjectResource}
        pagination={false}
        expandable={{
          expandedRowRender: expandedRowRenderDelivery,
        }}
      />
    );
  };

  // TABELA DESTINAÇÕES
  const expandedRowRenderDelivery = (record: any) => {
    //adicionar uma chave única para cada entrega usando o índice
    const deliveryWithKeys = delivery.map((delivery, index) => ({
      ...delivery,
      key: `delivery_${index}`,
    }));
    // filtra as entregas vinculados com fundo a funso
    const filteredDelivery = deliveryWithKeys.filter(
      dest => dest.resourceObjects?.id === record.id,
    );
    // expação da tabela de entregas
    const columns: TableColumnsType<ExpandedDataTypeDelivery> = [
      {
        title: 'Data da entrega',
        dataIndex: 'deliveryDate',
        key: 'deliveryDate',
        render: (value: any) => value || '*********',
      },
      {
        title: 'Quantidade',
        dataIndex: 'amount',
        key: 'amount',
        render: (value: any) => value || '*********',
      },
      {
        title: 'Unidade',
        dataIndex: 'unitId',
        key: 'unitId',
        width: '46%',

        render: (unitId: string) => {
          const unit = units.find(unit => unit.id === unitId);
          return unit ? unit.nome : unitId;
        },
      },
      {
        title: 'Data da liquidação',
        dataIndex: 'settlementDate',
        key: 'settlementDate',
        render: (value: any) => value || '*********',
      },
      {
        title: 'Ação',
        key: 'operation',
        render: (record: any) => {
          return (
            <Space size="middle">
              <Dropdown
                menu={{
                  items: [
                    {
                      label: (
                        <Popconfirm
                          title="Tem certeza de que desabilitar este unidade ?"
                          onConfirm={() => ClickDeleteDelivery(record.id)}
                        >
                          Excluir
                        </Popconfirm>
                      ),
                      key: '1',
                      danger: true,
                    },
                    {
                      label: 'Alterar',
                      key: '2',
                      onClick: () => {
                        setRecordDelivery(record);
                      },
                    },
                  ],
                  onClick: handleMenuClickDelivery,
                }}
              >
                <a onClick={e => e.preventDefault()} className="option">
                  <Space>
                    Mais
                    <DownOutlined />
                  </Space>
                </a>
              </Dropdown>
            </Space>
          );
        },
      },
    ];

    return (
      <Table
        columns={columns}
        dataSource={filteredDelivery}
        pagination={false}
        rowClassName={() => 'custom-table-destiny'} // Defina o nome da classe para o estilo personalizado
      />
    );
  };
  // Função para atualizar as unidades
  const updateDeliveryUnits = (newUnits: UnitsResponse[]) => {
    setUnits(newUnits);
  };
  //Função para renderizar os nome das unidades
  const fetchUnits = () => {
    const token = localStorage.getItem('token_sso');
    const urlWithToken = `unidadesPC?token=${token}`;

    apiDestination
      .get(urlWithToken)
      .then(response => {
        const listOfUnits = response.data;
        setUnits(listOfUnits);
      })
      .catch(error => {
        console.error('Erro ao obter unidades:', error);
      });
  };
  useEffect(() => {
    fetchUnits();
  }, []);

  //Parte de alteração do fundo a fundo, unidades e objetos
  const handleMenuClick: MenuProps['onClick'] = e => {
    if (e.key === '2') {
      setShowModal(true);
    } else if (e.key === '3') {
      setModalGoal(true);
    }
  };
  const handleMenuClickGoal: MenuProps['onClick'] = e => {
    if (e.key === '2') {
      setModalGoal(true);
    } else if (e.key === '3') {
      setModalObjectResourse(true);
    }
  };
  const handleMenuObjetc: MenuProps['onClick'] = e => {
    if (e.key === '2') {
      setModalObjectResourse(true);
    } else if (e.key === '3') {
      setModalDelivery(true);
    }
  };

  const handleMenuClickDelivery: MenuProps['onClick'] = e => {
    if (e.key === '2') {
      setModalDelivery(true);
    }
  };
  // tabela do fundo a fundo
  const columns: ColumnsType<DataType> = [
    {
      title: 'Fonte',
      dataIndex: 'source',
      key: 'source',
      width: '22%',
      className: 'custom-column', // Adicione a classe CSS personalizada à coluna "Nome"
    },
    {
      title: 'Eixo',
      dataIndex: 'axle',
      key: 'axle',
      width: '22%',
      render: axle => (axle ? axle?.name : '*******'),
    },
    {
      title: 'Ano',
      dataIndex: 'year',
      key: 'year',
      width: '22%',
      className: 'custom-column', // Adicione a classe CSS personalizada à coluna "Nome"
    },
    {
      title: 'Valor total',
      dataIndex: 'amount',
      key: 'amount',
      width: '22%',
      className: 'custom-column', // Adicione a classe CSS personalizada à coluna "Nome"
    },

    {
      title: 'Ação',
      key: 'operation',
      render: (record: any) => {
        return (
          <Space size="middle">
            <Dropdown
              menu={{
                items: [
                  {
                    label: (
                      <Popconfirm
                        title="Tem certeza de que deseja desabilitar este registro?"
                        onConfirm={() => ClickDeletebottomToBottom(record)}
                      >
                        Excluir
                      </Popconfirm>
                    ),
                    key: '1',
                    danger: true,
                  },
                  {
                    label: 'Alterar',
                    key: '2',
                    onClick: () => {
                      setRecordbottomToBottom(record);
                    },
                  },
                  {
                    label: (
                      <Space style={{ color: ' rgb(0, 21, 42)' }}>
                        <PlusOutlined style={{ color: 'rgb(0, 21, 42)' }} />
                        Meta
                      </Space>
                    ),
                    key: '3',
                    onClick: () => {
                      setRecordbottomToBottom(record);
                    },
                  },
                ],
                onClick: handleMenuClick,
              }}
            >
              <a onClick={e => e.preventDefault()} className="option">
                <Space>
                  Mais
                  <DownOutlined />
                </Space>
              </a>
            </Dropdown>
          </Space>
        );
      },
    },
  ];

  const updatedTotalValue = (resourceObjects: any) => {
    let totalValue = 0;

    resourceObjects.forEach((resourceObject: any) => {
      const executedValueString = resourceObject?.executedValue;

      // Remover separadores de milhar e substituir a vírgula por ponto
      const sanitizedValueString = executedValueString
        .replace(/\./g, '')
        .replace(',', '.');

      // Converter a string formatada para número
      const executedValue = parseFloat(sanitizedValueString);

      totalValue += executedValue;
    });

    totalValue = parseFloat(totalValue.toFixed(2));

    // Formatar o valor com separadores de milhar e duas casas decimais
    const formattedTotal = totalValue.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    return formattedTotal;
  };

  useEffect(() => {
    setShowModal(false);
  }, []);

  // listagem
  useEffect(() => {
    loadingbottomToBottomForm();
    loadingGoalForm();
    loadingObjectResourceForm();
    loadingDeliveryForm();
  }, []);
  // fundo a fundo
  async function loadingbottomToBottomForm() {
    const response = await getBottomToBottom('bottomToBottom');
    if (response !== false) {
      setbottomToBottom(response.data);
    }
  }
  const loadingOnebottomToBottom = async (id: string) => {
    const response = await getBottomToBottom(`bottomToBottom/${id}`);
    if (response !== false) {
      return response.data;
    }
  };
  // metas
  async function loadingGoalForm() {
    const response = await getGoals('goals');
    if (response !== false) {
      setGoal(response.data);
    }
  }
  // obejtos/recursos
  async function loadingObjectResourceForm() {
    const response = await getObjectResource('resourceobjects');
    if (response !== false) {
      setObjectResource(response.data);
    }
  }
  // entrega
  async function loadingDeliveryForm() {
    const response = await getDeliveryObject('delivery');
    if (response !== false) {
      setDelivery(response.data);
    } else {
      message.error('Ocorreu um erro inesperado ao obter as destinações.');
    }
  }
  //função de exlusão do fundo a fundo
  const ClickDeletebottomToBottom = async (record: any) => {
    try {
      const res = await loadingOnebottomToBottom(record.id);
      const goals = res.goal;

      if (goals.length > 0) {
        for (let i = 0; i < goals.length; i++) {
          await deleteGoals(goals[i].id);
        }
      }
      await deleteBottomToBottom(record.id);
      const newbottomToBottom = [...bottomToBottom];
      newbottomToBottom.splice(record, -1);
      setbottomToBottom(newbottomToBottom);
    } catch (error) {
      message.error('Ocorreu um erro ao excluir o bloco.');
    }

    loadingbottomToBottomForm();
  };
  //função de exlusão da meta
  const ClickDeleteGoal = async (record: any) => {
    await deleteGoals(record);
    const newGoal = [...goal];
    newGoal.splice(record, -1);
    setGoal(newGoal);
    loadingGoalForm();
  };
  //função de exlusão do obejto/recurso
  const ClickDeleteObjResource = async (record: any) => {
    await deleteObjectResource(record.id);
    const newObjResource = [...objectResource];
    newObjResource.splice(record.id, -1);
    setObjectResource(newObjResource);
    loadingObjectResourceForm();

    updatedBalanceList(record.goal);
  };
  //função de exlusão da Entrega
  const ClickDeleteDelivery = async (record: any) => {
    await deleteDeliveryObject(record);
    const newObjResource = [...delivery];
    newObjResource.splice(record, -1);
    setDelivery(newObjResource);
    loadingDeliveryForm();
  };

  //atualização do as tabelas
  const updateGoalList = (newGoal: any) => {
    setGoal(prevGoal => [...prevGoal, newGoal]);
    loadingGoalForm();
  };
  const updatebottomToBottomList = (newbottomToBottom: any) => {
    setbottomToBottom(prevottomToBottom => [
      ...prevottomToBottom,
      newbottomToBottom,
    ]);
    loadingbottomToBottomForm();
  };
  const updateResourceObjectsList = (newRObjectResource: any) => {
    setObjectResource(prevObjectResource => [
      ...prevObjectResource,
      newRObjectResource,
    ]);
    loadingObjectResourceForm();
    loadingGoalForm();
  };

  const submitUpdate = async (goal: any) => {
    await updateGoals(goal, goal.id);
    updateGoalList(goal);
  };

  const updatedBalance = (valorExecutado: any, goal: any) => {
    // Obtém o valor do repasse do objeto resourceObjects
    console.log('goal', goal);
    const repasse = goal?.predictedValue;
    console.log('repasse', repasse);

    if (repasse) {
      const repasseString = repasse.replace(/\./g, '').replace(',', '.');
      const valorExecutadoString = valorExecutado
        .replace(/\./g, '')
        .replace(',', '.');

      // Converte os valores para números (usando ponto como separador decimal)
      const valorExecutadoNumerico = parseFloat(valorExecutadoString);
      const repasseNumerico = parseFloat(repasseString);

      // Verifica se os valores são válidos antes de subtrair
      if (!isNaN(valorExecutadoNumerico) && !isNaN(repasseNumerico)) {
        // Subtrai o repasse do valorExecutado
        const resultado = repasseNumerico - valorExecutadoNumerico;

        // Formata o resultado com duas casas decimais usando toLocaleString
        const resultadoFormatado = resultado.toLocaleString('pt-BR', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });

        return resultadoFormatado;
      } else {
        return;
      }
    }
  };

  const updatedBalanceList = async (values: any) => {
    const res = await getGoals(`goals/${values.id}`);
    if (res) {
      const goalItem = res.data;
      const totalValue = updatedTotalValue(goalItem.resourceObjects);

      const valorBalance = updatedBalance(totalValue, goalItem);
      goalItem.balance = valorBalance;
      goalItem.executedValue = totalValue;
      submitUpdate(goalItem);
    }
  };

  const updateDeliveryList = (newDestiny: any) => {
    setDelivery(prevDestiny => [...prevDestiny, newDestiny]);
    loadingDeliveryForm();
  };

  // Fechar modal fundo a fundo
  const hideModal = (refresh: boolean) => {
    setShowModal(false);
    setRecordbottomToBottom(null);
    if (refresh) setbottomToBottom([]);
  };

  // Fechar modal de metas
  const hideModalGoals = (refresh: boolean) => {
    setModalGoal(false);
    setRecordGoal(null);
    if (refresh) setGoal([]);
  };

  // Fechar modal objetos
  const hideModalObjectResourse = (refresh: boolean) => {
    setModalObjectResourse(false);
    setRecordObjectResource(null);
    if (refresh) setObjectResource([]);
  };
  // Fechar modal entregas
  const hideModalObjectdelivery = (refresh: boolean) => {
    setModalDelivery(false);
    setRecordDelivery(null);
    if (refresh) setDelivery([]);
  };
  //adiciona uma chave única para cada fundo a fundo usando o índice
  const bottomToBottomWithKeys = bottomToBottom.map(
    (bottomToBottom, index) => ({
      ...bottomToBottom,
      key: `bottomToBottom${index}`,
    }),
  );

  const handleSearch = (searchText: any) => {
    console.log('Valor pesquisado:', searchText);
  };

  const onChangeSearch = (e: any) => {
    const searchText = e.target.value;
    handleSearch(searchText); // Chama a função de pesquisa a cada alteração no campo de entrada
  };

  return (
    <>
      <Row style={{ paddingBottom: 'inherit', display: 'flow-root' }}>
        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            style={{ float: 'right', width: 'auto' }}
            onClick={() => {
              setShowModal(true);
            }}
          >
            <PlusOutlined /> Fundo a Fundo
          </Button>
          {/*}
          <Input.Search
            style={{ width: '40%' }}
            placeholder="Pesquisar Fonte"
            onChange={onChangeSearch}
            onSearch={handleSearch} // Isso ainda será acionado ao pressionar Enter
          />*/}
        </Form.Item>
      </Row>
      <Table
        rowKey="key"
        columns={columns}
        expandable={{
          expandedRowRender,
          defaultExpandedRowKeys: ['0'],
        }}
        dataSource={bottomToBottomWithKeys}
        rowClassName={() => 'custom-table-row'} // Defina o nome da classe para o estilo personalizado
        className="custom-table" // Adicione a classe CSS personalizada à tabela
      />

      <ModalBottomToBottom
        id={recordbottomToBottom?.id}
        openModal={showModal}
        closeModal={hideModal}
        updatebottomToBottomList={updatebottomToBottomList}
      />

      <ModalGoal
        id={recordGoal?.id}
        idBottomToBottom={recordbottomToBottom?.id}
        openModal={modalGoal}
        closeModal={hideModalGoals}
        updateGoalList={updateGoalList}
        updateBalanceList={updatedBalanceList}
      />

      <ModalObjectResource
        id={recordObjectResource?.id}
        idFdd={''}
        idGoal={selectedGoalId}
        idCovenants={''}
        idStateTreasury={''}
        idStateAmendment={''}
        openModal={modalObjectResource}
        closeModal={hideModalObjectResourse}
        updateResourceObjectsList={updateResourceObjectsList}
        updateBalanceList={updatedBalanceList}
      />

      <ModalObjectDelivery
        id={recordDelivery?.id}
        idResourceObject={recordObjectResource?.id}
        openModal={modalDelivery}
        closeModal={hideModalObjectdelivery}
        updateDeliveryList={updateDeliveryList}
        updateDeliveryUnits={updateDeliveryUnits} // Passe a função como prop
      />
    </>
  );
}
