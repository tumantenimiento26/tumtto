/* global React, ReactDOM, AdminSidebar, AdminHeader, ClientsList, ClientDetail, MARIA */

function ScreenList() {
  return (
    <div style={{ display: "flex", width: 1440, height: 1100, background: "#F8FBFF", fontFamily: "'Inter', sans-serif" }}>
      <AdminSidebar active="clients" expanded="users" />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <AdminHeader crumbs={["Inicio", "Usuarios", "Clientes"]} />
        <ClientsList />
      </div>
    </div>
  );
}

function ScreenDetail() {
  return (
    <div style={{ display: "flex", width: 1440, height: 1400, background: "#F8FBFF", fontFamily: "'Inter', sans-serif" }}>
      <AdminSidebar active="clients" expanded="users" />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <AdminHeader crumbs={["Inicio", "Usuarios", "Clientes", MARIA.name]} />
        <ClientDetail />
      </div>
    </div>
  );
}

function App() {
  return (
    <DesignCanvas>
      <DCSection id="clients" title="Gestión de clientes" subtitle="Listado + detalle (Resumen)">
        <DCArtboard id="list" label="Listado de clientes" width={1440} height={1100}>
          <ScreenList />
        </DCArtboard>
        <DCArtboard id="detail" label="Detalle del cliente · Resumen" width={1440} height={1400}>
          <ScreenDetail />
        </DCArtboard>
      </DCSection>
    </DesignCanvas>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
