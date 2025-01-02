# Anime-Imprimatura *漫塗* <img src="READMEimages/LOGO.png" alt="漫塗LOGO" style="height: 1em; vertical-align: middle;">

### Demo網站(http://202.5.253.153/)
### 影片宣傳(https://youtu.be/OfGPD1aC1yY)
### 影片介紹(中文 https://youtu.be/tt2whU94dNM)
### 影片介紹(English https://www.youtube.com/watch?v=w2TM-NOkEMM)

## 目錄
- [專案介紹](#專案介紹)
- [系統架構](#系統架構)
- [系統功能劃分](#系統功能劃分)
- [系統建置](#系統建置過程)
- [開發可延伸研究](#開發可延伸研究)
- [分支說明](#分支說明)
## 專案介紹
- ### 功能說明 
    Anime Imprimatura，漫塗協助 2D動畫繪師進行人物鋪色。只需上傳少量角色設計圖 (CHD) 和所需的角色線稿圖 (CHS)，便可得到根據CHD上色的角色鋪色圖 (CHSF)，大量提升人物鋪色的效率。
    - CHD Character Design 角色設計圖
    - CHS Character Sketch 角色線稿圖
    - CHSF Character Sketch Finished 角色鋪色圖

    (以上三者為此專案為方便溝通所設立之名詞。)

<table>
  <thead>
    <tr>
      <th align="center">CHD, Character Design</th>
      <th colspan="3" align="center">CHS, Character Sketch</th>
      <th colspan="3" align="center">CHSF, Character Sketch Finished</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <!-- CHD 區塊 -->
      <td align="center" style="text-align: center; vertical-align: top;">
        <img src="TESTimages/Anime003/Anime003_CHD_01.png" alt="CHD" width="200" />
        <p>CHD</p>
      </td>
      <!-- CHS 區塊 -->
      <td colspan="3" align="center" style="text-align: center; vertical-align: top;">
        <img src="TESTimages/Anime003/Anime003_CHS_01.png" alt="CHS_01" width="200" />
        <p>CHS_01</p>
        <img src="TESTimages/Anime003/Anime003_CHS_02.png" alt="CHS_02" width="200" />
        <p>CHS_02</p>
        <img src="TESTimages/Anime003/Anime003_CHS_03.png" alt="CHS_03" width="200" />
        <p>CHS_03</p>
      </td>
      <!-- CHSF 區塊 -->
      <td colspan="3" align="center" style="text-align: center; vertical-align: top;">
        <img src="TESTimages/Anime003/colored/CHSF_01_01.png" alt="CHSF_01" width="200" />
        <p>CHSF_01</p>
        <img src="TESTimages/Anime003/colored/CHSF_01_02.png" alt="CHSF_02" width="200" />
        <p>CHSF_02</p>
        <img src="TESTimages/Anime003/colored/CHSF_01_03.png" alt="CHSF_03" width="200" />
        <p>CHSF_03</p>
      </td>
    </tr>
  </tbody>
</table>

![UserIO](READMEimages/UserIO.png)
<p align="center">UserIO</p>

- ### 開發動機

    對2D動畫而言，一秒通常需要24幀圖來達到動態效果，由此就算我們不是專業的繪師，我們都可以推知鋪色所需消耗的人力成本與時間皆不算小。此外，我們亦與擔任動畫繪師的相關人士交流，驗證了我們的觀點。
    1. 繪師：可不可以減少一下我的工作量？
    2. 獨立繪師：一個人上底色就要好久，誰來幫幫我？
    3. 觀眾：新的一季動畫可不可以快一點出啊！
        
- ### 核心理念

    漫塗的核心理念有三：
    1. AI協作

        透過協助重複性質高的鋪色工作，激發繪師與AI協作上色的意願，進而帶動2D動畫產業的流程轉變。
    2. 鼓勵創作

        想藉由減少上色工作量，降低個人完成有色動畫的門檻，增加更多創意的發想。
    3. 達成共贏局面

        透過動畫製作效率與品質的雙重提升，令觀眾能看到更多更優質的動畫，產業也能流入更多的資助，使 2D 動畫產業蓬勃發展。最終觀眾、動畫公司、繪師皆得到各自所需，形成共贏局面。 
- ### 使用者歷程

    在使用途中使用者可能會有三個疑問：
    1. 輸入CHD多角度資料不夠怎麼辦？

        使用者如果只有一個角度的角色設計圖，我們使用hugging face的pipe line達到多視角擴增，增加訓練資料量與多樣性。
    2. 一堆CHS不想自己分類角色角色怎麼辦？

        我們透過自動化訓練流程，使每一位使用者只要上傳CHD便可以訓練出一個專屬的角色辨識模型，並運用此專屬模型辨識使用者所上傳CHS中那些是真正要上色的角色。
    3. 怎麼確保根據CHD為CHS 正確上色？

        我們透過Roboflow訓練一個分割辨識模型，以達到角色基礎部件的辨識與分割，再透過遮罩部分達到CHD的取色與CHS的上色。
- ### 使用者模組

    我們將功能完整三個階段，使用者可以依照自己的需求決定目前該選用哪一個模組。
1. Standard 標準流程
    執行時間最久，完整度最高，最不彈性。每次要上同一個角色的CHS時必須重新訓練一次模型。
2. Flexible 彈性流程
    執行時間中等，完整度中等，較為彈性。選用此流程前必須事前已有訓練完的「專屬辨識模型」，可依照該模型判斷CHS的角色，不須再重新訓練過模型。
3. Fast 快速流程
    執行時間最短，完整度最低，最為彈性。可隨易更換CHD與CHS，不須使用「專屬角色辨識」模型。

![Flows](READMEimages/Flows.png)
<p align="center">使用者模組流程圖</p>

## 系統功能劃分
- ### 多視角擴增
    增加不同的角度並同步進行資料擴增，由1張圖變成n張圖。
- ### RPA訓練
    再將n張圖作為放入訓練資料集，訓練出角色「專屬辨識模型」。
- ### CHS辨識
    透過「專屬辨識模型」識別使用者輸入的多張CHS中是否屬於該角色，並將確認正確的圖片與CHD一同輸出給下一階段。
- ### 部件分割辨識
    我們透過Yolov8訓練一個Segmentation Model能分割出各個部件（如：眼睛、臉、頭髮、上衣等）。
- ### CHD取色與CHS上色
    透過CHD分割出的部件建構類別與顏色字典 (顏色字典，Color Dictionary)，也從CHS分割出的部件取得類別與點位置字典(位置字典，Posiotion Dictionary)，以字典方式儲存「CHD取色」結果，再合併兩者達成「CHS上色」。最終得到完成鋪色的CHSF。

![SystemFlow](READMEimages/SystemFlow.png)
<p align="center">系統運作流程圖</p>

![SystemFlow](READMEimages/AIFunctionModule.png)
<p align="center">AI功能模組化流程圖</p>

## 系統架構
- ### 前端
    前端作為系統的使用者介面層，旨在提供直覺且具視覺吸引力的互動介面。 
    - 工具與技術：
        - 設計框架：Figma，用於線框圖繪製和使用者介面原型設計。
        - 模板引擎：PUG，簡化動態網頁的 HTML 生成。
        - 樣式設計： CSS，用於創建視覺吸引且具回應性的設計。
        - 功能實現： JavaScript，實現互動性和動態內容渲染。
- ### 後端
    後端作為系統核心，管理資料流、業務邏輯，並實現前端和 AI 功能之間的無縫整合。
    - 工具與技術：
        - 框架：Express.js 輕量且快速，用於建立可擴展的 RESTful API。
        - 環境管理：dotenv安全管理環境變數。
        - 程式語言：Node.js提供非同步、事件驅動功能以處理高併發。
- ### AI功能
    AI 容器處理計算密集型任務，包括模型訓練、預測和影像處理。 
    - 框架與函式庫：
    - Ultralytics YOLOv8：用於物件檢測和分割。
    - PyTorch：用於深度學習和模型開發。
    - OpenCV：用於影像預處理和轉換。
    - HuggingFace Transformers：用於整合其他預訓練模型。
    - Stability AI：用於生成高品質視覺效果和影像相關任務。
    - 框架： Python、Flask：用於建立AI微服務。
- ### 系統架構說明

1. 雲端基礎設施：系統運行於台灣杉高速計算服務 (TWCC) 。
2. 作業系統:系統運託管於Linux環境 (Ubuntu)。 
3. 容器化：Docker通過將前端、後端和AI組件隔離到獨立容器來確模組化。 
4. 資料收集與訓練：使用Midjourney和Roboflow準備影像和資料進行模型訓練。 
5. 資料處理：MongoDB Atlas安全儲存所有持久性資料。 
6. 前端：前端通過API呼叫與後端通訊，使用 PUG 模板配合 CSS 和JavaScript呈現使用者介面。 
7. 後端：使用Express.js和Python管理API端點、認證和資料庫訊。 
8. AI功能：託管的AI模型處理影像，再使用PyTorch和OpenCV等函式庫執行上色和顏色擷取，並將結果回傳給後端。

![SstemFlow](READMEimages/SystemFrame.png)
<p align="center">系統架構圖</p>

## 系統建置過程
1. ### 下載release分支
    ```bash
    git clone --branch release --single-branch https://github.com/ThanatosJun/Anime-Imprimatura.git
    ```
2. ### 安裝所需環境
    - #### Node.js環境
    ```bash
    npm install
    ```
    - #### Python環境
    ```
    pip install -r requirements.txt
    ```
3. ### 環境變數更改
    開啟.env檔案
    - #### 變更MongoDB Atlas資料庫連結
        - 建立帳號
        - 依據資料庫格式建立資料庫
        - 更換資料庫連接
            ```
            MONGO_URI=
            ```
    - #### 變更JWT驗證金鑰
        - 隨意設置
        ```
        JWT_SECRET=
        ```
4. ### 開啟 Node.js Server
```Javascript
node app.js
```
5. ### 開啟 Flask Server
```Python
python AI_Function/test.py
```
6. ### 開啟網頁與使用系統

## 開發可延伸研究
1. 多視角擴增
    此專案使用的模型zero123對於2D動畫角色的角度生成並不佳，因此會極大影響訓練出的專屬辨識模型的效能。或許Adobe的Project Turntable便可大大提升多視角的不足，藉此滿足訓練資料的缺失。
2. 部件分割辨識模型替換
    原有嘗試運用Meta的SAM模型，雖說其能辨識出許多細微的封閉區塊，但難以分別不同的遮罩屬於哪個部位，另外運行此模型需要的算力也較本專案使用Roboflow訓練而出的模型大，故最後使用自行訓練的分割辨識模型。但是此專案無法分割出特殊的部件與細緻的封閉區塊，對畫風不同的圖像也難以分割、辨識，僅能判斷最基礎的15個部件。
    部件類別：Arm, Ear, Eye, Eyebrow, Face, Foot, Hair, Hand, Leg, Lower_clothes, Neck, Open_mouth, Shoe, Stock, Upper_clothes	
3. 取色、上色流程的替換
    目前透過遮罩取色構成class dictionary[class, color]與posion dictionary[class, position]，再藉由floodfill的方式上色。雖然此法只要遮罩的位置正確便可取到顏色相對應的平均顏色，但無法擷取漸層色，因此只可作為平鋪使用。上色部分則需要線段密閉，如若線段不密閉，則容易造成溢色。
## 分支說明
- ### main
集合全部features以利整合與說明
- ### release
整理完成的本機系統
- ### feature/sketch-and-rpa-training
轉線稿與自動化訓練
- ### feature/segmentation
部件分割與辨識
- ### feature/colors
部件取色與上色
- ### feature/web
網站前端建置