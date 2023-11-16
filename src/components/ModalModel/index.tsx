import { Modal, Form, Input, Col, message } from 'antd';
import { useEffect } from 'react';
import { getNature } from '../../hooks/nature';
import { postModel, updateModel } from '../../hooks/model';

type Props = {
  id: string;
  openModal: boolean;
  updateModelList: any;
  closeModal: (refresh: boolean) => void;
};

const ModalModel = ({ id, openModal, closeModal, updateModelList }: Props) => {
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
    loadingModel();
  }, [id]);

  async function loadingModel() {
    if (id) {
      await getNature(`model/${id}`).then(response => {
        if (response !== false) {
          form.setFieldsValue({
            id: response.data.id,
            name: response.data.name,
          });
        } else {
          message.error('Ocorreu um erro inesperado ao obter os modelos.');
        }
      });
    }
  }
  //ATUALIZAÇÃO DE MODELO************
  const submitUpdate = async () => {
    const editingModel = form.getFieldsValue(true);
    await updateModel(editingModel, id);
    updateModelList(editingModel);
  };

  // CRIAÇÃO DE MODELOS
  const submitCreate = async () => {
    const editingModel = form.getFieldsValue(true);
    await postModel(editingModel);
    updateModelList(editingModel);
  };
  return (
    <>
      <Modal
        open={openModal}
        title="Modelo"
        okText="Salvar"
        onCancel={() => {
          form.resetFields();
          closeModal(false);
        }}
        onOk={handleOk}
      >
        <Form layout="vertical" form={form}>
          <Col offset={1} span={22}>
            <Form.Item
              name={['name']}
              label="Nome"
              rules={[
                {
                  required: true,
                  message: 'Por favor, insira o nome do modelo',
                },
              ]}
              hasFeedback
            >
              <Input />
            </Form.Item>
          </Col>
        </Form>
      </Modal>
    </>
  );
};
export default ModalModel;
