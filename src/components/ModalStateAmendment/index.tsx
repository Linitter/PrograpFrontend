import { Modal, Form, Input, Col, message, Select, Row, Button } from 'antd';
import { useEffect, useState } from 'react';
import { getAuthor } from '../../hooks/uthorService';
import ModalAuthor from '../ModalAuthor';
import {
  getStateAmendment,
  postStateAmendment,
  updateStateAmendment,
} from '../../hooks/stateAmendmentService';
import { PlusOutlined } from '@ant-design/icons';

const { TextArea } = Input;

type AuthorResponse = {
  id: string;
  name: string;
};

type Props = {
  id: string;
  openModal: boolean;
  updateStateAmendmentList: any;
  closeModal: (refresh: boolean) => void;
};

const ModalStateAmendment = ({
  id,
  openModal,
  closeModal,
  updateStateAmendmentList,
}: Props) => {
  const [author, setAuthor] = useState<AuthorResponse[]>([]);
  const [selectAuthorId, setSelectedAuthorId] = useState('');
  const [showModal, setShowModal] = useState(false);

  const [form] = Form.useForm();

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
    loadingStateAmendment();
  }, [id]);

  async function loadingStateAmendment() {
    if (id) {
      await getStateAmendment(`stateAmendment/${id}`).then(response => {
        if (response !== false) {
          form.setFieldsValue({
            id: response.data.id,
            authors: response.data.authors?.id, // autor
            source: response.data.source, //fonte
            year: response.data.year, // ano
            amendmentNumber: response.data.amendmentNumber, // numero da emenda
            transferAmount: response.data.transferAmount, // valor do repasse
            description: response.data.description, // descrição
            balance: response.data.balance, // saldo
          });
        } else {
          message.error('Ocorreu um erro inesperado ao obter fundo a fundo.');
        }
      });
    }
  }

  //carregando os concedentes
  useEffect(() => {
    loadingAuthorForm();
  }, []);
  // carregando autor
  async function loadingAuthorForm() {
    const response = await getAuthor('author');
    if (response !== false) {
      setAuthor(response.data);
    }
  }

  //ATUALIZAÇÃO Da Emenda Estadual************
  const submitUpdate = async () => {
    const editingStateAmendment = form.getFieldsValue(true);
    // Defina os valores padrão se estiverem vazios ou nulos
    const setDefaultCurrencyValue = (field: any, defaultValue: any) => {
      if (
        editingStateAmendment[field] === undefined ||
        editingStateAmendment[field] === null
      ) {
        editingStateAmendment[field] = defaultValue;
      }
    };
    setDefaultCurrencyValue('transferAmount', 'R$ 0.000,00');
    setDefaultCurrencyValue('balance', 'R$ 0.000,00');

    // Agora, atualize os detalhes do convênio
    await updateStateAmendment(editingStateAmendment, id);
    updateStateAmendmentList(editingStateAmendment);
  };

  // CRIAÇÃO Da Emenda Estadual
  const submitCreate = async () => {
    const editingStateAmendment = form.getFieldsValue(true);
    const setDefaultCurrencyValue = (field: any, defaultValue: any) => {
      if (
        editingStateAmendment[field] === undefined ||
        editingStateAmendment[field] === null
      ) {
        editingStateAmendment[field] = defaultValue;
      }
    };
    setDefaultCurrencyValue('transferAmount', 'R$ 0.000,00');

    setDefaultCurrencyValue('balance', 'R$ 0.000,00');

    await postStateAmendment(editingStateAmendment);
    updateStateAmendmentList(editingStateAmendment);
  };
  //atualização de criação e atualização
  const updateAuthorList = (newAuthor: any) => {
    setAuthor(prevAuthor => [...prevAuthor, newAuthor]);
    loadingAuthorForm();
  };
  function handleSelectAuthor(value: any) {
    setSelectedAuthorId(value);
  }

  useEffect(() => {
    setShowModal(false);
  }, []);

  const hideModal = (refresh: boolean) => {
    setShowModal(false);
    if (refresh) setAuthor([]);
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
        title="Emenda Estadual"
        okText="Salvar"
        width={'40%'}
        onCancel={() => {
          form.resetFields();
          closeModal(false);
        }}
        onOk={handleOk}
      >
        <Form layout="vertical" form={form}>
          <Row gutter={24}>
            <>
              <Col offset={1} span={6}>
                <Form.Item name={['source']} label="Fonte" hasFeedback>
                  <Select
                    options={[{ value: 'Estadual', label: 'Estadual' }]}
                  />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item name={['authors']} label="Autor">
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
                  width: '8%',
                }}
                onClick={() => {
                  setShowModal(true);
                }}
              >
                <PlusOutlined />
              </Button>
              <Col span={8}>
                <Form.Item
                  name={['amendmentNumber']}
                  label="Numero da emenda"
                  hasFeedback
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col offset={1} span={6}>
                <Form.Item name={['year']} label="Ano" hasFeedback>
                  <Input />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name={['transferAmount']}
                  label="Valor do repasse"
                  hasFeedback
                >
                  {/*<CurrencyFormat
                    className="input-mask-date"
                    prefix="R$ "
                    thousandSeparator="."
                    decimalSeparator="," //
                    decimalScale={2} // Definindo 2 casas decimais
                    allowNegative={false} // Desativar caso não queira permitir valores negativos
                    fixedDecimalScale // Garante que o número de casas decimais seja fixo em 2
                  />
                </Form.Item>
              </Col>

              <Col span={8}>
                <Form.Item name={['balance']} label="Saldo" hasFeedback>
                  <CurrencyFormat
                    className="input-mask-date"
                    prefix="R$ "
                    thousandSeparator="."
                    decimalSeparator="," //
                    decimalScale={2} // Definindo 2 casas decimais
                    allowNegative={false} // Desativar caso não queira permitir valores negativos
                    fixedDecimalScale // Garante que o número de casas decimais seja fixo em 2
              />*/}
                </Form.Item>
              </Col>
              <Col offset={1} span={22}>
                <Form.Item name={['description']} label="Descrição" hasFeedback>
                  <TextArea rows={4} />
                </Form.Item>
              </Col>
            </>
          </Row>
        </Form>
      </Modal>
    </>
  );
};
export default ModalStateAmendment;
