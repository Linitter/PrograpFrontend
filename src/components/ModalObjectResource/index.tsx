import {
  Button,
  Col,
  Form,
  Input,
  Modal,
  Popconfirm,
  Row,
  Select,
  Space,
  Table,
  message,
} from 'antd';
import { useEffect, useState } from 'react';

import {
  deleteDestinationObjects,
  getDestinationObjects,
} from '../../hooks/destinationObjects';
import {
  getOneResourceobjects,
  postObjectResource,
  updateObjectResource,
} from '../../hooks/objectResourceService';

import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { ColumnsType } from 'antd/es/table';
import ReactInputMask from 'react-input-mask';
import { apiDestination } from '../../hooks/deliveryObject';
import { getObject } from '../../hooks/object';
import InputDinheiro from '../InputDinheiro';
import ModalObject from '../ModalObject';

type Props = {
  id: string;
  idFdd: string;
  idGoal: string;
  idCovenants: string;
  idStateTreasury: string;
  idStateAmendment: string;
  openModal: boolean;
  updateResourceObjectsList: any;
  updateBalanceList: any;
  closeModal: (refresh: boolean) => void;
};

interface DataType {
  id: any;
  key: React.Key;
  unitId: string;
  expectedQuantity: string;
}

type ModelObjects = {
  id: string;
  name: string;
  model: any;
};
type UnitsResponse = {
  id: string;
  sigla: string;
  nome: string;
  superior: string;
};
// OBJETOS DO RECUSROS
const ModalObjectResource = ({
  id,
  idFdd,
  idGoal,
  idCovenants,
  idStateAmendment,
  idStateTreasury,
  openModal,
  updateBalanceList,
  closeModal,
  updateResourceObjectsList,
}: Props) => {
  const [objects, setObjects] = useState<ModelObjects[]>([]);
  const [selectModelId, setSelectedObjectId] = useState('');
  const [showModal, setShowModal] = useState(false);

  const [units, setUnits] = useState<UnitsResponse[]>([]);
  const [selectUnits, setSelectedUnits] = useState('');
  const [unitMap, setUnitMap] = useState<{ [id: string]: UnitsResponse }>({});
  const [unitsLoaded, setUnitsLoaded] = useState(false);

  const [destinationObjects, setdestinationObjects] = useState<DataType[]>([]);

  const [selectExpectedQuant, setSelectExpectedQuant] = useState('');

  // BUSCANDO UNIDADES DA PC
  const token = localStorage.getItem('token_sso');
  const urlWithToken = `unidadesPC?token=${token}`;
  const [form] = Form.useForm();

  const [unitaryValue, setUnitaryValue] = useState<string>('');
  const [estimatedTotalValue, setEstimatedTotalValue] = useState<string>('');
  const [executedValue, setExecutedValue] = useState<string>('');

  //Setando id de destinação no formulario para criação de objetos
  form.setFieldValue('goal', idGoal); // Id da meta
  form.setFieldValue('covenants', idCovenants); // Id do convenio
  form.setFieldValue('stateAmendment', idStateAmendment); // Id da emenda estadual
  form.setFieldValue('stateTreasury', idStateTreasury); // Id do trouro estadual
  form.setFieldValue('fdd', idFdd); // Id do fdd

  const handleOk = (e: any) => {
    e.preventDefault();
    form
      .validateFields()
      .then(() => {
        if (id) {
          submitUpdate();
        } else {
          submitCreate();
        }
        form.resetFields();
        closeModal(true);
      })
      .catch(errorInfo => message.error('Erro no preenchimento dos campos.'));
  };

  useEffect(() => {
    loadingObjectsResource();
    resetDados();
  }, [id]);

  const resetDados = () => {
    setUnitaryValue('');
    setEstimatedTotalValue('');
    setExecutedValue('');
  };

  async function loadingObjectsResource() {
    if (id) {
      await getOneResourceobjects(id).then(response => {
        if (response !== false) {
          form.setFieldsValue({
            id: response.data?.id,
            objects: response.data.objects?.id, // id do obejto
            goal: response.data.goal?.id, // id da meta
            fdd: response.data.fdd?.id, // id do fdd
            covenants: response.data.covenants?.id, //  id do convenio
            stateAmendment: response.data.stateAmendment?.id, // id da emenda estadual
            idStateTreasury: response.data.idStateTreasury?.id, //id do tesouro estadual
            status: response.data.status, // status
            progress: response.data.progress, // andamento
            processNumber: response.data.processNumber, // numero do processo
            natureExpense: response.data.natureExpense, // naturesa de despesas
            acquisitionMode: response.data.acquisitionMode, // tipo de aquisição
            amount: response.data.amount, // quantidade
            unitaryValue: response.data.unitaryValue, // valor unitario
            estimatedTotalValue: response.data.estimatedTotalValue, // valor total estimado
            executedValue: response.data.executedValue, // valor executado
            commitmentDate: response.data.commitmentDate, // data do empenho
            forecastDate: response.data.forecastDate, // data de previsão
            destinationObjects: response.data.destinationObjects, //id da destinação/obejtos
          });

          setUnitaryValue(response.data.unitaryValue);
          setEstimatedTotalValue(response.data.estimatedTotalValue);
          setExecutedValue(response.data.executedValue);

          setdestinationObjects(response.data.destinationObjects || []);
        } else {
          message.error(
            'Ocorreu um erro inesperado ao obter os objetos do recurso.',
          );
        }
      });
    }
  }
  // listando objeto e destinações do objeto
  useEffect(() => {
    loadingObjects();
    loadingGrantorForm();
  }, []);
  //filtrar objetos de destino por convênio
  function filterDestinationObjectsByCovenant(
    destinationObjects: any,
    covenantId: any,
  ) {
    return destinationObjects.filter((destinationObject: any) => {
      return destinationObject.resourceObjects?.id === covenantId;
    });
  }

  async function loadingGrantorForm() {
    const response = await getDestinationObjects('destinationObjects');
    if (response !== false) {
      // Obtém todos os destinationObjects
      const allDestinationObjects = response.data;

      // Filtra os destinationObjects com base no covenant atual (idGrantor)
      const filteredDestinationObjects = filterDestinationObjectsByCovenant(
        allDestinationObjects,
        id,
      );

      setdestinationObjects(filteredDestinationObjects);
    }
  }

  // exclusão de destinação/objetos
  const ClickDelete = async (record: any) => {
    console.log('rec id', record.id);

    if (record.id !== null && record.id !== undefined) {
      console.log('defined');

      const newDestinationObjects = [...destinationObjects];
      const index = newDestinationObjects.findIndex(
        obj => obj.id === record.id,
      );

      if (index !== -1) {
        await deleteDestinationObjects(record.id);
        newDestinationObjects.splice(index, 1);
        setdestinationObjects(newDestinationObjects);
      } else {
        console.log('Objeto não encontrado na lista');
      }
    } else {
      console.log('destinationObjects', destinationObjects);

      const findObjectIndex = destinationObjects.findIndex(
        (obj: any) =>
          obj.expectedQuantity === record.expectedQuantity &&
          obj.unitId === record.unitId &&
          obj.resourceObjects === record.resourceObjects &&
          obj.id === undefined,
      );

      if (findObjectIndex !== -1) {
        const newDestinationObjects = [...destinationObjects];
        newDestinationObjects.splice(findObjectIndex, 1);
        setdestinationObjects(newDestinationObjects);
        console.log('Objeto correspondente encontrado e removido da lista');
      } else {
        console.log('Nenhum objeto correspondente encontrado na lista');
      }
    }
  };

  //carregando objetos
  async function loadingObjects() {
    const response = await getObject('objects');
    if (response !== false) {
      setObjects(response.data);
    } else {
      message.error('Ocorreu um erro inesperado ao obter os objetos.');
    }
  }

  //selec do id de objeto e destino
  function handleSelectObject(value: any) {
    setSelectedObjectId(value); // Atualiza o estado com o ID selecionado
  }
  const novoBalanceValue = (objResource: any) => {
    let id;
    if (idFdd !== null && idFdd !== '') {
      id = objResource.fdd;
    } else if (idCovenants !== null && idCovenants !== '') {
      id = objResource.covenants;
    } else if (idGoal !== null && idGoal !== '') {
      id = objResource.goal;
    } else if (idStateAmendment !== null && idStateAmendment !== '') {
      id = objResource.stateAmendment;
    } else if (idStateTreasury !== null && idStateTreasury !== '') {
      id = objResource.stateTreasury;
    } else {
      id = null;
    }
    updateBalanceList({
      id,
    });
  };

  const salvarObjetoRecurso = async (e: any) => {
    e.destinationObjects = destinationObjects;
    const savedResourceObject = await postObjectResource(e);
    updateResourceObjectsList(savedResourceObject);
    return savedResourceObject; // Retorna o objeto de recurso salvo
  };
  // No momento de submeter a criação ou atualização
  const submitCreate = async () => {
    const editingObjectsResource = form.getFieldsValue(true);
    // Defina os valores padrão para campos numéricos se estiverem vazios ou nulos
    const setDefaultCurrencyValue = (field: any, defaultValue: any) => {
      if (
        editingObjectsResource[field] === undefined ||
        editingObjectsResource[field] === null
      ) {
        editingObjectsResource[field] = defaultValue;
      }
    };
    setDefaultCurrencyValue('unitaryValue', '0.000,00');
    setDefaultCurrencyValue('estimatedTotalValue', '0.000,00');
    setDefaultCurrencyValue('executedValue', '0.000,00');

    const fieldValues = determineFields();
    editingObjectsResource.goal = fieldValues.goal;
    editingObjectsResource.covenants = fieldValues.covenants;
    editingObjectsResource.stateAmendment = fieldValues.stateAmendment;
    editingObjectsResource.stateTreasury = fieldValues.stateTreasury;
    editingObjectsResource.fdd = fieldValues.fdd;
    await salvarObjetoRecurso(editingObjectsResource);
    novoBalanceValue(editingObjectsResource);
  };

  // // Função para determinar os campos nulos
  const determineFields = () => {
    const fields = {
      goal: idGoal || null,
      covenants: idCovenants || null,
      stateAmendment: idStateAmendment || null,
      stateTreasury: idStateTreasury || null,
      fdd: idFdd || null,
    };
    return fields;
  };

  const atualizarObjetoRecurso = async (e: any) => {
    e.destinationObjects = destinationObjects;
    const updatedCovenant = await updateObjectResource(e, id);
    updateResourceObjectsList(updatedCovenant);
  };

  const submitUpdate = async () => {
    const editingObjectsResource = form.getFieldsValue(true);

    // Defina os valores padrão para campos numéricos se estiverem vazios ou nulos
    const setDefaultCurrencyValue = (field: any, defaultValue: any) => {
      if (
        editingObjectsResource[field] === undefined ||
        editingObjectsResource[field] === null
      ) {
        editingObjectsResource[field] = defaultValue;
      }
    };
    setDefaultCurrencyValue('unitaryValue', '0.000,00');
    setDefaultCurrencyValue('executedValue', '0.000,00');
    setDefaultCurrencyValue('estimatedTotalValue', '0.000,00');

    const fieldValues = determineFields();
    editingObjectsResource.goal = fieldValues.goal;
    editingObjectsResource.covenants = fieldValues.covenants;
    editingObjectsResource.stateAmendment = fieldValues.stateAmendment;
    editingObjectsResource.stateTreasury = fieldValues.stateTreasury;
    editingObjectsResource.fdd = fieldValues.fdd;
    await atualizarObjetoRecurso(editingObjectsResource);
    novoBalanceValue(editingObjectsResource);
  };

  // Função para calcular e atualizar o valor total com base na quantidade e valor unitário
  const handleAmountAndUnitaryValueChange = (
    amount: any,
    unitaryValue: any,
  ) => {
    const numericAmount = Number(amount);

    if (typeof unitaryValue === 'string') {
      const valorSemPontos = unitaryValue.replace(/\./g, '').replace(/,/g, '.');

      const numericUnitaryValue = Number(valorSemPontos);
      console.log('unitaryValue', numericUnitaryValue);
      console.log('amount', numericAmount);

      const estimatedTotalValue = numericAmount * numericUnitaryValue || 0;

      const formattedEstimatedTotalValue = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        maximumFractionDigits: 2,
      }).format(estimatedTotalValue);

      const valorSemSimbolo = formattedEstimatedTotalValue.replace(
        /R\$\s?/,
        '',
      );

      form.setFieldsValue({ estimatedTotalValue: valorSemSimbolo });
      form.setFieldsValue({ executedValue: valorSemSimbolo });
    }
  };

  const updateObjectList = (newObjects: any) => {
    setObjects(prevObjects => [...prevObjects, newObjects]);
    loadingObjects();
  };
  const hideModal = (refresh: boolean) => {
    loadingGrantorForm();
    setShowModal(false);
    if (refresh) setObjects([]);
  };

  const handleCreateDestination = async () => {
    const destination = {
      unitId: selectUnits,
      expectedQuantity: selectExpectedQuant,
      resourceObjects: id, // Inclui o ID do objeto de recurso
    };
    setdestinationObjects((prevList: any) => [...prevList, destination]);
    setSelectedUnits('');
    setSelectExpectedQuant('');
    form.setFieldsValue({ expectedQuantity: '' });
    form.setFieldsValue({ unitId: '' });
  };

  //consulta de nome pelo id
  const renderGrantorName = (unitId: any, unit: any) => {
    const selectedUnit = unitMap[unitId];
    if (selectedUnit) {
      return selectedUnit.nome;
    } else if (unit && unit.name) {
      return unit.name;
    } else {
      return '*******';
    }
  };

  const handleSetUnitaryValue = (value: string) => {
    const valorSemSimbolo = value.replace(/R\$\s?/, '');

    const amount = form.getFieldValue('amount');

    handleAmountAndUnitaryValueChange(amount, valorSemSimbolo);
    setUnitaryValue(valorSemSimbolo);
    form.setFieldsValue({ unitaryValue: valorSemSimbolo });
  };

  const handleSetEstimatedTotalValue = (value: string) => {
    const valorSemSimbolo = value.replace(/R\$\s?/, '');
    setEstimatedTotalValue(valorSemSimbolo);
    form.setFieldsValue({ estimatedTotalValue: valorSemSimbolo });
  };

  const handleSetExecutedValue = (value: string) => {
    const valorSemSimbolo = value.replace(/R\$\s?/, '');

    setExecutedValue(valorSemSimbolo);
    form.setFieldsValue({ executedValue: valorSemSimbolo });
  };
  //tabela de concedentes e valores
  const columns: ColumnsType<DataType> = [
    {
      title: 'Unidades',
      dataIndex: 'unitId',
      key: 'unitId',
      render: (unitId: number, record: any) =>
        renderGrantorName(unitId, unitMap[unitId]),
      width: '45%',
    },

    {
      title: 'Qtde prevista',
      dataIndex: 'expectedQuantity',
      key: 'expectedQuantity',
      width: '30%',
    },

    {
      title: 'Ação',
      key: 'operation',
      width: '10%',
      render: (record: any) => {
        return (
          <Space size="middle">
            <Popconfirm
              title="Tem certeza de que deseja excluir?"
              onConfirm={() => ClickDelete(record)}
            >
              <DeleteOutlined
                className="icon-delete-phones"
                style={{ color: 'red' }}
              />
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  //selec do id de unidades
  function handleSelectUnits(value: any, field: string) {
    if (field === 'unitId') {
      setSelectedUnits(value);
    } else if (field === 'subUnitId') {
      setSelectedUnits(value);
    }
  }
  useEffect(() => {
    if (openModal) {
      resetModalState();
    }
  }, [openModal]);
  // resetando inputs do destinationObjects
  const resetModalState = () => {
    setSelectExpectedQuant('');
    setSelectedUnits('');
    setdestinationObjects([]);
  };
  // Verifica se o modal está aberto, verifique se as unidades ainda não foram carregadas e carregue-as apenas uma vez.
  useEffect(() => {
    if (openModal && !unitsLoaded) {
      // Carregue os dados das unidades aqui
      apiDestination
        .get(urlWithToken)
        .then(response => {
          const listOfUnits = response.data;
          setUnits(listOfUnits);
          setUnitMap(
            listOfUnits.reduce((map: any, unit: UnitsResponse) => {
              map[unit.id] = unit;
              return map;
            }, {}),
          );
          setUnitsLoaded(true); // Marque que os dados das unidades foram carregados
        })
        .catch(error => {
          console.error('Erro ao obter unidades:', error);
        });
    }
  }, [openModal, unitsLoaded]);
  // As unidades serão carregadas apenas uma vez quando o modal for aberto pela primeira vez
  useEffect(() => {
    if (!openModal) {
      setUnitsLoaded(false); // Redefina o estado quando o modal for fechado
    }
  }, [openModal]);

  return (
    <>
      <ModalObject
        id={''}
        openModal={showModal}
        closeModal={hideModal}
        updateObjectsList={updateObjectList}
      />
      <Modal
        open={openModal}
        title="Objetos"
        okText="Salvar"
        width={'60%'}
        onCancel={() => {
          form.resetFields();
          closeModal(false);
        }}
        onOk={handleOk}
      >
        <Form layout="vertical" form={form}>
          <Row gutter={24}>
            <Col offset={1} span={6}>
              <Form.Item
                name={['objects']}
                label="Objeto"
                rules={[
                  {
                    required: true,
                    message: 'Por favor, insira um objeto.',
                  },
                ]}
              >
                <Select
                  showSearch
                  placeholder="Selecione o objeto"
                  onChange={value => handleSelectObject(value)}
                  value={selectModelId} // Define o valor do Select com o estado atual de selectTraining
                  filterOption={(input, option) =>
                    (option?.label ?? '')
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  options={objects.map(obj => ({
                    label: `${obj.name} - ${obj.model?.name || ''}`, // Usar 'N/A' se obj.model.name for undefined
                    value: obj.id, // Define o ID do treinamento como valor da opção
                  }))}
                />
              </Form.Item>
            </Col>
            <Button
              style={{
                marginTop: '29px',
                marginLeft: '-0.7%',
                marginRight: '12px',
                width: '4%',
              }}
              onClick={() => {
                setShowModal(true);
              }}
            >
              <PlusOutlined />
            </Button>
            <Col span={4}>
              <Form.Item name={['status']} label="Status">
                <Select
                  showSearch
                  placeholder={'Selecione o status'}
                  filterOption={(input, option) =>
                    (option?.label ?? '')
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  options={[
                    { value: 'Entregue', label: 'Entregue' },
                    { value: 'Concluído', label: 'Concluído' },
                    { value: 'Em execução', label: 'Em execução' },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col span={5}>
              <Form.Item name={['progress']} label="Andamento">
                <Input />
              </Form.Item>
            </Col>

            <Col span={6}>
              <Form.Item name={['processNumber']} label="Nº Processo">
                <Input />
              </Form.Item>
            </Col>

            <Col offset={1} span={6}>
              <Form.Item name={['natureExpense']} label="Natureza de despesa">
                <Select
                  showSearch
                  placeholder={'Selecione o tipo'}
                  filterOption={(input, option) =>
                    (option?.label ?? '')
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  options={[
                    { value: 'Custeio', label: 'Custeio' },
                    { value: 'Investimento', label: 'Investimento' },
                  ]}
                />
              </Form.Item>
            </Col>

            <Col span={5}>
              <Form.Item name={['acquisitionMode']} label="Modo de aquisição">
                <Select
                  showSearch
                  placeholder={'Selecione o tipo'}
                  filterOption={(input, option) =>
                    (option?.label ?? '')
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  options={[
                    { value: '', label: '' },
                    { value: 'ARP', label: 'ARP' },
                    { value: 'Aditivo', label: 'Aditivo' },
                    { value: 'Licitação', label: 'Licitação' },
                    { value: 'Compra Direta', label: 'Compra Direta' },
                  ]}
                />
              </Form.Item>
            </Col>

            <Col span={5}>
              <Form.Item name={['amount']} label="Quantidade">
                <Input
                  type="number"
                  onChange={(e: any) => {
                    const amount = parseFloat(e.target.value);
                    const unitaryValue = form.getFieldValue('unitaryValue');
                    handleAmountAndUnitaryValueChange(amount, unitaryValue);
                  }}
                />
              </Form.Item>
            </Col>

            <Col span={6}>
              <Form.Item name={['unitaryValue']} label="Valor unitario">
                <InputDinheiro
                  props={undefined}
                  handleMoeda={handleSetUnitaryValue}
                  value={unitaryValue}
                />
              </Form.Item>
            </Col>
            <Col offset={1} span={6}>
              <Form.Item
                name={['estimatedTotalValue']}
                label="Valor total estimado"
              >
                <InputDinheiro
                  props={undefined}
                  handleMoeda={handleSetEstimatedTotalValue}
                  value={estimatedTotalValue}
                  disabled={true}
                />
              </Form.Item>
            </Col>

            <Col span={6}>
              <Form.Item
                name={['executedValue']}
                label="Valor executado"
                hasFeedback
              >
                <InputDinheiro
                  props={undefined}
                  handleMoeda={handleSetExecutedValue}
                  value={executedValue}
                />
              </Form.Item>
            </Col>

            <Col span={5}>
              <Form.Item name={['forecastDate']} label="Data de previsão">
                <ReactInputMask
                  className="input-mask-date"
                  placeholder="00/00/0000"
                  maskChar={null}
                  mask="99/99/9999"
                />
              </Form.Item>
            </Col>
            <Col span={5}>
              <Form.Item name={['commitmentDate']} label="Data do empenho">
                <ReactInputMask
                  className="input-mask-date"
                  placeholder="00/00/0000"
                  maskChar={null}
                  mask="99/99/9999"
                />
              </Form.Item>
            </Col>

            {/* Renderizar a seção de Unidades e Tabela somente se houver um ID de covenants */}
            {form.getFieldValue('goal') ? null : (
              <>
                <Col offset={1} span={14}>
                  <Form.Item name={['unitId']} label="Unidade">
                    <Select
                      showSearch
                      placeholder={'Selecione o tipo'}
                      onChange={value => handleSelectUnits(value, 'unitId')}
                      value={selectUnits}
                      filterOption={(input, option) =>
                        (option?.label ?? '')
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                      options={units.map(units => ({
                        label: units.nome,
                        value: units.id,
                      }))}
                      onClick={() => {
                        // Buscar as unidades aqui somente quando o usuário clicar
                        apiDestination
                          .get(urlWithToken)
                          .then(response => {
                            const listOfUnits = response.data;
                            setUnits(listOfUnits);
                            setUnitMap(
                              listOfUnits.reduce(
                                (map: any, unit: UnitsResponse) => {
                                  map[unit.id] = unit;
                                  return map;
                                },
                                {},
                              ),
                            );
                            updateObjectList(listOfUnits);
                          })
                          .catch(error => {
                            console.error('Erro ao obter unidades:', error);
                          });
                      }}
                    />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item name={['expectedQuantity']} label="Qtde prevista">
                    <Input
                      type="number"
                      onChange={e => {
                        setSelectExpectedQuant(e.target.value);
                      }}
                      disabled={
                        !!form.getFieldValue('stateAmendment') ||
                        !!form.getFieldValue('stateTreasury')
                      } // Define disabled com base em stateAmendment ou no stateTreasury
                    />
                  </Form.Item>
                </Col>

                <Button
                  style={{
                    marginTop: '29px',
                    marginLeft: '-0.11%',
                    marginRight: '9px',
                    width: '7.5%',
                  }}
                  onClick={() => {
                    handleCreateDestination();
                  }}
                >
                  <PlusOutlined /> Incluir
                </Button>
              </>
            )}
            <Col span={8}>
              <Form.Item name={['goal']} label="Id Meta" hidden>
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name={['fdd']} label="Id FDD" hidden>
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name={['stateTreasury']} label="Id tesouro" hidden>
                <Input />
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item name={['stateAmendment']} label="Id Emenda " hidden>
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name={['covenants']} label="Id convênio" hidden>
                <Input />
              </Form.Item>
            </Col>
          </Row>
          {form.getFieldValue('goal') ? null : (
            <Table
              columns={columns}
              rowKey="key"
              dataSource={destinationObjects}
              rowClassName={() => 'custom-table-row'} // Defina o nome da classe para o estilo personalizado
              className="custom-table"
            />
          )}
        </Form>
      </Modal>
    </>
  );
};
export default ModalObjectResource;
