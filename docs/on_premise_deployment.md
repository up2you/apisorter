# On-Premise Deployment Guide (地端部署分析)

若您計畫將 API Sorter 系統部署在自己的地端環境 (On-Premise)，以下是針對硬體、軟體及外部服務的完整分析。

## 1. 硬體需求 (Hardware Requirements)

既然是地端部署，我們建議使用 **Docker** 容器化架構，這樣可以最輕鬆地管理所有服務。

### 建議規格 (單機部署)
這台機器將運行 Next.js 應用、PostgreSQL 資料庫、Meilisearch 搜尋引擎以及爬蟲任務。

| 元件 | 建議規格 | 說明 |
| :--- | :--- | :--- |
| **電腦數量** | **1 台** | 對於目前的規模，一台高效能主機綽綽有餘。 |
| **CPU** | **4 核心以上** | 建議 Intel Core i5 (10代後) 或 AMD Ryzen 5 以上。爬蟲與搜尋引擎較吃 CPU。 |
| **RAM** | **16 GB** (最低) | 建議 **32 GB**。PostgreSQL + Meilisearch + Node.js 爬蟲同時運行會佔用不少記憶體。 |
| **硬碟** | **512 GB SSD** | 建議使用 **NVMe SSD**。資料庫讀寫與圖片快取需要高速 I/O。 |
| **網路** | **1 Gbps** | 穩定的網路連接，特別是爬蟲需要頻繁訪問外部網站。 |

### 進階選項：本地 AI 模型
如果您希望將 AI 部分 (目前使用 OpenAI) 也完全地端化 (例如跑 Llama 3)：
*   **GPU**: 必須加裝 **NVIDIA RTX 3060 (12GB VRAM)** 或更高等級顯卡。
*   **RAM**: 建議升級至 **64 GB**。

---

## 2. 軟體架構 (Software Architecture)

在地端環境，我們需要用開源軟體替代原本的雲端服務 (SaaS)。

| 雲端服務 (目前) | 地端替代方案 (Docker) | 說明 |
| :--- | :--- | :--- |
| **Vercel** (Hosting) | **Docker + Nginx** | 使用 Docker Compose 運行 Next.js App，前段用 Nginx 做反向代理。 |
| **Supabase** (DB) | **PostgreSQL** | 自建標準 PostgreSQL 資料庫。 |
| **Meilisearch Cloud** | **Meilisearch** | 自建 Meilisearch 實例 (官方提供 Docker Image)。 |
| **Cloudinary** (Images) | **MinIO** | 自建 S3 相容的物件儲存系統，或直接存於本機檔案系統 (需修改程式碼支援)。 |
| **Upstash** (Redis) | **Redis** | 自建 Redis 用於快取與 Queue。 |

---

## 3. 外部服務與費用 (External Services)

即使是地端部署，某些功能仍建議或必須依賴外部服務：

### A. 必須購買/申請
1.  **網域名稱 (Domain Name)**
    *   **費用**: 約 $10 - $15 USD / 年。
    *   **用途**: 讓使用者透過 `apisorter.com` 訪問您的主機。
2.  **固定 IP (Static IP)**
    *   **費用**: 依 ISP (如中華電信) 費率而定。
    *   **用途**: 確保您的伺服器 IP 不會變動，方便 DNS 解析。

### B. 必須使用外部 API (無法自建)
1.  **Lemon Squeezy (支付金流)**
    *   **費用**: 無月費，每筆交易抽成 (約 5% + 50¢)。
    *   **原因**: 處理信用卡、稅務與發票極其複雜，**強烈不建議自建**。

### C. 建議使用外部服務 (可自建但不推薦)
1.  **Email 服務 (SMTP)**
    *   **建議**: 使用 **Resend** (免費額度大) 或 **Amazon SES**。
    *   **自建困難點**: 自建 Mail Server 極易被 Gmail/Outlook 擋信 (進垃圾郵件)，維護 IP 信譽很麻煩。
2.  **AI 模型 (OpenAI)**
    *   **建議**: 繼續使用 **OpenAI API**。
    *   **自建困難點**: 需要購買昂貴顯卡，且電費與維護成本可能高於 API 費用。

---

## 4. 總結成本預估

### 初期一次性成本 (硬體)
*   **主機**: 約 NT$ 20,000 - 30,000 (自組 PC 或入門 Server)。
*   **UPS 不斷電系統**: 約 NT$ 3,000 (建議購買，避免斷電資料損毀)。

### 每月營運成本
*   **電費**: 依 24h 運作計算。
*   **網路費**: 家用/商用光纖費用。
*   **網域**: ~NT$ 30 / 月 (攤提)。
*   **OpenAI API**: 依用量 (目前用量低，可能 < $5 USD)。
*   **Lemon Squeezy**: 依收入抽成 (無收入則免費)。

**結論**: 
只要準備一台 **i5 / 32GB RAM / 512GB SSD** 的電腦，安裝 **Ubuntu Linux** 與 **Docker**，即可完整運作此系統。唯一強烈建議不要自建的是 **支付** 與 **Email** 發送功能。
