import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const CHINESE_REGEX = /[\u4e00-\u9fa5]+/;

// Comprehensive Name Translations (Keep these as they might still be needed for idempotency)
const NAME_TRANSLATIONS: Record<string, string> = {
    "支付寶 (Alipay)": "Alipay",
    "微信支付 (WeChat Pay)": "WeChat Pay",
    "Payoneer (派安盈)": "Payoneer",
    "Brevo (原 Sendinblue)": "Brevo",
    "Hygraph (原 GraphCMS)": "Hygraph",
    "Phrase (原 PhraseApp)": "Phrase",
    "Dropbox Sign API (原 HelloSign)": "Dropbox Sign API",
    // ... (Previous name translations are fine, they are mostly handled)
};

// Comprehensive Description Translations - USING CURRENT DB STATE AS KEYS
const DESC_TRANSLATIONS: Record<string, string> = {
    "REST API\n\nTarget Users: Microsoft Cloud/企業Customers、Seeking高Secure與Compliance的 LLM Deploy。": "REST API\n\nTarget Users: Microsoft Cloud/Enterprise Customers, Seeking High Security and Compliance LLM Deployment.",
    "REST API\n\nTarget Users: Enterprises of all sizes、Needs與美國市場主導會計系統Integrate的Applications。": "REST API\n\nTarget Users: Enterprises of all sizes, Applications needing integration with US-dominant accounting systems.",
    "REST API, SQL Endpoints\n\nTarget Users: Data Scientists、資料工程師、Needs統一Data和 AI 工作流程的企業。": "REST API, SQL Endpoints\n\nTarget Users: Data Scientists, Data Engineers, Enterprises needing unified Data and AI workflows.",
    "REST API\n\nTarget Users: 內容量大、Needs嚴格品質控制和專業人工Translate服務的Large Enterprises。": "REST API\n\nTarget Users: Large Enterprises with high volume content needing strict quality control and professional human translation services.",
    "普及、Free (基礎版)、需 API 獲取大量原始Data。": "Popular, Free (Basic), API required for massive raw data access.",
    "REST API\n\nTarget Users: 重視Secure與長上下文、深度推理、Enterprise-grade AI 應用。": "REST API\n\nTarget Users: Enterprise AI applications prioritizing security, long context, and deep reasoning.",
    "SQL API, Snowpark SDK\n\nTarget Users: CloudData倉庫Users、Real-timeDataAnalyze、跨雲Data共享。": "SQL API, Snowpark SDK\n\nTarget Users: Cloud Data Warehouse Users, Real-time Data Analytics, Cross-cloud Data Sharing.",
    "Unified API\n\nTarget Users: 開發 SaaS 產品的公司、NeedsFastIntegrate多個後端系統。": "Unified API\n\nTarget Users: SaaS product companies needing fast integration with multiple backend systems.",
    "頂尖 AI Models、Enterprise-grade應用。": "Top-tier AI Models, Enterprise-grade Applications.",
    "REST API\n\nTarget Users: 專業Researchers、量化策略開發、Needs多樣化和特殊Data集的應用。": "REST API\n\nTarget Users: Professional Researchers, Quant Strategy Developers, Applications needing diverse and specialized datasets.",
    "全面性（KYC/KYB）、GlobalData覆蓋。": "Comprehensive (KYC/KYB), Global Data Coverage.",
    "Focuses on GraphQL 和 Content Federation，能透過單一 API Integrate多個Data源。\n\nTarget Users: 複雜的DataIntegrate、追求高效能查詢的開發Teams。": "Focuses on GraphQL and Content Federation, integrating multiple data sources via a single API.\n\nTarget Users: Dev teams with complex data integration and high-performance query needs.",
    "REST API\n\nTarget Users: Uses Microsoft 生態系統的GlobalLarge Enterprises。": "REST API\n\nTarget Users: Global Large Enterprises using the Microsoft Ecosystem.",
    "REST API\n\nTarget Users: Fintech App、Individuals理財、Payments/Transfers服務。": "REST API\n\nTarget Users: Fintech Apps, Personal Finance, Payments/Transfer Services.",
    "Focuses on 媒體檔案的Optimize、Real-timeConvert 和 Global CDN 交付。\n\nTarget Users: 任何Process大量圖片和影片的Websites/Applications (E-commerce、媒體)。": "Focuses on Media File Optimization, Real-time Conversion, and Global CDN Delivery.\n\nTarget Users: Any website/app processing large volumes of images/video (E-commerce, Media).",
    "REST API\n\nTarget Users: 播客、會議記錄、語音Customer Support、語音Search。": "REST API\n\nTarget Users: Podcasts, Meeting Transcripts, Voice Support, Voice Search.",
    "Mobile歸因領導者、高精確度。": "Mobile Attribution Leader, High Accuracy.",
    "Powerful的Mobile測量Solution。": "Powerful Mobile Measurement Solution.",
    "REST/SOAP API (SuiteTalk)\n\nTarget Users: 中Large Enterprises、NeedsIntegrate整個企業營運Data的應用。": "REST/SOAP API (SuiteTalk)\n\nTarget Users: Mid-to-Large Enterprises, Applications needing full business operation data integration.",
    "REST API\n\nTarget Users: AWS CloudUsers、大規模媒體內容Analyze。": "REST API\n\nTarget Users: AWS Cloud Users, Large-scale Media Content Analysis.",
    "REST API\n\nTarget Users: Focuses onEnterprise-grade自然語言Process (NLP)、RAG 應用。": "REST API\n\nTarget Users: Focuses on Enterprise NLP, RAG Applications.",
    "深度Integrate Google Workspace，在 Gmail 環境中Manage CRM Data。\n\nTarget Users: 重度依賴 Google 生態系統的Teams。": "Deeply integrated with Google Workspace, managing CRM data within Gmail.\n\nTarget Users: Teams heavily reliant on the Google Ecosystem.",
    "REST API\n\nTarget Users: 協助賣家在 Walmart Marketplace 上架和Manage的Solution。": "REST API\n\nTarget Users: Solutions helping sellers list and manage on Walmart Marketplace.",
    "REST API\n\nTarget Users: 創意產業、圖像/媒體內容AutomatedGenerate。": "REST API\n\nTarget Users: Creative Industries, Automated Image/Media Content Generation.",
    "REST API\n\nTarget Users: Enterprise-grade應用、Finance、房地產、高Secure和Compliance性要求。": "REST API\n\nTarget Users: Enterprise Apps, Finance, Real Estate, High Security & Compliance Requirements.",
    "REST API\n\nTarget Users: Finance、Healthcare等Needs高可信度 AI Solution的企業。": "REST API\n\nTarget Users: Finance, Healthcare, and other enterprises needing high-trust AI solutions.",
    "REST API\n\nTarget Users: DataAnalyze師、Marketers、Needs自訂儀表板和報告。": "REST API\n\nTarget Users: Data Analysts, Marketers, needing custom dashboards and reports.",
    "Modernize API、平衡Secure與Users體驗。": "Modern API, Balancing Security and User Experience.",
    "SDK & REST API\n\nTarget Users: Needs將Complete的 PDF 功能嵌入到網頁/桌面/MobileApplications的Developers。": "SDK & REST API\n\nTarget Users: Developers needing to embed complete PDF functionality into web/desktop/mobile apps.",
    "Developers友好、Scalable。": "Developer-friendly, Scalable.",
    "Data來源統一、消除Data孤島。": "Unified Data Sources, Eliminating Data Silos.",
    "與 Google Cloud 生態系統深度Integrate，Provides大規模、高性能的檔案Store。\n\nTarget Users: Google Cloud Users、NeedsIntegrate AI/ML 服務的專案。": "Deeply integrated with Google Cloud, providing large-scale, high-performance file storage.\n\nTarget Users: Google Cloud Users, Projects needing AI/ML integration.",
    "Data建模和 BI 視覺化。": "Data Modeling and BI Visualization.",
    "功能Powerful、適用於Large Enterprises的高級Analyze。": "Powerful, Advanced Analytics for Large Enterprises.",
    "速度快、Suitable for高監管行業。": "Fast, Suitable for Highly Regulated Industries.",
    "Fast響應、廣泛的證件和語言支持。": "Fast Response, Wide ID & Language Support.",
    "Focuses on聯盟Marketing、影響者和合作夥伴的績效歸因。": "Focuses on Affiliate Marketing, Influencer & Partner Performance Attribution.",
    "高度品牌控制、Flexible的工作流程編排。": "High Brand Control, Flexible Workflow Orchestration.",
    "Real-time風險評分、預防帳戶濫用。": "Real-time Risk Scoring, Preventing Account Abuse.",
    "REST API, Data Feeds\n\nTarget Users: Finance機構、Investment Banks、Needs專業FinanceData。": "REST API, Data Feeds\n\nTarget Users: Financial Institutions, Investment Banks, needing professional financial data.",
    "強調Secure性與Compliance標準。": "Emphasizes Security and Compliance Standards.",
    "在美國公共服務和Healthcare領域有特定優勢。": "Specific advantages in US Public Services and Healthcare.",
    "REST API (CLI Tool)\n\nTarget Users: 資料科學家、ML 研究者、EngageData競賽。": "REST API (CLI Tool)\n\nTarget Users: Data Scientists, ML Researchers, Competition Participants.",
    "應對隱私限制，確保Data準確性。": "Addressing privacy restrictions, ensuring data accuracy.",
    "業界領導者，完全以 API 為核心Drive，Provides高度可Scale性。\n\nTarget Users: Large Enterprises、Needs複雜Customizable。": "Industry Leader, API-First Driven, Highly Scalable.\n\nTarget Users: Large Enterprises, needing complex customization.",
    "獨特的 視覺化編輯器 (Visual Editor)，讓Marketers能像傳統 CMS 一樣預覽頁面。\n\nTarget Users: MarketingWebsites、Needs編輯體驗友善的Teams。": "Unique Visual Editor allowing marketers to preview pages like a traditional CMS.\n\nTarget Users: Marketing Websites, Teams needing a friendly editing experience.",
    "REST API\n\nTarget Users: Seeking易於Uses和Integrate的Cloud電子SignaturesSolution。": "REST API\n\nTarget Users: Seeking easy-to-use and integrated Cloud eSignature solutions.",
    "高度視覺化、可Customizable的看板式 CRM。\n\nTarget Users: 偏好視覺化工作流和FlexibleCustomizable的Teams。": "Highly Visual, Customizable Kanban CRM.\n\nTarget Users: Teams preferring visual workflows and flexible customization.",
    "Focuses onSales管道Manage，API 用於AutomatedSales活動。\n\nTarget Users: Focuses onSales流程和交易Manage的Teams。": "Focuses on Sales Pipeline Management, API for Automated Sales Activities.\n\nTarget Users: Teams focused on Sales Processes and Deal Management.",
    "Enterprise-grade、Scalable、Flexible的內容Models和Powerful的多語言Support。\n\nTarget Users: 跨國企業、多品牌Websites、E-commerce產品內容。": "Enterprise-grade, Scalable, Flexible Content Models & Powerful Multi-language Support.\n\nTarget Users: Multinational Enterprises, Multi-brand Sites, E-commerce Product Content.",
    "全能 CRM Platform，擅長Marketing與Sales的DataBi-directionalSync。\n\nTarget Users: 中型企業、Seeking高Easy to use性。": "All-in-one CRM Platform, excelling in Marketing & Sales Data Bi-directional Sync.\n\nTarget Users: Mid-sized Enterprises, Seeking High Usability.",
    "Focuses onLarge Enterprises的整體Customers體驗和高層次SalesManage。\n\nTarget Users: 頂級企業、Focuses on CX Integrate。": "Focuses on Total Customer Experience and High-level Sales Management for Large Enterprises.\n\nTarget Users: Top-tier Enterprises, Focus on CX Integration.",
    "ProvidesReal-time 360 度Customers視圖，CRM 與 ERP Data一體化。\n\nTarget Users: Needs CRM 與 ERP 深度Integrate的企業。": "Provides Real-time 360-degree Customer View, CRM & ERP Data Integration.\n\nTarget Users: Enterprises needing deep CRM & ERP Integration.",
    "Provides Powerful、Secure的檔案上傳 功能，並具備檔案Convert和Process能力。\n\nTarget Users: NeedsProcessUsers上傳、檔案Convert和Secure傳輸的 SaaS 應用。": "Provides Powerful, Secure File Uploads with Conversion and Processing Capabilities.\n\nTarget Users: SaaS Apps needing to process user uploads, file conversion, and secure transfer.",
    "Focuses on Individuals和TeamsCollaborate，Provides檔案Share、版本控制和 Webhooks Real-time通知。\n\nTarget Users: CollaborateTools、生產力 App、NeedsIntegrateUsersCloud檔案的服務。": "Focuses on Individual & Team Collaboration, providing File Sharing, Version Control, and Webhooks Real-time Notifications.\n\nTarget Users: Collaboration Tools, Productivity Apps, Services needing User Cloud File Integration.",
    "性價比高，Provides AI (Zia) 功能，API SupportFlexible。\n\nTarget Users: 價格敏感、Seeking多功能且負擔得起的Platform。": "Cost-effective, Provides AI (Zia) features, Flexible API Support.\n\nTarget Users: Price-sensitive, Seeking versatile and affordable platforms.",
    "REST API\n\nTarget Users: 追求可Scale性的中Large EnterprisesE-commerce。": "REST API\n\nTarget Users: Scalability-focused Mid-to-Large E-commerce.",
    "REST API\n\nTarget Users: Adobe 產品Uses者、Needs高信賴度和Global標準的企業。": "REST API\n\nTarget Users: Adobe Product Users, Enterprises needing High Trust and Global Standards.",
    "REST API\n\nTarget Users: Needs從 PDF Documents中Extract結構化Data和Process複雜表單的應用。": "REST API\n\nTarget Users: Applications needing to extract structured data from PDFs and process complex forms.",
    "REST API\n\nTarget Users: Needs從Data動態Generate發票、報表、合約等Documents。": "REST API\n\nTarget Users: Needing to dynamically generate Invoices, Reports, Contracts from data.",
    "REST API\n\nTarget Users: Process線上Documents表單填寫和後續Signatures流程的應用。": "REST API\n\nTarget Users: Applications processing online document form filling and subsequent signature flows.",
    "REST API\n\nTarget Users: Needs在一個 API 呼叫中串聯多個DocumentsProcess步驟的企業。": "REST API\n\nTarget Users: Enterprises needing to chain multiple document processing steps in a single API call.",
    "REST API\n\nTarget Users: Seeking結構化、標準化財務報表Data的Finance建模應用。": "REST API\n\nTarget Users: Financial Modeling Apps seeking structured, standardized financial statement data.",
    "REST API\n\nTarget Users: SeekingIntegrate eBay Sales和購買流程的Tools。": "REST API\n\nTarget Users: Tools seeking to integrate eBay Sales and Buying processes.",
    "Mobile SDKs (iOS/macOS)\n\nTarget Users: Focuses onProvides原生 Apple Platform最佳體驗的Applications。": "Mobile SDKs (iOS/macOS)\n\nTarget Users: Applications focused on providing the best native Apple platform experience.",
    "REST API\n\nTarget Users: 回溯測試 (Backtesting)、風險Analyze、NeedsReliableHistoricalData的應用。": "REST API\n\nTarget Users: Backtesting, Risk Analysis, Applications needing Reliable Historical Data.",
    "REST API\n\nTarget Users: Integrate Dropbox 生態、Seeking簡潔、Developers友好介面的應用。": "REST API\n\nTarget Users: Integrating Dropbox Ecosystem, Seeking Simple, Developer-friendly Interface Apps.",
    "Focuses onAccelerate潛在CustomersProcess和SalesCommunication。\n\nTarget Users: 追求高效Sales速度的Teams。": "Focuses on Accelerating Lead Processing and Sales Communication.\n\nTarget Users: Teams pursuing high sales velocity.",
    "REST API & WebSocket\n\nTarget Users: DataAnalyzePlatform、高頻交易、NeedsLow Latency、高Reliable性Data的應用。": "REST API & WebSocket\n\nTarget Users: Data Analytics Platforms, HFT, Applications needing Low Latency, High Reliability Data.",
    "REST API\n\nTarget Users: E-commerce、SaaS Platform、NeedsAutomatedGlobal交易稅務計算與Compliance的企業。": "REST API\n\nTarget Users: E-commerce, SaaS Platforms, Enterprises needing Automated Global Transaction Tax Calculation & Compliance.",
    "REST API\n\nTarget Users: 需將 AI Uses日誌Integrate至 eDiscovery/DLP/SIEM 系統以滿足企業Compliance要求的Customers。": "REST API\n\nTarget Users: Customers needing to integrate AI usage logs into eDiscovery/DLP/SIEM systems for enterprise compliance.",
    "REST API\n\nTarget Users: Focuses on高效能、跨職能Collaborate的軟體本地化Platform。": "REST API\n\nTarget Users: Software Localization Platform focused on High Performance and Cross-functional Collaboration.",
    "REST API, JavaScript/Mobile SDKs\n\nTarget Users: 大眾Applications、Needs極高Global覆蓋率和資料準確度的服務。": "REST API, JavaScript/Mobile SDKs\n\nTarget Users: Mass Market Apps, Services needing extremely high global coverage and data accuracy.",
    "REST API, SDKs\n\nTarget Users: 深度Integrate Microsoft 生態系統的企業、艦隊ManageSolution。": "REST API, SDKs\n\nTarget Users: Enterprises deeply integrated with Microsoft Ecosystem, Fleet Management Solutions.",
    "REST API & CLI\n\nTarget Users: FastDeploy多語言應用、Needs集中ManageTranslate資產的Teams。": "REST API & CLI\n\nTarget Users: Fast Deployment of Multi-language Apps, Teams needing Centralized Translation Asset Management.",
    "REST API (Integrate於 Stripe Payments)\n\nTarget Users: Uses Stripe 生態、Seeking一站式Payments與稅務ComplianceSolution的線上業務。": "REST API (Integrated in Stripe Payments)\n\nTarget Users: Online Businesses using Stripe Ecosystem, Seeking One-stop Payment & Tax Compliance Solution.",
    "REST API & CLI\n\nTarget Users: 軟體開發Teams、NeedsAutomated CI/CD 流程中Translate任務的企業。": "REST API & CLI\n\nTarget Users: Software Dev Teams, Enterprises needing to automate translation tasks in CI/CD pipelines.",
    "REST API\n\nTarget Users: Focuses on歐盟 TBE 服務 (電訊、廣播、電子服務) 稅務Compliance的企業。": "REST API\n\nTarget Users: Enterprises focused on EU TBE Service (Telecom, Broadcasting, Electronic) Tax Compliance.",
    "Community Data\n\nTarget Users: Seeking低成本、Open SourceSolution、Needs高度資料控制權的Developers。": "Community Data\n\nTarget Users: Developers seeking Low-cost, Open Source Solutions, needing high data control.",
    "REST API\n\nTarget Users: Focuses onOpen SourceData (如 OSM) 的商業化 API 服務，成本效益高。": "REST API\n\nTarget Users: Commercial API Services focused on Open Source Data (e.g., OSM), Cost-effective.",
    "REST API\n\nTarget Users: Seeking OpenStreetMap 或自有Data的高效能Maps渲染服務。": "REST API\n\nTarget Users: Seeking High-performance Map Rendering Services for OpenStreetMap or Proprietary Data.",
    "深度E-commerceIntegrate、Based onCustomers行為的個性化。": "Deep E-commerce Integration, Customer Behavior-based Personalization.",
    "傳輸速度快、Reliable性極高、排除促銷Email。": "Fast Transmission, Extremely High Reliability, Excluding Promotional Emails.",
    "ProvidesMarketing套件與交易 API 的平衡方案。": "Provides a balanced solution of Marketing Suite and Transactional API.",
    "REST API, SDKs\n\nTarget Users: Retail、餐飲、Needs精確Based on地理Location觸發功能的應用。": "REST API, SDKs\n\nTarget Users: Retail, Dining, Applications needing precise location-based triggers.",
    "REST API\n\nTarget Users: Focuses onRouting計算、旅行時間、可自託管的Logistics和Navigation應用。": "REST API\n\nTarget Users: Logistics and Navigation Apps focused on Route Calculation, Travel Time, Self-hostable.",
    "REST API\n\nTarget Users: Needs豐富、準確的商業地點資料和情境感知Data的應用。": "REST API\n\nTarget Users: Applications needing rich, accurate Business Location Data and Context-aware Data.",
    "REST API, SDKs\n\nTarget Users: 汽車產業、車隊Manage、NeedsPowerfulNavigation功能的應用。": "REST API, SDKs\n\nTarget Users: Automotive Industry, Fleet Management, Applications needing Powerful Navigation.",
    "Developers優先、Tools包完善、Reliable性高。": "Developer-first, Complete Toolkit, High Reliability.",
    "Modernize可觀察性Platform，ProvidesFlexible的Data查詢和操作能力。\n\nTarget Users: 採用 OpenTelemetry 標準的Teams。": "Modern Observability Platform, providing flexible data query and manipulation.\n\nTarget Users: Teams adopting OpenTelemetry standards.",
    "程式碼層級的錯誤Track領導者，Integrate Session Replay 進行視覺除錯。\n\nTarget Users: 軟體Developers、SaaS 產品Teams。": "Code-level Error Tracking Leader, integrating Session Replay for visual debugging.\n\nTarget Users: Software Developers, SaaS Product Teams.",
    "Focuses onReal-time錯誤Monitor和錯誤匯總，Provides高效率的警報Automated。\n\nTarget Users: NeedsFastIdentify並修復錯誤的開發Teams。": "Focuses on Real-time Error Monitoring and Aggregation, providing efficient alert automation.\n\nTarget Users: Dev Teams needing to fast identify and fix errors.",
    "深度Integrate整體Customers體驗和高層次SalesManage。": "Deeply integrates Total Customer Experience and High-level Sales Management.",
    "Provides高保真 Session Replay 和深度的Users行為Analyze。\n\nTarget Users: Product Managers、UX/UI Designers。": "Provides High-fidelity Session Replay and Deep User Behavior Analysis.\n\nTarget Users: Product Managers, UX/UI Designers.",
    "ProvidesReal-time 360 度Customers視圖。": "Provides Real-time 360-degree Customer View.",
    "REST API (Bi-directionalSync、Webhooks)，對SMBs友好。": "REST API (Bi-directional Sync, Webhooks), SMB Friendly.",
    "REST API，Focuses onSales流程和交易Manage。": "REST API, Focuses on Sales Process and Deal Management.",
    "REST API，內建CommunicationToolsIntegrate。": "REST API, Built-in Communication Tool Integration.",
    "REST API，與 Google 生態系統深度Integrate。": "REST API, Deeply Integrated with Google Ecosystem.",
    "全渠道 API，完善的Tickets系統。": "Omnichannel API, Complete Ticket System.",
    "多渠道 API，Integrate聊天機器人與Tickets。": "Multichannel API, Integrating Chatbots & Tickets.",
    "Developers為主的 Replay Tools，ProvidesComplete的技術除錯上下文。\n\nTarget Users: Needs重現和除錯複雜前端問題的Developers。": "Developer-centric Replay Tool, providing complete technical debugging context.\n\nTarget Users: Developers needing to reproduce and debug complex frontend issues.",
    "Unified REST API\n\nTarget Users: 企業應用、Needs高Reliable度、Real-time多CalendarSync的Scheduling服務。": "Unified REST API\n\nTarget Users: Enterprise Apps, Scheduling Services needing High Reliability, Real-time Multi-calendar Sync.",
    "REST API, Webhooks\n\nTarget Users: IntegrateBooking流程至 CRM/SalesTools、CustomizableBooking體驗。": "REST API, Webhooks\n\nTarget Users: Integrating Booking Flows into CRM/Sales Tools, Custom Booking Experiences.",
    "統一多渠道Messaging API。": "Unified Omnichannel Messaging API.",
    "JavaScript API，基礎功能Free。": "JavaScript API, Basic Features Free.",
    "AI AutomatedAnalyze，深度 APM Track。": "AI Automated Analysis, Deep APM Tracking.",
    "GraphQL API (NerdGraph)，Flexible的Data查詢。": "GraphQL API (NerdGraph), Flexible Data Querying.",
    "事件報告、DeployTrack API。": "Event Reporting, Deployment Tracking API.",
    "會話Data導出 API，高保真 Replay。": "Session Data Export API, High-fidelity Replay.",
    "網路請求/日誌/錯誤Data捕獲 API，Complete的技術上下文。": "Network Request/Log/Error Data Capture API, Complete Technical Context.",
    "核心Communication基礎設施 API，業界標準。": "Core Communication Infrastructure API, Industry Standard.",
    "SMS, Voice, Video, Verify API，Suitable for國際Communication。": "SMS, Voice, Video, Verify API, Suitable for International Communication.",
    "Chat API & SDK，高度可Scale的 UI Kit。": "Chat API & SDK, Highly Scalable UI Kit.",
    "Chat API & SDK，高性能、Low Latency。": "Chat API & SDK, High Performance, Low Latency.",
    "Focuses onE-commerce的 AI Search、產品Recommendation與MarketingAutomated。": "Focuses on E-commerce AI Search, Product Recommendations & Marketing Automation.",
    "REST API\n\nTarget Users: 跨國、多地點的服務型企業Booking。": "REST API\n\nTarget Users: Multinational, Multi-location Service Enterprise Booking.",
    "採用 Amazon.com 級別的機器學習Models。": "Uses Amazon.com-grade Machine Learning Models.",
    "ProvidesWebsites個性化、A/B 測試和Recommendation小Tools。": "Provides Website Personalization, A/B Testing, and Recommendation Widgets.",
    "Focuses on AI Recommendation系統。": "Focuses on AI Recommendation Systems.",
    "REST API\n\nTarget Users: Healthcare保健、Finance等高Compliance性需求的行業Scheduling。": "REST API\n\nTarget Users: Scheduling for Healthcare, Finance, and other High-compliance Industries.",
    "強大的Open SourceSearch和Analyze引擎。": "Powerful Open Source Search and Analytics Engine.",
    "REST API\n\nTarget Users: 服務業、健身房、沙龍等NeedsCompleteBookingManage功能的企業。": "REST API\n\nTarget Users: Service Industry, Gyms, Salons needing Complete Booking Management Features.",
    "REST, Bulk, SOAP API，行業領導者，高度可Scale。": "REST, Bulk, SOAP API, Industry Leader, Highly Scalable.",
    "Enterprise-grade AI Platform，統一Connect跨系統的Data。": "Enterprise AI Platform, Unifying Data across Systems.",
    "Tickets API，與 HubSpot CRM 緊密Integrate。": "Ticket API, Tightly Integrated with HubSpot CRM.",
    "Metrics/Logs/Traces Data攝取與Extract API，Integrate RUM/Replay。": "Metrics/Logs/Traces Data Ingestion & Extraction API, Integrating RUM/Replay.",
    "超快的Real-timeSearch體驗，高度可自定義。": "Ultra-fast Real-time Search Experience, Highly Customizable.",
    "REST API\n\nTarget Users: Needs將倉儲、包裝和發貨外包的成長中E-commerce品牌。": "REST API\n\nTarget Users: Growing E-commerce Brands needing to outsource Warehousing, Packing, and Shipping.",
    "REST API\n\nTarget Users: SeekingPowerfulLogistics後端基礎設施的E-commercePlatform或 SaaS 供應商。": "REST API\n\nTarget Users: E-commerce Platforms or SaaS Providers seeking Powerful Logistics Backend Infrastructure.",
    "SaaS Platform API\n\nTarget Users: 中小型E-commerce、Needs一站式Manage訂單和出貨流程的賣家。": "SaaS Platform API\n\nTarget Users: SMB E-commerce, Sellers needing One-stop Order & Shipping Management.",
    "Customer Support領域領導者，Provides成熟的Tickets系統和Integrate生態。\n\nTarget Users: Large Enterprises、Needs成熟、多渠道Customer SupportSolution。": "Customer Support Leader, providing Mature Ticket System and Integration Ecosystem.\n\nTarget Users: Large Enterprises, needing Mature, Omnichannel Support Solutions.",
    "REST API\n\nTarget Users: Process大宗貨物、國際Supply Chain、NeedsEnd-to-end可視化的企業。": "REST API\n\nTarget Users: Enterprises processing Bulk Cargo, International Supply Chain, needing End-to-End Visibility.",
    "REST API, Web App\n\nTarget Users: 國際E-commerce、NeedsProcess複雜海關和稅務的Cross-borderSales者。": "REST API, Web App\n\nTarget Users: International E-commerce, Cross-border Sellers needing to process complex Customs and Tax.",
    "REST API\n\nTarget Users: E-commerce、SaaS Platform、NeedsProvides品牌化Track頁面和通知的服務。": "REST API\n\nTarget Users: E-commerce, SaaS Platforms, Services needing to provide Branded Tracking Pages and Notifications.",
    "REST API\n\nTarget Users: 歐洲與國際貨運、Cross-borderE-commerce、GlobalLogistics。": "REST API\n\nTarget Users: European & International Freight, Cross-border E-commerce, Global Logistics.",
    "REST/SOAP API\n\nTarget Users: Needs深度Integrate UPS 服務、國際快遞、Supply ChainManage。": "REST/SOAP API\n\nTarget Users: Needing Deep Integration with UPS Services, International Express, Supply Chain Management.",
    "REST API, SDKs\n\nTarget Users: 專業 GIS 領域、政府、環境科學、Needs複雜MapsAnalyze的企業。": "REST API, SDKs\n\nTarget Users: Professional GIS, Government, Environmental Science, Enterprises needing Complex Map Analysis.",
    "REST API\n\nTarget Users: Cross-borderE-commercePlatform、NeedsProcess多國 VAT 註冊和申報義務的企業。": "REST API\n\nTarget Users: Cross-border E-commerce Platforms, Enterprises needing to handle Multi-country VAT Registration and Filing.",
    "REST API, SDKs\n\nTarget Users: Seeking高度視覺化客製、Scalable、Needs獨特Maps風格的應用。": "REST API, SDKs\n\nTarget Users: Seeking High Visual Customization, Scalability, Applications needing Unique Map Styles.",
    "REST API\n\nTarget Users: 中小企業、尤其在英國、澳洲、紐西蘭市場有Powerful影響力。": "REST API\n\nTarget Users: SMBs, especially with strong influence in UK, Australia, NZ markets.",
    "REST/SOAP API\n\nTarget Users: 成長型和Large Enterprises、複雜的財務報告和多實體Manage。": "REST/SOAP API\n\nTarget Users: Growing and Large Enterprises, Complex Financial Reporting and Multi-entity Management.",
    "REST API\n\nTarget Users: Seeking高度Customizable、Open Source或自託管的SchedulingSolution的Developers。": "REST API\n\nTarget Users: Developers seeking Highly Customizable, Open Source or Self-hosted Scheduling Solutions.",
    "全套 CRM 生態系統、適用於 B2B。": "Full CRM Ecosystem, Suitable for B2B.",
    "Messaging API，對話式Marketing能力強。": "Messaging API, Strong Conversational Marketing Capabilities.",
    "REST API\n\nTarget Users: Integrate Google 生態系統、Needs直接操作 Google CalendarData的應用。": "REST API\n\nTarget Users: Integrating Google Ecosystem, Applications needing direct manipulation of Google Calendar Data.",
    "REST API\n\nTarget Users: 各類Applications、聊天機器人、內容Generate、程式碼輔助。": "REST API\n\nTarget Users: Various Applications, Chatbots, Content Generation, Code Assistance.",
    "REST API, SDK, Python Library\n\nTarget Users: Enterprise-grade AI 應用、Google Cloud 生態系統Users、多模態Process。": "REST API, SDK, Python Library\n\nTarget Users: Enterprise AI Apps, Google Cloud Ecosystem Users, Multimodal Processing.",
    "成本效益高、與 AWS 生態系統深度Integrate。": "Cost-effective, Deeply Integrated with AWS Ecosystem.",
    "跨渠道Engage領導者、Powerful的Real-time區隔。": "Cross-channel Engagement Leader, Powerful Real-time Segmentation.",
    "REST, GraphQL API，性價比高。": "REST, GraphQL API, High Cost-Performance.",
    "錯誤報告、Applications上下文 API，Integrate Session Replay。": "Error Reporting, App Context API, Integrating Session Replay.",
    "Pub/Sub Real-timeData網絡 API，Low LatencyMessaging傳輸。": "Pub/Sub Real-time Data Network API, Low Latency Message Transmission.",
    "REST API\n\nTarget Users: 各規模E-commerce、Needs比較費率和Manage多個承運商的Platform。": "REST API\n\nTarget Users: E-commerce of all sizes, Platforms needing to compare rates and manage multiple carriers.",
    "解決MarketingData混亂問題，Provides標準化資料。": "Solves Marketing Data Chaos, Provides Standardized Data.",
    "REST API\n\nTarget Users: Uses Squarespace BuildWebsites的Individuals或小型企業。": "REST API\n\nTarget Users: Individuals or Small Businesses building websites with Squarespace.",
    "REST API\n\nTarget Users: 國際LogisticsTrack、Cross-borderE-commerce，尤其亞洲地區。": "REST API\n\nTarget Users: International Logistics Tracking, Cross-border E-commerce, especially in Asia.",
    "REST & GraphQL\n\nTarget Users: 品牌E-commerce、Needs高度Customizable店面或開發 App 的Developers。": "REST & GraphQL\n\nTarget Users: Brand E-commerce, Developers needing Highly Customizable Storefronts or App Development.",
    "Google Cloud 的 AI Recommendation服務。": "Google Cloud's AI Recommendation Service.",
    "REST/SOAP API\n\nTarget Users: Needs深度Integrate FedEx 服務、高貨量、Enterprise-gradeLogistics。": "REST/SOAP API\n\nTarget Users: Needing Deep Integration with FedEx Services, High Volume, Enterprise Logistics.",
    "Enterprise-grade內容Manage 和SecureCollaborate功能。\n\nTarget Users: 重視企業Secure、Compliance和工作流程的Organizations。": "Enterprise Content Management and Secure Collaboration Features.\n\nTarget Users: Organizations prioritizing Enterprise Security, Compliance, and Workflows.",
    "Integrate良好的聊天和Tickets系統，性價比高。\n\nTarget Users: Fast成長的SMBs。": "Well-integrated Chat and Ticket System, High Value.\n\nTarget Users: Fast-growing SMBs.",
    "Focuses onCustomersCommunication，對話式Marketing能力強。\n\nTarget Users: 追求主動式、對話式Customers體驗的 SaaS 公司。": "Focuses on Customer Communication, Strong Conversational Marketing.\n\nTarget Users: SaaS Companies pursuing Proactive, Conversational Customer Experiences.",
    "Open Source、自託管 (Self-hosted) 首選，ProvidesComplete的程式碼控制和Powerful的Customizable能力。\n\nTarget Users: Needs完全控制資料、Customizable後台的開發Teams。": "Open Source, Self-hosted Choice, Providing Complete Code Control and Powerful Customization.\n\nTarget Users: Dev Teams needing Full Data Control and Custom Backends.",
    "業界標準、Send量極高、極度Reliable。": "Industry Standard, Extremely High Volume, Extremely Reliable.",
    "AI DriveAutomated根因Analyze，深度 APM Track，Suitable for複雜企業環境。\n\nTarget Users: 追求高AutomatedAnalyze的企業。": "AI-Driven Automated Root Cause Analysis, Deep APM Tracking, Suitable for Complex Enterprise Environments.\n\nTarget Users: Enterprises pursuing High Automated Analysis.",
    "REST API\n\nTarget Users: 深度Integrate Microsoft 365 企業環境、Needs統一存取 M365 Data的應用。": "REST API\n\nTarget Users: Deeply Integrated Microsoft 365 Enterprise Environment, Applications needing Unified Access to M365 Data.",
    "JavaScript Library (非傳統 REST API)\n\nTarget Users: Websites前端Developers，Needs高度Customizable的瀏覽器內Calendar顯示。": "JavaScript Library (Non-traditional REST API)\n\nTarget Users: Web Frontend Developers, Needing Highly Customizable In-browser Calendar Display.",
    "REST API\n\nTarget Users: NeedsSimple、高效、大批量Process PDF 任務的應用。": "REST API\n\nTarget Users: Applications needing Simple, Efficient, High-volume PDF Task Processing.",
    "REST API\n\nTarget Users: 軟體開發商、高用量發貨者、NeedsSimplifyLogistics技術棧的公司。": "REST API\n\nTarget Users: Software Vendors, High-volume Shippers, Companies needing to Simplify Logistics Tech Stack.",
    "Web API, FIX API, TWS API\n\nTarget Users: 專業交易員、量化基金、NeedsGlobal市場和多資產類別的機構。": "Web API, FIX API, TWS API\n\nTarget Users: Professional Traders, Quant Funds, Institutions needing Global Markets and Multi-asset Classes.",
    "Unified API\n\nTarget Users: Fintech (Finance科技) 公司、貸款Platform、NeedsCustomersReal-time財務Data的應用。": "Unified API\n\nTarget Users: Fintech Companies, Lending Platforms, Applications needing Customer Real-time Financial Data.",
    "REST API & CLI\n\nTarget Users: Seeking高度Automated、Real-time交付Translate內容的Developers和Startups。": "REST API & CLI\n\nTarget Users: Developers and Startups seeking Highly Automated, Real-time Translated Content Delivery.",
    "REST API\n\nTarget Users: Needs高度Flexible性和複雜業務規則的Booking系統 (如Healthcare、顧問)。": "REST API\n\nTarget Users: Booking Systems needing High Flexibility and Complex Business Rules (e.g., Healthcare, Consultants).",
    "REST API\n\nTarget Users: 社交投資Platform、零佣金交易應用Developers。": "REST API\n\nTarget Users: Social Investment Platforms, Zero-commission Trading App Developers.",
    "REST API\n\nTarget Users: 初級Developers、學術研究、Needs廣泛Data覆蓋範圍的應用 (ProvidesFree層級)。": "REST API\n\nTarget Users: Junior Developers, Academic Research, Applications needing Wide Data Coverage (Provides Free Tier).",
    "Unified REST API\n\nTarget Users: Developers、SaaS 公司，Seeking單一 API Integrate所有主流CalendarPlatform。": "Unified REST API\n\nTarget Users: Developers, SaaS Companies, Seeking Single API to Integrate All Major Calendar Platforms.",
    "REST API & WebSocket\n\nTarget Users: Fintech Applications、機器人投顧 (Robo-advisors)、算法交易Developers。": "REST API & WebSocket\n\nTarget Users: Fintech Apps, Robo-advisors, Algo Trading Developers.",
    "REST API\n\nTarget Users: Focuses onDevelopers和投資Platform，ProvidesComplete的券商服務介面。": "REST API\n\nTarget Users: Focuses on Developers and Investment Platforms, Providing Complete Brokerage Service Interface.",
    "SageMaker API/SDK\n\nTarget Users: AWS Users、NeedsComplete的機器學習 MLOps 管道。": "SageMaker API/SDK\n\nTarget Users: AWS Users, Needing Complete ML MLOps Pipeline.",
    "REST API\n\nTarget Users: NeedsProcess PDF Documents的核心功能、依賴 Adobe 技術的應用。": "REST API\n\nTarget Users: Applications needing Core PDF Processing Features, Relying on Adobe Technology.",
    "內容即Data (Content as Data)，Provides高度可Customizable的 Sanity Studio 編輯介面和Real-timeCollaborate。\n\nTarget Users: 複雜內容結構、Applications配置、Real-time更新Websites。": "Content as Data, Providing Highly Customizable Sanity Studio Editing Interface and Real-time Collaboration.\n\nTarget Users: Complex Content Structures, App Configuration, Real-time Website Updates.",
    "Powerful的Open SourceSearch和Analyze引擎。": "Powerful Open Source Search and Analytics Engine.",
    "ProvidesLow Latency、高Reliable性的Messaging傳遞，可高度Customizable UI。\n\nTarget Users: Needs從底層構建聊天或社群功能的Developers。": "Provides Low Latency, High Reliability Messaging, Highly Customizable UI.\n\nTarget Users: Developers needing to build chat or community features from scratch."
};

