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
  Tooltip,
} from 'antd';
import { EllipsisOutlined, PlusOutlined } from '@ant-design/icons';
import { DownOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { Table } from 'antd';
import {
  deleteObjectResource,
  getObjectResource,
} from '../../hooks/objectResourceService';
import ModalObjectResource from '../../components/ModalObjectResource';
import {
  apiDestination,
  deleteDeliveryObject,
  getDeliveryObject,
} from '../../hooks/deliveryObject';
import ModalObjectDelivery from '../../components/ModalObjectDelivery';
import {
  deleteCovenants,
  getCovenants,
  updateCovenants,
} from '../../hooks/covenantsService';
import ModalCovenants from '../../components/ModalCovenants';

interface DataType {
  key: React.Key;
  id: string;
  grantorId: string;
  source: string;
  year: string;
  amendmentNumber: string;
  agreementNumber: string;
  processNumber: string;
  transferAmount: string;
  counterpartValue: string;
  globalValue: string;
  description: string;
  balance: any;
  totalValueExecuted: any;
  resourceObjects: any;
  covenantAuthor: any[];
}

interface ExpandedDataTypeObject {
  destinationObjects: any;
  key: React.Key;
  id: string;
  objectsId: string;
  covenantsId: string;
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

interface ExpandedDataTypeDelivery {
  key: React.Key;
  unitId: string;
  amount: string;
  deliveryDate: string;
  settlementDate: string;
  ObjectResourceId: string;
}

type UnitsResponse = {
  id: string;
  sigla: string;
  nome: string;
  superior: string;
};

export default function Covenants() {
  const [showModal, setShowModal] = useState(false);

  const [modalObjectResource, setModalObjectResourse] = useState(false);
  const [modalDelivery, setModalDelivery] = useState(false);

  const [covenants, setCovenants] = useState<DataType[]>([]);
  const [recordCovenants, setRecordCovenants] = useState<any>({});

  const [objectResource, setObjectResource] = useState<any[]>([]);
  const [recordObjectResource, setRecordObjectResource] = useState<any>({});

  const [delivery, setDelivery] = useState<any[]>([]);

  const [recordDelivery, setRecordDelivery] = useState<any>({});
  const [units, setUnits] = useState<UnitsResponse[]>([]); // Adicione este estado
  const [selectedCovenantId, setSelectedCovenantId] = useState<any>({});

  const expandedRowRender = (record: any) => {
    //adicionar uma chave única para cada objetos do recurso usando o índice
    const objectWithKeys = objectResource.map((objectResource, index) => ({
      ...objectResource,
      key: `objectResource_${index}`,
    }));
    // filtra os objetos vinculado com convenio
    const filterObjectResource = objectWithKeys.filter(
      object => object.covenants?.id === record.id,
    );
    //busca do nome da unidade por id
    const findUnitNameById = (unitId: any) => {
      const unit = units.find(unit => unit.id === unitId);
      return unit ? unit.nome : 'Unidade Desconhecida';
    };
    // expação de tabela de objetos/Recursos
    const columns: TableColumnsType<ExpandedDataTypeObject> = [
      {
        title: 'Objeto',
        dataIndex: 'objects',
        key: 'objects',
        width: '12%',
        render: objects => (objects ? objects?.name : ''),
      },
      {
        title: 'Unidades e Qtde prevista',
        dataIndex: 'destinationObjects',
        key: 'destinationObjects',
        width: '18%',
        render: (_, record) => {
          const destination = record.destinationObjects;

          if (destination && destination.length > 0) {
            const unitAndQuantity = destination.map(
              (destinationObjects: any) => {
                const unitId = destinationObjects?.unitId || 'Desconhecido';
                const unitName = findUnitNameById(unitId); // Encontra o nome da unidade
                const expectedQuantity =
                  destinationObjects?.expectedQuantity || '***';
                return `${unitName}, Qtd: ${expectedQuantity}`;
              },
            );

            const initialTooltip = unitAndQuantity.shift(); // Remove e obtenha o primeiro elemento
            const restTooltip = unitAndQuantity.join(', ');

            return (
              <Tooltip title={restTooltip}>
                <span>
                  {initialTooltip}
                  <EllipsisOutlined
                    style={{ fontSize: '20px', verticalAlign: 'middle' }}
                  />
                </span>
              </Tooltip>
            );
          }

          return '*******';
        },
      },

      {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        width: '6%',
        render: (value: any) => value || '*********',
      },
      {
        title: 'Andamento',
        dataIndex: 'progress',
        key: 'progress',
        width: '7%',

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
        title: 'Modo de aquisição',
        dataIndex: 'acquisitionMode',
        key: 'acquisitionMode',
        width: '7%',
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
        width: '8%',
        render: (value: any) => `R$ ${value}` || '*********',
      },

      {
        title: 'Data do empenho',
        dataIndex: 'commitmentDate',
        key: 'commitmentDate',
        width: '6%',
        render: (value: any) => value || '*********',
      },
      {
        title: 'Ação',
        key: 'operation',
        width: '5%',
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
                        setSelectedCovenantId(record.covenants.id);
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
    // filtra as entregas vinculados com convenio
    const filteredDelivery = deliveryWithKeys.filter(
      dest => dest.resourceObjects?.id === record.id,
    );
    // expação de tabela de entregas
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
                          onConfirm={() => ClickDeleteDestinaions(record.id)}
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

  //tabela de convenio
  const columns: ColumnsType<DataType> = [
    {
      title: 'Fonte',
      dataIndex: 'source',
      key: 'source',
      width: '4%',
      className: 'custom-column', // Adicione a classe CSS personalizada à coluna "Nome"
    },
    {
      title: 'Emenda',
      dataIndex: 'amendment',
      key: 'amendment',
      width: '5%',
      className: 'custom-column', // Adicione a classe CSS personalizada à coluna "Nome"
      render: (value: any) => value || '*******',
    },
    {
      title: 'Autor e Valor',
      dataIndex: 'covenantAuthor',
      key: 'authorAndValue',
      width: '15%', // Ajuste a largura conforme necessário
      render: (_, record) => {
        const authors = record.covenantAuthor;

        if (authors && authors.length > 0) {
          const authorAndValue = authors.map(covenantAuthor => {
            const grantorName = covenantAuthor?.authors?.name || 'Desconhecido';
            const contributionValue =
              covenantAuthor?.contributionValue || 'R$ 0.000,00';
            return `${grantorName}: ${contributionValue}`;
          });

          return (
            <div>
              {authorAndValue.map((pair, index) => (
                <div key={index}>{pair}</div>
              ))}
            </div>
          );
        }

        return '*******';
      },
    },
    {
      title: 'Nº emenda',
      dataIndex: 'amendmentNumber',
      key: 'amendmentNumber',
      width: '6%',
      className: 'custom-column', // Adicione a classe CSS personalizada à coluna "Nome"
      render: (value: any) => value || '*******',
    },
    {
      title: 'Nº convênio',
      dataIndex: 'agreementNumber',
      key: 'agreementNumber',
      width: '7%',
      className: 'custom-column', // Adicione a classe CSS personalizada à coluna "Nome"
      render: (value: any) => value || '*******',
    },
    {
      title: 'Ano',
      dataIndex: 'year',
      key: 'year',
      width: '4%',
      className: 'custom-column', // Adicione a classe CSS personalizada à coluna "Nome"
      render: (value: any) => value || '*******',
    },

    {
      title: 'Valor do repasse',
      dataIndex: 'transferAmount',
      key: 'transferAmount',
      width: '10%',
      className: 'custom-column', // Adicione a classe CSS personalizada à coluna "Nome"
      render: (value: any) => `R$ ${value}` || '****',
    },
    {
      title: 'Valor contrapartida',
      dataIndex: 'counterpartValue',
      key: 'counterpartValue',
      width: '10%',
      className: 'custom-column', // Adicione a classe CSS personalizada à coluna "Nome"
      render: (value: any) => `R$ ${value}` || '****',
    },
    {
      title: 'Valor global',
      dataIndex: 'globalValue',
      key: 'globalValue',
      width: '8%',
      className: 'custom-column', // Adicione a classe CSS personalizada à coluna "Nome"
      render: (value: any) => `R$ ${value}` || '****',
    },
    {
      title: 'Descrição',
      dataIndex: 'description',
      key: 'description',
      width: '15%',
      className: 'custom-column', // Adicione a classe CSS personalizada à coluna "Nome"
      render: (value: any) => value || '*******',
    },
    {
      title: 'Valor total executado',
      dataIndex: 'totalValueExecuted',
      key: 'totalValueExecuted',
      width: '8%',
      className: 'custom-column', // Adicione a classe CSS personalizada à coluna "Nome"
      render: (value: any) => `R$ ${value}` || '****',
    },
    {
      title: 'Saldo',
      dataIndex: 'balance',
      key: 'balance',
      width: '8%',
      className: 'custom-column', // Adicione a classe CSS personalizada à coluna "Nome"
      render: (value: any) => `R$ ${value}` || '****',
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
                        onConfirm={() => ClickDeletecovenants(record.id)}
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
                      setRecordCovenants(record);
                    },
                  },
                  {
                    label: (
                      <Space style={{ color: ' rgb(0, 21, 42)' }}>
                        <PlusOutlined style={{ color: 'rgb(0, 21, 42)' }} />
                        Objeto
                      </Space>
                    ),
                    key: '3',
                    onClick: () => {
                      setSelectedCovenantId(record.id);
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

  const updatedBalance = (valorExecutado: any, resourceObjects: any) => {
    // Obtém o valor do repasse do objeto resourceObjects
    const repasse = resourceObjects[0]?.covenants?.transferAmount;

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
  };

  // Função para atualizar as unidades
  const updateDeliveryUnits = (newUnits: UnitsResponse[]) => {
    setUnits(newUnits);
  };
  //Função para rnderizar os nome das unidades
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

  useEffect(() => {
    setShowModal(false);
  }, []);

  // Funções para listagens
  useEffect(() => {
    loadingcovenantsForm();
    loadingObjectResourceForm();
    loadingDeliveryForm();
  }, []);

  async function loadingcovenantsForm() {
    const response = await getCovenants('covenants');
    if (response !== false) {
      setCovenants(response.data);
    }
  }

  async function loadingObjectResourceForm() {
    const response = await getObjectResource('resourceobjects');
    if (response !== false) {
      setObjectResource(response.data);
    }
  }
  async function loadingDeliveryForm() {
    const response = await getDeliveryObject('delivery');
    if (response !== false) {
      setDelivery(response.data);
    } else {
      message.error('Ocorreu um erro inesperado ao obter as destinações.');
    }
  }
  //funções de exlusão
  const ClickDeletecovenants = async (record: any) => {
    await deleteCovenants(record);
    const newcovenants = [...covenants];
    newcovenants.splice(record, -1);
    setCovenants(newcovenants);
    loadingcovenantsForm();
  };

  const ClickDeleteObjResource = async (record: any) => {
    await deleteObjectResource(record.id);
    const newObjResource = [...objectResource];
    newObjResource.splice(record.id, -1);
    setObjectResource(newObjResource);
    loadingObjectResourceForm();

    updatedBalanceList(record.covenants);
  };

  const ClickDeleteDestinaions = async (record: any) => {
    await deleteDeliveryObject(record);
    const newObjResource = [...delivery];
    newObjResource.splice(record, -1);
    setDelivery(newObjResource);
    loadingDeliveryForm();
  };
  // Função para atalizações de tabelas
  const updateCovenantsList = (newcovenants: any) => {
    setCovenants(prevottomToBottom => [...prevottomToBottom, newcovenants]);
    loadingcovenantsForm();
  };
  const updateResourceObjectsList = (newRObjectResource: any) => {
    setObjectResource(prevObjectResource => [
      ...prevObjectResource,
      newRObjectResource,
    ]);
    loadingObjectResourceForm();
    loadingcovenantsForm();
  };

  const submitUpdate = async (convenants: any) => {
    await updateCovenants(convenants, convenants.id);
    updateCovenantsList(convenants);
  };

  const updatedBalanceList = async (values: any) => {
    const res = await getCovenants(`covenants/${values.id}`);
    if (res) {
      const covenantsItem = res.data;

      const valorTotalValue = updatedTotalValue(covenantsItem?.resourceObjects);
      const valorBalance = updatedBalance(
        valorTotalValue,
        covenantsItem?.resourceObjects,
      );

      covenantsItem.balance = valorBalance;
      covenantsItem.totalValueExecuted = valorTotalValue;
      submitUpdate(covenantsItem);
    }
  };

  const updateDeliveryList = (newDestiny: any) => {
    setDelivery(prevDestiny => [...prevDestiny, newDestiny]);
    loadingDeliveryForm();
  };

  // Fechar modal convenio
  const hideModal = (refresh: boolean) => {
    setShowModal(false);
    setRecordCovenants(null);
    if (refresh) setCovenants([]);
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

  //adiciona uma chave única para cada convênio usando o índice
  const covenantsWithKeys = covenants.map((covenants, index) => ({
    ...covenants,
    key: `covenants${index}`,
  }));

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
            <PlusOutlined /> Convênio
          </Button>
        </Form.Item>
      </Row>
      <Table
        rowKey="key"
        columns={columns}
        expandable={{
          expandedRowRender,
          defaultExpandedRowKeys: ['0'],
        }}
        dataSource={covenantsWithKeys}
        rowClassName={() => 'custom-table-row'} // Defina o nome da classe para o estilo personalizado
        className="custom-table" // Adicione a classe CSS personalizada à tabela
      />

      <ModalCovenants
        id={recordCovenants?.id}
        openModal={showModal}
        closeModal={hideModal}
        updateCovenantsList={updateCovenantsList}
        updateBalanceList={updatedBalanceList}
      />

      <ModalObjectResource
        id={recordObjectResource?.id}
        idFdd={''}
        idGoal={''}
        idStateAmendment={''}
        idStateTreasury={''}
        idCovenants={selectedCovenantId}
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
