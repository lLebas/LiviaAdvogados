import React, { useState, useMemo } from "react";
import Modal from "./Modal";
import DOMPurify from "dompurify";
import { Clipboard, Settings, FileText } from "lucide-react";
import { saveAs } from "file-saver";
import mammoth from "mammoth";
import { Document, Packer, Paragraph, TextRun } from "docx";

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
};

// --- Serviços disponíveis e seus nomes completos ---
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

// --- Banco de textos oficiais de cada serviço (HTML) ---
const serviceTextDatabase = {
  folhaPagamento: `
    <p>Realização de auditoria das folhas de pagamento referentes ao Regime Geral, bem como das GFIPS e tabela de incidências do INSS.</p>
    <p>Há muito se discute acerca da correta base de cálculo das contribuições previdenciárias, especialmente porque há conflitos entre a legislação infraconstitucional e as diretrizes da Constituição Federal.</p>
    <p>A controvérsia cinge-se quanto à incidência ou não da contribuição previdenciária patronal sobre as verbas de caráter indenizatório, pagas aos servidores públicos municipais, celetistas ou comissionados, e aos agentes políticos.</p>
    <p>O STF, no julgamento do RE 565.160/SC (Tema 163), em regime de Repercussão Geral, sedimentou o entendimento de que não incide contribuição previdenciária sobre verba não incorporável aos proventos de aposentadoria do servidor público, tais como terço de férias, serviços extraordinários, adicional noturno, dentre outros.</p>
    <p>A tese consiste na recuperação dos valores pagos indevidamente ao INSS nos últimos 05 (cinco) anos, bem como cessar os pagamentos futuros, via administrativa, por meio da Receita Federal do Brasil (RFB), conforme Resolução nº 754 da RFB.</p>
  `,
  pasep: `
    <p>O Programa de Formação do Patrimônio do Servidor Público (PASEP) foi instituído pela Lei Complementar nº 8/1970, por meio do qual a União, os Estados, os Municípios, o Distrito Federal e os Territórios contribuiriam com o fundo destinado aos servidores públicos.</p>
    <p>Em 1988, a Constituição Federal, em seu art. 239, alterou a destinação dos recursos provenientes das contribuições para o PIS/PASEP, que passaram a ser alocados ao Fundo de Amparo ao Trabalhador (FAT) e ao Banco Nacional de Desenvolvimento Econômico e Social (BNDES).</p>
    <p>Ocorre que a Lei nº 9.715/98, ao alterar a legislação referente ao PIS/PASEP, determinou que os Municípios, assim como as demais pessoas jurídicas de direito público, passassem a contribuir para o PIS/PASEP com base na receita corrente arrecadada e nas transferências correntes e de capital recebidas.</p>
    <p>A tese visa, portanto, a recuperação dos valores recolhidos indevidamente a título de PASEP sobre as transferências constitucionais (FPM, ICMS, IPVA, ITR, etc.) e demais receitas, como as de alienação de bens e de aplicação financeira, dos últimos 05 (cinco) anos, com base na inconstitucionalidade da cobrança.</p>
  `,
  rpps: `
    <p>A Portaria 15.829/20 da Secretaria Especial de Previdência e Trabalho, que veio para regulamentar a operacionalização da compensação financeira entre o Regime Geral de Previdência e os Regimes Próprios, acabou por permitir aos Municípios a recuperação de valores pagos a título de COMPREV.</p>
    <p>A referida portaria estabelece os parâmetros para que os Municípios possam reaver os valores pagos indevidamente, desde janeiro de 2000, considerando que o INSS sempre cobrou dos Municípios os valores integrais dos benefícios, sem considerar o teto previdenciário.</p>
    <p>A tese consiste na recuperação administrativa e/ou judicial dos valores pagos a maior ao INSS, bem como a cessação dos pagamentos futuros.</p>
  `,
  impostoRenda: `
    <p>No julgamento do IRDR (Incidente de Resolução de Demandas Repetitivas) nº 0023475-47.2016.4.01.0000/TRF1, ficou estabelecido que a Constituição Federal (art. 158, inc. I) define o direito do Ente municipal ao produto da arrecadação do imposto de renda retido na fonte, incidente sobre rendimentos pagos, a qualquer título, por eles, suas autarquias e fundações.</p>
    <p>Ocorre que os valores de Imposto de Renda Retido na Fonte (IRRF) incidentes sobre os contratos de prestação de serviços e fornecimento de bens firmados pelo Município não estavam sendo devidamente repassados ao Ente Municipal, permanecendo com a União.</p>
    <p>A tese, portanto, consiste em reaver os valores retidos e não repassados ao Município nos últimos 05 (cinco) anos, bem como garantir os repasses futuros, por via administrativa e/ou judicial.</p>
  `,
  cfem: `
    <p>A Compensação Financeira pela Exploração de Recursos Minerais (CFEM) é uma contraprestação paga à União, Estados, Distrito Federal e Municípios pela utilização econômica dos recursos minerais em seus respectivos territórios.</p>
    <p>A tese consiste na recuperação dos valores não repassados ou repassados a menor aos Municípios, referentes à CFEM, em decorrência de equívocos no cálculo da distribuição da compensação, bem como a cobrança de débitos de empresas exploradoras que não realizaram o pagamento ou o fizeram em valor inferior ao devido.</p>
  `,
  cfurh: `
    <p>A Compensação Financeira pela Utilização de Recursos Hídricos (CFURH) destina-se a compensar os entes federativos (União, Estados e Municípios) pelo aproveitamento de recursos hídricos para fins de geração de energia elétrica.</p>
    <p>A tese consiste na recuperação de valores devidos aos Municípios que são afetados por usinas hidrelétricas, seja pela área alagada, seja pela localização da usina, e que não receberam a devida compensação ou a receberam em valor inferior ao legalmente estabelecido.</p>
  `,
  tabelaSUS: `
    <p>Auditoria e análise dos repasses federais referentes aos procedimentos de Média e Alta Complexidade (MAC) da Tabela de Procedimentos, Medicamentos, Órteses, Próteses e Materiais Especiais (OPM) do Sistema Único de Saúde (SUS).</p>
    <p>Muitos Municípios arcam com custos de procedimentos de saúde que deveriam ser financiados pela União, ou recebem valores defasados que não cobrem os custos reais dos serviços prestados.</p>
    <p>A tese visa identificar e recuperar valores não repassados ou repassados a menor pelo Ministério da Saúde, bem como pleitear a atualização dos valores de referência da Tabela SUS, garantindo o equilíbrio financeiro da saúde municipal.</p>
  `,
  fundef: `
    <p>Na vigência da Lei nº 9.424/96, instituidora do Fundo de Manutenção e Desenvolvimento do Ensino Fundamental e de Valorização do Magistério – FUNDEF, a União descumpriu preceito contido no art. 6º, §1º desta lei, deixando de complementar o valor do Fundo em diversos exercícios financeiros.</p>
    <p>A União, ao fixar o Valor Mínimo Anual por Aluno (VMAA), utilizou-se de dados equivocados, o que gerou repasses inferiores aos devidos a diversos Municípios.</p>
    <p>O Supremo Tribunal Federal (STF), no julgamento do RE 630.934/DF, reconheceu o direito dos Municípios a receberem as diferenças não repassadas pela União. A tese consiste na atuação processual para agilizar a tramitação e expedição dos precatórios referentes a esses valores.</p>
  `,
  fundeb: `
    <p>A ação discute aspectos do FUNDEB, especificamente os valores equivocados de cotas por aluno que foram fixados pela União e o montante da complementação de recursos repassados desde a sua criação em 2007.</p>
    <p>Assim como no FUNDEF, a União utilizou parâmetros incorretos para o cálculo do Valor Mínimo Anual por Aluno (VMAA), resultando em prejuízos significativos para os Municípios, que deixaram de receber vultosas quantias anuais.</p>
    <p>A tese tem por objeto a revisão judicial dos cálculos e a recuperação dos valores que não foram repassados corretamente pela União ao Município nos últimos anos, acrescidos de juros e correção monetária.</p>
  `,
  energiaEletrica: `
    <p>A execução de serviços técnicos especializados de auditoria e consultoria energética.</p>
    <p>Os serviços propostos são consistentes no levantamento de dados, preparação, encaminhamento e acompanhamento da recuperação financeira dos valores pagos ou cobrados indevidamente à Concessionária/Distribuidora de energia elétrica do Estado.</p>
    <p>Isso inclui a análise de faturas de energia elétrica (Demanda Contratada, Ultrapassagem, reativa, etc.), a verificação da incidência indevida de ICMS sobre a Tarifa de Uso do Sistema de Distribuição (TUSD) e Tarifa de Uso do Sistema de Transmissão (TUST), e a recuperação de valores pagos a maior nos últimos 05 (cinco) anos.</p>
  `,
  royaltiesOleoGas: `
    <p>Os Royalties são uma compensação financeira devida pelas empresas que exploram petróleo e gás natural em território nacional, destinada aos Estados e Municípios produtores ou afetados pela atividade.</p>
    <p>A tese que se apresenta tem por objetivo ajuizar as competentes ações judiciais visando o recálculo dos valores pagos a título de Royalties, com base na legislação vigente, para que os Municípios recebam os valores corretos que lhes são devidos, bem como a recuperação dos valores pagos a menor nos últimos 05 (cinco) anos.</p>
  `,
  repassesFPM: `
    <p>Análise dos repasses do Fundo de Participação dos Municípios (FPM) com o objetivo de verificar a correta base de cálculo utilizada pela União, especificamente no que tange à exclusão de incentivos fiscais (IPI e IR) da base de cálculo.</p>
    <p>O FPM é um fundo constitucional composto por percentuais da arrecadação do Imposto de Renda (IR) e do Imposto sobre Produtos Industrializados (IPI). Ocorre que a União, ao conceder benefícios e incentivos fiscais, reduz artificialmente a base de cálculo do FPM, repassando valores a menor aos Municípios.</p>
    <p>A tese consiste na recuperação judicial dos valores que deixaram de ser repassados ao Município em decorrência da dedução desses incentivos fiscais da base de cálculo do FPM.</p>
  `,
  revisaoParcelamento: `
    <p>Auditoria e revisão dos parcelamentos previdenciários firmados entre o Município e a Receita Federal do Brasil, com o objetivo de identificar a aplicação de juros e multas ilegais ou inconstitucionais.</p>
    <p>Muitos parcelamentos contêm encargos abusivos, como a aplicação da taxa SELIC de forma capitalizada, multas em percentuais confiscatórios e a incidência de juros sobre multas.</p>
    <p>A tese consiste na revisão judicial desses contratos de parcelamento para expurgar as ilegalidades, recalcular o saldo devedor e, se for o caso, reaver valores pagos indevidamente.</p>
  `,
  issqn: `
    <p>Recuperação de créditos de ISSQN (Imposto Sobre Serviços de Qualquer Natureza) não repassados ou repassados a menor ao Município, especialmente de instituições financeiras (bancos), operadoras de cartão de crédito, planos de saúde e empresas de leasing.</p>
    <p>Muitas dessas empresas possuem complexas estruturas operacionais e, por vezes, declaram o ISSQN em domicílios fiscais diversos, em vez do local onde o serviço é efetivamente prestado, causando prejuízo à arrecadação municipal.</p>
    <p>A tese consiste na atuação junto a essas instituições para garantir o correto recolhimento do ISSQN em favor do Município, bem como a recuperação dos valores não pagos nos últimos 05 (cinco) anos.</p>
  `,
  servicosTecnicos: `
    <p>O desenvolvimento de todos os atos necessários, administrativos e judiciais, em qualquer instância, serviços técnicos especializados de assessoria e consultoria jurídica na área de Direito Financeiro, Econômico, Administrativo e Tributário perante os Tribunais Superiores no Distrito Federal.</p>
    <p>Atuação em processos estratégicos de interesse do Município que tramitam em Brasília-DF, perante o Supremo Tribunal Federal (STF), Superior Tribunal de Justiça (STJ), Tribunal de Contas da União (TCU) e demais órgãos federais, garantindo um acompanhamento processual célere e especializado.</p>
  `,
};

