import React, { useState, useMemo } from "react";
import { Clipboard, Settings, FileText } from "lucide-react";

// Paleta de Cores - APENAS TEMA CLARO
const colors = {
  background: "#fef6e4",
  headline: "#001858",
  paragraph: "#172c66",
  button: "#f582ae",
  buttonText: "#001858",
  stroke: "#001858",
  main: "#f3d2c1",
  highlight: "#fef6e4",
  secondary: "#8bd3dd",
  tertiary: "#f582ae",
  docBg: "#ffffff",
  docText: "#000000",
  sidebarBg: "#ffffff",
  sidebarBorder: "#e0e0e0",
  tableBorder: "#000000",
  tableHeaderBg: "#f0f0f0",
};

// Serviços disponíveis
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

// Textos completos dos serviços
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

const logoUrl = "/logo-cavalcante-reis.png";

// Cabeçalho
const Header = () => (
  <header className="p-4 flex justify-between items-center bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-20 h-16">
    <div className="flex items-center gap-2">
      <FileText size={28} className="text-blue-900" />
      <h1 className="text-2xl font-bold" style={{ color: colors.headline }}>
        Gerador de Propostas
      </h1>
    </div>
  </header>
);

// Barra Lateral
const ControlsSidebar = ({ options, setOptions, services, setServices }) => {
  const handleServiceChange = (serviceName) => {
    setServices((prev) => ({ ...prev, [serviceName]: !prev[serviceName] }));
  };

  const handleOptionChange = (e) => {
    const { name, value } = e.target;
    setOptions((prev) => ({ ...prev, [name]: value }));
  };

  const toggleAllServices = (isOn) => {
    setServices((prev) => {
      const newState = { ...prev };
      Object.keys(newState).forEach((key) => {
        newState[key] = isOn;
      });
      return newState;
    });
  };

  return (
    <aside
      style={{
        backgroundColor: colors.sidebarBg,
        borderColor: colors.sidebarBorder,
      }}
      className="w-full lg:w-96 p-6 border-r lg:border-r-0 lg:border-b h-auto lg:h-full overflow-y-auto">
      <div className="flex items-center gap-3 mb-6">
        <Settings size={24} style={{ color: colors.headline }} />
        <h2 className="text-2xl font-bold" style={{ color: colors.headline }}>
          Personalizar Proposta
        </h2>
      </div>

      <div className="mb-6">
        <label htmlFor="municipio" className="block text-sm font-medium mb-1" style={{ color: colors.paragraph }}>
          Município Destinatário (Ex: Jaicós - PI)
        </label>
        <input
          type="text"
          id="municipio"
          name="municipio"
          value={options.municipio}
          onChange={handleOptionChange}
          className="w-full p-2 border rounded-md"
          style={{
            backgroundColor: colors.docBg,
            color: colors.docText,
            borderColor: colors.sidebarBorder,
          }}
        />
      </div>
      <div className="mb-6">
        <label htmlFor="data" className="block text-sm font-medium mb-1" style={{ color: colors.paragraph }}>
          Data da Proposta (Ex: 07 de outubro de 2025)
        </label>
        <input
          type="text"
          id="data"
          name="data"
          value={options.data}
          onChange={handleOptionChange}
          className="w-full p-2 border rounded-md"
          style={{
            backgroundColor: colors.docBg,
            color: colors.docText,
            borderColor: colors.sidebarBorder,
          }}
        />
      </div>

      <hr className="my-6" style={{ borderColor: colors.sidebarBorder }} />

      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold" style={{ color: colors.headline }}>
          Serviços (Seções da Proposta)
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => toggleAllServices(true)}
            className="text-xs p-1 px-2 rounded hover:opacity-80"
            style={{ backgroundColor: colors.main, color: colors.headline }}>
            Todos
          </button>
          <button
            onClick={() => toggleAllServices(false)}
            className="text-xs p-1 px-2 rounded hover:opacity-80"
            style={{ backgroundColor: colors.sidebarBorder, color: colors.paragraph }}>
            Nenhum
          </button>
        </div>
      </div>
      <div className="space-y-3">
        {Object.entries(allServices).map(([key, name]) => (
          <label key={key} className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={services[key]}
              onChange={() => handleServiceChange(key)}
              className="h-5 w-5 rounded border-gray-300"
              style={{ accentColor: colors.button }}
            />
            <span style={{ color: colors.paragraph }} className="select-none">
              {name}
            </span>
          </label>
        ))}
      </div>
    </aside>
  );
};

