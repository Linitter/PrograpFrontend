import { Modal, Form, Input, Col, message, Select, Row } from 'antd';
import { useEffect } from 'react';
import {
  getStateTreasury,
  postStateTreasury,
  updateStateTreasury,
} from '../../hooks/StateTreasury';

type Props = {
  id: string;
  openModal: boolean;
  updateStateTreasuryList: any;
  closeModal: (refresh: boolean) => void;
};

const ModalstateTreasury = ({
  id,
  openModal,
  closeModal,
  updateStateTreasuryList,
}: Props) => {
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
    loadingStateTreasury();
  }, [id]);

  async function loadingStateTreasury() {
    if (id) {
      await getStateTreasury(`stateTreasury/${id}`).then(response => {
        if (response !== false) {
          form.setFieldsValue({
            id: response.data.id,
            source: response.data.source, // fonte
            year: response.data.year, // ano
          });
        } else {
          message.error(
            'Ocorreu um erro inesperado ao obter Tesouro Estadual.',
          );
        }
      });
    }
  }

  const loadAllState = async () => {
    const response = await getStateTreasury('stateTreasury');
    if (response) {
      const state = response.data;
      const sortedState = state.sort((a: any, b: any) => {
        return parseInt(a.position, 10) - parseInt(b.position, 10);
      });

      return sortedState;
    }
  };

  //ATUALIZAÇÃO Do Tesouro Estadual************
  const submitUpdate = async () => {
    const editingStateTreasury = form.getFieldsValue(true);
    // Agora, atualize os detalhes do Tesouro Estadual
    await updateStateTreasury(editingStateTreasury, id);
    updateStateTreasuryList(editingStateTreasury);
  };

  // CRIAÇÃO Do Tesouro Estadual
  const submitCreate = async () => {
    const editingStateTreasury = form.getFieldsValue(true);

    const lastState = await loadAllState();
    const maxPosition =
      lastState.length > 0
        ? Math.max(...lastState.map((state: any) => state.position))
        : 0;
    const newPosition = maxPosition + 1;
    editingStateTreasury.position = newPosition;

    await postStateTreasury(editingStateTreasury);
    updateStateTreasuryList(editingStateTreasury);
  };

  return (
    <>
      <Modal
        open={openModal}
        title="Tesouro Estadual"
        okText="Salvar"
        onCancel={() => {
          form.resetFields();
          closeModal(false);
        }}
        onOk={handleOk}
      >
        <Form layout="vertical" form={form}>
          <Row gutter={24}>
            <>
              <Col offset={1} span={11}>
                <Form.Item name={['source']} label="Fonte" hasFeedback>
                  <Select
                    options={[{ value: 'Estadual', label: 'Estadual' }]}
                  />
                </Form.Item>
              </Col>

              <Col span={11}>
                <Form.Item name={['year']} label="Ano" hasFeedback>
                  <Input />
                </Form.Item>
              </Col>
            </>
          </Row>
        </Form>
      </Modal>
    </>
  );
};
export default ModalstateTreasury;
