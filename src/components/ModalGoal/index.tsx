import { Modal, Form, Input, Col, message, Row } from 'antd';
import { useEffect } from 'react';
import { getGoals, postGoals, updateGoals } from '../../hooks/goalService';
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
  }, [id]);

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
          });
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
      editingGoal.predictedValue = 'R$ 0.000,00';
    }
    if (editingGoal.balance === undefined || editingGoal.balance === null) {
      editingGoal.balance = 'R$ 0.000,00';
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
      editingGoal.predictedValue = 'R$ 0.000,00';
    }
    if (editingGoal.balance === undefined || editingGoal.balance === null) {
      editingGoal.balance = 'R$ 0.000,00';
    }

    await updateGoals(editingGoal, id);
    updateGoalList(editingGoal);
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
            <Col offset={1} span={10}>
              <Form.Item name={['predictedValue']} label="Valor previsto">
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
            <Col span={12}>
              <Form.Item name={['balance']} label="Saldo">
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
