import React, { useState, useMemo } from "react";
import { Sun, Moon, Clipboard, Settings, FileText } from "lucide-react";
import { saveAs } from "file-saver";
import mammoth from "mammoth";
import { Document, Packer, Paragraph, TextRun } from "docx";

// Paleta baseada nas imagens enviadas
const colors = {
  light: {
    background: "#eff0f3",     // Background (light image)
    headline: "#0d0d0d",      // Headline / strong text
    paragraph: "#2a2a2a",     // Paragraph / body text
    button: "#ff8e3c",        // Button (sun color)
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
    background: "#0f0e17",    // Background (dark image)
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

const Header = ({ theme, toggleTheme }) => (
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

const ControlsSidebar = ({ theme, options, setOptions, services, setServices }) => {
  const themeColors = colors[theme];

  const handleServiceChange = (serviceName) => {
    setServices((prev) => ({ ...prev, [serviceName]: !prev[serviceName] }));
  };

  const handleOptionChange = (e) => {
    const { name, value } = e.target;
    setOptions((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <aside
      className="sidebar"
      style={{ backgroundColor: themeColors.sidebarBg, borderColor: themeColors.sidebarBorder }}>
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
        {Object.keys(services).map((key) => (
          <label key={key} className="service-item">
            <input type="checkbox" checked={services[key]} onChange={() => handleServiceChange(key)} />
            <span>
              {
                {
                  folhaPagamento: "2.1 - Folha de Pagamento",
                  rpps: "2.2 - RPPS",
                  impostoRenda: "2.3 - Imposto de Renda",
                  energiaEletrica: "2.4 - Auditoria Energia",
                  fundef: "2.5 - Recuperação FUNDEF",
                  fundeb: "2.6 - Recuperação FUNDEB",
                  servicosTecnicos: "2.7 - Serviços Técnicos",
                }[key]
              }
            </span>
          </label>
        ))}

        <div className="actions">
          <button id="download-docx" className="btn primary">
            Baixar .docx
          </button>
          <div style={{ marginTop: 12 }}>
            <label className="btn" style={{ display: "inline-block", cursor: "pointer" }}>
              Upload .docx modelo
              <input id="upload-docx" type="file" accept=".docx" style={{ display: "none" }} />
            </label>
          </div>
        </div>
      </div>
    </aside>
  );
};

const CopyButton = ({ theme, textToCopy }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    try {
      const textarea = document.createElement("textarea");
      textarea.value = textToCopy;
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
    <button className={`copy-btn`} onClick={handleCopy}>
      <Clipboard /> {copied ? "Copiado!" : "Copiar Proposta"}
    </button>
  );
};

const ProposalDocument = ({ theme, options, services }) => {
  const themeColors = colors[theme];

  const html = useMemo(() => {
    const section = (key, title, body) => (services[key] ? `<h3>${title}</h3><p>${body}</p>` : "");

    return `
      <div class="doc">
        <h1>CAVALCANTE REIS</h1>
        <p><strong>Destinatário:</strong> Prefeitura Municipal de ${options.municipio}</p>
        ${section("folhaPagamento", "2.1 – Folha de pagamento", "Texto da seção 2.1...")}
        ${section("rpps", "2.2 – RPPS", "Texto da seção 2.2...")}
        ${section("impostoRenda", "2.3 – Imposto de Renda", "Texto da seção 2.3...")}
        ${section("energiaEletrica", "2.4 – Auditoria e Consultoria em Energia", "Texto da seção 2.4...")}
        ${section("fundef", "2.5 – Recuperação FUNDEF", "Texto da seção 2.5...")}
        ${section("fundeb", "2.6 – Recuperação FUNDEB", "Texto da seção 2.6...")}
        ${section("servicosTecnicos", "2.7 – Serviços Técnicos", "Texto da seção 2.7...")}
        <div class="signature">Brasília-DF, ${options.data}.</div>
      </div>
    `;
  }, [options, services]);

  return <div id="preview" className="preview" dangerouslySetInnerHTML={{ __html: html }} />;
};

export default function App() {
  const [theme, setTheme] = useState("light");
  const [options, setOptions] = useState({ municipio: "Jaicós - PI", data: "07 de outubro de 2025" });
  const [services, setServices] = useState({
    folhaPagamento: true,
    rpps: true,
    impostoRenda: true,
    energiaEletrica: true,
    fundef: true,
    fundeb: true,
    servicosTecnicos: true,
  });

  const toggleTheme = () => setTheme((t) => (t === "light" ? "dark" : "light"));

  // Gera HTML para copiar
  const proposalHtmlForCopy = useMemo(() => {
    const el = document.getElementById("preview");
    return el ? el.innerHTML : "";
  }, [options, services, theme]);

  // Função para gerar docx simples
  const generateDocx = async () => {
    const doc = new Document();
    doc.addSection({
      children: [
        new Paragraph({ children: [new TextRun({ text: "CAVALCANTE REIS", bold: true, size: 28 })] }),
        new Paragraph({ children: [new TextRun(`Destinatário: Prefeitura Municipal de ${options.municipio}`)] }),
      ],
    });

    if (services.folhaPagamento) {
      doc.addSection({ children: [new Paragraph("2.1 – Folha de pagamento"), new Paragraph("Texto da seção 2.1...")] });
    }
    if (services.rpps) {
      doc.addSection({ children: [new Paragraph("2.2 – RPPS"), new Paragraph("Texto da seção 2.2...")] });
    }

    const packer = new Packer();
    const blob = await packer.toBlob(doc);
    saveAs(blob, `Proposta - ${options.municipio}.docx`);
  };

  // Processar upload de .docx: substituir município, data e remover seções 2.2-2.8
  const handleUpload = async (file) => {
    if (!file) return;
    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      let text = result.value; // texto puro

      // Substituir município e data
      if (options.municipio) {
        // Substitui ocorrências simples do município anterior para o novo
        const municipioRegex = /Brasileira|Corrente|Jaic[oó]s/gi;
        text = text.replace(municipioRegex, options.municipio);
      }
      if (options.data) {
        // substitui datas comuns por nova
        text = text.replace(/\d{1,2}\s+de\s+\w+\s+de\s+\d{4}/g, options.data);
      }

      // Remover seções 2.2 até 2.8 (assume que as seções iniciam com '2.' e número)
      // Estratégia: dividir por linhas e filtrar entre linhas que começam com 2.2... até 2.8
      const lines = text.split(/\r?\n/);
      let outLines = [];
      let skip = false;
      for (let ln of lines) {
        const t = ln.trim();
        if (/^2\.[2-8]\b/.test(t) || /^2\.[2-8]\s?–/.test(t) || /^2\.[2-8]\s?-/.test(t)) {
          skip = true;
          continue;
        }
        if (skip && /^3\./.test(t)) {
          skip = false;
        }
        if (!skip) outLines.push(ln);
      }

      const cleaned = outLines.join("\n");

      // Gerar docx com conteúdo processado
      const doc = new Document();
      const paras = cleaned.split(/\n\n+/g);
      const children = paras.map((p) => new Paragraph(p));
      doc.addSection({ children });
      const packer = new Packer();
      const blob = await packer.toBlob(doc);
      saveAs(blob, `Proposta-ajustada-${options.municipio}.docx`);
    } catch (err) {
      console.error("Erro ao processar .docx:", err);
    }
  };

  // Vincular botão de download ao clique global (simples)
  React.useEffect(() => {
    const btn = document.getElementById("download-docx");
    if (btn) btn.onclick = generateDocx;

    const upload = document.getElementById("upload-docx");
    if (upload) {
      upload.onchange = (e) => {
        const f = e.target.files && e.target.files[0];
        if (f) handleUpload(f);
      };
    }
  }, [options, services]);

  return (
    <div className={`app ${theme}`} style={{ backgroundColor: colors[theme].background }}>
      <Header theme={theme} toggleTheme={toggleTheme} />

      <main className="main">
        <ControlsSidebar
          theme={theme}
          options={options}
          setOptions={setOptions}
          services={services}
          setServices={setServices}
        />
        <div className="content">
          <ProposalDocument theme={theme} options={options} services={services} />
          <CopyButton theme={theme} textToCopy={proposalHtmlForCopy} />
        </div>
      </main>
    </div>
  );
}
