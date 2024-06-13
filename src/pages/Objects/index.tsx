import { DownOutlined, SearchOutlined } from '@ant-design/icons';
import {
  Button,
  Dropdown,
  Form,
  Input,
  InputRef,
  MenuProps,
  Popconfirm,
  Row,
  Space,
  Table,
  message,
} from 'antd';
import type { ColumnType, ColumnsType } from 'antd/es/table';
import { FilterConfirmProps } from 'antd/lib/table/interface';
import React, { useEffect, useRef, useState } from 'react';
import Highlighter from 'react-highlight-words';
import ModalObject from '../../components/ModalObject';
import { deleteObject, getObject } from '../../hooks/object';

interface DataType {
  key: React.Key;
  id: string;
  name: string;
  objectszaId: string;
  modeloId: string;
  nature: any;
  model: any;
}

type DataIndex = keyof DataType;

export default function Objects() {
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const searchInput = useRef<InputRef>(null);
  const [showModal, setShowModal] = useState(false);

  const [objects, setObjects] = useState<DataType[]>([]);

  const [recordObjects, setRecordObjects] = useState<any>({});

  const handleSearch = (
    selectedKeys: string[],
    confirm: (param?: FilterConfirmProps) => void,
    dataIndex: DataIndex,
  ) => {
    console.log('dataIndex', dataIndex);
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleResetFilters = () => {
    setSearchText('');
    setSearchedColumn('');
    loadingObjectsForm();
  };

  const getColumnSearchProps = (
    dataIndex: DataIndex,
  ): ColumnType<DataType> => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
      close,
    }) => (
      <div style={{ padding: 8 }}>
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={e =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() =>
            handleSearch(selectedKeys as string[], confirm, dataIndex)
          }
          style={{ marginBottom: 8, display: 'block' }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() =>
              handleSearch(selectedKeys as string[], confirm, dataIndex)
            }
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Search
          </Button>
          <Button
            onClick={() => {
              if (clearFilters) {
                clearFilters();
              }
              handleResetFilters();
              confirm();
            }}
            size="small"
            style={{ width: 90 }}
          >
            Reset
          </Button>

          <Button
            type="link"
            size="small"
            onClick={() => {
              close();
            }}
          >
            close
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered: boolean) => (
      <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
    ),
    onFilter: (value, record) => {
      if (dataIndex === 'nature') {
        return record.nature?.name
          .toString()
          .toLowerCase()
          .includes((value as string).toLowerCase());
      } else if (dataIndex === 'model') {
        return record.model?.name
          .toString()
          .toLowerCase()
          .includes((value as string).toLowerCase());
      }
      return record[dataIndex]
        .toString()
        .toLowerCase()
        .includes((value as string).toLowerCase());
    },
    onFilterDropdownOpenChange: visible => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
    render: text =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ''}
        />
      ) : (
        text
      ),
  });

  const handleMenuClick: MenuProps['onClick'] = e => {
    if (e.key === '1') {
      setShowModal(true);
    }
  };

  const columns: ColumnsType<DataType> = [
    {
      title: 'Nome',
      dataIndex: 'name',
      key: 'name',
      width: '30%',
      ...getColumnSearchProps('name'),
      sorter: (a, b) => a.name.length - b.name.length,
      sortDirections: ['descend', 'ascend'],
    },

    {
      title: 'Natureza',
      dataIndex: 'nature',
      key: 'nature',
      width: '30%',
      ...getColumnSearchProps('nature'),
      render: nature => (nature ? nature?.name : ''),
    },
    {
      title: 'Modelo',
      dataIndex: 'model',
      key: 'model',
      width: '30%',
      ...getColumnSearchProps('model'),
      render: model => (model ? model?.name : ''),
    },
    {
      title: 'Ação',
      key: 'operation',
      render: (record: any) => {
        return (
          <Space size="middle">
            <Dropdown
              menu={{
                items: [
                  {
                    label: 'Alterar',
                    key: '1',
                    onClick: () => {
                      setRecordObjects(record);
                    },
                  },
                  {
                    label: (
                      <Popconfirm
                        title="Tem certeza de que deseja desabilitar este registro de objeto ?"
                        onConfirm={() => ClickDeleteObjects(record.id)}
                      >
                        Excluir
                      </Popconfirm>
                    ),
                    key: '2',
                    danger: true,
                  },
                ],
                onClick: handleMenuClick,
              }}
            >
              <a onClick={e => e.preventDefault()} className="option">
                <Space>
                  Mais
                  <DownOutlined />
                </Space>
              </a>
            </Dropdown>
          </Space>
        );
      },
    },
  ];

  // LISTAGEM DE OBJETOS
  useEffect(() => {
    setShowModal(false);
  }, []);

  useEffect(() => {
    loadingObjectsForm();
  }, []);

  const updateObjectsList = (newObjects: any) => {
    setObjects(prevObjects => [...prevObjects, newObjects]);
    loadingObjectsForm();
  };
  async function loadingObjectsForm() {
    const response = await getObject('objects');
    if (response !== false) {
      setObjects(response.data);
    } else {
      message.error('Ocorreu um erro inesperado ao obter os objetos.');
    }
  }

  // exclusão de objects
  const ClickDeleteObjects = async (record: any) => {
    await deleteObject(record);
    const newObjects = [...objects];
    newObjects.splice(record, -1);
    setObjects(newObjects);
    loadingObjectsForm();
  };

  // Fechar modal
  const hideModal = (refresh: boolean) => {
    setShowModal(false);
    setRecordObjects(null);
    if (refresh) setObjects([]);
  };

  return (
    <>
      <Row style={{ paddingBottom: 'inherit', display: 'flow-root' }}>
        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            style={{ float: 'right', width: 'auto' }}
            onClick={() => {
              setShowModal(true);
            }}
          >
            Criar novo objeto
          </Button>
        </Form.Item>
      </Row>
      <Table
        columns={columns}
        expandable={{
          rowExpandable: record => record.name !== 'Not Expandable',
        }}
        rowKey="name"
        dataSource={objects}
        rowClassName={() => 'custom-table-row'} // Defina o nome da classe para o estilo personalizado
        className="custom-table" // Adicione a classe CSS personalizada à tabela
      />

      <ModalObject
        id={recordObjects?.id}
        openModal={showModal}
        closeModal={hideModal}
        updateObjectsList={updateObjectsList} // Passa a função handleAxleCreated como prop
      />
    </>
  );
}
