import React, { useState, useMemo, useEffect } from "react";
import Head from "next/head";
import { Sun, Moon, Clipboard, Settings, FileText } from "lucide-react";
import { saveAs } from "file-saver";

const colors = {
  light: {
    background: "#ffffff",
    headline: "#0b2545",
    paragraph: "#1f2d4a",
    button: "#f582ae",
    buttonText: "#ffffff",
    stroke: "#e6e6e6",
    docBg: "#ffffff",
    docText: "#000000",
    sidebarBg: "#ffffff",
    sidebarBorder: "#e6e6e6",
  },
  dark: {
    background: "#0b2545",
    headline: "#fef6e4",
    paragraph: "#fef6e4",
    button: "#f582ae",
    buttonText: "#0b2545",
    stroke: "#1f2d4a",
    docBg: "#1e293b",
    docText: "#fef6e4",
    sidebarBg: "#071133",
    sidebarBorder: "#102040",
  },
};

// --- Lista completa de serviços (mantida no topo) ---
const allServices = {
  folhaPagamento: "Folha de Pagamento (INSS)",
  pasep: "Recuperação/Compensação PASEP",
  rpps: "RPPS (Regime Próprio)",
  impostoRenda: "Imposto de Renda (IRRF)",
  cfem: "Compensação (Recursos Minerais - CFEM)",
  cfurh: "Compensação (Recursos Hídricos - CFURH)",
  tabelaSUS: "Tabela SUS",
  fundef: "Recuperação FUNDEF",
  fundeb: "Recuperação FUNDEB",
  energiaEletrica: "Auditoria de Energia Elétrica",
  royaltiesOleoGas: "Royalties (Óleo, Xisto e Gás)",
  repassesFPM: "Repasses de Recursos do FPM (IPI/IR)",
  revisaoParcelamento: "Revisão dos Parcelamentos Previdenciários",
  issqn: "Recuperação de Créditos de ISSQN",
  servicosTecnicos: "Serviços Técnicos (DF)",
};

