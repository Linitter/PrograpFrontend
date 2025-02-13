import {
  Modal,
  Form,
  Input,
  Col,
  message,
  Select,
  Row,
  Button,
  Space,
  Popconfirm,
} from 'antd';
import { useEffect, useState } from 'react';
import {
  getCovenants,
  getOneCovenants,
  postCovenants,
  updateCovenants,
} from '../../hooks/covenantsService';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import Table, { ColumnsType } from 'antd/es/table';
import {
  deleteCovenantAuthor,
  getCovenantAuthor,
} from '../../hooks/covenantAuthor';
import { getAuthor } from '../../hooks/uthorService';
import ModalAuthor from '../ModalAuthor';
import InputDinheiro from '../InputDinheiro';

const { TextArea } = Input;

type AuthorResponse = {
  id: string;
  name: string;
};

interface DataType {
  id: any;
  key: React.Key;
  covenants: string;
  authors: string;
  contributionValue: string;
}

type Props = {
  id: string;
  openModal: boolean;
  updateCovenantsList: any;
  updateBalanceList: any;
  closeModal: (refresh: boolean) => void;
};

const ModalCovenants = ({
  id,
  openModal,
  closeModal,
  updateCovenantsList,
  updateBalanceList,
}: Props) => {
  // author = autor
  const [author, setAuthor] = useState<AuthorResponse[]>([]);
  // convenant = convenio
  const [covenantAuthor, setcovenantAuthor] = useState<DataType[]>([]);
  //selectAuthorId = selecione ID do autor
  const [selectAuthorId, setSelectedAuthorId] = useState('');
  const [selectedContValue, setSelectedContValue] = useState('');
  // savedgrauthorsId = ID dos autores salvos
  const [savedgrauthorsId, setSavedgrauthorsId] = useState<any>({});
  const [selectedAuthor, setSelectedAuthor] = useState<AuthorResponse | null>(
    null,
  );
  const [authorMap, setAuthorMap] = useState<{
    [id: string]: AuthorResponse;
  }>({});
  const [currentcovenantAuthor, setCurrentAuthor] = useState<DataType[]>([]);
  // Estado para controlar os valores de repasse e contrapartida

  const [showModal, setShowModal] = useState(false);

  const [globalValue, setGlobalValue] = useState<string>('');
  const [balance, setBalance] = useState<string>('');
  const [counterpartValue, setCounterpartValue] = useState<string>('');
  const [transferAmount, setTransferAmount] = useState<string>('');
  const [executedValue, setExecutedValue] = useState<string>('');

  const [contributionValue, setContributionValue] = useState<string>('');

  const [form] = Form.useForm();
  // criação de convêncios
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

  //Listagem, se tiver id set no formulário
  useEffect(() => {
    loadingCovenants();
    resetDados();
  }, [id]);

  useEffect(() => {
    setGlobalValue('');
    setBalance('');
    setCounterpartValue('');
    setTransferAmount('');
    setContributionValue('');
  }, [openModal]);

  const resetDados = () => {
    setGlobalValue('');
    setBalance('');
    setCounterpartValue('');
    setTransferAmount('');
    setContributionValue('');
  };

  const loadAllConvenants = async () => {
    const response = await getCovenants('covenants');
    if (response) {
      const covenants = response.data;
      const sortedCovenants = covenants.sort((a: any, b: any) => {
        return parseInt(a.position, 10) - parseInt(b.position, 10);
      });

      return sortedCovenants;
    }
  };

  async function loadingCovenants() {
    if (id) {
      await getOneCovenants(id).then(response => {
        if (response !== false) {
          form.setFieldsValue({
            id: response.data.id,
            source: response.data.source, //fonte
            year: response.data.year, // Ano
            amendmentNumber: response.data.amendmentNumber, // Numero da emenda
            agreementNumber: response.data.agreementNumber, // Número do convênio
            amendment: response.data.amendment, // Emenda
            transferAmount: response.data.transferAmount, // Valor do repasse
            counterpartValue: response.data.counterpartValue, // Valor contrapartida
            globalValue: response.data.globalValue, // Valor Golbal
            description: response.data.description, // Descrição
            balance: response.data.balance, // Saldo
            covenantAuthor: response.data.covenantAuthor, //conveio/autor
            totalValueExecuted: response.data.totalValueExecuted,
          });

          setGlobalValue(response.data.globalValue);
          setBalance(response.data.balance);
          setExecutedValue(response.data.totalValueExecuted);
          setCounterpartValue(response.data.counterpartValue);
          setTransferAmount(response.data.transferAmount);
          setcovenantAuthor(response.data.covenantAuthor || []);
          setCurrentAuthor(response.data.covenantAuthor || []);
        } else {
          message.error('Ocorreu um erro inesperado ao obter fundo a fundo.');
        }
      });
    }
  }
  //função para mostrar o nome quando incluir e quando vem do banco no formulario
  const renderAuthorName = (authorId: any, authors: any) => {
    const selectedAuthor = authorMap[authorId];

    if (selectedAuthor) {
      return selectedAuthor.name;
    } else if (authors && authors.name) {
      return authors.name;
    } else {
      return '*******';
    }
  };

  //tabela de concedentes e valores
  const columns: ColumnsType<DataType> = [
    {
      title: 'Autor',
      dataIndex: 'authors',
      key: 'authors',
      render: (authorId: number, record: DataType) =>
        renderAuthorName(authorId, record.authors),
      width: '30%',
    },

    {
      title: 'Valor',
      dataIndex: 'contributionValue',
      key: 'contributionValue',
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
              onConfirm={() => ClickDelete(record.id)}
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

  function filtercovenantAuthorsByCovenant(
    covenantAuthors: any,
    covenantId: any,
  ) {
    return covenantAuthors.filter((covenantAuthor: any) => {
      return covenantAuthor.covenants?.id === covenantId;
    });
  }

  async function loadingcovenantAuthorForm() {
    const response = await getCovenantAuthor('covenantAuthor');
    if (response !== false) {
      // Obtém todos os destinationObjects
      const allDestinationObjects = response.data;

      // Filtra os destinationObjects com base no covenant atual id
      const filteredDestinationObjects = filtercovenantAuthorsByCovenant(
        allDestinationObjects,
        id,
      );

      setcovenantAuthor(filteredDestinationObjects);
    }
  }

  //carregando os convencio/autor
  useEffect(() => {
    loadingAuthorForm();
    loadingcovenantAuthorForm();
  }, []);

  async function loadingAuthorForm() {
    const response = await getAuthor('author');
    if (response !== false) {
      setAuthor(response.data);
    }
  }

  // exclusão de convenio/autor
  const ClickDelete = async (record: any) => {
    await deleteCovenantAuthor(record); // Certifique-se de passar o ID do registro
    const newcovenantAuthor = covenantAuthor.filter(
      item => item.id !== record.id,
    );
    setcovenantAuthor(newcovenantAuthor);
    loadingcovenantAuthorForm();
  };
  //incluindo dados no convencio/autor pelo convênio
  const handleCreateCovenantsAuthor = () => {
    if (savedgrauthorsId && selectedAuthor) {
      const contributionValue = selectedContValue || '0.000,00';
      const covenantAuthorData = {
        covenants: savedgrauthorsId,
        // convenio
        authors: selectedAuthor.id,
        //autor
        contributionValue: contributionValue,
        //valor de contribuição
      };

      setcovenantAuthor((prevList: any) => [...prevList, covenantAuthorData]);
      setCurrentAuthor((prevList: any) => [...prevList, covenantAuthorData]);
      setSelectedAuthor(null);
      setSelectedContValue('');

      form.setFieldsValue({ contributionValue: '' });
      form.setFieldsValue({ author: '' });
    }
  };

  //ATUALIZAÇÃO DE convenios************

  const atualizarConvenio = async (e: any) => {
    e.covenantAuthor = covenantAuthor;
    const updatedCovenant = await updateCovenants(e, id);
    updateCovenantsList(updatedCovenant);
    updateBalanceList({ id });
  };

  const submitUpdate = async () => {
    const editingCovenants = form.getFieldsValue(true);
    // Defina os valores padrão se estiverem vazios ou nulos
    const setDefaultCurrencyValue = (field: any, defaultValue: any) => {
      if (
        editingCovenants[field] === undefined ||
        editingCovenants[field] === null
      ) {
        editingCovenants[field] = defaultValue;
      }
    };
    setDefaultCurrencyValue('transferAmount', '0.000,00');
    setDefaultCurrencyValue('counterpartValue', '0.000,00');
    setDefaultCurrencyValue('globalValue', '0.000,00');
    setDefaultCurrencyValue('balance', '0.000,00');
    setDefaultCurrencyValue('totalValueExecuted', '0.000,00');

    // Agora, atualize os detalhes do convênio
    await atualizarConvenio(editingCovenants);
  };

  const salvarConvenio = async (e: any) => {
    e.covenantAuthor = covenantAuthor;
    const savedCovenant = await postCovenants(e);
    updateCovenantsList(savedCovenant);
    setSavedgrauthorsId(savedCovenant.id); // Defina o ID do convênio salvo
  };

  // CRIAÇÃO DE convenios
  const submitCreate = async () => {
    const editingCovenants = form.getFieldsValue(true);

    const lastCovenants = await loadAllConvenants();
    const maxPosition =
      lastCovenants.length > 0
        ? Math.max(...lastCovenants.map((covenants: any) => covenants.position))
        : 0;
    const newPosition = maxPosition + 1;
    editingCovenants.position = newPosition;

    const setDefaultCurrencyValue = (field: any, defaultValue: any) => {
      if (
        editingCovenants[field] === undefined ||
        editingCovenants[field] === null
      ) {
        editingCovenants[field] = defaultValue;
      }
    };
    setDefaultCurrencyValue('transferAmount', '0.000,00');
    setDefaultCurrencyValue('counterpartValue', '0.000,00');
    setDefaultCurrencyValue('globalValue', '0.000,00');
    setDefaultCurrencyValue('balance', '0.000,00');
    setDefaultCurrencyValue('totalValueExecuted', '0.000,00');

    await salvarConvenio(editingCovenants);
  };
  //atualização de criação e atualização
  const updateAuthorList = (newAuthor: any) => {
    setAuthor(prevAuthor => [...prevAuthor, newAuthor]);
    loadingAuthorForm();
  };
  //selec do id de concedente, compara o id com nome para mostar na tela
  function handleSelectAuthor(value: any) {
    setSelectedAuthorId(value);
    const selectedAuthorObj = author.find(g => g.id === value) || null;
    setSelectedAuthor(selectedAuthorObj);

    // Atualize o mapeamento
    if (selectedAuthorObj) {
      setAuthorMap(prevMap => ({
        ...prevMap,
        [selectedAuthorObj.id]: selectedAuthorObj,
      }));
    }
  }

  // Função para calcular a soma e atualizar o estado do valor global
  const calcularValorGlobal = (transferAmount: any, counterpartValue: any) => {
    const repasseValue = transferAmount || '0,00';
    const contrapartidaValue = counterpartValue || '0,00';

    const repasseValueString = repasseValue
      .replace(/\./g, '')
      .replace(',', '.');

    // Converter a string formatada para número
    const repasseNumber = parseFloat(repasseValueString);

    const counterValueString = contrapartidaValue
      .replace(/\./g, '')
      .replace(',', '.');

    // Converter a string formatada para número
    const contrapartidaNumber = parseFloat(counterValueString);
    const valorGlobal = (repasseNumber + contrapartidaNumber).toFixed(2);
    const number = parseFloat(valorGlobal);

    const formattedValue = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 2,
    }).format(number);

    const valorSemSimbolo = formattedValue.replace(/R\$\s?/, '');

    form.setFieldsValue({
      globalValue: valorSemSimbolo,
    });
  };
  useEffect(() => {
    setShowModal(false);
  }, []);

  const hideModal = (refresh: boolean) => {
    setShowModal(false);
    if (refresh) setAuthor([]);
  };

  useEffect(() => {
    if (openModal) {
      resetModalState();
    }
  }, [openModal]);

  // resetando valores do convencio/autor no modal
  const resetModalState = () => {
    setSelectedAuthorId('');
    setSelectedContValue('');
    setSelectedAuthor(null);
    setcovenantAuthor([]);
    setSavedgrauthorsId({});
  };

  const handleSetGlobalValue = (value: string) => {
    const valorSemSimbolo = value.replace(/R\$\s?/, '');
    setGlobalValue(valorSemSimbolo);
    form.setFieldsValue({ globalValue: valorSemSimbolo }); // Define o valor formatado no campo 'amount' do formulário
  };

  const handleSetBalance = (value: string) => {
    const valorSemSimbolo = value.replace(/R\$\s?/, '');
    setBalance(valorSemSimbolo);
    form.setFieldsValue({ balance: valorSemSimbolo }); // Define o valor formatado no campo 'amount' do formulário
  };

  const handleSetExecutedValue = (value: string) => {
    const valorSemSimbolo = value.replace(/R\$\s?/, '');
    setExecutedValue(valorSemSimbolo);
    form.setFieldsValue({ totalValueExecuted: valorSemSimbolo }); // Define o valor formatado no campo 'amount' do formulário
  };

  const handleSetTransferAmount = (value: string) => {
    const valorSemSimbolo = value.replace(/R\$\s?/, '');
    setTransferAmount(valorSemSimbolo);
    calcularValorGlobal(valorSemSimbolo, counterpartValue);

    form.setFieldsValue({ transferAmount: valorSemSimbolo }); // Define o valor formatado no campo 'amount' do formulário
  };

  const handleSetCounterpartValue = (value: string) => {
    const valorSemSimbolo = value.replace(/R\$\s?/, '');
    setCounterpartValue(valorSemSimbolo);
    calcularValorGlobal(transferAmount, valorSemSimbolo);
    form.setFieldsValue({ counterpartValue: valorSemSimbolo }); // Define o valor formatado no campo 'amount' do formulário
  };

  const handleSetContributionValue = (value: string) => {
    const valorSemSimbolo = value.replace(/R\$\s?/, '');
    setContributionValue(valorSemSimbolo);
    setSelectedContValue(valorSemSimbolo);
    form.setFieldsValue({ contributionValue: valorSemSimbolo }); // Define o valor formatado no campo 'amount' do formulário
  };

  return (
    <>
      <ModalAuthor
        id={''}
        openModal={showModal}
        closeModal={hideModal}
        updateAuthorList={updateAuthorList}
      />
      <Modal
        open={openModal}
        title="Convênio"
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
            <>
              <Col offset={1} span={4}>
                <Form.Item name={['source']} label="Fonte" hasFeedback>
                  <Select options={[{ value: 'Federal', label: 'Federal' }]} />
                </Form.Item>
              </Col>
              <Col span={5}>
                <Form.Item name={['amendment']} label="Emenda" hasFeedback>
                  <Select
                    options={[
                      {
                        value: '',
                        label: '',
                      },
                      {
                        value: 'Bancada',
                        label: 'Bancada',
                      },
                      {
                        value: 'Individual',
                        label: 'Individual',
                      },
                      {
                        value: 'Especial',
                        label: 'Especial',
                      },
                    ]}
                  />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  name={['agreementNumber']}
                  label="Número do convênio"
                  hasFeedback
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col span={3}>
                <Form.Item name={['year']} label="Ano" hasFeedback>
                  <Input />
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item
                  name={['amendmentNumber']}
                  label="Numero da emenda"
                  hasFeedback
                >
                  <Input />
                </Form.Item>
              </Col>

              <Col offset={1} span={4}>
                <Form.Item
                  name={['transferAmount']}
                  label="Valor do repasse"
                  hasFeedback
                >
                  <InputDinheiro
                    props={undefined}
                    handleMoeda={handleSetTransferAmount}
                    value={transferAmount}
                  />
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item
                  name={['counterpartValue']}
                  label="Valor contrapartida"
                  hasFeedback
                >
                  <InputDinheiro
                    props={undefined}
                    handleMoeda={handleSetCounterpartValue}
                    value={counterpartValue}
                  />
                </Form.Item>
              </Col>
              <Col span={5}>
                <Form.Item name={['globalValue']} label="Valor global">
                  <InputDinheiro
                    props={undefined}
                    handleMoeda={handleSetGlobalValue}
                    value={globalValue}
                  />
                </Form.Item>
              </Col>
              <Col span={5}>
                <Form.Item
                  name={['totalValueExecuted']}
                  label="Valor total executado"
                  hasFeedback
                >
                  <InputDinheiro
                    props={undefined}
                    handleMoeda={handleSetExecutedValue}
                    value={executedValue}
                    disabled={true}
                  />
                </Form.Item>
              </Col>

              <Col span={4}>
                <Form.Item name={['balance']} label="Saldo" hasFeedback>
                  <InputDinheiro
                    props={undefined}
                    handleMoeda={handleSetBalance}
                    value={balance}
                    disabled={true}
                  />
                </Form.Item>
              </Col>
              <Col offset={1} span={22}>
                <Form.Item name={['description']} label="Descrição" hasFeedback>
                  <TextArea rows={4} />
                </Form.Item>
              </Col>
              <Col offset={1} span={12}>
                <Form.Item name={['author']} label="Autor">
                  <Select
                    showSearch
                    placeholder={'Selecione o concedente'}
                    onChange={value => handleSelectAuthor(value)}
                    value={selectAuthorId}
                    filterOption={(input, option) =>
                      (option?.label ?? '')
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                    options={author.map(author => ({
                      label: author.name,
                      value: author.id,
                    }))}
                  />
                </Form.Item>
              </Col>

              <Button
                style={{
                  marginTop: '29px',
                  marginLeft: '-1%',
                  marginRight: '12px',
                  width: '5%',
                }}
                onClick={() => {
                  setShowModal(true);
                }}
              >
                <PlusOutlined />
              </Button>
              <Col span={7}>
                <Form.Item
                  name={['contributionValue']}
                  label="Valor"
                  hasFeedback
                >
                  <InputDinheiro
                    props={undefined}
                    handleMoeda={handleSetContributionValue}
                    value={contributionValue}
                  />
                  {/*}
                  <CurrencyFormat
                    className="input-mask-date"
                    prefix="R$ "
                    thousandSeparator="."
                    decimalSeparator="," //
                    decimalScale={2} // Definindo 2 casas decimais
                    allowNegative={false} // Desativar caso não queira permitir valores negativos
                    fixedDecimalScale // Garante que o número de casas decimais seja fixo em 2
                    value={selectedContValue}
                    onValueChange={values => {
                      setSelectedContValue(values.formattedValue);
                    }}
                  />*/}
                </Form.Item>
              </Col>
              <Button
                style={{
                  marginTop: '29px',
                  marginLeft: '-1%',
                  marginRight: '9px',
                  width: '7.5%',
                }}
                onClick={() => {
                  handleCreateCovenantsAuthor();
                }}
              >
                <PlusOutlined /> Incluir
              </Button>
            </>
          </Row>
          <Table
            columns={columns}
            rowKey="key"
            dataSource={covenantAuthor}
            rowClassName={() => 'custom-table-row'} // Defina o nome da classe para o estilo personalizado
            className="custom-table"
          />
        </Form>
      </Modal>
    </>
  );
};
export default ModalCovenants;
