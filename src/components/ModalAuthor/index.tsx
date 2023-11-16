import { Modal, Form, Input, Col, message } from 'antd';
import { useEffect } from 'react';
import { getAuthor, postAuthor, updateAuthor } from '../../hooks/uthorService';

type Props = {
  id: string;
  openModal: boolean;
  updateAuthorList: any;
  closeModal: (refresh: boolean) => void;
};
// modal do autor
const ModalAuthor = ({
  id,
  openModal,
  closeModal,
  updateAuthorList,
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
    loadingAxles();
  }, [id]);

  async function loadingAxles() {
    if (id) {
      await getAuthor(`author/${id}`).then(response => {
        if (response !== false) {
          form.setFieldsValue({
            id: response.data.id,
            name: response.data.name,
          });
        } else {
          message.error('Ocorreu um erro inesperado ao obter os concedentes.');
        }
      });
    }
  }
  // CRIAÇÃO DE deputados
  const submitCreate = async () => {
    const editingGrantor = form.getFieldsValue(true);
    await postAuthor(editingGrantor);
    updateAuthorList(editingGrantor); // Chama a função updateGAuthorList com o novo axle
  };

  //ATUALIZAÇÃO DE eixos************
  const submitUpdate = async () => {
    const editingGrantor = form.getFieldsValue(true);
    await updateAuthor(editingGrantor, id);
    updateAuthorList(editingGrantor); // Chama a função updateGAuthorList com o novo axle
  };

  return (
    <>
      <Modal
        open={openModal}
        title="Autor"
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
                  message: 'Por favor, insira um concedente',
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
export default ModalAuthor;
