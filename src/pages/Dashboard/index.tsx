import { Tabs } from 'antd';
import GraficoBottomToBottom from '../../components/Graficos/GraficoBottomToBottom';
import GraficoConvents from '../../components/Graficos/GraficoConvents';

export default function Dashboard() {
  return (
    <Tabs defaultActiveKey="1">
      <Tabs.TabPane key="1" tab="Fundo a Fundo">
        {/*<GraficoBottomToBottom />*/}
        <div>
          <GraficoBottomToBottom />
        </div>
      </Tabs.TabPane>
      <Tabs.TabPane key="2" tab="Convênio">
        <div>
          <GraficoConvents />
        </div>
      </Tabs.TabPane>
      {/*       <Tabs.TabPane key="3" tab="Camadas"></Tabs.TabPane>
       */}
    </Tabs>
  );
}