// Botão de Copiar
const CopyButton = ({ textToCopy }) => {
  const [copyHint, setCopyHint] = useState("Copiar Texto da Proposta");

  const handleCopy = () => {
    try {
      const htmlToCopy = textToCopy;
      const tempContainer = document.createElement("div");

      tempContainer.style.fontFamily = '"EB Garamond", Garamond, serif';
      tempContainer.style.fontSize = "13px";
      tempContainer.style.lineHeight = "1.5";
      tempContainer.innerHTML = htmlToCopy;

      tempContainer.style.position = "fixed";
      tempContainer.style.left = "-9999px";
      document.body.appendChild(tempContainer);

      const range = document.createRange();
      range.selectNodeContents(tempContainer);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);

      let success = false;
      try {
        success = document.execCommand("copy");
      } catch (err) {
        console.error("Falha ao usar document.execCommand:", err);
      }

      selection.removeAllRanges();
      document.body.removeChild(tempContainer);

      if (success) {
        setCopyHint("HTML Copiado! Cole no Word.");
        setTimeout(() => {
          setCopyHint("Copiar Texto da Proposta");
        }, 3000);
      } else {
        setCopyHint("Erro ao copiar!");
        setTimeout(() => {
          setCopyHint("Copiar Texto da Proposta");
        }, 3000);
      }
    } catch (err) {
      console.error("Erro geral na função de cópia: ", err);
      setCopyHint("Erro!");
      setTimeout(() => {
        setCopyHint("Copiar Texto da Proposta");
      }, 3000);
    }
  };

  return (
    <button
      onClick={handleCopy}
      style={{
        backgroundColor: colors.button,
        color: colors.buttonText,
      }}
      className="fixed bottom-6 right-6 z-20 flex items-center gap-2 px-6 py-3 rounded-full font-bold shadow-lg transform transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-600">
      <Clipboard size={20} />
      {copyHint}
    </button>
  );
};

