import { Modal, Form, Input, Col, message, Row } from 'antd';
import { useEffect, useState } from 'react';
import { getGoals, postGoals, updateGoals } from '../../hooks/goalService';
import CurrencyInput from '../InputDinheiro';
const { TextArea } = Input;

type Props = {
  id: string;
  openModal: boolean;
  updateGoalList: any; //ATUALIZAÇÃO DE METAS
  idBottomToBottom: any;
  closeModal: (refresh: boolean) => void;
};

const ModalGoal = ({
  id,
  idBottomToBottom,
  openModal,
  closeModal,
  updateGoalList,
}: Props) => {
  const [form] = Form.useForm();

  const [predictedValue, setPredictedValue] = useState<string>('');
  const [executedValue, setExecutedValue] = useState<string>('');
  const [balance, setBalance] = useState<string>('');

  //Setando id do fundo a fundo no formulario para criação das metas
  form.setFieldValue('bottomToBottom', idBottomToBottom);

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
    loadingGoals();
    resetDados();
  }, [id]);

  const resetDados = () => {
    setPredictedValue('');
    setBalance('');
  };

  async function loadingGoals() {
    if (id) {
      await getGoals(`goals/${id}`).then(response => {
        if (response !== false) {
          form.setFieldsValue({
            id: response.data.id,
            bottomToBottom: response.data.bottomToBottom?.id, // id do fundo a fundo
            description: response.data.description, // descriçaõ
            predictedValue: response.data.predictedValue, //valor  previsto
            balance: response.data.balance, // saldo
            executedValue: response.data.executedValue,
          });
          setPredictedValue(response.data.predictedValue);
          setBalance(response.data.balance);
        } else {
          message.error('Ocorreu um erro inesperado ao obter as metas.');
        }
      });
    }
  }

  const submitCreate = async () => {
    const editingGoal = form.getFieldsValue(true);

    // Defina os valores padrão para predictedValue e balance se estiverem vazios ou nulos
    if (
      editingGoal.predictedValue === undefined ||
      editingGoal.predictedValue === null
    ) {
      editingGoal.predictedValue = '0.000,00';
    }
    if (editingGoal.balance === undefined || editingGoal.balance === null) {
      editingGoal.balance = '0.000,00';
    }

    if (
      editingGoal.executedValue === undefined ||
      editingGoal.executedValue === null
    ) {
      editingGoal.executedValue = '0.000,00';
    }

    await postGoals(editingGoal);
    updateGoalList(editingGoal);
  };

  const submitUpdate = async () => {
    const editingGoal = form.getFieldsValue(true);

    // Defina os valores padrão para predictedValue e balance se estiverem vazios ou nulos
    if (
      editingGoal.predictedValue === undefined ||
      editingGoal.predictedValue === null
    ) {
      editingGoal.predictedValue = '0.000,00';
    }
    if (editingGoal.balance === undefined || editingGoal.balance === null) {
      editingGoal.balance = '0.000,00';
    }

    if (
      editingGoal.executedValue === undefined ||
      editingGoal.executedValue === null
    ) {
      editingGoal.executedValue = ' 0.000,00';
    }

    await updateGoals(editingGoal, id);
    updateGoalList(editingGoal);
  };

  const handleSetPredicatedValue = (value: string) => {
    const valorSemSimbolo = value.replace(/R\$\s?/, '');
    setPredictedValue(valorSemSimbolo);
    form.setFieldsValue({ predictedValue: valorSemSimbolo }); // Define o valor formatado no campo 'amount' do formulário
  };
  const handleSetExecutedValue = (value: string) => {
    const valorSemSimbolo = value.replace(/R\$\s?/, '');
    setExecutedValue(valorSemSimbolo);
    form.setFieldsValue({ executedValue: valorSemSimbolo }); // Define o valor formatado no campo 'amount' do formulário
  };

  const handleSetBalance = (value: string) => {
    if (value) {
      const valorSemSimbolo = value.replace(/R\$\s?/, '');
      setBalance(valorSemSimbolo);
      form.setFieldsValue({ balance: valorSemSimbolo }); // Define o valor formatado no campo 'amount' do formulário
    }
  };

  return (
    <>
      <Modal
        open={openModal}
        title="Metas"
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
            <Col offset={1} span={22}>
              <Form.Item name={['description']} label="Meta" hasFeedback>
                <TextArea rows={4} />
              </Form.Item>
            </Col>
            <Col offset={1} span={8}>
              <Form.Item name={['predictedValue']} label="Valor previsto">
                <CurrencyInput
                  props={undefined}
                  handleMoeda={handleSetPredicatedValue}
                  value={predictedValue}
                />
              </Form.Item>
            </Col>
            <Col offset={0} span={7}>
              <Form.Item name={['executedValue']} label="Valor executado">
                <CurrencyInput
                  props={undefined}
                  handleMoeda={handleSetExecutedValue}
                  value={predictedValue}
                />
              </Form.Item>
            </Col>
            <Col offset={0} span={7}>
              <Form.Item name={['balance']} label="Saldo">
                <CurrencyInput
                  props={undefined}
                  handleMoeda={handleSetBalance}
                  value={balance}
                />
              </Form.Item>
            </Col>

            <Col span={16}>
              <Form.Item name={['bottomToBottom']} label="Fundo a Fundo" hidden>
                <Input />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </>
  );
};
export default ModalGoal;
