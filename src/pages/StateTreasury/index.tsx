import {
  DownOutlined,
  EllipsisOutlined,
  PlusOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import {
  Button,
  Dropdown,
  Form,
  Input,
  InputRef,
  MenuProps,
  Popconfirm,
  Row,
  Space,
  Table,
  TableColumnsType,
  Tooltip,
  message,
} from 'antd';
import type { ColumnType, ColumnsType } from 'antd/es/table';
import { FilterConfirmProps } from 'antd/es/table/interface';
import React, { useEffect, useRef, useState } from 'react';
import Highlighter from 'react-highlight-words';
import ModalObjectDelivery from '../../components/ModalObjectDelivery';
import ModalObjectResource from '../../components/ModalObjectResource';
import ModalstateTreasury from '../../components/ModalstateTreasury';
import {
  deleteStateTreasury,
  getStateTreasury,
} from '../../hooks/StateTreasury';
import {
  apiDestination,
  deleteDeliveryObject,
  getDeliveryObject,
} from '../../hooks/deliveryObject';
import {
  deleteObjectResource,
  getObjectResource,
} from '../../hooks/objectResourceService';

interface DataType {
  key: React.Key;
  id: string;
  authors: string;
  source: string;
  year: string;
  amendmentNumber: string;
  transferAmount: string;
  description: string;
  balance: any;
  resourceObjects: any;
}

interface ExpandedDataTypeObject {
  destinationObjects: any;
  key: React.Key;
  id: string;
  objectsId: string;
  stateTreasuryId: string;
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

  //resouce objects
  objects: any;
  acquisitionMode: string;
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

type DataIndex = keyof DataType;

export default function StateTreasury() {
  const [showModal, setShowModal] = useState(false);

  const [modalObjectResource, setModalObjectResourse] = useState(false);
  const [modalDelivery, setModalDelivery] = useState(false);

  const [stateTreasury, setstateTreasury] = useState<DataType[]>([]);
  const [recordstateTreasury, setRecordstateTreasury] = useState<any>({});

  const [objectResource, setObjectResource] = useState<any[]>([]);
  const [recordObjectResource, setRecordObjectResource] = useState<any>({});

  const [delivery, setDelivery] = useState<any[]>([]);

  const [recordDelivery, setRecordDelivery] = useState<any>({});
  const [units, setUnits] = useState<UnitsResponse[]>([]); // Adicione este estado
  const [selectedCovenantId, setSelectedstateTreasuryId] = useState<any>({});

  //Filtros
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const searchInput = useRef<InputRef>(null);

  const getResourceObjectColumnSearchProps = (
    dataIndex: keyof ExpandedDataTypeObject,
  ): ColumnType<ExpandedDataTypeObject> => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
      close,
    }) => (
      <div style={{ padding: 8 }}>
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={e =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() =>
            handleSearch(selectedKeys as string[], confirm, dataIndex)
          }
          style={{ marginBottom: 8, display: 'block' }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() =>
              handleSearch(selectedKeys as string[], confirm, dataIndex)
            }
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Search
          </Button>
          <Button
            onClick={() => {
              if (clearFilters) {
                clearFilters();
              }
              handleResetFilters();
              confirm();
            }}
            size="small"
            style={{ width: 90 }}
          >
            Reset
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              close();
            }}
          >
            close
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered: boolean) => (
      <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
    ),
    onFilter: (value, record) => {
      const recordValue =
        dataIndex === 'objects' ? record.objects?.name : record[dataIndex];

      return recordValue
        ? recordValue
            .toString()
            .toLowerCase()
            .includes((value as string).toLowerCase())
        : false;
    },
    onFilterDropdownOpenChange: visible => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
    render: text =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ''}
        />
      ) : (
        text
      ),
  });

  const expandedRowRender = (record: any) => {
    //adicionar uma chave única para cada objetos do recurso usando o índice
    const objectWithKeys = objectResource.map((objectResource, index) => ({
      ...objectResource,
      key: `objectResource_${index}`,
    }));
    // filtra os objetos vinculado com uma meta
    const filterObjectResource = objectWithKeys.filter(
      object => object.stateTreasury?.id === record.id,
    );
    //busca do nome da unidade por id
    const findUnitNameById = (unitId: any) => {
      const unit = units.find(unit => unit.id === unitId);
      return unit ? unit.nome : 'Unidade Desconhecida';
    };
    const columns: TableColumnsType<ExpandedDataTypeObject> = [
      {
        title: 'Objeto',
        dataIndex: 'objects',
        key: 'objects',
        width: '12%',
        render: objects => (objects ? objects?.name : ''),
        ...getResourceObjectColumnSearchProps('objects'),
      },
      {
        title: 'Unidades',
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

                return `${unitName}`;
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
        ...getResourceObjectColumnSearchProps('status'),
        render: (value: any) => value || '*********',
      },
      {
        title: 'Andamento',
        dataIndex: 'progress',
        key: 'progress',
        width: '7%',
        ...getResourceObjectColumnSearchProps('progress'),
        render: (value: any) => value || '*********',
      },
      {
        title: 'Nº processo',
        dataIndex: 'processNumber',
        key: 'processNumber',
        width: '8%',
        ...getResourceObjectColumnSearchProps('processNumber'),
        render: (value: any) => value || '*********',
      },
      {
        title: 'natureza de despesa',
        dataIndex: 'natureExpense',
        key: 'natureExpense',
        className: 'custom-column', // Adicione a classe CSS personalizada à coluna "Nome"
        width: '7%',
        ...getResourceObjectColumnSearchProps('natureExpense'),
        render: (value: any) => value || '*********',
      },
      {
        title: 'Modo de aquisição',
        dataIndex: 'acquisitionMode',
        key: 'acquisitionMode',
        width: '7%',
        ...getResourceObjectColumnSearchProps('acquisitionMode'),
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
                        setSelectedstateTreasuryId(record.stateTreasury?.id);
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

  const handleSearch = (
    selectedKeys: string[],
    confirm: (param?: FilterConfirmProps) => void,
    dataIndex: any,
  ) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };
  const handleResetFilters = () => {
    setSearchText('');
    setSearchedColumn('');
    loadingstateTreasuryForm();
  };

  const getColumnSearchProps = (
    dataIndex: DataIndex,
  ): ColumnType<DataType> => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
      close,
    }) => (
      <div style={{ padding: 8 }}>
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={e =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() =>
            handleSearch(selectedKeys as string[], confirm, dataIndex)
          }
          style={{ marginBottom: 8, display: 'block' }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() =>
              handleSearch(selectedKeys as string[], confirm, dataIndex)
            }
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Search
          </Button>
          <Button
            onClick={() => {
              if (clearFilters) {
                clearFilters();
              }
              handleResetFilters();
              confirm();
            }}
            size="small"
            style={{ width: 90 }}
          >
            Reset
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              close();
            }}
          >
            Close
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered: boolean) => (
      <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
    ),
    onFilter: (value, record) => {
      return record[dataIndex]
        ? record[dataIndex]
            .toString()
            .toLowerCase()
            .includes((value as string).toLowerCase())
        : false;
    },
    onFilterDropdownOpenChange: visible => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
    render: text =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ''}
        />
      ) : (
        text
      ),
  });

  const columns: ColumnsType<DataType> = [
    {
      title: 'Fonte',
      dataIndex: 'source',
      key: 'source',
      width: '40%',
      className: 'custom-column',
    },
    {
      title: 'Ano',
      dataIndex: 'year',
      key: 'year',
      width: '40%',
      className: 'custom-column',
      ...getColumnSearchProps('year'),
      render: (value: any) => value || '*******',
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
                        onConfirm={() => ClickDeletestateTreasury(record.id)}
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
                      setRecordstateTreasury(record);
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
                      setSelectedstateTreasuryId(record.id);
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

  useEffect(() => {
    setShowModal(false);
  }, []);

  // listagem
  useEffect(() => {
    loadingstateTreasuryForm();
    loadingObjectResourceForm();
    loadingDeliveryForm();
  }, []);
  {
    /* const updatedBalance = (resourceObjects: any) => {
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


    const submitUpdate = async (stateTreasury: any) => {
    await updateStateTreasury(stateTreasury, stateTreasury.id);
    updatestateTreasuryList(stateTreasury);
  };
  }; */
  }

  async function loadingstateTreasuryForm() {
    const response = await getStateTreasury('stateTreasury');
    if (response !== false) {
      const stateData = response.data;

      const sortedState = stateData.sort((a: any, b: any) => {
        return parseInt(a.position, 10) - parseInt(b.position, 10);
      });

      setstateTreasury(sortedState);
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
  //função de exlusão
  const ClickDeletestateTreasury = async (record: any) => {
    await deleteStateTreasury(record);
    const newstateTreasury = [...stateTreasury];
    newstateTreasury.splice(record, -1);
    setstateTreasury(newstateTreasury);
    loadingstateTreasuryForm();
  };

  const ClickDeleteObjResource = async (record: any) => {
    await deleteObjectResource(record.id);
    const newObjResource = [...objectResource];
    newObjResource.splice(record.id, -1);
    setObjectResource(newObjResource);
    loadingObjectResourceForm();
    //  updatedBalanceList(record.stateAmendment);
  };

  const ClickDeleteDestinaions = async (record: any) => {
    await deleteDeliveryObject(record);
    const newObjResource = [...delivery];
    newObjResource.splice(record, -1);
    setDelivery(newObjResource);
    loadingDeliveryForm();
  };

  const updatestateTreasuryList = (newstateTreasury: any) => {
    setstateTreasury(prevottomToBottom => [
      ...prevottomToBottom,
      newstateTreasury,
    ]);
    loadingstateTreasuryForm();
  };
  const updateResourceObjectsList = (newRObjectResource: any) => {
    setObjectResource(prevObjectResource => [
      ...prevObjectResource,
      newRObjectResource,
    ]);
    loadingObjectResourceForm();
    loadingstateTreasuryForm();
  };

  const updatedBalanceList = async (values: any) => {
    {
      /*  const resState = await getStateTreasury(`stateTreasury/${values.id}`);
    if (resState) {
      const StateItem = resState.data;
      const resObj = await getObjectResource(`resourceobjects`);
      if (resObj) {
        const newObj = resObj.data;
        const filterObj = newObj.filter((obj: any) => {
          return obj.stateTreasury?.id === values.id;
        });

        const valorBalance = updatedBalance(filterObj);
        StateItem.balance = valorBalance;
        submitUpdate(StateItem);
      }
    }*/
    }
  };

  const updateDeliveryList = (newDestiny: any) => {
    setDelivery(prevDestiny => [...prevDestiny, newDestiny]);
    loadingDeliveryForm();
  };

  // Fechar modal fundo a fundo
  const hideModal = (refresh: boolean) => {
    setShowModal(false);
    setRecordstateTreasury(null);
    if (refresh) setstateTreasury([]);
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
  const stateTreasuryWithKeys = stateTreasury.map((stateTreasury, index) => ({
    ...stateTreasury,
    key: `stateTreasury${index}`,
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
            <PlusOutlined /> Tesouro Estadual
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
        dataSource={stateTreasuryWithKeys}
        rowClassName={() => 'custom-table-row'} // Defina o nome da classe para o estilo personalizado
        className="custom-table" // Adicione a classe CSS personalizada à tabela
      />

      <ModalstateTreasury
        id={recordstateTreasury?.id}
        openModal={showModal}
        closeModal={hideModal}
        updateStateTreasuryList={updatestateTreasuryList}
      />

      <ModalObjectResource
        id={recordObjectResource?.id}
        idFdd={''}
        idGoal={''}
        idCovenants={''}
        idStateAmendment={''}
        idStateTreasury={selectedCovenantId}
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
