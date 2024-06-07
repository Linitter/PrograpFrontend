import { Modal, Form, Input, Col, message, Select, Row, Button } from 'antd';
import { useEffect, useState } from 'react';
import {
  getBottomToBottom,
  postBottomToBottom,
  updateBottomToBottom,
} from '../../hooks/bottomToBottom';

import { getAxles } from '../../hooks/axleService';
import { PlusOutlined } from '@ant-design/icons';
import ModalAxle from '../ModalAxle';
import InputDinheiro from '../InputDinheiro';
require('./index.css');

type AxlesResponse = {
  id: string;
  name: string;
};

type Props = {
  id: string;
  openModal: boolean;
  updatebottomToBottomList: any;
  closeModal: (refresh: boolean) => void;
};
// modal do fundo a fundo
const ModalBottomToBottom = ({
  id,
  openModal,
  closeModal,
  updatebottomToBottomList,
}: Props) => {
  //axles =  eixo
  const [axles, setAxles] = useState<AxlesResponse[]>([]);
  const [selectAxlesId, setSelectedAxlesId] = useState('');
  const [amount, setAmount] = useState<string>('');

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
    loadingBottonToBotton();
    resetDados();
  }, [id]);

  const resetDados = () => {
    setAmount('');
  };

  async function loadingBottonToBotton() {
    if (id) {
      await getBottomToBottom(`bottomToBottom/${id}`).then(response => {
        if (response !== false) {
          form.setFieldsValue({
            id: response.data.id,
            axle: response.data.axle?.id, // eixo
            source: response.data.source, // fonte
            year: response.data.year, // ano
            amount: response.data.amount, //Valor total
          });
          setAmount(response.data.amount);
        } else {
          message.error('Ocorreu um erro inesperado ao obter fundo a fundo.');
        }
      });
    }
  }
  //ATUALIZAÇÃO DO FUNDO A FUNDO************
  const submitUpdate = async () => {
    const editingbottomToBottom = form.getFieldsValue(true);

    // Defina os valores padrão para amount se estiverem vazios ou nulos
    if (
      editingbottomToBottom.amount === undefined ||
      editingbottomToBottom.amount === null
    ) {
      editingbottomToBottom.amount = ' 0.000,00';
    }

    await updateBottomToBottom(editingbottomToBottom, id);
    //ATUALIZANDO A LISTA DE FUNDO A FUNDO
    updatebottomToBottomList(editingbottomToBottom);
  };

  // CRIAÇÃO DO FUNDO A FUNDO
  const submitCreate = async () => {
    const editingbottomToBottom = form.getFieldsValue(true);

    // Defina os valores padrão para amount se estiverem vazios ou nulos
    if (
      editingbottomToBottom.amount === undefined ||
      editingbottomToBottom.amount === null
    ) {
      editingbottomToBottom.amount = ' 0.000,00';
    }

    await postBottomToBottom(editingbottomToBottom);
    updatebottomToBottomList(editingbottomToBottom);
  };

  //carregando os eixos
  useEffect(() => {
    loadingAxlesForm();
  }, []);

  async function loadingAxlesForm() {
    const response = await getAxles('axles');
    if (response !== false) {
      setAxles(response.data);
    }
  }
  //atualizando lista eixos
  const updateGrantorList = (newGrantor: any) => {
    setAxles(prevGrantor => [...prevGrantor, newGrantor]);
    loadingAxlesForm();
  };
  //selec do id de modelo e natureza
  function handleSelectAxle(value: any) {
    setSelectedAxlesId(value); // Atualiza o estado com o ID selecionado
  }

  const hideModal = (refresh: boolean) => {
    setShowModal(false);
    if (refresh) setAxles([]);
  };

  const handleSetAmount = (value: string) => {
    if (value) {
      const valorSemSimbolo = value.replace(/R\$\s?/, '');
      setAmount(valorSemSimbolo);

      form.setFieldsValue({ amount: valorSemSimbolo }); // Define o valor formatado no campo 'amount' do formulário
    }
  };

  return (
    <>
      <ModalAxle
        id={''}
        openModal={showModal}
        closeModal={hideModal}
        updateAxleList={updateGrantorList}
      />
      <Modal
        open={openModal}
        title="Fundo a Fundo"
        okText="Salvar"
        width={'45%'}
        onCancel={() => {
          form.resetFields();
          closeModal(false);
        }}
        onOk={handleOk}
      >
        <Form layout="vertical" form={form}>
          <Row gutter={24}>
            <>
              <Col offset={1} span={10}>
                <Form.Item name={['source']} label="Fonte" hasFeedback>
                  <Select options={[{ value: 'Federal', label: 'Federal' }]} />
                </Form.Item>
              </Col>
              <Col span={10}>
                <Form.Item name={['axle']} label="Eixo">
                  <Select
                    showSearch
                    placeholder={'Selecione o tipo'}
                    onChange={value => handleSelectAxle(value)}
                    value={selectAxlesId}
                    filterOption={(input, option) =>
                      (option?.label ?? '')
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                    options={axles.map(axle => ({
                      label: axle.name,
                      value: axle.id,
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
              <Col offset={1} span={10}>
                <Form.Item name={['year']} label="Ano" hasFeedback>
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name={['amount']} label="Valor total" hasFeedback>
                  <InputDinheiro
                    props={undefined}
                    handleMoeda={handleSetAmount}
                    value={amount}
                  />

                  {/*<CurrencyFormat
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
            </>

            <></>
          </Row>
        </Form>
      </Modal>
    </>
  );
};
export default ModalBottomToBottom;