// Documento de Proposta
const ProposalDocument = ({ options, services }) => {
  const generatedHtml = useMemo(() => {
    const renderService = (serviceKey, title, content) => {
      if (!services[serviceKey]) return "";
      return `
            <h3 class="font-bold text-lg mt-6 mb-2">${title}</h3>
            <div class="space-y-3 proposal-section-content">${content}</div>
        `;
    };

    const renderTableObjetosRow = (serviceKey, tese, cabimento) => {
      if (!services[serviceKey]) return "";
      return `
        <tr style="border-bottom: 1px solid ${colors.tableBorder};">
          <td class="p-3 align-top" style="border-right: 1px solid ${colors.tableBorder};">${tese}</td>
          <td class="p-3 align-top">${cabimento}</td>
        </tr>
      `;
    };

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

    return `
      <div class="proposal-header text-center mb-10">
         <img
            src="${logoUrl}"
            alt="Logo Cavalcante Reis Advogados"
            class="mx-auto h-24 object-contain"
          />
      </div>

       <div class="mb-10 space-y-2">
        <p><strong>Proponente:</strong> Cavalcante Reis Advogados</p>
        <p><strong>Destinatário:</strong> Prefeitura Municipal de ${options.municipio || "[Nome do Município]"}</p>
      </div>

      <div class="mb-10">
        <h2 class="text-2xl font-bold pb-2 mb-4" style="border-bottom: 2px solid ${colors.tableBorder};">Sumário</h2>
        <ul class="list-decimal list-inside space-y-1">
          <li>Objeto da Proposta</li>
          <li>Análise da Questão</li>
          <li>Dos Honorários, das Condições de Pagamento e Despesas</li>
          <li>Prazo e Cronograma de Execução dos Serviços</li>
          <li>Experiência e Equipe Responsável</li>
          <li>Disposições Finais</li>
        </ul>
      </div>

      <div class="mb-10 proposal-section">
        <h2 class="text-2xl font-bold pb-2 mb-4" style="border-bottom: 2px solid ${
          colors.tableBorder
        };">1. Objeto da Proposta</h2>
        <p class="mb-4">
          É objeto do presente contrato o desenvolvimento de serviços advocatícios
          especializados por parte da Proponente, Cavalcante Reis Advogados, ao Aceitante,
          Município de ${
            options.municipio || "[Nome do Município]"
          }, a fim de prestação de serviços de assessoria técnica e jurídica
          nas áreas de Direito Público, Tributário, Econômico, Financeiro, Minerário e
          Previdenciário, atuando perante o Ministério da Fazenda e os seus órgãos
          administrativos, em especial para alcançar o incremento de receitas, ficando
          responsável pelo ajuizamento, acompanhamento e eventuais intervenções de terceiro
          em ações de interesse do Município.
        </p>
        <p class="mb-4">A proposta inclui os seguintes objetos:</p>

        <table class="w-full mb-4" style="border-collapse: collapse; border: 1px solid ${colors.tableBorder};">
          <thead>
            <tr class="text-left font-bold" style="background-color: ${
              colors.tableHeaderBg
            }; border-bottom: 2px solid ${colors.tableBorder};">
              <th class="p-3" style="border-right: 1px solid ${colors.tableBorder};">TESE</th>
              <th class="p-3">CABIMENTO / PERSPECTIVA</th>
            </tr>
          </thead>
          <tbody>
            ${renderTableObjetosRow(
              "folhaPagamento",
              "Folha de pagamento, recuperação de verbas indenizatórias e contribuições previdenciárias (INSS)",
              "A perspectiva de incremento/recuperação é de aproximadamente o valor referente a até duas folhas de pagamento mensais."
            )}
            ${renderTableObjetosRow("pasep", "Recuperação/ compensação PASEP", "Cabível")}
            ${renderTableObjetosRow(
              "rpps",
              "RPPS Regime Próprio de Previdência Social",
              "Estimativa de R$ 1.101.342,00 (Exemplo)"
            )}
            ${renderTableObjetosRow(
              "impostoRenda",
              "Recuperação/Compensação de Imposto de Renda",
              "Estimativa de R$ 10.287.064,25 (Exemplo)"
            )}
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
            ${renderTableObjetosRow(
              "fundef",
              "FUNDEF - Atuação no feito 0062536-08.2016.4.01.3400 para agilizar a tramitação.",
              "Cabível"
            )}
            ${renderTableObjetosRow(
              "fundeb",
              "Recuperação dos valores repassado à menor pela União Federal a título de FUNDEB.",
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

        <p class="mb-4">
          Também é objeto do presente contrato o desenvolvimento de serviços de natureza
          jurídica por parte da Proponente, consistentes na análise e coleta dos documentos
          fornecidos pela municipalidade que irão gerar subsídios para os pleitos do incremento
          de receita; ingresso de medida administrativa e/ou judicial, com posterior
          acompanhamento do processo durante sua tramitação, com prestação de informações
          periódicas sobre o andamento dos feitos.
        </p>
      </div>

      <div class="mb-10 proposal-section">
        <h2 class="text-2xl font-bold pb-2 mb-4" style="border-bottom: 2px solid ${
          colors.tableBorder
        };">2. Análise da Questão</h2>

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

      <div class="mb-10 proposal-section">
         <h2 class="text-2xl font-bold pb-2 mb-4" style="border-bottom: 2px solid ${
           colors.tableBorder
         };">3. Dos Honorários, das Condições de Pagamento e Despesas</h2>
        <p>Os valores levantados a título de incremento são provisórios, baseados em informações preliminares, podendo, ao final, representar valores a maior ou a menor.</p>
        <p class="mt-4">Considerando a necessidade de manutenção do equilíbrio econômico-financeiro do contrato administrativo, propõe o escritório CAVALCANTE REIS ADVOGADOS que esta Municipalidade pague ao Proponente da seguinte forma:</p>
        <ul class="list-disc list-inside space-y-2 mt-4 ml-4">
          <li><strong>3.1.1</strong> Para todos os demais itens descritos nesta Proposta será efetuado o pagamento de honorários advocatícios à CAVALCANTE REIS ADVOGADOS pela execução dos serviços de recuperação de créditos, <strong>ad êxito</strong> na ordem de R$ 0,12 (doze centavos) para cada R$ 1,00 (um real) do montante referente ao incremento financeiro auferido pelo Município, seja por via administrativa ou judicial, quando do efetivo ingresso dos valores nas contas do Município.</li>
          <li><strong>3.1.2</strong> Em caso de valores retroativos recuperados em favor da municipalidade, o pagamento dos honorários advocatícios também serão cobrados na ordem de R$ 0,12 (doze centavos) para cada R$ 1.00 (um real) e serão pagos quando da expedição do Precatório ou RPV, ou ainda, quando da efetiva compensação dos valores.</li>
          <li><strong>3.1.3</strong> Sendo um contrato <strong>AD EXITUM</strong>, a CONTRATADA só receberá os honorários advocatícios quando do êxito da demanda, ou seja, quando o Município receber os valores pleiteados.</li>
        </ul>
      </div>

      <div class="mb-10 proposal-section">
         <h2 class="text-2xl font-bold pb-2 mb-4" style="border-bottom: 2px solid ${
           colors.tableBorder
         };">4. Prazo e Cronograma de Execução dos Serviços</h2>
        <p>O prazo de execução será de 24 (vinte e quatro) meses ou pelo tempo que perdurar os processos judiciais, podendo ser prorrogado por interesse das partes, com base no art. 107 da Lei n.º 14.133/21.</p>
      </div>

      <div class="mb-10 proposal-section">
         <h2 class="text-2xl font-bold pb-2 mb-4" style="border-bottom: 2px solid ${
           colors.tableBorder
         };">5. Experiência em atuação em favor de Municípios e da Equipe Responsável</h2>
        <p>No portfólio de serviços executados e/ou em execução, constam diversos Municípios contratantes.</p>
        <p class="mt-4">Para coordenar os trabalhos de consultoria propostos neste documento, a CAVALCANTE REIS ADVOGADOS alocará os seguintes profissionais:</p>
        <p class="mt-4"><strong>IURI DO LAGO NOGUEIRA CAVALCANTE REIS</strong> - Doutorando em Direito pela UNIVERSIDADE AUTÔNOMA DE LISBOA – UAL, Mestre em Direito Constitucional pelo INSTITUTO BRASILEIRO DE ENSINO, DESENVOLVIMENTO E PESQUISA – IDP, inscrito na OAB/DF sob o n.º 33.876.</p>
        <p class="mt-2"><strong>PEDRO AFONSO FIGUEIREDO DE SOUZA</strong> - Graduado em Direito pelo Centro Universitário de Brasília - CEUB, inscrito na OAB/DF sob o n.º 56.771.</p>
        <p class="mt-2"><strong>GABRIEL DE CARVALHO BOMFIM</strong> - Graduado em Direito pelo Centro Universitário de Brasília - CEUB, inscrito na OAB/DF sob o n.º 60.301.</p>
      </div>

      <div class="mb-10 proposal-section">
         <h2 class="text-2xl font-bold pb-2 mb-4" style="border-bottom: 2px solid ${
           colors.tableBorder
         };">6. Disposições Finais</h2>
        <p>Nesse sentido, ficamos no aguardo da manifestação deste Município para promover os ajustes contratuais que entenderem necessários...</p>
        <p class="mt-4">A presente proposta tem validade de 60 (sessenta) dias.</p>
        <p class="mt-4">Sendo o que se apresenta para o momento, aguardamos posicionamento da parte de V. Exa., colocando-nos, desde já, à inteira disposição para dirimir quaisquer dúvidas eventualmente existentes.</p>

        <div class="mt-10 pt-10 text-center space-y-1" style="border-top: 1px solid ${colors.tableBorder};">
          <p>Brasília-DF, ${options.data || "[Data da Proposta]"}.</p>
          <p class="mt-6 font-bold">Atenciosamente,</p>
          <p class="mt-4 font-bold">CAVALCANTE REIS ADVOGADOS</p>
        </div>
      </div>
    `;
  }, [options, services]);

  return (
    <div
      id="proposal-preview-container"
      className="rounded-lg shadow-lg overflow-hidden max-w-4xl mx-auto"
      style={{
        backgroundColor: colors.docBg,
        color: colors.docText,
        fontFamily: '"EB Garamond", Garamond, serif',
        fontSize: "13px",
        lineHeight: "1.5",
      }}>
      <div
        id="proposal-content"
        className="p-12 md:p-16 lg:p-20 bg-transparent"
        dangerouslySetInnerHTML={{ __html: generatedHtml }}
      />
    </div>
  );
};

