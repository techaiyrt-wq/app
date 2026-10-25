export function ArchDiagram() {
  return (
    <svg
      viewBox="0 0 880 430"
      className="w-full"
      role="img"
      aria-label="Diagrama de arquitetura: iPhone e dashboard ligados ao backend, que fala com Postgres e com as APIs de IA"
    >
      <defs>
        <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" fill="#0f766e" />
        </marker>
      </defs>

      {/* iPhone */}
      <g>
        <rect x="30" y="60" width="170" height="120" rx="14" fill="#10283a" />
        <text x="115" y="95" textAnchor="middle" fill="#ffffff" fontSize="15" fontWeight="700" fontFamily="Sora, sans-serif">📱 App iPhone</text>
        <text x="115" y="118" textAnchor="middle" fill="#9fc3bd" fontSize="11" fontFamily="IBM Plex Mono, monospace">SwiftUI + Keychain</text>
        <text x="115" y="138" textAnchor="middle" fill="#7d99a8" fontSize="10.5">Sign in with Apple</text>
        <text x="115" y="156" textAnchor="middle" fill="#7d99a8" fontSize="10.5">cache local (SwiftData)</text>
      </g>

      {/* Dashboard */}
      <g>
        <rect x="30" y="250" width="170" height="120" rx="14" fill="#10283a" />
        <text x="115" y="285" textAnchor="middle" fill="#ffffff" fontSize="15" fontWeight="700" fontFamily="Sora, sans-serif">🖥 Dashboard web</text>
        <text x="115" y="308" textAnchor="middle" fill="#9fc3bd" fontSize="11" fontFamily="IBM Plex Mono, monospace">Next.js (este site)</text>
        <text x="115" y="328" textAnchor="middle" fill="#7d99a8" fontSize="10.5">mesma API, mesma sessão</text>
        <text x="115" y="346" textAnchor="middle" fill="#7d99a8" fontSize="10.5">polling a cada 5 s</text>
      </g>

      {/* Backend */}
      <g>
        <rect x="340" y="145" width="200" height="140" rx="14" fill="#0f766e" />
        <text x="440" y="180" textAnchor="middle" fill="#ffffff" fontSize="15" fontWeight="700" fontFamily="Sora, sans-serif">Backend / API</text>
        <text x="440" y="203" textAnchor="middle" fill="#d9efec" fontSize="11" fontFamily="IBM Plex Mono, monospace">HTTPS + JWT</text>
        <text x="440" y="223" textAnchor="middle" fill="#d9efec" fontSize="10.5">única fonte de verdade</text>
        <text x="440" y="241" textAnchor="middle" fill="#d9efec" fontSize="10.5">cofre de chaves de API</text>
        <text x="440" y="259" textAnchor="middle" fill="#d9efec" fontSize="10.5">limites de custo por dia</text>
      </g>

      {/* Postgres */}
      <g>
        <rect x="365" y="345" width="150" height="60" rx="12" fill="#ffffff" stroke="#d8e1e5" />
        <text x="440" y="370" textAnchor="middle" fill="#0c1f2c" fontSize="13" fontWeight="700" fontFamily="Sora, sans-serif">🗄 PostgreSQL</text>
        <text x="440" y="390" textAnchor="middle" fill="#6b8090" fontSize="10.5" fontFamily="IBM Plex Mono, monospace">tarefas · chats · eventos</text>
      </g>

      {/* Provedores IA */}
      <g fontFamily="Sora, sans-serif" fontSize="12.5" fontWeight="600">
        <rect x="680" y="60" width="170" height="66" rx="12" fill="#ffffff" stroke="#10a37f" strokeWidth="1.5" />
        <text x="765" y="88" textAnchor="middle" fill="#0c1f2c">OpenAI API</text>
        <text x="765" y="108" textAnchor="middle" fill="#6b8090" fontSize="10" fontFamily="IBM Plex Mono, monospace">chave do utilizador</text>

        <rect x="680" y="182" width="170" height="66" rx="12" fill="#ffffff" stroke="#d97757" strokeWidth="1.5" />
        <text x="765" y="210" textAnchor="middle" fill="#0c1f2c">Anthropic API</text>
        <text x="765" y="230" textAnchor="middle" fill="#6b8090" fontSize="10" fontFamily="IBM Plex Mono, monospace">chave do utilizador</text>

        <rect x="680" y="304" width="170" height="66" rx="12" fill="#ffffff" stroke="#4285f4" strokeWidth="1.5" />
        <text x="765" y="332" textAnchor="middle" fill="#0c1f2c">Gemini API</text>
        <text x="765" y="352" textAnchor="middle" fill="#6b8090" fontSize="10" fontFamily="IBM Plex Mono, monospace">nível gratuito ✓</text>
      </g>

      {/* ligações */}
      <g stroke="#0f766e" strokeWidth="2" fill="none">
        <path className="flow-line" d="M200 120 C 280 120 280 185 340 190" markerEnd="url(#arrow)" />
        <path className="flow-line" d="M200 310 C 280 310 280 250 340 243" markerEnd="url(#arrow)" />
        <path className="flow-line" d="M440 285 L440 345" markerEnd="url(#arrow)" />
        <path className="flow-line" d="M540 180 C 615 165 615 100 680 93" markerEnd="url(#arrow)" />
        <path className="flow-line" d="M540 215 L680 215" markerEnd="url(#arrow)" />
        <path className="flow-line" d="M540 252 C 615 268 615 330 680 337" markerEnd="url(#arrow)" />
      </g>

      <text x="268" y="132" textAnchor="middle" fill="#6b8090" fontSize="10" fontFamily="IBM Plex Mono, monospace">REST/JSON</text>
      <text x="268" y="300" textAnchor="middle" fill="#6b8090" fontSize="10" fontFamily="IBM Plex Mono, monospace">REST/JSON</text>
      <text x="608" y="150" textAnchor="middle" fill="#6b8090" fontSize="10" fontFamily="IBM Plex Mono, monospace">só o servidor</text>
      <text x="608" y="166" textAnchor="middle" fill="#6b8090" fontSize="10" fontFamily="IBM Plex Mono, monospace">toca nas chaves</text>
    </svg>
  );
}