const Header = ({ theme }) => (
  <header className={`header ${theme}`}>
    <div className="left">
      <FileText size={28} />
      <h1>Gerador de Propostas</h1>
    </div>
  </header>
);

const ControlsSidebar = ({
  theme,
  options,
  setOptions,
  services,
  setServices,
  savedProposals,
  onLoadProposal,
  onDeleteProposal,
  onStartFromScratch,
  onImportDocx,
  onSaveProposal,
  onDownloadDocx,
}) => {
  const themeColors = colors[theme];

  const handleServiceChange = (serviceName) => {
    setServices((prev) => ({ ...prev, [serviceName]: !prev[serviceName] }));
  };

  const handleOptionChange = (e) => {
    const { name, value } = e.target;
    // Sanitizar entrada para prevenir XSS
    const sanitizedValue = value
      .replace(/<script[^>]*>.*?<\/script>/gi, "") // Remove scripts
      .replace(/<[^>]+>/g, "") // Remove tags HTML
      .trim();
    setOptions((prev) => ({ ...prev, [name]: sanitizedValue }));
  };

  return (
    <aside
      className="sidebar"
      style={{ backgroundColor: themeColors.sidebarBg, borderColor: themeColors.sidebarBorder }}>
      <div className="sidebar-header">
        <Settings />
        <h2>Personalizar Proposta</h2>
      </div>

      {/* Botões de Início */}
      <div className="start-buttons" style={{ marginTop: "16px", marginBottom: "16px" }}>
        <button
          onClick={onStartFromScratch}
          className="btn"
          style={{
            width: "100%",
            marginBottom: "8px",
            background: "var(--button)",
            color: "var(--button-text)",
          }}>
          Começar do Zero
        </button>
        <button
          onClick={() => document.getElementById("import-docx-input").click()}
          className="btn"
          style={{
            width: "100%",
            background: "var(--surface)",
            border: "2px solid var(--button)",
            color: "var(--headline)",
          }}>
          📄 Importar .docx Modelo
        </button>
        <input
          id="import-docx-input"
          type="file"
          accept=".docx"
          style={{ display: "none" }}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onImportDocx(file);
          }}
        />
      </div>

      <hr />

      <div className="field">
        <label>Município Destinatário</label>
        <input
          name="municipio"
          value={options.municipio}
          onChange={handleOptionChange}
          maxLength={100}
          placeholder="Nome do Município"
        />
      </div>

      <div className="field">
        <label>Data da Proposta</label>
        <input
          name="data"
          value={options.data}
          onChange={handleOptionChange}
          maxLength={50}
          placeholder="DD de mês de AAAA"
        />
      </div>

      <hr />

      <h3>Serviços (Seções)</h3>

      {/* Botões Selecionar/Desmarcar Todos */}
      <div style={{ display: "flex", gap: "8px", margin: "16px 0" }}>
        <button
          className="btn"
          style={{ flex: 1, background: "var(--button)", color: "var(--button-text)" }}
          onClick={() =>
            setServices(
              Object.keys(allServices).reduce((acc, key) => {
                acc[key] = true;
                return acc;
              }, {})
            )
          }>
          Selecionar Todos
        </button>
        <button
          className="btn"
          style={{ flex: 1, background: "var(--surface)", border: "2px solid var(--stroke)", color: "var(--headline)" }}
          onClick={() =>
            setServices(
              Object.keys(allServices).reduce((acc, key) => {
                acc[key] = false;
                return acc;
              }, {})
            )
          }>
          Desmarcar Todos
        </button>
      </div>

      <div className="services">
        {Object.entries(allServices).map(([key, label]) => (
          <label key={key} className="service-item">
            <input type="checkbox" checked={!!services[key]} onChange={() => handleServiceChange(key)} />
            <span>{label}</span>
          </label>
        ))}

        <div className="actions">
          <button
            id="save-proposal"
            className="btn primary"
            style={{ width: "100%", marginBottom: "8px" }}
            onClick={onSaveProposal}>
            💾 Salvar Proposta
          </button>
          <button
            id="download-docx"
            className="btn primary"
            style={{ width: "100%", marginBottom: "8px" }}
            onClick={onDownloadDocx}>
            ⬇️ Baixar .docx
          </button>
        </div>
      </div>

      <hr style={{ margin: "24px 0" }} />

      {/* Propostas Salvas */}
      <div className="saved-proposals">
        <h3>Propostas Salvas</h3>
        {savedProposals.length === 0 ? (
          <p style={{ color: themeColors.paragraph, fontSize: "14px", fontStyle: "italic" }}>
            Nenhuma proposta salva ainda.
          </p>
        ) : (
          <div className="proposals-list">
            {savedProposals.map((proposal) => {
              // Calcular dias restantes
              const daysRemaining = proposal.expiresAt
                ? Math.ceil((proposal.expiresAt - Date.now()) / (1000 * 60 * 60 * 24))
                : null;

              const isExpiringSoon = daysRemaining && daysRemaining <= 3;
              const isExpired = daysRemaining && daysRemaining <= 0;

              return (
                <div
                  key={proposal.id}
                  className="proposal-item"
                  style={{
                    padding: "12px",
                    marginBottom: "8px",
                    border: `1px solid ${isExpiringSoon ? "#ff9800" : themeColors.sidebarBorder}`,
                    borderRadius: "4px",
                    backgroundColor: isExpired ? "#ffebee" : themeColors.docBg,
                    opacity: isExpired ? 0.7 : 1,
                  }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ flex: 1 }}>
                      <strong style={{ display: "block", marginBottom: "4px" }}>{proposal.municipio}</strong>
                      <small style={{ color: themeColors.paragraph, fontSize: "12px", display: "block" }}>
                        {proposal.data}
                      </small>
                      {daysRemaining !== null && (
                        <small
                          style={{
                            color: isExpired ? "#c62828" : isExpiringSoon ? "#f57c00" : "#666",
                            fontSize: "11px",
                            display: "block",
                            marginTop: "4px",
                            fontWeight: isExpiringSoon ? "bold" : "normal",
                          }}>
                          {isExpired
                            ? "⚠️ Expirada"
                            : `⏰ Expira em ${daysRemaining} dia${daysRemaining !== 1 ? "s" : ""}`}
                        </small>
                      )}
                    </div>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        onClick={() => onLoadProposal(proposal)}
                        className="btn-small"
                        style={{ padding: "4px 8px", fontSize: "12px" }}
                        disabled={isExpired}>
                        Carregar
                      </button>
                      <button
                        onClick={() => onDeleteProposal(proposal.id)}
                        className="btn-small"
                        style={{ padding: "4px 8px", fontSize: "12px", backgroundColor: "#dc3545", color: "white" }}>
                        Excluir
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
};

const CopyButton = ({ theme, textToCopy }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    try {
      // Cria um elemento temporário para copiar texto limpo (sem HTML)
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = textToCopy;
      const cleanText = tempDiv.innerText;
      const textarea = document.createElement("textarea");
      textarea.value = cleanText;
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
    // Helper to render a service section if enabled
    const renderService = (serviceKey, title, content) => {
      if (!services[serviceKey]) return "";
      return `
        <hr style="border:2px solid #000; margin:24px 0;">
        <h3 class="font-bold text-lg mt-6 mb-2">${title}</h3>
        <div class="space-y-4">${content}</div>
      `;
    };

    // Helper to render table rows dynamically
    const renderTableObjetosRow = (serviceKey, tese, cabimento) => {
      if (!services[serviceKey]) return "";
      return `
        <tr style="height: 40px; vertical-align: top; border-bottom:4px solid #000;">
          <td class="p-2 align-top" style="padding-top: 12px; padding-bottom: 12px;">${tese}</td>
          <td class="p-2 align-top" style="padding-top: 12px; padding-bottom: 12px;">${cabimento}</td>
        </tr>
      `;
    };

    // Dynamic numbering for section 2 subsections
    let sectionCounter = 1;
    const getSectionTitle = (key, text) => {
      if (!services[key]) return "";
      const title = `2.${sectionCounter} – ${text}`;
      sectionCounter++;
      return title;
    };

    // Prepare titles with correct numbering based on enabled services
    sectionCounter = 1;
    const serviceTitles = {
      folhaPagamento: getSectionTitle("folhaPagamento", "Folha de pagamento (INSS)"),
      pasep: getSectionTitle("pasep", "Recuperação/ compensação PASEP"),
      rpps: getSectionTitle("rpps", "RPPS - Regime Próprio de Previdência Social"),
      impostoRenda: getSectionTitle("impostoRenda", "Imposto de Renda Retido na Fonte"),
      cfem: getSectionTitle("cfem", "Compensação Financeira (Recursos Minerais – CFEM)"),
      cfurh: getSectionTitle("cfurh", "Compensação Financeira (Recursos Hídricos – CFURH)"),
      tabelaSUS: getSectionTitle("tabelaSUS", "Tabela SUS"),
      fundef: getSectionTitle("fundef", "Recuperação FUNDEF"),
      fundeb: getSectionTitle("fundeb", "Recuperação FUNDEB"),
      energiaEletrica: getSectionTitle("energiaEletrica", "Auditoria de Energia Elétrica"),
      royaltiesOleoGas: getSectionTitle("royaltiesOleoGas", "Royalties (Óleo, Xisto e Gás)"),
      repassesFPM: getSectionTitle("repassesFPM", "Repasses de Recursos do FPM (IPI/IR)"),
      revisaoParcelamento: getSectionTitle("revisaoParcelamento", "Revisão dos Parcelamentos Previdenciários"),
      issqn: getSectionTitle("issqn", "Recuperação de Créditos de ISSQN"),
      servicosTecnicos: getSectionTitle("servicosTecnicos", "Serviços Técnicos Especializados (DF)"),
    };
    sectionCounter = 1; // reset before real rendering

    return `
      <div class="doc">
        <!-- Cabeçalho com logo -->
        <div style="text-align:center; margin-bottom:24px;">
          <img src="/logo-cavalcante-reis.png" alt="Logo Cavalcante Reis Advogados" style="max-width:300px; max-height:100px; display:block; margin:0 auto;" />
        </div>
        <!-- Bloco à direita -->
        <div style="text-align:right; margin-bottom:32px;">
          <p><strong>Proponente:</strong> Cavalcante Reis Advogados</p>
          <p><strong>Destinatário:</strong> Prefeitura Municipal de ${options.municipio || "[Nome do Município]"}</p>
          <p>${options.data || "[Data da Proposta]"}</p>
        </div>

        <!-- Sumário -->
        <div style="margin: 24px 0;">
          <h2 class="text-2xl font-bold" style="border-bottom:1px solid #ddd;padding-bottom:8px;">Sumário</h2>
          <ol style="margin-top:8px; padding-left: 20px;">
            <li>Objeto da Proposta</li>
            <li>Análise da Questão</li>
            <li>Dos Honorários, das Condições de Pagamento e Despesas</li>
            <li>Prazo e Cronograma de Execução dos Serviços</li>
            <li>Experiência e Equipe Responsável</li>
            <li>Disposições Finais</li>
          </ol>
        </div>

        <!-- Seção 1: Objeto -->
        <div class="proposal-section" style="margin: 24px 0;">
          <h2 class="text-2xl font-bold" style="border-bottom:1px solid #ddd;padding-bottom:8px;">1. Objeto da Proposta</h2>
          <p style="margin: 8px 0;">
            É objeto do presente contrato o desenvolvimento de serviços advocatícios especializados por parte da Proponente,
            Cavalcante Reis Advogados, ao Aceitante, Município de ${
              options.municipio || "[Nome do Município]"
            }, a fim de prestação de serviços de
            assessoria técnica e jurídica nas áreas de Direito Público, Tributário, Econômico, Financeiro, Minerário e Previdenciário,
            atuando perante o Ministério da Fazenda e os seus órgãos administrativos, em especial para alcançar o incremento de receitas,
            ficando responsável pelo ajuizamento, acompanhamento e eventuais intervenções de terceiro em ações de interesse do Município.
          </p>
          <p class="mb-4">A proposta inclui os seguintes objetos:</p>

            <table class="w-full border-collapse border mb-4" style="width:100%; border:1px solid #000;">
              <thead>
                <tr style="background:#f7f7f7; text-align:left;">
                  <th class="p-2 border-r" style="padding:8px; border-right:2px solid #000;">TESE</th>
                  <th class="p-2" style="padding:8px;">CABIMENTO / PERSPECTIVA</th>
                </tr>
              </thead>
              <tbody>
              ${renderTableObjetosRow(
                "folhaPagamento",
                "Folha de pagamento, recuperação de verbas indenizatórias e contribuições previdenciárias (INSS)",
                "A perspectiva de incremento/recuperação é de aproximadamente o valor referente a até duas folhas de pagamento mensais."
              )}
              ${renderTableObjetosRow("pasep", "Recuperação/ compensação PASEP", "Cabível")}
              ${renderTableObjetosRow("rpps", "RPPS Regime Próprio de Previdência Social", "Cabível")}
              ${renderTableObjetosRow("impostoRenda", "Recuperação/Compensação de Imposto de Renda", "Cabível")}
              ${renderTableObjetosRow(
                "cfem",
                "Compensação financeira pela exploração de recursos minerais – CFEM",
                "Cabível"
              )}
              ${renderTableObjetosRow(
                "cfurh",
                "Compensação Financeira pela Utilização dos Recursos Hídricos – CFURH",
                "Cabível"
              )}
              ${renderTableObjetosRow("tabelaSUS", "Tabela SUS", "Cabível")}
              ${renderTableObjetosRow("fundef", "FUNDEF - Atuação em feito para agilizar a tramitação.", "Cabível")}
              ${renderTableObjetosRow(
                "fundeb",
                "Recuperação dos valores repassados à menor a título de FUNDEB.",
                "Cabível"
              )}
              ${renderTableObjetosRow(
                "energiaEletrica",
                "Auditoria e Consultoria do pagamento de Energia Elétrica",
                "Cabível"
              )}
              ${renderTableObjetosRow(
                "royaltiesOleoGas",
                "Royalties pela exploração de óleo bruto, xisto betuminoso e gás natural.",
                "Cabível"
              )}
              ${renderTableObjetosRow(
                "repassesFPM",
                "Repasses dos recursos de FPM com base na real e efetiva arrecadação do IPI e IR.",
                "Cabível"
              )}
              ${renderTableObjetosRow("revisaoParcelamento", "Revisão dos parcelamentos previdenciários", "Cabível")}
              ${renderTableObjetosRow("issqn", "Recuperação de Créditos de ISSQN", "Cabível")}
              ${renderTableObjetosRow(
                "servicosTecnicos",
                "Serviços técnicos especializados de assessoria e consultoria jurídica (DF)",
                "Cabível"
              )}
            </tbody>
          </table>
        </div>

        <!-- Seção 2: Análise da Questão -->
        <div class="proposal-section" style="margin: 24px 0;">
          <h2 class="text-2xl font-bold" style="border-bottom:1px solid #ddd;padding-bottom:8px;">2. Análise da Questão</h2>
          ${renderService("folhaPagamento", serviceTitles.folhaPagamento, serviceTextDatabase.folhaPagamento)}
          ${renderService("pasep", serviceTitles.pasep, serviceTextDatabase.pasep)}
          ${renderService("rpps", serviceTitles.rpps, serviceTextDatabase.rpps)}
          ${renderService("impostoRenda", serviceTitles.impostoRenda, serviceTextDatabase.impostoRenda)}
          ${renderService("cfem", serviceTitles.cfem, serviceTextDatabase.cfem)}
          ${renderService("cfurh", serviceTitles.cfurh, serviceTextDatabase.cfurh)}
          ${renderService("tabelaSUS", serviceTitles.tabelaSUS, serviceTextDatabase.tabelaSUS)}
          ${renderService("fundef", serviceTitles.fundef, serviceTextDatabase.fundef)}
          ${renderService("fundeb", serviceTitles.fundeb, serviceTextDatabase.fundeb)}
          ${renderService("energiaEletrica", serviceTitles.energiaEletrica, serviceTextDatabase.energiaEletrica)}
          ${renderService("royaltiesOleoGas", serviceTitles.royaltiesOleoGas, serviceTextDatabase.royaltiesOleoGas)}
          ${renderService("repassesFPM", serviceTitles.repassesFPM, serviceTextDatabase.repassesFPM)}
          ${renderService(
            "revisaoParcelamento",
            serviceTitles.revisaoParcelamento,
            serviceTextDatabase.revisaoParcelamento
          )}
          ${renderService("issqn", serviceTitles.issqn, serviceTextDatabase.issqn)}
          ${renderService("servicosTecnicos", serviceTitles.servicosTecnicos, serviceTextDatabase.servicosTecnicos)}
        </div>

        <!-- Seção 3: Honorários (resumo fixo) -->
        <div class="proposal-section" style="margin: 24px 0;">
          <h2 class="text-2xl font-bold" style="border-bottom:1px solid #ddd;padding-bottom:8px;">3. Dos Honorários, das Condições de Pagamento e Despesas</h2>
          <p>Os valores levantados a título de incremento são provisórios, baseados em informações preliminares, podendo, ao final, representar valores a maior ou a menor.</p>
          <ul style="margin-top:8px; padding-left:20px; list-style:disc;">
            <li><strong>3.1.1</strong> Para todos os demais itens descritos nesta Proposta será efetuado o pagamento de honorários advocatícios à CAVALCANTE REIS ADVOGADOS pela execução dos serviços de recuperação de créditos, ad êxito na ordem de R$ 0,12 para cada R$ 1,00.</li>
            <li><strong>3.1.2</strong> Em caso de valores retroativos recuperados em favor da municipalidade, os honorários também serão cobrados na ordem de R$ 0,12 para cada R$ 1,00 e serão pagos quando da expedição do Precatório ou RPV, ou quando da efetiva compensação dos valores.</li>
            <li><strong>3.1.3</strong> Sendo um contrato AD EXITUM, a CONTRATADA só receberá os honorários quando do êxito da demanda.</li>
          </ul>
        </div>

        <!-- Seções 4-6 (resumo fixo) -->
        <div class="proposal-section" style="margin: 24px 0;">
          <h2 class="text-2xl font-bold" style="border-bottom:1px solid #ddd;padding-bottom:8px;">4. Prazo e Cronograma de Execução dos Serviços</h2>
          <p>O prazo de execução será de 24 (vinte e quatro) meses ou pelo tempo que perdurar os processos judiciais, podendo ser prorrogado por interesse das partes.</p>
        </div>

        <div class="proposal-section" style="margin: 24px 0;">
          <h2 class="text-2xl font-bold" style="border-bottom:1px solid #ddd;padding-bottom:8px;">5. Experiência e Equipe Responsável</h2>
          <p>No portfólio de serviços executados e/ou em execução, constam diversos Municípios contratantes.</p>
        </div>

        <div class="proposal-section" style="margin: 24px 0;">
          <h2 class="text-2xl font-bold" style="border-bottom:1px solid #ddd;padding-bottom:8px;">6. Disposições Finais</h2>
          <div style="margin-top:16px; border-top:1px solid #ddd; padding-top:16px; text-align:center;">
            <p>Brasília-DF, ${options.data || "[Data da Proposta]"}.</p>
            <p style="margin-top:12px; font-weight:bold;">Atenciosamente,</p>
            <p style="margin-top:8px; font-weight:bold;">CAVALCANTE REIS ADVOGADOS</p>
          </div>
        </div>
      </div>
    `;
  }, [options, services, theme]);

  // Sanitizar HTML antes de renderizar
  const cleanHtml = DOMPurify.sanitize(html);
  return <div id="preview" className="preview" dangerouslySetInnerHTML={{ __html: cleanHtml }} />;
};

export default function App() {
  // Função para começar do zero
  // (removida duplicidade, usar apenas a versão do modal abaixo)
  // Modal state
  const [modal, setModal] = useState({
    open: false,
    title: "",
    message: "",
    onConfirm: null,
    onCancel: null,
    confirmText: "OK",
    cancelText: "Cancelar",
    type: "info",
  });
  const [theme, setTheme] = useState("light");
  const [options, setOptions] = useState({ municipio: "", data: "" });
  const [services, setServices] = useState(
    Object.keys(allServices).reduce((acc, key) => {
      acc[key] = false; // começa com todos desmarcados
      return acc;
    }, {})
  );
  const [savedProposals, setSavedProposals] = useState([]);

  // Função para limpar propostas expiradas
  const cleanExpiredProposals = (proposals) => {
    const now = Date.now();
    return proposals.filter((p) => {
      // Se a proposta não tem expiresAt (propostas antigas), manter por compatibilidade
      if (!p.expiresAt) return true;
      return p.expiresAt > now;
    });
  };

  // Carregar propostas salvas do localStorage ao iniciar e limpar expiradas
  React.useEffect(() => {
    const saved = localStorage.getItem("savedProposals");
    if (saved) {
      const allProposals = JSON.parse(saved);
      const validProposals = cleanExpiredProposals(allProposals);

      // Se alguma proposta foi removida, atualizar localStorage
      if (validProposals.length !== allProposals.length) {
        localStorage.setItem("savedProposals", JSON.stringify(validProposals));
        console.log(
          `${allProposals.length - validProposals.length} proposta(s) expirada(s) foi(ram) deletada(s) automaticamente.`
        );
      }

      setSavedProposals(validProposals);
    }
  }, []);

  // Começar do zero - reseta tudo
  const startFromScratch = () => {
    setModal({
      open: true,
      title: "Nova Proposta",
      message: "Deseja começar uma nova proposta do zero? Todos os dados não salvos serão perdidos.",
      confirmText: "Começar",
      cancelText: "Cancelar",
      type: "warning",
      onConfirm: () => {
        setOptions({ municipio: "", destinatario: "", data: "" }); // limpa todos os campos
        setServices(
          Object.keys(allServices).reduce((acc, key) => {
            acc[key] = false;
            return acc;
          }, {})
        );
        setModal({ ...modal, open: false });
      },
      onCancel: () => setModal({ ...modal, open: false }),
    });
  };

  // Função para validar arquivos .docx
  const validateDocxFile = (file) => {
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    const ALLOWED_TYPES = [
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
    ];
    const ALLOWED_EXTENSIONS = [".docx", ".doc"];

    // Validar se arquivo existe
    if (!file) {
      return { valid: false, error: "Nenhum arquivo selecionado." };
    }

    // Validar tamanho
    if (file.size > MAX_SIZE) {
      return {
        valid: false,
        error: `Arquivo muito grande. Tamanho máximo: 10MB. Tamanho do arquivo: ${(file.size / 1024 / 1024).toFixed(
          2
        )}MB`,
      };
    }

    // Validar extensão
    const fileName = file.name.toLowerCase();
    const hasValidExtension = ALLOWED_EXTENSIONS.some((ext) => fileName.endsWith(ext));
    if (!hasValidExtension) {
      return { valid: false, error: "Formato inválido. Use apenas arquivos .docx ou .doc" };
    }

    // Validar tipo MIME
    if (file.type && !ALLOWED_TYPES.includes(file.type)) {
      return { valid: false, error: "Tipo de arquivo inválido. Use apenas documentos Word." };
    }

    return { valid: true };
  };

  // Importar documento .docx e preencher campos automaticamente
  const importDocx = async (file) => {
    // Validar arquivo antes de processar
    const validation = validateDocxFile(file);
    if (!validation.valid) {
      setModal({
        open: true,
        title: "Arquivo inválido",
        message: validation.error,
        confirmText: "OK",
        type: "error",
        onConfirm: () => setModal((m) => ({ ...m, open: false })),
      });
      return;
    }

    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      const text = result.value;

      // Extrair município do texto
      const municipioMatch = text.match(/Município de ([^,\n]+)/i) || text.match(/Prefeitura Municipal de ([^,\n]+)/i);
      if (municipioMatch) {
        setOptions((prev) => ({ ...prev, municipio: municipioMatch[1].trim() }));
      }

      // Extrair data do texto
      const dataMatch = text.match(/(\d{1,2})\s+de\s+(\w+)\s+de\s+(\d{4})/);
      if (dataMatch) {
        setOptions((prev) => ({ ...prev, data: dataMatch[0] }));
      }

      // Detectar quais serviços estão no documento
      const newServices = {};
      Object.keys(allServices).forEach((key) => {
        // Verifica se o serviço aparece no texto
        const serviceName = allServices[key].toLowerCase();
        newServices[key] = text.toLowerCase().includes(serviceName.substring(0, 15));
      });
      setServices(newServices);

      setModal({
        open: true,
        title: "Importação concluída",
        message: "Documento importado com sucesso! Os campos foram preenchidos automaticamente.",
        confirmText: "OK",
        type: "success",
        onConfirm: () => setModal((m) => ({ ...m, open: false })),
      });
    } catch (err) {
      console.error("Erro ao importar .docx:", err);
      setModal({
        open: true,
        title: "Erro ao importar",
        message: "Erro ao importar documento. Verifique se o arquivo é válido.",
        confirmText: "OK",
        type: "error",
        onConfirm: () => setModal((m) => ({ ...m, open: false })),
      });
    }
  };

  // Salvar proposta atual
  const saveProposal = () => {
    const now = Date.now();
    const expiresAt = now + 14 * 24 * 60 * 60 * 1000; // 14 dias em milissegundos

    const newProposal = {
      id: now,
      municipio: options.municipio,
      data: options.data,
      timestamp: new Date().toLocaleString("pt-BR"),
      createdAt: now,
      expiresAt: expiresAt,
      services: { ...services },
      options: { ...options },
    };

    // Filtrar propostas expiradas antes de salvar
    const validProposals = savedProposals.filter((p) => p.expiresAt > now);
    const updated = [...validProposals, newProposal];

    setSavedProposals(updated);
    localStorage.setItem("savedProposals", JSON.stringify(updated));

    const daysRemaining = Math.ceil((expiresAt - now) / (1000 * 60 * 60 * 24));

    setModal({
      open: true,
      title: "Proposta Salva",
      message: `Proposta para ${
        options.municipio
      } salva com sucesso!\n\nEsta proposta será automaticamente deletada em ${daysRemaining} dias (${new Date(
        expiresAt
      ).toLocaleDateString("pt-BR")}).`,
      confirmText: "OK",
      type: "success",
      onConfirm: () => setModal((m) => ({ ...m, open: false })),
    });
  };

  // Carregar proposta salva
  const loadProposal = (proposal) => {
    // Verificar se a proposta expirou
    if (proposal.expiresAt && proposal.expiresAt < Date.now()) {
      setModal({
        open: true,
        title: "Proposta Expirada",
        message: "Esta proposta expirou e será deletada automaticamente. Por favor, selecione outra proposta.",
        confirmText: "OK",
        type: "error",
        onConfirm: () => {
          // Remover a proposta expirada
          const updated = savedProposals.filter((p) => p.id !== proposal.id);
          setSavedProposals(updated);
          localStorage.setItem("savedProposals", JSON.stringify(updated));
          setModal((m) => ({ ...m, open: false }));
        },
      });
      return;
    }

    setOptions(proposal.options);
    setServices(proposal.services);
  };

  // Excluir proposta salva
  const deleteProposal = (id) => {
    setModal({
      open: true,
      title: "Excluir Proposta",
      message: "Tem certeza que deseja excluir esta proposta?",
      confirmText: "Excluir",
      cancelText: "Cancelar",
      type: "warning",
      onConfirm: () => {
        const updated = savedProposals.filter((p) => p.id !== id);
        setSavedProposals(updated);
        localStorage.setItem("savedProposals", JSON.stringify(updated));
        setModal((m) => ({ ...m, open: false }));
      },
      onCancel: () => setModal((m) => ({ ...m, open: false })),
    });
  };

  // Gera HTML para copiar
  const proposalHtmlForCopy = useMemo(() => {
    // Gera o mesmo HTML que está na prévia
    // Usado para copiar e para exportar
    // Reutiliza a lógica do ProposalDocument
    // (mantém igual ao que está renderizado)
    let sectionCounter = 1;
    const getSectionTitle = (key, text) => {
      if (!services[key]) return "";
      const title = `2.${sectionCounter} – ${text}`;
      sectionCounter++;
      return title;
    };
    sectionCounter = 1;
    const serviceTitles = {
      folhaPagamento: getSectionTitle("folhaPagamento", "Folha de pagamento (INSS)"),
      pasep: getSectionTitle("pasep", "Recuperação/ compensação PASEP"),
      rpps: getSectionTitle("rpps", "RPPS - Regime Próprio de Previdência Social"),
      impostoRenda: getSectionTitle("impostoRenda", "Imposto de Renda Retido na Fonte"),
      cfem: getSectionTitle("cfem", "Compensação Financeira (Recursos Minerais – CFEM)"),
      cfurh: getSectionTitle("cfurh", "Compensação Financeira (Recursos Hídricos – CFURH)"),
      tabelaSUS: getSectionTitle("tabelaSUS", "Tabela SUS"),
      fundef: getSectionTitle("fundef", "Recuperação FUNDEF"),
      fundeb: getSectionTitle("fundeb", "Recuperação FUNDEB"),
      energiaEletrica: getSectionTitle("energiaEletrica", "Auditoria de Energia Elétrica"),
      royaltiesOleoGas: getSectionTitle("royaltiesOleoGas", "Royalties (Óleo, Xisto e Gás)"),
      repassesFPM: getSectionTitle("repassesFPM", "Repasses de Recursos do FPM (IPI/IR)"),
      revisaoParcelamento: getSectionTitle("revisaoParcelamento", "Revisão dos Parcelamentos Previdenciários"),
      issqn: getSectionTitle("issqn", "Recuperação de Créditos de ISSQN"),
      servicosTecnicos: getSectionTitle("servicosTecnicos", "Serviços Técnicos Especializados (DF)"),
    };
    sectionCounter = 1;
    // Monta o HTML igual à prévia, com fonte Garamond e tamanho 13px
    return `
      <div class="doc" style="font-family: Garamond, serif; font-size: 13px; color: #222;">
        <h1 style="margin-bottom:10px; font-family: Garamond, serif; font-size: 20px;">CAVALCANTE REIS</h1>
        <p><strong>Proponente:</strong> Cavalcante Reis Advogados</p>
        <p><strong>Destinatário:</strong> Prefeitura Municipal de ${options.municipio || "[Nome do Município]"}</p>
        <div style="margin: 24px 0;">
          <h2 class="text-2xl font-bold" style="border-bottom:1px solid #ddd;padding-bottom:8px; font-family: Garamond, serif; font-size: 15px;">Sumário</h2>
          <ol style="margin-top:8px; padding-left: 20px;">
            <li>Objeto da Proposta</li>
            <li>Análise da Questão</li>
            <li>Dos Honorários, das Condições de Pagamento e Despesas</li>
            <li>Prazo e Cronograma de Execução dos Serviços</li>
            <li>Experiência e Equipe Responsável</li>
            <li>Disposições Finais</li>
          </ol>
        </div>
        <div class="proposal-section" style="margin: 24px 0;">
          <h2 class="text-2xl font-bold" style="border-bottom:1px solid #ddd;padding-bottom:8px; font-family: Garamond, serif; font-size: 15px;">1. Objeto da Proposta</h2>
          <p style="margin: 8px 0;">É objeto do presente contrato o desenvolvimento de serviços advocatícios especializados por parte da Proponente, Cavalcante Reis Advogados, ao Aceitante, Município de ${
            options.municipio || "[Nome do Município]"
          }, a fim de prestação de serviços de assessoria técnica e jurídica nas áreas de Direito Público, Tributário, Econômico, Financeiro, Minerário e Previdenciário, atuando perante o Ministério da Fazenda e os seus órgãos administrativos, em especial para alcançar o incremento de receitas, ficando responsável pelo ajuizamento, acompanhamento e eventuais intervenções de terceiro em ações de interesse do Município.</p>
          <p class="mb-4">A proposta inclui os seguintes objetos:</p>
          <table class="w-full border-collapse border mb-4" style="width:100%; border:1px solid #ddd; font-family: Garamond, serif; font-size: 13px;">
            <thead>
              <tr style="background:#f7f7f7; text-align:left;">
                <th class="p-2 border-r" style="padding:8px; border-right:1px solid #ddd;">TESE</th>
                <th class="p-2" style="padding:8px;">CABIMENTO / PERSPECTIVA</th>
              </tr>
            </thead>
            <tbody>
              ${Object.entries(allServices)
                .map(([key, label]) =>
                  services[key]
                    ? `<tr class="border-b"><td class="p-2 align-top">${label}</td><td class="p-2 align-top">Cabível</td></tr>`
                    : ""
                )
                .join("")}
            </tbody>
          </table>
        </div>
        <div class="proposal-section" style="margin: 24px 0;">
          <h2 class="text-2xl font-bold" style="border-bottom:1px solid #ddd;padding-bottom:8px; font-family: Garamond, serif; font-size: 15px;">2. Análise da Questão</h2>
          ${Object.entries(allServices)
            .map(([key, label]) =>
              services[key]
                ? `<h3 class="font-bold text-lg mt-6 mb-2" style="font-family: Garamond, serif; font-size: 14px;">${serviceTitles[key]}</h3><div class="space-y-4">${serviceTextDatabase[key]}</div>`
                : ""
            )
            .join("")}
        </div>
        <div class="proposal-section" style="margin: 24px 0;">
          <h2 class="text-2xl font-bold" style="border-bottom:1px solid #ddd;padding-bottom:8px; font-family: Garamond, serif; font-size: 15px;">3. Dos Honorários, das Condições de Pagamento e Despesas</h2>
          <p>Os valores levantados a título de incremento são provisórios, baseados em informações preliminares, podendo, ao final, representar valores a maior ou a menor.</p>
          <ul style="margin-top:8px; padding-left:20px; list-style:disc; font-family: Garamond, serif; font-size: 13px;">
            <li><strong>3.1.1</strong> Para todos os demais itens descritos nesta Proposta será efetuado o pagamento de honorários advocatícios à CAVALCANTE REIS ADVOGADOS pela execução dos serviços de recuperação de créditos, ad êxito na ordem de R$ 0,12 para cada R$ 1,00.</li>
            <li><strong>3.1.2</strong> Em caso de valores retroativos recuperados em favor da municipalidade, os honorários também serão cobrados na ordem de R$ 0,12 para cada R$ 1,00 e serão pagos quando da expedição do Precatório ou RPV, ou quando da efetiva compensação dos valores.</li>
            <li><strong>3.1.3</strong> Sendo um contrato AD EXITUM, a CONTRATADA só receberá os honorários quando do êxito da demanda.</li>
          </ul>
        </div>
        <div class="proposal-section" style="margin: 24px 0;">
          <h2 class="text-2xl font-bold" style="border-bottom:1px solid #ddd;padding-bottom:8px; font-family: Garamond, serif; font-size: 15px;">4. Prazo e Cronograma de Execução dos Serviços</h2>
          <p>O prazo de execução será de 24 (vinte e quatro) meses ou pelo tempo que perdurar os processos judiciais, podendo ser prorrogado por interesse das partes.</p>
        </div>
        <div class="proposal-section" style="margin: 24px 0;">
          <h2 class="text-2xl font-bold" style="border-bottom:1px solid #ddd;padding-bottom:8px; font-family: Garamond, serif; font-size: 15px;">5. Experiência e Equipe Responsável</h2>
          <p>No portfólio de serviços executados e/ou em execução, constam diversos Municípios contratantes.</p>
        </div>
        <div class="proposal-section" style="margin: 24px 0;">
          <h2 class="text-2xl font-bold" style="border-bottom:1px solid #ddd;padding-bottom:8px; font-family: Garamond, serif; font-size: 15px;">6. Disposições Finais</h2>
          <div style="margin-top:16px; border-top:1px solid #ddd; padding-top:16px; text-align:center; font-family: Garamond, serif; font-size: 13px;">
            <p>Brasília-DF, ${options.data || "[Data da Proposta]"}.</p>
            <p style="margin-top:12px; font-weight:bold;">Atenciosamente,</p>
            <p style="margin-top:8px; font-weight:bold;">CAVALCANTE REIS ADVOGADOS</p>
          </div>
        </div>
      </div>
    `;
  }, [options, services, theme]);

  // Função para gerar docx igual à prévia
  const generateDocx = async () => {
    // Importa logo
    const logoUrl = "/logo-cavalcante-reis.png";
    const logoResponse = await fetch(logoUrl);
    const logoBlob = await logoResponse.blob();
    const logoArrayBuffer = await logoBlob.arrayBuffer();
    const {
      Document,
      Packer,
      Paragraph,
      TextRun,
      Table,
      TableRow,
      TableCell,
      AlignmentType,
      ImageRun,
    } = require("docx");

    // Cabeçalho: logo centralizado
    const logoImageRun = new ImageRun({
      data: logoArrayBuffer,
      transformation: { width: 300, height: 100 },
    });
    const logoParagraph = new Paragraph({
      children: [logoImageRun],
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    });

    // Bloco à direita: Proponente/Destinatário/Data
    const { municipio, data } = options;
    const infoParagraph = new Paragraph({
      children: [
        new TextRun({ text: "Proponente: Cavalcante Reis Advogados\n", bold: true, font: "Garamond", size: 26 }),
        new TextRun({
          text: `Destinatário: Prefeitura Municipal de ${municipio || "[Nome do Município]"}\n`,
          bold: true,
          font: "Garamond",
          size: 26,
        }),
        new TextRun({ text: `${data || "[Data da Proposta]"}`, italics: true, font: "Garamond", size: 26 }),
      ],
      alignment: AlignmentType.RIGHT,
      spacing: { after: 200 },
    });

    // Conteúdo principal: divide por parágrafos para manter espaçamento
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = proposalHtmlForCopy;
    const blocks = tempDiv.querySelectorAll("h1, h2, h3, p, ul, ol, table");
    const children = [];
    blocks.forEach((block) => {
      if (block.tagName === "P") {
        children.push(
          new Paragraph({
            text: block.innerText,
            style: "Normal",
            spacing: { after: 200 },
          })
        );
      } else if (block.tagName === "H1" || block.tagName === "H2" || block.tagName === "H3") {
        children.push(
          new Paragraph({
            text: block.innerText,
            style: "Normal",
            bold: true,
            spacing: { before: 200, after: 100 },
          })
        );
      } else if (block.tagName === "UL" || block.tagName === "OL") {
        block.querySelectorAll("li").forEach((li) => {
          children.push(
            new Paragraph({
              text: "• " + li.innerText,
              style: "Normal",
              spacing: { after: 100 },
            })
          );
        });
      } else if (block.tagName === "TABLE") {
        // Tabela: converte para Table do docx
        const rows = Array.from(block.querySelectorAll("tr")).map(
          (tr) =>
            new TableRow({
              children: Array.from(tr.querySelectorAll("th,td")).map(
                (cell) =>
                  new TableCell({
                    children: [new Paragraph({ text: cell.innerText, style: "Normal" })],
                    margins: { top: 100, bottom: 100, left: 100, right: 100 },
                  })
              ),
            })
        );
        children.push(new Table({ rows, width: { size: 100, type: "pct" } }));
      }
    });

    // Cria documento com fonte Garamond 13
    const doc = new Document({
      styles: {
        paragraphStyles: [
          {
            id: "Normal",
            name: "Normal",
            run: {
              font: "Garamond",
              size: 26,
              color: "222222",
            },
            paragraph: {
              spacing: { after: 120 },
            },
          },
        ],
      },
    });

    // Removido bloco duplicado de declaração de logoImage

    // Adiciona tudo na ordem correta
    doc.addSection({
      children: [
        logoParagraph,
        infoTable,
        new Paragraph({ text: "", spacing: { after: 100 } }),
        new Paragraph({ text: cleanText, style: "Normal" }),
      ],
    });
    const packer = new Packer();
    const blob = await packer.toBlob(doc);
    saveAs(blob, `Proposta - ${municipio || "Municipio"}.docx`);
  };

  // Processar upload de .docx: substituir município, data e remover seções 2.2-2.8
  const handleUpload = async (file) => {
    // Validar arquivo antes de processar
    const validation = validateDocxFile(file);
    if (!validation.valid) {
      setModal({
        open: true,
        title: "Arquivo inválido",
        message: validation.error,
        confirmText: "OK",
        type: "error",
        onConfirm: () => setModal((m) => ({ ...m, open: false })),
      });
      return;
    }

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

  // Handler para download e salvar, passado para o sidebar
  const onDownloadDocx = generateDocx;
  const onSaveProposal = saveProposal;
  React.useEffect(() => {
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
      <Header theme={theme} />
      <main className="main">
        <ControlsSidebar
          theme={theme}
          options={options}
          setOptions={setOptions}
          services={services}
          setServices={setServices}
          savedProposals={savedProposals || []}
          onLoadProposal={loadProposal}
          onDeleteProposal={deleteProposal}
          onStartFromScratch={startFromScratch}
          onImportDocx={importDocx}
          onSaveProposal={saveProposal}
          onDownloadDocx={generateDocx}
        />
        <div className="content">
          <ProposalDocument theme={theme} options={options} services={services} />
        </div>
        <Modal {...modal} />
      </main>
    </div>
  );
}
