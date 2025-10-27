import React, { useState, useMemo } from "react";
import Modal from "./Modal";
import DOMPurify from "dompurify";
import { Clipboard, Settings, FileText } from "lucide-react";
import { saveAs } from "file-saver";
import mammoth from "mammoth";
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, AlignmentType, ImageRun } from "docx";

// Paleta baseada nas imagens enviadas
const colors = {
  light: {
    background: "#eff0f3",
    headline: "#0d0d0d",
    paragraph: "#2a2a2a",
    button: "#ff8e3c",
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

const serviceTitles = {
  folhaPagamento: "2.1 – Folha de Pagamento (INSS)",
  pasep: "2.2 – Recuperação/Compensação PASEP",
  rpps: "2.3 – RPPS (Regime Próprio)",
  impostoRenda: "2.4 – Imposto de Renda (IRRF)",
  cfem: "2.5 – Compensação (Recursos Minerais - CFEM)",
  cfurh: "2.6 – Compensação (Recursos Hídricos - CFURH)",
  tabelaSUS: "2.7 – Tabela SUS",
  fundef: "2.8 – Recuperação FUNDEF",
  fundeb: "2.9 – Recuperação FUNDEB",
  energiaEletrica: "2.10 – Auditoria de Energia Elétrica",
  royaltiesOleoGas: "2.11 – Royalties (Óleo, Xisto e Gás)",
  repassesFPM: "2.12 – Repasses de Recursos do FPM (IPI/IR)",
  revisaoParcelamento: "2.13 – Revisão dos Parcelamentos Previdenciários",
  issqn: "2.14 – Recuperação de Créditos de ISSQN",
  servicosTecnicos: "2.15 – Serviços Técnicos (DF)",
};

// --- Banco de textos oficiais de cada serviço (HTML) ---
const serviceTextDatabase = {
  folhaPagamento: `<p>Realização de auditoria das folhas de pagamento referentes ao Regime Geral, bem como das GFIPS e tabela de incidências do INSS.</p>
  <p>Há muito se discute acerca da correta base de cálculo das contribuições previdenciárias, especialmente porque há conflitos entre a legislação infraconstitucional e as diretrizes da Constituição Federal.</p>
  <p>A controvérsia cinge-se quanto à incidência ou não da contribuição previdenciária patronal sobre as verbas de caráter indenizatório, pagas aos servidores públicos municipais, celetistas
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
  customCabimentos,
  setCustomCabimentos,
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

  const handleCabimentoChange = (serviceName, value) => {
    const sanitizedValue = value
      .replace(/<script[^>]*>.*?<\/script>/gi, "") // Remove scripts
      .replace(/<[^>]+>/g, "") // Remove tags HTML
      .trim();
    setCustomCabimentos((prev) => ({ ...prev, [serviceName]: sanitizedValue }));
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
        {Object.entries(allServices).map(([key, label]) => {
          const hasCabivel = customCabimentos.hasOwnProperty(key);
          return (
            <div key={key} style={{ marginBottom: "12px" }}>
              <label className="service-item">
                <input type="checkbox" checked={!!services[key]} onChange={() => handleServiceChange(key)} />
                <span>{label}</span>
              </label>
              {hasCabivel && services[key] && (
                <div style={{ marginLeft: "24px", marginTop: "4px" }}>
                  <input
                    type="text"
                    value={customCabimentos[key] || ""}
                    onChange={(e) => handleCabimentoChange(key, e.target.value)}
                    placeholder="Cabimento/Perspectiva"
                    style={{
                      width: "100%",
                      padding: "6px 8px",
                      fontSize: "13px",
                      border: "1px solid #ccc",
                      borderRadius: "4px",
                      fontFamily: "inherit",
                    }}
                  />
                </div>
              )}
            </div>
          );
        })}

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
        <h3 style={{ marginBottom: "30px", fontSize: "16px" }}>Propostas Salvas</h3>
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

              // Formatar data de expiração em dd/mm/aaaa
              const expirationDate = proposal.expiresAt
                ? new Date(proposal.expiresAt).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })
                : null;

              // Determinar a cor de fundo base
              const baseColor = isExpired ? "#ffebee" : themeColors.docBg;

              return (
                <div
                  key={proposal.id}
                  className="proposal-item"
                  data-expired={isExpired}
                  style={{
                    padding: "16px",
                    borderRadius: "4px",
                    marginBottom: "15px",
                    border: `1px solid ${isExpiringSoon ? "#ff9800" : themeColors.sidebarBorder}`,
                    backgroundColor: baseColor,
                    opacity: isExpired ? 0.7 : 1,
                  }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ flex: 1 }}>
                      <strong style={{ display: "block", marginBottom: "4px", fontSize: "14px" }}>
                        {proposal.municipio}
                      </strong>
                      <small style={{ color: themeColors.paragraph, fontSize: "11px", display: "block" }}>
                        {proposal.data}
                      </small>
                      {expirationDate && (
                        <small
                          style={{
                            color: isExpired ? "#c62828" : isExpiringSoon ? "#f57c00" : "#555",
                            fontSize: "12px",
                            display: "block",
                            marginTop: "4px",
                            fontWeight: isExpiringSoon ? "bold" : "600",
                          }}>
                          {isExpired ? `⚠️ Expirada dia: ${expirationDate}` : `⏰ Expira dia: ${expirationDate}`}
                        </small>
                      )}
                    </div>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button
                        onClick={() => onLoadProposal(proposal)}
                        className="btn-small"
                        style={{ padding: "4px 8px", fontSize: "11px" }}
                        disabled={isExpired}>
                        Carregar
                      </button>
                      <button
                        onClick={() => onDeleteProposal(proposal.id)}
                        className="btn-small"
                        style={{ padding: "4px 8px", fontSize: "11px", backgroundColor: "#dc3545", color: "white" }}>
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

const ProposalDocument = ({ theme, options, services, customCabimentos }) => {
  const themeColors = colors[theme];

  // Helper para renderizar serviços como componentes React
  const renderServiceSection = (serviceKey, title, content) => {
    if (!services[serviceKey]) return null;

    // Converter HTML string para elementos React
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = DOMPurify.sanitize(content);
    const paragraphs = Array.from(tempDiv.querySelectorAll("p")).map((p, idx) => (
      <p key={idx} style={{ margin: "8px 0" }}>
        {p.textContent}
      </p>
    ));

    return (
      <>
        <hr style={{ border: "2px solid black", margin: "24px 0" }} />
        <h3 className="font-bold text-lg mt-6 mb-2" style={{ color: "#000" }}>
          {title}
        </h3>
        <div className="space-y-4">{paragraphs}</div>
      </>
    );
  };

  // Helper para renderizar linhas da tabela
  const renderTableRow = (serviceKey, tese, cabimento) => {
    if (!services[serviceKey]) return null;

    // Usar o valor customizado se existir, senão usar o valor padrão
    const finalCabimento = customCabimentos && customCabimentos[serviceKey] ? customCabimentos[serviceKey] : cabimento;

    return (
      <tr key={serviceKey} style={{ height: 40, verticalAlign: "top", borderBottom: "4px solid black" }}>
        <td className="p-2 align-top" style={{ paddingTop: 12, paddingBottom: 12, color: "#000" }}>
          {tese}
        </td>
        <td className="p-2 align-top" style={{ paddingTop: 12, paddingBottom: 12, color: "#000" }}>
          {finalCabimento}
        </td>
      </tr>
    );
  };

  // Helper para renderizar uma "página"
  const renderPage = (children, showLogo = true) => (
    <div style={{ pageBreakAfter: "always", paddingBottom: 40 }}>
      {showLogo && (
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <img
            src="/logo-cavalcante-reis.png"
            alt="Logo Cavalcante Reis Advogados"
            style={{ maxWidth: 300, maxHeight: 100, display: "block", margin: "0 auto" }}
          />
        </div>
      )}
      {children}
    </div>
  );

  return (
    <div id="preview" className="preview" style={{ fontFamily: "Garamond, serif", fontSize: "13px", color: "#222" }}>
      {/* Página 1: Capa */}
      {renderPage(
        <>
          <div style={{ textAlign: "center", marginTop: 60, marginBottom: 200 }}>
            <img
              src="/logo-cavalcante-reis.png"
              alt="Cavalcante Reis Advogados"
              style={{ width: "250px", height: "auto" }}
            />
          </div>

          <div style={{ marginTop: 40 }}>
            <div
              style={{
                borderTop: "1px solid #000",
                paddingTop: 25,
                maxWidth: "55%",
                marginLeft: "auto",
                marginRight: 0,
              }}>
              <div style={{ textAlign: "right", marginBottom: 30 }}>
                <p style={{ margin: "4px 0" }}>
                  <strong>Proponente:</strong>
                </p>
                <p style={{ margin: "4px 0" }}>Cavalcante Reis Advogados</p>

                <p style={{ margin: "16px 0 4px 0" }}>
                  <strong>Destinatário:</strong>
                </p>
                <p style={{ margin: "4px 0" }}>Prefeitura Municipal de {options.municipio || "[Nome do Município]"}</p>
              </div>

              <div style={{ borderTop: "1px solid #000", paddingTop: 12, textAlign: "right" }}>
                <p style={{ fontSize: "16px", fontWeight: "bold" }}>{options.data || "2025"}</p>
              </div>
            </div>
          </div>
        </>,
        false // Não mostrar logo na capa pois já tem um logo grande
      )}

      {/* Página 2: Sumário */}
      {renderPage(
        <>
          <div style={{ textAlign: "right", marginBottom: 40 }}>
            <p style={{ fontSize: "14px" }}>2 -</p>
          </div>
          <h2 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: 30 }}>Sumário</h2>
          <div style={{ paddingLeft: 40, lineHeight: 2 }}>
            <p style={{ margin: "12px 0" }}>
              <strong>1.</strong> Objeto da Proposta
            </p>
            <p style={{ margin: "12px 0" }}>
              <strong>2.</strong> Análise da Questão
            </p>
            <p style={{ margin: "12px 0" }}>
              <strong>3.</strong> Dos Honorários, das Condições de Pagamento e Despesas
            </p>
            <p style={{ margin: "12px 0" }}>
              <strong>4.</strong> Prazo e Cronograma de Execução dos Serviços
            </p>
            <p style={{ margin: "12px 0" }}>
              <strong>5.</strong> Experiência em atuação em favor de Municípios e da Equipe Responsável
            </p>
            <p style={{ margin: "12px 0" }}>
              <strong>6.</strong> Disposições Finais
            </p>
          </div>
        </>
      )}

      {/* Página 3: Objeto da Proposta */}
      {renderPage(
        <>
          <h2 className="text-2xl font-bold" style={{ borderBottom: "1px solid #ddd", paddingBottom: 8 }}>
            1. Objeto da Proposta
          </h2>
          <p style={{ margin: "8px 0" }}>
            É objeto do presente contrato o desenvolvimento de serviços advocatícios especializados por parte da
            Proponente, Cavalcante Reis Advogados, ao Aceitante, Município de{" "}
            {options.municipio || "[Nome do Município]"}, a fim de prestação de serviços de assessoria técnica e
            jurídica nas áreas de Direito Público, Tributário, Econômico, Financeiro, Minerário e Previdenciário,
            atuando perante o Ministério da Fazenda e os seus órgãos administrativos, em especial para alcançar o
            incremento de receitas, ficando responsável pelo ajuizamento, acompanhamento e eventuais intervenções de
            terceiro em ações de interesse do Município.
          </p>
          <p className="mb-4">A proposta inclui os seguintes objetos:</p>
          <table
            className="w-full border-collapse border mb-4"
            style={{
              width: "100%",
              border: "1px solid #000",
              borderTop: "4px solid #000",
              borderBottom: "4px solid #000",
            }}>
            <thead>
              <tr
                style={{
                  background: "#f7f7f7",
                  textAlign: "left",
                  borderBottom: "4px solid #000",
                  borderTop: "4px solid #000",
                }}>
                <th className="p-2 border-r" style={{ padding: 8, borderRight: "2px solid #000" }}>
                  TESE
                </th>
                <th className="p-2" style={{ padding: 8 }}>
                  CABIMENTO / PERSPECTIVA
                </th>
              </tr>
            </thead>
            <tbody>
              {renderTableRow(
                "folhaPagamento",
                "Folha de pagamento, recuperação de verbas indenizatórias e contribuições previdenciárias (INSS)",
                "A perspectiva de incremento/recuperação é de aproximadamente o valor referente a até duas folhas de pagamento mensais."
              )}
              {renderTableRow("pasep", "Recuperação/ compensação PASEP", "Cabível")}
              {renderTableRow("rpps", "RPPS Regime Próprio de Previdência Social", "Cabível")}
              {renderTableRow("impostoRenda", "Recuperação/Compensação de Imposto de Renda", "Cabível")}
              {renderTableRow("cfem", "Compensação financeira pela exploração de recursos minerais – CFEM", "Cabível")}
              {renderTableRow(
                "cfurh",
                "Compensação Financeira pela Utilização dos Recursos Hídricos – CFURH",
                "Cabível"
              )}
              {renderTableRow("tabelaSUS", "Tabela SUS", "Cabível")}
              {renderTableRow("fundef", "FUNDEF - Atuação em feito para agilizar a tramitação.", "Cabível")}
              {renderTableRow("fundeb", "Recuperação dos valores repassados à menor a título de FUNDEB.", "Cabível")}
              {renderTableRow("energiaEletrica", "Auditoria e Consultoria do pagamento de Energia Elétrica", "Cabível")}
              {renderTableRow(
                "royaltiesOleoGas",
                "Royalties pela exploração de óleo bruto, xisto betuminoso e gás natural.",
                "Cabível"
              )}
              {renderTableRow(
                "repassesFPM",
                "Repasses dos recursos de FPM com base na real e efetiva arrecadação do IPI e IR.",
                "Cabível"
              )}
              {renderTableRow("revisaoParcelamento", "Revisão dos parcelamentos previdenciários", "Cabível")}
              {renderTableRow("issqn", "Recuperação de Créditos de ISSQN", "Cabível")}
              {renderTableRow(
                "servicosTecnicos",
                "Serviços técnicos especializados de assessoria e consultoria jurídica (DF)",
                "Cabível"
              )}
            </tbody>
          </table>
        </>
      )}

      {/* Página 3: Análise da Questão */}
      {renderPage(
        <>
          <h2 className="text-2xl font-bold" style={{ borderBottom: "1px solid #ddd", paddingBottom: 8 }}>
            2. Análise da Questão
          </h2>
          {renderServiceSection("folhaPagamento", serviceTitles.folhaPagamento, serviceTextDatabase.folhaPagamento)}
          {renderServiceSection("pasep", serviceTitles.pasep, serviceTextDatabase.pasep)}
          {renderServiceSection("rpps", serviceTitles.rpps, serviceTextDatabase.rpps)}
          {renderServiceSection("impostoRenda", serviceTitles.impostoRenda, serviceTextDatabase.impostoRenda)}
          {renderServiceSection("cfem", serviceTitles.cfem, serviceTextDatabase.cfem)}
          {renderServiceSection("cfurh", serviceTitles.cfurh, serviceTextDatabase.cfurh)}
          {renderServiceSection("tabelaSUS", serviceTitles.tabelaSUS, serviceTextDatabase.tabelaSUS)}
          {renderServiceSection("fundef", serviceTitles.fundef, serviceTextDatabase.fundeb)}
          {renderServiceSection("fundeb", serviceTitles.fundeb, serviceTextDatabase.fundeb)}
          {renderServiceSection("energiaEletrica", serviceTitles.energiaEletrica, serviceTextDatabase.energiaEletrica)}
          {renderServiceSection(
            "royaltiesOleoGas",
            serviceTitles.royaltiesOleoGas,
            serviceTextDatabase.royaltiesOleoGas
          )}
          {renderServiceSection("repassesFPM", serviceTitles.repassesFPM, serviceTextDatabase.repassesFPM)}
          {renderServiceSection(
            "revisaoParcelamento",
            serviceTitles.revisaoParcelamento,
            serviceTextDatabase.revisaoParcelamento
          )}
          {renderServiceSection("issqn", serviceTitles.issqn, serviceTextDatabase.issqn)}
          {renderServiceSection(
            "servicosTecnicos",
            serviceTitles.servicosTecnicos,
            serviceTextDatabase.servicosTecnicos
          )}
        </>
      )}

      {/* Página 4: Honorários */}
      {renderPage(
        <>
          <h2 className="text-2xl font-bold" style={{ borderBottom: "1px solid #ddd", paddingBottom: 8 }}>
            3. Dos Honorários, das Condições de Pagamento e Despesas
          </h2>
          <p>
            Os valores levantados a título de incremento são provisórios, baseados em informações preliminares, podendo,
            ao final, representar valores a maior ou a menor.
          </p>
          <ul style={{ marginTop: 8, paddingLeft: 20, listStyle: "disc" }}>
            <li>
              <strong>3.1.1</strong> Para todos os demais itens descritos nesta Proposta será efetuado o pagamento de
              honorários advocatícios à CAVALCANTE REIS ADVOGADOS pela execução dos serviços de recuperação de créditos,
              ad êxito na ordem de R$ 0,12 para cada R$ 1,00.
            </li>
            <li>
              <strong>3.1.2</strong> Em caso de valores retroativos recuperados em favor da municipalidade, os
              honorários também serão cobrados na ordem de R$ 0,12 para cada R$ 1,00 e serão pagos quando da expedição
              do Precatório ou RPV, ou quando da efetiva compensação dos valores.
            </li>
            <li>
              <strong>3.1.3</strong> Sendo um contrato AD EXITUM, a CONTRATADA só receberá os honorários quando do êxito
              da demanda.
            </li>
          </ul>
        </>
      )}

      {/* Página 5: Prazo */}
      {renderPage(
        <>
          <h2 className="text-2xl font-bold" style={{ borderBottom: "1px solid #ddd", paddingBottom: 8 }}>
            4. Prazo e Cronograma de Execução dos Serviços
          </h2>
          <p>
            O prazo de execução será de 24 (vinte e quatro) meses ou pelo tempo que perdurar os processos judiciais,
            podendo ser prorrogado por interesse das partes.
          </p>
        </>
      )}

      {/* Página 6: Experiência */}
      {renderPage(
        <>
          <h2 className="text-2xl font-bold" style={{ borderBottom: "1px solid #ddd", paddingBottom: 8 }}>
            5. Experiência e Equipe Responsável
          </h2>
          <p>No portfólio de serviços executados e/ou em execução, constam diversos Municípios contratantes.</p>
        </>
      )}

      {/* Página 7: Disposições Finais */}
      {renderPage(
        <>
          <h2 className="text-2xl font-bold" style={{ borderBottom: "1px solid #ddd", paddingBottom: 8 }}>
            6. Disposições Finais
          </h2>
          <div style={{ marginTop: 16, borderTop: "1px solid #ddd", paddingTop: 16, textAlign: "center" }}>
            <p>Brasília-DF, {options.data || "[Data da Proposta]"}.</p>
            <p style={{ marginTop: 12, fontWeight: "bold" }}>Atenciosamente,</p>
            <p style={{ marginTop: 8, fontWeight: "bold" }}>CAVALCANTE REIS ADVOGADOS</p>
          </div>
        </>
      )}
    </div>
  );
};

// Componente principal App
function App() {
  const [theme] = useState("light");
  const [options, setOptions] = useState({ municipio: "", destinatario: "", data: "" });
  const [services, setServices] = useState(
    Object.keys(allServices).reduce((acc, key) => {
      acc[key] = false;
      return acc;
    }, {})
  );
  const [customCabimentos, setCustomCabimentos] = useState({
    pasep: "Cabível",
    rpps: "Cabível",
    impostoRenda: "Cabível",
    cfem: "Cabível",
    cfurh: "Cabível",
    tabelaSUS: "Cabível",
    fundef: "Cabível",
    fundeb: "Cabível",
    energiaEletrica: "Cabível",
    royaltiesOleoGas: "Cabível",
    repassesFPM: "Cabível",
    revisaoParcelamento: "Cabível",
    issqn: "Cabível",
    servicosTecnicos: "Cabível",
  });
  const [savedProposals, setSavedProposals] = useState([]);
  const [modal, setModal] = useState({
    open: false,
    title: "",
    message: "",
    confirmText: "OK",
    cancelText: "",
    type: "info",
    onConfirm: () => {},
    onCancel: () => {},
  });

  // Funções auxiliares
  const generateDocx = async () => {
    console.log("Gerando DOCX...");

    // Validar campos obrigatórios
    if (!options.municipio || !options.data) {
      setModal({
        open: true,
        title: "Campos Obrigatórios",
        message: "Por favor, preencha o Município Destinatário e a Data da Proposta antes de baixar o documento.",
        confirmText: "OK",
        cancelText: "",
        type: "warning",
        onConfirm: () =>
          setModal({
            open: false,
            title: "",
            message: "",
            confirmText: "OK",
            cancelText: "",
            type: "info",
            onConfirm: () => {},
            onCancel: () => {},
          }),
        onCancel: () => {},
      });
      return;
    }

    try {
      // Carregar a imagem do logo
      const logoResponse = await fetch("/logo-cavalcante-reis.png");
      const logoBlob = await logoResponse.blob();
      const logoArrayBuffer = await logoBlob.arrayBuffer();
      const logoBuffer = new Uint8Array(logoArrayBuffer);

      // Função auxiliar para criar linha de tabela
      const createTableRow = (teseText, cabimentoText) => {
        return new TableRow({
          children: [
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: teseText,
                      font: "Garamond",
                      size: 26,
                    }),
                  ],
                }),
              ],
            }),
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: cabimentoText,
                      font: "Garamond",
                      size: 26,
                    }),
                  ],
                }),
              ],
            }),
          ],
        });
      };

      // Criar linhas da tabela dinamicamente baseado nos serviços selecionados
      const tableRows = [
        // Header
        new TableRow({
          children: [
            new TableCell({
              shading: { fill: "F7F7F7" },
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "TESE",
                      bold: true,
                      font: "Garamond",
                      size: 26,
                    }),
                  ],
                }),
              ],
            }),
            new TableCell({
              shading: { fill: "F7F7F7" },
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "CABIMENTO / PERSPECTIVA",
                      bold: true,
                      font: "Garamond",
                      size: 26,
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),
      ];

      // Adicionar linhas de serviços selecionados
      if (services.folhaPagamento) {
        tableRows.push(
          new TableRow({
            children: [
              new TableCell({
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: "Folha de pagamento, recuperação de verbas indenizatórias e contribuições previdenciárias (INSS)",
                        font: "Garamond",
                        size: 26,
                      }),
                    ],
                  }),
                ],
              }),
              new TableCell({
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: "A perspectiva de incremento/recuperação é de aproximadamente o valor referente a até duas folhas de pagamento mensais.",
                        font: "Garamond",
                        size: 26,
                      }),
                    ],
                  }),
                ],
              }),
            ],
          })
        );
      }

      if (services.pasep) {
        tableRows.push(createTableRow("Recuperação/ compensação PASEP", customCabimentos.pasep));
      }

      if (services.rpps) {
        tableRows.push(createTableRow("RPPS Regime Próprio de Previdência Social", customCabimentos.rpps));
      }

      if (services.impostoRenda) {
        tableRows.push(createTableRow("Recuperação/Compensação de Imposto de Renda", customCabimentos.impostoRenda));
      }

      if (services.cfem) {
        tableRows.push(
          createTableRow("Compensação financeira pela exploração de recursos minerais – CFEM", customCabimentos.cfem)
        );
      }

      if (services.cfurh) {
        tableRows.push(
          createTableRow("Compensação Financeira pela Utilização dos Recursos Hídricos – CFURH", customCabimentos.cfurh)
        );
      }

      if (services.tabelaSUS) {
        tableRows.push(createTableRow("Tabela SUS", customCabimentos.tabelaSUS));
      }

      if (services.fundef) {
        tableRows.push(
          createTableRow("FUNDEF - Atuação em feito para agilizar a tramitação.", customCabimentos.fundef)
        );
      }

      if (services.fundeb) {
        tableRows.push(
          createTableRow("Recuperação dos valores repassados à menor a título de FUNDEB.", customCabimentos.fundeb)
        );
      }

      if (services.energiaEletrica) {
        tableRows.push(
          createTableRow("Auditoria e Consultoria do pagamento de Energia Elétrica", customCabimentos.energiaEletrica)
        );
      }

      if (services.royaltiesOleoGas) {
        tableRows.push(
          createTableRow(
            "Royalties pela exploração de óleo bruto, xisto betuminoso e gás natural.",
            customCabimentos.royaltiesOleoGas
          )
        );
      }

      if (services.repassesFPM) {
        tableRows.push(
          createTableRow(
            "Repasses dos recursos de FPM com base na real e efetiva arrecadação do IPI e IR.",
            customCabimentos.repassesFPM
          )
        );
      }

      if (services.revisaoParcelamento) {
        tableRows.push(
          createTableRow("Revisão dos parcelamentos previdenciários", customCabimentos.revisaoParcelamento)
        );
      }

      if (services.issqn) {
        tableRows.push(createTableRow("Recuperação de Créditos de ISSQN", customCabimentos.issqn));
      }

      if (services.servicosTecnicos) {
        tableRows.push(
          createTableRow(
            "Serviços técnicos especializados de assessoria e consultoria jurídica (DF)",
            customCabimentos.servicosTecnicos
          )
        );
      }

      const doc = new Document({
        sections: [
          // Página 1: Capa
          {
            properties: {
              page: {
                margin: {
                  top: 1440,
                  right: 1440,
                  bottom: 1440,
                  left: 1440,
                },
              },
            },
            children: [
              // Logo da capa
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { after: 800, before: 200 },
                children: [
                  new ImageRun({
                    data: logoBuffer,
                    transformation: {
                      width: 200,
                      height: 60,
                    },
                  }),
                ],
              }),
              // Linha horizontal superior
              new Paragraph({
                border: {
                  top: {
                    color: "000000",
                    space: 1,
                    style: "single",
                    size: 6,
                  },
                },
                spacing: { after: 400 },
              }),
              // Proponente
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                spacing: { after: 100 },
                children: [
                  new TextRun({
                    text: "Proponente:",
                    bold: true,
                    font: "Garamond",
                    size: 24,
                  }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                spacing: { after: 200 },
                children: [
                  new TextRun({
                    text: "Cavalcante Reis Advogados",
                    font: "Garamond",
                    size: 24,
                  }),
                ],
              }),
              // Destinatário
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                spacing: { after: 100 },
                children: [
                  new TextRun({
                    text: "Destinatário:",
                    bold: true,
                    font: "Garamond",
                    size: 24,
                  }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                spacing: { after: 400 },
                children: [
                  new TextRun({
                    text: `Prefeitura Municipal de ${options.municipio || "[Nome do Município]"}`,
                    font: "Garamond",
                    size: 24,
                  }),
                ],
              }),
              // Linha horizontal do meio
              new Paragraph({
                border: {
                  top: {
                    color: "000000",
                    space: 1,
                    style: "single",
                    size: 6,
                  },
                },
                spacing: { after: 200 },
              }),
              // Ano
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: options.data || "2025",
                    bold: true,
                    font: "Garamond",
                    size: 28,
                  }),
                ],
              }),
            ],
          },
          // Página 2: Sumário
          {
            properties: {
              page: {
                margin: {
                  top: 1440,
                  right: 1440,
                  bottom: 1440,
                  left: 1440,
                },
              },
            },
            children: [
              // Logo do cabeçalho
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { after: 100 },
                children: [
                  new ImageRun({
                    data: logoBuffer,
                    transformation: {
                      width: 150,
                      height: 45,
                    },
                  }),
                ],
              }),
              // Número da página
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                spacing: { after: 400 },
                children: [
                  new TextRun({
                    text: "2 -",
                    font: "Garamond",
                    size: 24,
                  }),
                ],
              }),
              // Título Sumário
              new Paragraph({
                spacing: { after: 400 },
                children: [
                  new TextRun({
                    text: "Sumário",
                    bold: true,
                    font: "Garamond",
                    size: 32,
                  }),
                ],
              }),
              // Itens do sumário
              new Paragraph({
                spacing: { after: 200 },
                indent: { left: 720 },
                children: [
                  new TextRun({
                    text: "1. Objeto da Proposta",
                    font: "Garamond",
                    size: 24,
                  }),
                ],
              }),
              new Paragraph({
                spacing: { after: 200 },
                indent: { left: 720 },
                children: [
                  new TextRun({
                    text: "2. Análise da Questão",
                    font: "Garamond",
                    size: 24,
                  }),
                ],
              }),
              new Paragraph({
                spacing: { after: 200 },
                indent: { left: 720 },
                children: [
                  new TextRun({
                    text: "3. Dos Honorários, das Condições de Pagamento e Despesas",
                    font: "Garamond",
                    size: 24,
                  }),
                ],
              }),
              new Paragraph({
                spacing: { after: 200 },
                indent: { left: 720 },
                children: [
                  new TextRun({
                    text: "4. Prazo e Cronograma de Execução dos Serviços",
                    font: "Garamond",
                    size: 24,
                  }),
                ],
              }),
              new Paragraph({
                spacing: { after: 200 },
                indent: { left: 720 },
                children: [
                  new TextRun({
                    text: "5. Experiência em atuação em favor de Municípios e da Equipe Responsável",
                    font: "Garamond",
                    size: 24,
                  }),
                ],
              }),
              new Paragraph({
                spacing: { after: 200 },
                indent: { left: 720 },
                children: [
                  new TextRun({
                    text: "6. Disposições Finais",
                    font: "Garamond",
                    size: 24,
                  }),
                ],
              }),
            ],
          },
          // Página 3: Objeto da Proposta
          {
            properties: {
              page: {
                margin: {
                  top: 1440,
                  right: 1440,
                  bottom: 1440,
                  left: 1440,
                },
              },
            },
            children: [
              // Logo do cabeçalho
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { after: 100 },
                children: [
                  new ImageRun({
                    data: logoBuffer,
                    transformation: {
                      width: 150,
                      height: 45,
                    },
                  }),
                ],
              }),
              // Título
              new Paragraph({
                spacing: { after: 300 },
                border: {
                  bottom: {
                    color: "DDDDDD",
                    space: 1,
                    style: "single",
                    size: 6,
                  },
                },
                children: [
                  new TextRun({
                    text: "1. Objeto da Proposta",
                    bold: true,
                    font: "Garamond",
                    size: 28,
                  }),
                ],
              }),
              // Texto introdutório
              new Paragraph({
                spacing: { after: 200 },
                children: [
                  new TextRun({
                    text: `É objeto do presente contrato o desenvolvimento de serviços advocatícios especializados por parte da Proponente, Cavalcante Reis Advogados, ao Aceitante, Município de ${
                      options.municipio || "[Nome do Município]"
                    }, a fim de prestação de serviços de assessoria técnica e jurídica nas áreas de Direito Público, Tributário, Econômico, Financeiro, Minerário e Previdenciário, atuando perante o Ministério da Fazenda e os seus órgãos administrativos, em especial para alcançar o incremento de receitas, ficando responsável pelo ajuizamento, acompanhamento e eventuais intervenções de terceiro em ações de interesse do Município.`,
                    font: "Garamond",
                    size: 24,
                  }),
                ],
              }),
              new Paragraph({
                spacing: { after: 300 },
                children: [
                  new TextRun({
                    text: "A proposta inclui os seguintes objetos:",
                    font: "Garamond",
                    size: 24,
                  }),
                ],
              }),
              // Tabela de serviços
              new Table({
                width: {
                  size: 100,
                  type: "pct",
                },
                borders: {
                  top: { style: "single", size: 24, color: "000000" },
                  bottom: { style: "single", size: 24, color: "000000" },
                  left: { style: "single", size: 6, color: "000000" },
                  right: { style: "single", size: 6, color: "000000" },
                  insideHorizontal: { style: "single", size: 24, color: "000000" },
                  insideVertical: { style: "single", size: 12, color: "000000" },
                },
                rows: tableRows,
              }),
            ],
          },
        ],
      });

      console.log("Documento criado, gerando blob...");

      // Gerar e baixar o arquivo
      const blob = await Packer.toBlob(doc);

      console.log("Blob gerado, iniciando download...");

      saveAs(blob, `Proposta-${options.municipio || "Municipio"}-${Date.now()}.docx`);

      console.log("Download iniciado!");

      setModal({
        open: true,
        title: "Download Concluído",
        message: "O documento .docx foi gerado com sucesso!",
        confirmText: "OK",
        type: "success",
        onConfirm: () => setModal((m) => ({ ...m, open: false })),
      });
    } catch (error) {
      console.error("Erro ao gerar DOCX:", error);
      setModal({
        open: true,
        title: "Erro ao Gerar Documento",
        message: `Ocorreu um erro ao gerar o documento: ${error.message}`,
        confirmText: "OK",
        type: "error",
        onConfirm: () => setModal((m) => ({ ...m, open: false })),
      });
    }
  };

  const saveProposal = () => {
    const newProposal = {
      id: Date.now(),
      municipio: options.municipio,
      data: options.data,
      services,
      customCabimentos,
      expiresAt: Date.now() + 15 * 24 * 60 * 60 * 1000, // 15 dias
    };

    const updated = [...savedProposals, newProposal];
    setSavedProposals(updated);
    localStorage.setItem("savedPropostas", JSON.stringify(updated));

    setModal({
      open: true,
      title: "Proposta Salva",
      message: "Proposta salva com sucesso!",
      confirmText: "OK",
      cancelText: "",
      type: "success",
      onConfirm: () =>
        setModal({
          open: false,
          title: "",
          message: "",
          confirmText: "OK",
          cancelText: "",
          type: "info",
          onConfirm: () => {},
          onCancel: () => {},
        }),
      onCancel: () => {},
    });
  };

  const loadProposal = (proposal) => {
    setOptions({ municipio: proposal.municipio, destinatario: "", data: proposal.data });
    setServices(proposal.services);
    // Restaurar customCabimentos se existir, senão usar valores padrão
    if (proposal.customCabimentos) {
      setCustomCabimentos(proposal.customCabimentos);
    }
  };

  const deleteProposal = (id) => {
    setModal({
      open: true,
      title: "Confirmar Exclusão",
      message: "Tem certeza que deseja excluir esta proposta salva? Esta ação não pode ser desfeita.",
      confirmText: "Sim, Excluir",
      cancelText: "Cancelar",
      type: "warning",
      onConfirm: () => {
        const updated = savedProposals.filter((p) => p.id !== id);
        setSavedProposals(updated);
        localStorage.setItem("savedPropostas", JSON.stringify(updated));
        setModal({
          open: false,
          title: "",
          message: "",
          confirmText: "OK",
          cancelText: "",
          type: "info",
          onConfirm: () => {},
          onCancel: () => {},
        });
      },
      onCancel: () =>
        setModal({
          open: false,
          title: "",
          message: "",
          confirmText: "OK",
          cancelText: "",
          type: "info",
          onConfirm: () => {},
          onCancel: () => {},
        }),
    });
  };

  // Funções de limpeza de propostas expiradas
  const cleanExpiredProposals = (proposals) => {
    const now = Date.now();
    return proposals.filter((p) => {
      if (!p.expiresAt) return true;
      return p.expiresAt > now;
    });
  };

  // Carregar propostas salvas do localStorage ao iniciar e limpar expiradas
  React.useEffect(() => {
    const saved = localStorage.getItem("savedPropostas");
    if (saved) {
      const allProposals = JSON.parse(saved);
      const validProposals = cleanExpiredProposals(allProposals);

      if (validProposals.length !== allProposals.length) {
        localStorage.setItem("savedPropostas", JSON.stringify(validProposals));
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
        setOptions({ municipio: "", destinatario: "", data: "" });
        setServices(
          Object.keys(allServices).reduce((acc, key) => {
            acc[key] = false;
            return acc;
          }, {})
        );
        setCustomCabimentos({
          pasep: "Cabível",
          rpps: "Cabível",
          impostoRenda: "Cabível",
          cfem: "Cabível",
          cfurh: "Cabível",
          tabelaSUS: "Cabível",
          fundef: "Cabível",
          fundeb: "Cabível",
          energiaEletrica: "Cabível",
          royaltiesOleoGas: "Cabível",
          repassesFPM: "Cabível",
          revisaoParcelamento: "Cabível",
          issqn: "Cabível",
          servicosTecnicos: "Cabível",
        });
        setModal({
          open: false,
          title: "",
          message: "",
          confirmText: "OK",
          cancelText: "",
          type: "info",
          onConfirm: () => {},
          onCancel: () => {},
        });
      },
      onCancel: () =>
        setModal({
          open: false,
          title: "",
          message: "",
          confirmText: "OK",
          cancelText: "",
          type: "info",
          onConfirm: () => {},
          onCancel: () => {},
        }),
    });
  };

  // Função para validar arquivos .docx
  const validateDocxFile = (file) => {
    const MAX_SIZE = 10 * 1024 * 1024;
    const ALLOWED_TYPES = [
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
    ];
    const ALLOWED_EXTENSIONS = [".docx", ".doc"];

    if (!file) {
      return { valid: false, error: "Nenhum arquivo selecionado." };
    }

    if (file.size > MAX_SIZE) {
      return {
        valid: false,
        error: `Arquivo muito grande. Tamanho máximo: 10MB. Tamanho do arquivo: ${(file.size / 1024 / 1024).toFixed(
          2
        )}MB`,
      };
    }

    const fileName = file.name.toLowerCase();
    const hasValidExtension = ALLOWED_EXTENSIONS.some((ext) => fileName.endsWith(ext));
    if (!hasValidExtension) {
      return { valid: false, error: "Formato inválido. Use apenas arquivos .docx ou .doc" };
    }

    if (file.type && !ALLOWED_TYPES.includes(file.type)) {
      return { valid: false, error: "Tipo de arquivo inválido. Use apenas documentos Word." };
    }

    return { valid: true };
  };

  // Importar documento .docx
  const importDocx = async (file) => {
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
        text = text.replace(/\d{1,2}\s+de\s+(\w+)\s+de\s+\d{4}/g, options.data);
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
          customCabimentos={customCabimentos}
          setCustomCabimentos={setCustomCabimentos}
          savedProposals={savedProposals || []}
          onLoadProposal={loadProposal}
          onDeleteProposal={deleteProposal}
          onStartFromScratch={startFromScratch}
          onImportDocx={importDocx}
          onSaveProposal={saveProposal}
          onDownloadDocx={generateDocx}
        />
        <div className="content">
          <ProposalDocument theme={theme} options={options} services={services} customCabimentos={customCabimentos} />
        </div>
        <Modal {...modal} />
      </main>
    </div>
  );
}

export default App;
