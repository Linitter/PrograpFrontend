import { Modal, Form, Col, Input, message, Select, Row } from 'antd';
import { useEffect, useState } from 'react';

import {
  apiDestination,
  getDeliveryObject,
  postDelivery,
  updateDeliveryObject,
} from '../../hooks/deliveryObject';
import ReactInputMask from 'react-input-mask';

interface DataType {
  key: React.Key;
  id: string;
  unitId: string;
  deliveryDate: string;
  amountDelivery: string;
  observation: string;
}
type UnitsResponse = {
  id: string;
  sigla: string;
  nome: string;
  superior: string;
};
type Props = {
  id: string;
  updateDeliveryList: any; // Adicione esta prop
  idResourceObject: string;
  openModal: boolean;
  updateDeliveryUnits: any;
  closeModal: (refresh: boolean) => void;
};
// ENTRGA DO OBJETOS
const ModalObjectDelivery = ({
  id,
  idResourceObject,
  updateDeliveryList, // Adicione esta prop PARA ATUALIZAR A LISTAGEM
  openModal,
  closeModal,
}: Props) => {
  const [delivery, setDelivery] = useState<DataType[]>([]); // Adicione a tipagem para o estado  delivery
  const [units, setUnits] = useState<UnitsResponse[]>([]);
  const [unitMap, setUnitMap] = useState<{ [id: string]: UnitsResponse }>({});
  const [unitsLoaded, setUnitsLoaded] = useState(false);
  const [selectUnits, setSelectedUnits] = useState('');
  const [form] = Form.useForm();

  // BUSCANDO UNIDADES DA PC
  const token = localStorage.getItem('token_sso');
  const urlWithToken = `unidadesPC?token=${token}`;

  //Setando id de recusrso no formulario para criação de destinos
  form.setFieldValue('resourceObjects', idResourceObject);

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
    loadingdDelivery();
  }, [id]);

  async function loadingdDelivery() {
    if (id) {
      await getDeliveryObject(`delivery/${id}`).then(response => {
        if (response !== false) {
          form.setFieldsValue({
            id: response.data.id,
            resourceObjects: response.data.resourceObjects?.id, //OBEJTOS DO RECURSOS
            unitId: response.data?.unitId, //UNIDADES
            amount: response.data?.amount, //QUANTIDADE
            deliveryDate: response.data?.deliveryDate, //Data da entrega
            settlementDate: response.data?.settlementDate, // DATA DA LIQUIDAÇÃO
          });
          setSelectedUnits(response.data.unitId); // Atualiza o estado com o ID da unidade carregada
        } else {
          message.error('Ocorreu um erro inesperado ao obter as entregas.');
        }
      });
    }
  }
  useEffect(() => {
    loadingDeliveryForm();
  }, [idResourceObject]);
  //LISTAGEM DAS ENTREGAS
  async function loadingDeliveryForm() {
    const response = await getDeliveryObject('delivery');
    if (response !== false) {
      const deliveries = response.data;
      setDelivery(deliveries);
    }
  }

  // CRIAÇÃO DAS ENTREGAS
  const submitCreate = async () => {
    const editingDelivery = form.getFieldsValue(true);
    await postDelivery(editingDelivery);
    updateDeliveryList(editingDelivery);
  };

  //ATUALIZAÇÃO DAS NTREGAS**********
  const submitUpdate = async () => {
    const editingDelivery = form.getFieldsValue(true);
    await updateDeliveryObject(editingDelivery, id);
    updateDeliveryList(editingDelivery);
  };

  //selec do id de unidades
  function handleSelectUnits(value: any, field: string) {
    if (field === 'unitId') {
      setSelectedUnits(value);
    } else if (field === 'subUnitId') {
      // setSelectedSubUnit(value);
    }
  }

  // Verifica se o modal está aberto, verifique se as unidades ainda não foram carregadas e carregue-as apenas uma vez.
  useEffect(() => {
    if (openModal && !unitsLoaded) {
      // Carregue os dados das unidades aqui
      apiDestination
        .get(urlWithToken)
        .then(response => {
          const listOfUnits = response.data;
          setUnits(listOfUnits);
          setUnitMap(
            listOfUnits.reduce((map: any, unit: UnitsResponse) => {
              map[unit.id] = unit;
              return map;
            }, {}),
          );
          setUnitsLoaded(true); // Marque que os dados das unidades foram carregados
        })
        .catch(error => {
          console.error('Erro ao obter unidades:', error);
        });
    }
  }, [openModal, unitsLoaded]);
  // As unidades serão carregadas apenas uma vez quando o modal for aberto pela primeira vez
  useEffect(() => {
    if (!openModal) {
      setUnitsLoaded(false); // Redefina o estado quando o modal for fechado
    }
  }, [openModal]);

  return (
    <>
      <Modal
        open={openModal}
        title="Entregas"
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
            <Col offset={1} span={7}>
              <Form.Item name={['deliveryDate']} label="Data da entrega">
                <ReactInputMask
                  className="input-mask-date"
                  placeholder="00/00/0000"
                  maskChar={null}
                  mask="99/99/9999"
                />
              </Form.Item>
            </Col>

            <Col span={6}>
              <Form.Item name={['amount']} label="Quantidade">
                <Input type="number" />
              </Form.Item>
            </Col>

            <Col span={9}>
              <Form.Item name={['settlementDate']} label="Data da liquidação">
                <ReactInputMask
                  className="input-mask-date"
                  placeholder="00/00/0000"
                  maskChar={null}
                  mask="99/99/9999"
                />
              </Form.Item>
            </Col>
            <Col offset={1} span={22}>
              <Form.Item name={['unitId']} label="Unidade">
                <Select
                  showSearch
                  placeholder={'Selecione o tipo'}
                  onChange={value => handleSelectUnits(value, 'unitId')}
                  value={selectUnits}
                  filterOption={(input, option) =>
                    (option?.label ?? '')
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  options={units.map(units => ({
                    label: units.nome,
                    value: units.id,
                  }))}
                  onClick={() => {
                    // Buscar as unidades aqui somente quando o usuário clicar
                    apiDestination
                      .get(urlWithToken)
                      .then(response => {
                        const listOfUnits = response.data;
                        setUnits(listOfUnits);
                        updateDeliveryList(listOfUnits);
                      })
                      .catch(error => {
                        console.error('Erro ao obter unidades:', error);
                      });
                  }}
                />
              </Form.Item>
            </Col>

            <Col span={16}>
              <Form.Item
                name={['resourceObjects']}
                label="Id / obejtos do recurso"
                hidden
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </>
  );
};
export default ModalObjectDelivery;
