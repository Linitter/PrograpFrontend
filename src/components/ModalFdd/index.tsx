import { Modal, Form, Input, Col, message, Select, Row } from 'antd';
import { useEffect, useState } from 'react';
import { getFdd, postFdd, updateFdd } from '../../hooks/fdd';
import CurrencyInput from '../InputDinheiro';

const { TextArea } = Input;

type Props = {
  id: string;
  openModal: boolean;
  updateFddList: any;
  updateBalanceList: any;
  closeModal: (refresh: boolean) => void;
};

const ModalFdd = ({
  id,
  openModal,
  closeModal,
  updateFddList,
  updateBalanceList,
}: Props) => {
  const [showModal, setShowModal] = useState(false);

  const [transferAmount, setTransferAmount] = useState<string>('');
  const [counterpartValue, setCounterpartValue] = useState<string>('');
  const [globalValue, setGlobalValue] = useState<string>('');
  const [balance, setBalance] = useState<string>('');
  const [executedValue, setExecutedValue] = useState<string>('');

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
    loadingFdd();
    resetDados();
  }, [id]);

  useEffect(() => {
    setTransferAmount('');
    setCounterpartValue('');
    setGlobalValue('');
    setBalance('');
  }, [openModal]);

  const resetDados = () => {
    setTransferAmount('');
    setCounterpartValue('');
    setGlobalValue('');
    setBalance('');
  };

  async function loadingFdd() {
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
            totalValueExecuted: response.data.totalValueExecuted,
          });
          setTransferAmount(response.data.transferAmount);
          setCounterpartValue(response.data.counterpartValue);
          setGlobalValue(response.data.globalValue);
          setBalance(response.data.balance);
          setExecutedValue(response.data.totalValueExecuted);
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
    setDefaultCurrencyValue('transferAmount', '0.000,00');
    setDefaultCurrencyValue('counterpartValue', '0.000,00');
    setDefaultCurrencyValue('globalValue', '0.000,00');
    setDefaultCurrencyValue('balance', '0.000,00');
    await updateFdd(editingFdd, id);
    updateFddList(editingFdd);
    updateBalanceList({ id });
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
    setDefaultCurrencyValue('transferAmount', '0.000,00');
    setDefaultCurrencyValue('counterpartValue', '0.000,00');
    setDefaultCurrencyValue('globalValue', '0.000,00');
    setDefaultCurrencyValue('balance', '0.000,00');
    await postFdd(editingFdd);
    updateFddList(editingFdd);
  };

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
              <Col offset={1} span={5}>
                <Form.Item name={['source']} label="Fonte" hasFeedback>
                  <Select options={[{ value: 'Federal', label: 'Federal' }]} />
                </Form.Item>
              </Col>
              <Col span={5}>
                <Form.Item
                  name={['agreementNumber']}
                  label="Número"
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
              <Col span={7}>
                <Form.Item
                  name={['transferAmount']}
                  label="Valor do repasse"
                  hasFeedback
                >
                  <CurrencyInput
                    props={undefined}
                    handleMoeda={handleSetTransferAmount}
                    value={transferAmount}
                  />
                </Form.Item>
              </Col>
              <Col offset={1} span={5}>
                <Form.Item
                  name={['counterpartValue']}
                  label="Valor contrapartida"
                  hasFeedback
                >
                  <CurrencyInput
                    props={undefined}
                    handleMoeda={handleSetCounterpartValue}
                    value={counterpartValue}
                  />
                </Form.Item>
              </Col>
              <Col span={5}>
                <Form.Item name={['globalValue']} label="Valor global">
                  <CurrencyInput
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
                  <CurrencyInput
                    props={undefined}
                    handleMoeda={handleSetExecutedValue}
                    value={executedValue}
                  />
                </Form.Item>
              </Col>

              <Col span={6}>
                <Form.Item name={['balance']} label="Saldo" hasFeedback>
                  <CurrencyInput
                    props={undefined}
                    handleMoeda={handleSetBalance}
                    value={balance}
                  />
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