function Header({ theme, toggleTheme }) {
  return (
    <header className={`header ${theme}`}>
      <div className="left">
        <FileText size={28} />
        <h1>Gerador de Propostas</h1>
      </div>
      <button onClick={toggleTheme} className="theme-btn" aria-label="Mudar tema">
        {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
      </button>
    </header>
  );
}

function CopyButton({ textToCopy }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    try {
      const textarea = document.createElement("textarea");
      // limpa HTML simples
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = textToCopy || "";
      const clean = tempDiv.textContent || tempDiv.innerText || "";
      textarea.value = clean;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };
  return (
    <button className={`copy-btn`} onClick={handleCopy} title="Copiar texto limpo da proposta">
      <Clipboard /> {copied ? "Proposta Copiada!" : "Copiar Texto da Proposta"}
    </button>
  );
}

export default function Home() {
  const [theme, setTheme] = useState("light");
  const [options, setOptions] = useState({ municipio: "Jaicós - PI", data: "07 de outubro de 2025" });
  // inicializa todos os serviços como true por padrão
  const [services, setServices] = useState(() =>
    Object.keys(allServices).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {})
  );

  const toggleTheme = () => setTheme((t) => (t === "light" ? "dark" : "light"));

  const [proposalHtmlForCopy, setProposalHtmlForCopy] = useState("");
  useEffect(() => {
    const el = typeof window !== "undefined" ? document.getElementById("preview") : null;
    setProposalHtmlForCopy(el ? el.innerHTML : "");
  }, [options, services, theme]);

  const handleOptionChange = (e) => {
    const { name, value } = e.target;
    setOptions((prev) => ({ ...prev, [name]: value }));
  };

  const handleServiceToggle = (name) => {
    setServices((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const handleUploadToServer = async (file) => {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("municipio", options.municipio);
    formData.append("data", options.data);
    // quais serviços manter
    formData.append("services", JSON.stringify(services));

    const res = await fetch("/api/process-docx", { method: "POST", body: formData });
    if (!res.ok) {
      alert("Erro ao processar no servidor");
      return;
    }
    const blob = await res.blob();
    saveAs(blob, `Proposta-ajustada-${options.municipio}.docx`);
  };

  // --- Propostas (Opção A: salvar em JSON no servidor)
  const [savedList, setSavedList] = useState([]);

  const fetchList = async () => {
    try {
      const res = await fetch("/api/propostas");
      if (res.ok) {
        const data = await res.json();
        setSavedList(data.reverse());
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  const handleSaveProposal = async () => {
    const body = { municipio: options.municipio, data: options.data, services, html: proposalHtmlForCopy };
    const res = await fetch("/api/propostas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      const item = await res.json();
      setSavedList((prev) => [item, ...prev]);
      alert("Proposta salva com sucesso");
    } else {
      alert("Falha ao salvar");
    }
  };

  const handleLoadProposal = async (id) => {
    const res = await fetch(`/api/propostas/${id}`);
    if (res.ok) {
      const p = await res.json();
      setOptions({ municipio: p.municipio || options.municipio, data: p.data || options.data });
      setServices(p.services || services);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className={`app ${theme}`} style={{ backgroundColor: colors[theme].background }}>
      <Head>
        <title>Gerador de Propostas - Livia Advogados</title>
      </Head>

      <Header theme={theme} toggleTheme={toggleTheme} />

      <main className="main">
        <aside className="sidebar">
          <div className="sidebar-header">
            <Settings />
            <h2>Personalizar Proposta</h2>
          </div>

          <div className="field">
            <label>Município Destinatário</label>
            <input name="municipio" value={options.municipio} onChange={handleOptionChange} />
          </div>

          <div className="field">
            <label>Data da Proposta</label>
            <input name="data" value={options.data} onChange={handleOptionChange} />
          </div>

          <hr />

          <h3>Serviços (Seções)</h3>
          <div className="services">
            {Object.entries(allServices).map(([key, label]) => (
              <label key={key} className="service-item">
                <input type="checkbox" checked={!!services[key]} onChange={() => handleServiceToggle(key)} />
                <span>{label}</span>
              </label>
            ))}

            <div className="actions">
              <label className="btn upload-btn" style={{ display: "inline-block", cursor: "pointer" }}>
                Upload .docx modelo
                <input
                  id="upload-docx"
                  type="file"
                  accept=".docx"
                  style={{ display: "none" }}
                  onChange={(e) => {
                    const f = e.target.files && e.target.files[0];
                    if (f) handleUploadToServer(f);
                  }}
                />
              </label>
              <button className="btn primary" style={{ marginLeft: 8 }} onClick={handleSaveProposal}>
                Salvar Proposta
              </button>
            </div>
          </div>

          <hr style={{ marginTop: 18 }} />
          <h3 style={{ marginTop: 12 }}>Propostas Salvas</h3>
          <div style={{ maxHeight: 220, overflowY: "auto", marginTop: 8 }}>
            {savedList.length === 0 && <p style={{ color: "rgba(11,37,69,0.6)" }}>Nenhuma proposta salva</p>}
            {savedList.map((s) => (
              <div
                key={s.id}
                className="saved-item"
                style={{
                  padding: 8,
                  borderBottom: "1px solid rgba(11,37,69,0.04)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}>
                <div>
                  <div style={{ fontWeight: 700 }}>{s.municipio}</div>
                  <div style={{ fontSize: 12, color: "rgba(11,37,69,0.6)" }}>
                    {new Date(s.createdAt).toLocaleString()}
                  </div>
                </div>
                <div>
                  <button className="btn" onClick={() => handleLoadProposal(s.id)}>
                    Carregar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </aside>

        <div className="content">
          <div id="preview-area">
            <div id="preview" className="preview paper">
              <div className="doc-header">
                <div className="brand">
                  <FileText size={32} />
                  <div>
                    <h1>CAVALCANTE REIS</h1>
                    <p className="sub">advogados</p>
                  </div>
                </div>
              </div>

              <div className="doc-body">
                <p>
                  <strong>Proponente:</strong> Cavalcante Reis Advogados
                </p>
                <p>
                  <strong>Destinatário:</strong> Prefeitura Municipal de {options.municipio}
                </p>

                <h2>Sumário</h2>
                <ol className="summary">
                  <li>Objeto da Proposta</li>
                  <li>Análise da Questão</li>
                </ol>

                <h2>1. Objeto da Proposta</h2>
                <p>É objeto do presente contrato... (resumo)</p>

                <h2>2. Análise da Questão</h2>
                <table className="obj-table">
                  <thead>
                    <tr>
                      <th>TESE</th>
                      <th>CABIMENTO / PERSPECTIVA</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.keys(allServices)
                      .filter((k) => services[k])
                      .map((k) => (
                        <tr key={k}>
                          <td>{allServices[k]}</td>
                          <td>Cabível</td>
                        </tr>
                      ))}
                  </tbody>
                </table>

                {/* Renderiza seções dinamicamente com numeração 2.1, 2.2 ... */}
                {Object.keys(allServices)
                  .filter((k) => services[k])
                  .map((k, idx) => (
                    <div key={k}>
                      <h3>{`2.${idx + 1} – ${allServices[k]}`}</h3>
                      <p>Texto da seção {allServices[k]}... (pode ser substituído depois)</p>
                    </div>
                  ))}

                <div className="signature">Brasília-DF, {options.data}.</div>
              </div>
            </div>

            <CopyButton textToCopy={proposalHtmlForCopy} />
          </div>
        </div>
      </main>
    </div>
  );
}
