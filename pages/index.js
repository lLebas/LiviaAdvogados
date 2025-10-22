import React, { useState, useMemo, useEffect } from "react";
import Head from "next/head";
import { Sun, Moon, Clipboard, Settings, FileText } from "lucide-react";
import { saveAs } from "file-saver";

// Paleta baseada nas imagens enviadas
const colors = {
  light: {
    background: "#eff0f3", // Background (light image)
    headline: "#0d0d0d", // Headline / strong text
    paragraph: "#2a2a2a", // Paragraph / body text
    button: "#ff8e3c", // Button (sun color)
    buttonText: "#0d0d0d",
    stroke: "#0d0d0d",
    main: "#eff0f3",
    highlight: "#ff8e3c",
    secondary: "#ffffff",
    tertiary: "#d9376e",
    docBg: "#ffffff",
    docText: "#000000",
    sidebarBg: "#ffffff",
    sidebarBorder: "#0d0d0d",
  },
  dark: {
    background: "#0f0e17", // Background (dark image)
    headline: "#ffffff",
    paragraph: "#a7a9be",
    button: "#ff8906",
    buttonText: "#ffffff",
    stroke: "#000000",
    main: "#ffffff",
    highlight: "#ff8906",
    secondary: "#f25f4c",
    tertiary: "#e53170",
    docBg: "#0f0e17",
    docText: "#ffffff",
    sidebarBg: "#0f0e17",
    sidebarBorder: "#000000",
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
    <header className={`header header-prominent ${theme}`}>
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

// --- Componente: Modal simples ---
function Modal({
  open,
  title,
  description,
  onCancel,
  onConfirm,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  theme = "light",
}) {
  if (!open) return null;
  const themeColors = colors[theme] || colors.light;
  const bg = theme === "light" ? "rgba(2,6,23,0.06)" : "rgba(2,6,23,0.7)";
  const modalBg = theme === "light" ? "#fff" : "#0b0b12";
  const textColor = themeColors.headline;
  const descColor = theme === "light" ? "#334155" : themeColors.paragraph;
  return (
    <div
      className="modal-backdrop"
      style={{
        position: "fixed",
        inset: 0,
        background: bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 60,
      }}>
      <div
        className="modal"
        style={{
          background: modalBg,
          color: textColor,
          padding: 20,
          borderRadius: 10,
          width: 420,
          boxShadow: "0 8px 24px rgba(2,6,23,0.4)",
        }}>
        <h3 style={{ margin: 0, marginBottom: 8 }}>{title}</h3>
        <p style={{ marginTop: 0, marginBottom: 18, color: descColor }}>{description}</p>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <button className="btn" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button
            className="btn danger"
            onClick={onConfirm}
            style={{ background: themeColors.highlight, color: themeColors.buttonText }}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Componente: Toast simples ---
function Toast({ toast, theme = "light" }) {
  if (!toast) return null;
  const themeColors = colors[theme] || colors.light;
  const bg = toast.type === "success" ? "#16a34a" : toast.type === "error" ? "#dc2626" : themeColors.highlight;
  return (
    <div style={{ position: "fixed", right: 20, top: 20, zIndex: 70 }}>
      <div
        style={{
          background: bg,
          color: "#fff",
          padding: "10px 14px",
          borderRadius: 8,
          boxShadow: "0 6px 18px rgba(2,6,23,0.3)",
        }}>
        {toast.message}
      </div>
    </div>
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

  // UI state para modal e toast
  const [toast, setToast] = useState(null);
  const [confirmState, setConfirmState] = useState({ open: false, id: null, title: "", description: "" });
  // texto por serviço (editável)
  const initialServiceTexts = Object.keys(allServices).reduce((acc, k) => {
    acc[k] = `${allServices[k]} — Texto padrão. (pode ser substituído depois)`;
    return acc;
  }, {});
  const [serviceTexts, setServiceTexts] = useState(initialServiceTexts);
  const [editingService, setEditingService] = useState(null);

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

  const handleDeleteProposal = async (id) => {
    // abrir modal de confirmação
    setConfirmState({
      open: true,
      id,
      title: "Excluir Proposta",
      description: "Deseja realmente apagar esta proposta? Esta ação não pode ser desfeita.",
    });
  };

  const doDeleteConfirmed = async () => {
    const id = confirmState.id;
    if (!id) return;
    try {
      const res = await fetch(`/api/propostas/${id}`, { method: "DELETE" });
      if (res.status === 204 || res.ok) {
        setSavedList((prev) => prev.filter((p) => p.id !== id));
        setToast({ type: "success", message: "Proposta excluída" });
        setTimeout(() => setToast(null), 3000);
      } else {
        const json = await res.json().catch(() => ({}));
        setToast({ type: "error", message: "Falha ao deletar: " + (json.error || res.statusText) });
        setTimeout(() => setToast(null), 4000);
      }
    } catch (e) {
      console.error(e);
      setToast({ type: "error", message: "Erro ao conectar-se ao servidor" });
      setTimeout(() => setToast(null), 4000);
    } finally {
      setConfirmState({ open: false, id: null, title: "", description: "" });
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
          <div className="services sidebar-highlight">
            <div className="service-grid">
              {Object.entries(allServices).map(([key, label]) => (
                <div key={key} className="service-card">
                  <div>
                    <input type="checkbox" checked={!!services[key]} onChange={() => handleServiceToggle(key)} />
                  </div>
                  <div className="service-meta">
                    <h4>{label}</h4>
                    <p>{serviceTexts[key]}</p>
                    <div style={{ marginTop: 8 }}>
                      <button className="btn" onClick={() => setEditingService(editingService === key ? null : key)}>
                        {editingService === key ? "Fechar" : "Editar"}
                      </button>
                    </div>
                    {editingService === key && (
                      <div style={{ marginTop: 8 }}>
                        <textarea
                          value={serviceTexts[key]}
                          onChange={(e) => setServiceTexts((prev) => ({ ...prev, [key]: e.target.value }))}
                          rows={4}
                          style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid var(--stroke)" }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="actions" style={{ marginTop: 12 }}>
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
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="btn" onClick={() => handleLoadProposal(s.id)}>
                    Carregar
                  </button>
                  <button className="btn danger" onClick={() => handleDeleteProposal(s.id)}>
                    Excluir
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
                    <div key={k} className="section-editable">
                      <h3>{`2.${idx + 1} – ${allServices[k]}`}</h3>
                      <p>{serviceTexts[k]}</p>
                    </div>
                  ))}

                <div className="signature">Brasília-DF, {options.data}.</div>
              </div>
            </div>

            <CopyButton textToCopy={proposalHtmlForCopy} />
          </div>
        </div>
      </main>

      {/* Modal e Toast global */}
      <Modal
        open={confirmState.open}
        title={confirmState.title}
        description={confirmState.description}
        theme={theme}
        onCancel={() => setConfirmState({ open: false, id: null, title: "", description: "" })}
        onConfirm={doDeleteConfirmed}
        confirmLabel="Excluir"
      />
      <Toast toast={toast} theme={theme} />
    </div>
  );
}