async function main() {
    console.log('Applying comprehensive translations...');
    const providers = await prisma.provider.findMany();
    for (const p of providers) {
        let newName = p.name;

        // Check exact match in map
        if (NAME_TRANSLATIONS[p.name]) {
            newName = NAME_TRANSLATIONS[p.name];
        }
        // Handle "English (Chinese)" pattern
        else if (/\(.+[\u4e00-\u9fa5]+.+\)/.test(p.name)) {
            newName = p.name.replace(/\s*\(.+[\u4e00-\u9fa5]+.+\)/, '').trim();
        }

        if (newName !== p.name) {
            console.log(`[Provider] Translating "${p.name}" -> "${newName}"`);
            await prisma.provider.update({ where: { id: p.id }, data: { name: newName } });
        }
    }

    // 2. APIs
    const apis = await prisma.api.findMany();
    for (const api of apis) {
        let newName = api.name;
        let newDesc = api.description;

        // Translate Name
        if (NAME_TRANSLATIONS[api.name]) {
            newName = NAME_TRANSLATIONS[api.name];
        } else if (/\(.+[\u4e00-\u9fa5]+.+\)/.test(api.name)) {
            newName = api.name.replace(/\s*\(.+[\u4e00-\u9fa5]+.+\)/, '').trim();
        }

        // Translate Description
        if (newDesc) {
            // 1. Exact match
            if (DESC_TRANSLATIONS[newDesc]) {
                newDesc = DESC_TRANSLATIONS[newDesc];
            }
            // 2. Partial match for "Target Users" pattern if not exact match
            else if (CHINESE_REGEX.test(newDesc)) {
                // Try to find a matching key in DESC_TRANSLATIONS that is a substring? 
                // No, exact match is safer. 
                // Let's try to replace known terms if exact match failed.
                for (const [chinese, english] of Object.entries(NAME_TRANSLATIONS)) {
                    if (newDesc.includes(chinese)) {
                        newDesc = newDesc.replace(chinese, english);
                    }
                }
            }
        }

        if (newName !== api.name || newDesc !== api.description) {
            console.log(`[API] Updating "${api.name}"`);
            await prisma.api.update({
                where: { id: api.id },
                data: {
                    name: newName,
                    description: newDesc
                }
            });
        }
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
