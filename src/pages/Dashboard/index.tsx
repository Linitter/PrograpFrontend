import { useState, ReactElement } from 'react';
import { Tabs, Spin } from 'antd';
import GraficoBottomToBottom from '../../components/Graficos/GraficoBottomToBottom';
import GraficoConvents from '../../components/Graficos/GraficoConvents';
import GraficoFDD from '../../components/Graficos/GraficoFDD';
import GraficoEmenda from '../../components/Graficos/GraficoEmendaEstadual';
import GraficoTesouro from '../../components/Graficos/GraficoTesouroEstadual';

type ComponentType = ReactElement<any, any> | null;

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('1');
  const [loading, setLoading] = useState(false);
  const [componentToShow, setComponentToShow] = useState<ComponentType>(
    <GraficoBottomToBottom />,
  );

  const handleTabChange = (key: string) => {
    setLoading(true);
    setActiveTab(key);

    // Simula um atraso de 1 segundo antes de exibir o componente correspondente
    setTimeout(() => {
      setLoading(false);
      switch (key) {
        case '1':
          setComponentToShow(<GraficoBottomToBottom />);
          break;
        case '2':
          setComponentToShow(<GraficoConvents />);
          break;
        case '3':
          setComponentToShow(<GraficoFDD />);
          break;
        case '4':
          setComponentToShow(<GraficoEmenda />);
          break;
        case '5':
          setComponentToShow(<GraficoTesouro />);
          break;
        default:
          setComponentToShow(null);
      }
    }, 100); // Tempo de espera em milissegundos (1 segundo)
  };

  return (
    <Tabs defaultActiveKey="1" activeKey={activeTab} onChange={handleTabChange}>
      <Tabs.TabPane key="1" tab="Fundo a Fundo">
        {loading ? (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100%',
            }}
          >
            <Spin />
          </div>
        ) : (
          componentToShow
        )}
      </Tabs.TabPane>
      <Tabs.TabPane key="2" tab="Convênio">
        {loading ? (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100%',
            }}
          >
            <Spin />
          </div>
        ) : (
          componentToShow
        )}
      </Tabs.TabPane>
      <Tabs.TabPane key="3" tab="FDD">
        {loading ? (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100%',
            }}
          >
            <Spin />
          </div>
        ) : (
          componentToShow
        )}
      </Tabs.TabPane>
      <Tabs.TabPane key="4" tab="Emenda Estadual">
        {loading ? (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100%',
            }}
          >
            <Spin />
          </div>
        ) : (
          componentToShow
        )}
      </Tabs.TabPane>
      <Tabs.TabPane key="5" tab="Tesouro Estadual">
        {loading ? (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100%',
            }}
          >
            <Spin />
          </div>
        ) : (
          componentToShow
        )}
      </Tabs.TabPane>
    </Tabs>
  );
}
