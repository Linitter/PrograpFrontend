import { Modal, Form, Input, Col, message, Select, Row } from 'antd';
import { useEffect, useState } from 'react';
import { getFdd, postFdd, updateFdd } from '../../hooks/fdd';

const { TextArea } = Input;

type Props = {
  id: string;
  openModal: boolean;
  updateFddList: any;
  closeModal: (refresh: boolean) => void;
};

const ModalFdd = ({ id, openModal, closeModal, updateFddList }: Props) => {
  const [repasse, setRepasse] = useState(0);
  const [contrapartida, setContrapartida] = useState(0);
  const [showModal, setShowModal] = useState(false);

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
  }, [id]);

  async function loadingCovenants() {
    if (id) {
      await getFdd(`fdd/${id}`).then(response => {
        if (response !== false) {
          form.setFieldsValue({
            id: response.data.id,
            source: response.data.source, //fonte
            year: response.data.year, // ano
            agreementNumber: response.data.agreementNumber, // Número do convênio
            transferAmount: response.data.transferAmount, // Valor do repasse
            counterpartValue: response.data.counterpartValue, // Valor contrapartida
            globalValue: response.data.globalValue, // Valor global
            description: response.data.description, // Descrição
            balance: response.data.balance, // saldo
          });
        } else {
          message.error('Ocorreu um erro inesperado ao obter fundo a fundo.');
        }
      });
    }
  }

  //ATUALIZAÇÃO DE FDD************
  const submitUpdate = async () => {
    const editingFdd = form.getFieldsValue(true);
    // Defina os valores padrão se estiverem vazios ou nulos
    const setDefaultCurrencyValue = (field: any, defaultValue: any) => {
      if (editingFdd[field] === undefined || editingFdd[field] === null) {
        editingFdd[field] = defaultValue;
      }
    };
    setDefaultCurrencyValue('transferAmount', 'R$ 0.000,00');
    setDefaultCurrencyValue('counterpartValue', 'R$ 0.000,00');
    setDefaultCurrencyValue('globalValue', 'R$ 0.000,00');
    setDefaultCurrencyValue('balance', 'R$ 0.000,00');
    await updateFdd(editingFdd, id);
    updateFddList(editingFdd);
  };

  // CRIAÇÃO DO FDD
  const submitCreate = async () => {
    const editingFdd = form.getFieldsValue(true);
    // Defina os valores padrão se estiverem vazios ou nulos
    const setDefaultCurrencyValue = (field: any, defaultValue: any) => {
      if (editingFdd[field] === undefined || editingFdd[field] === null) {
        editingFdd[field] = defaultValue;
      }
    };
    setDefaultCurrencyValue('transferAmount', 'R$ 0.000,00');
    setDefaultCurrencyValue('counterpartValue', 'R$ 0.000,00');
    setDefaultCurrencyValue('globalValue', 'R$ 0.000,00');
    setDefaultCurrencyValue('balance', 'R$ 0.000,00');
    await postFdd(editingFdd);
    updateFddList(editingFdd);
  };

  // Função para calcular a soma e atualizar o estado do valor global
  const calcularValorGlobal = () => {
    const repasseValue = form.getFieldValue('transferAmount') || 'R$ 0,00';
    const contrapartidaValue =
      form.getFieldValue('counterpartValue') || 'R$ 0,00';

    const repasseNumber = parseFloat(
      repasseValue.replace('R$ ', '').replace('.', '').replace(',', '.'),
    );
    const contrapartidaNumber = parseFloat(
      contrapartidaValue.replace('R$ ', '').replace('.', '').replace(',', '.'),
    );

    const valorGlobal = (repasseNumber + contrapartidaNumber).toFixed(2);
    form.setFieldsValue({
      globalValue: 'R$ ' + valorGlobal.replace('.', ','),
    });
  };
  // Função para lidar com a mudança no campo de repasse
  const handleRepasseChange = (value: any) => {
    setRepasse(value);
    calcularValorGlobal();
  };

  // Função para lidar com a mudança no campo de contrapartida
  const handleContrapartidaChange = (value: any) => {
    setContrapartida(value);
    calcularValorGlobal();
  };

  useEffect(() => {
    setShowModal(false);
  }, []);

  return (
    <>
      <Modal
        open={openModal}
        title="FDD"
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
                  <Select options={[{ value: 'Federal', label: 'Federal' }]} />
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
              <Col span={4}>
                <Form.Item name={['year']} label="Ano" hasFeedback>
                  <Input />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  name={['transferAmount']}
                  label="Valor do repasse"
                  hasFeedback
                >
                  {' '}
                  {/*
                  <CurrencyFormat
                    className="input-mask-date"
                    prefix="R$ "
                    thousandSeparator="."
                    decimalSeparator="," //
                    decimalScale={2} // Definindo 2 casas decimais
                    allowNegative={false} // Desativar caso não queira permitir valores negativos
                    fixedDecimalScale // Garante que o número de casas decimais seja fixo em 2
                    onChange={(e: any) => handleRepasseChange(e.target.value)}
                  />
                </Form.Item>
              </Col>
              <Col offset={1} span={7}>
                <Form.Item
                  name={['counterpartValue']}
                  label="Valor contrapartida"
                  hasFeedback
                >
                  <CurrencyFormat
                    className="input-mask-date"
                    prefix="R$ "
                    thousandSeparator="."
                    decimalSeparator="," //
                    decimalScale={2} // Definindo 2 casas decimais
                    allowNegative={false} // Desativar caso não queira permitir valores negativos
                    fixedDecimalScale // Garante que o número de casas decimais seja fixo em 2
                    onChange={(e: any) =>
                      handleContrapartidaChange(e.target.value)
                    }
                  />
                </Form.Item>
              </Col>
              <Col span={7}>
                <Form.Item name={['globalValue']} label="Valor global">
                  <CurrencyFormat
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
                  /> */}
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
export default ModalFdd;
