export default function Layout({ children }) {
  return (
    <div className="page">
      <div className="container">
        <header className="header">
          <h1>Tic Tac Toe</h1>
          <p>Multiplayer game powered by Nakama</p>
        </header>

        <main>{children}</main>
      </div>
    </div>
  );
}