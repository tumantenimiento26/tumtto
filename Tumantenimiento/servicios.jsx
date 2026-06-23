/* global React, ReactDOM, AdminSidebar, AdminHeader, ServicesList, ServiceDetail, DETAIL */

function ScreenList() {
  return (
    <div style={{ display: "flex", width: 1440, height: 1300, background: "#F8FBFF", fontFamily: "'Inter', sans-serif" }}>
      <AdminSidebar active="services" />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <AdminHeader crumbs={["Inicio", "Servicios"]} />
        <ServicesList />
      </div>
    </div>
  );
}

function ScreenDetail({ dispute = false }) {
  return (
    <div style={{ display: "flex", width: 1440, height: 1500, background: "#F8FBFF", fontFamily: "'Inter', sans-serif" }}>
      <AdminSidebar active="services" />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <AdminHeader crumbs={["Inicio", "Servicios", `#${DETAIL.id}`]} />
        <ServiceDetail dispute={dispute} />
      </div>
    </div>
  );
}

function App() {
  return (
    <DesignCanvas>
      <DCSection id="services" title="Gestión de servicios" subtitle="Listado · detalle · disputa">
        <DCArtboard id="list" label="Listado de servicios" width={1440} height={1300}>
          <ScreenList />
        </DCArtboard>
        <DCArtboard id="detail" label="Detalle · línea de tiempo" width={1440} height={1500}>
          <ScreenDetail dispute={false} />
        </DCArtboard>
        <DCArtboard id="detail-dispute" label="Detalle · servicio con disputa" width={1440} height={1500}>
          <ScreenDetail dispute={true} />
        </DCArtboard>
      </DCSection>
    </DesignCanvas>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