// App Principal
export default function App() {
  const [options, setOptions] = useState({
    municipio: "Jaicós - PI",
    data: "28 de outubro de 2025",
  });
  const [services, setServices] = useState(
    Object.keys(allServices).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {})
  );

  const proposalHtmlForCopy = useMemo(() => {
    const contentEl = document.querySelector("#proposal-content");
    return contentEl ? contentEl.innerHTML : "";
  }, [options, services]);

  return (
    <>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,700;1,400&display=swap');
          html, body { height: 100%; overflow: hidden; }
          #root { height: 100%; display: flex; flex-direction: column; }
          .app-container { flex: 1; overflow: hidden; }
          main { height: 100%; display: flex; overflow: hidden; }
          .main-content-area { flex: 1; overflow-y: auto; padding: 2.5rem; }
          .sidebar-area { width: 24rem; flex-shrink: 0; overflow-y: auto; height: 100%; }
          @media (max-width: 1023px) {
            html, body { height: auto; overflow: auto; }
            #root { height: auto; }
            .app-container { overflow: visible; }
            main { height: auto; flex-direction: column; overflow: visible; }
            .main-content-area, .sidebar-area { width: 100%; overflow-y: visible; height: auto; max-height: none; }
            .main-content-area { padding: 1.5rem; }
          }
          #proposal-content p { margin-bottom: 0.8rem; }
          #proposal-content h2 { margin-top: 2rem; margin-bottom: 0.75rem; padding-bottom: 0.5rem; }
          #proposal-content h3 { margin-top: 1.75rem; margin-bottom: 0.5rem; }
          #proposal-content ul, #proposal-content ol { margin-left: 1.5rem; margin-bottom: 1rem; }
          #proposal-content table { margin-top: 1rem; margin-bottom: 1rem; width: 100%; }
          #proposal-content th, #proposal-content td { padding: 0.75rem; text-align: left; vertical-align: top; }
        `}
      </style>

      <div
        id="app-root-div"
        style={{
          backgroundColor: colors.background,
          color: colors.paragraph,
        }}
        className="flex flex-col h-screen transition-colors duration-300">
        <Header />

        <div className="app-container">
          <main>
            <div
              className="sidebar-area border-r lg:border-r-0 lg:border-b"
              style={{ borderColor: colors.sidebarBorder }}>
              <ControlsSidebar
                options={options}
                setOptions={setOptions}
                services={services}
                setServices={setServices}
              />
            </div>

            <div className="main-content-area" style={{ backgroundColor: colors.background }}>
              <ProposalDocument options={options} services={services} />
            </div>
          </main>
        </div>

        <CopyButton textToCopy={proposalHtmlForCopy} />
      </div>
    </>
  );
}
