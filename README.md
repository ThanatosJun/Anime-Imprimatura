# Anime-Imprimatura *漫塗* <img src="READMEimages/LOGO.png" alt="漫塗LOGO" style="height: 1em; vertical-align: middle;">
## 目錄
- [專案介紹](#專案介紹)
- [系統架構](#系統架構)
- [系統功能劃分](#系統功能劃分)
- [系統建置](#系統建置過程)
- [開發可延伸研究](#開發可延伸研究)
## 專案介紹
- **功能說明**  
    Anime Imprimatura，漫塗是一個幫助2D動畫繪師上人物底色的系統。
    - CHD 角色設計圖
    - CHS 角色線稿圖
    - CHSF 角色鋪色圖
    (以上三者為此專案為方便溝通所設立之名詞。)
![UserIO](READMEimages/UserIO.png)
<p align="center">UserIO</p>
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
        <p>CHS01</p>
        <img src="TESTimages/Anime003/Anime003_CHS_02.png" alt="CHS_02" width="200" />
        <p>CHS02</p>
        <img src="TESTimages/Anime003/Anime003_CHS_03.png" alt="CHS_03" width="200" />
        <p>CHS03</p>
      </td>
      <!-- CHSF 區塊 -->
      <td colspan="3" align="center" style="text-align: center; vertical-align: top;">
        <img src="TESTimages/Anime003/colored/CHSF_01_01.png" alt="CHSF_01" width="200" />
        <p>CHSF01</p>
        <img src="TESTimages/Anime003/colored/CHSF_01_02.png" alt="CHSF_02" width="200" />
        <p>CHSF02</p>
        <img src="TESTimages/Anime003/colored/CHSF_01_03.png" alt="CHSF_03" width="200" />
        <p>CHSF03</p>
      </td>
    </tr>
  </tbody>
</table>

- **開發動機**

    對2D動畫而言，一秒通常需要24幀圖來達到動態效果，由此就算我們不是專業的繪師，我們都可以推知鋪色所需消耗的人力成本與時間皆不算小。此外，我們亦與擔任動畫繪師的相關人士交流，驗證了我們的觀點。
    1. 繪師
        可不可以減少一下我的工作量？
    2. 獨立繪師
        一個人上底色就要好久，誰來幫幫我？
    3. 觀眾：新的一季動畫可不可以快一點出啊！
        
- **核心理念**

    漫塗的核心理念有三：
    1. AI協作

        透過協助重複性質高的鋪色工作，激發繪師與AI協作上色的意願，進而帶動2D動畫產業的流程轉變。
    2. 鼓勵創作

        想藉由減少上色工作量，降低個人完成有色動畫的門檻，增加更多創意的發想。
    3. 達成共贏局面

        透過動畫製作效率與品質的雙重提升，令觀眾能看到更多更優質的動畫，產業也能流入更多的資助，使 2D 動畫產業蓬勃發展。最終觀眾、動畫公司、繪師皆得到各自所需，形成共贏局面。 
- **使用者歷程**

    在使用途中使用者可能會有三個疑問：
    1. 輸入CHD多角度資料不夠怎麼辦？

        使用者如果只有一個角度的角色設計圖，我們使用hugging face的pipe line達到多視角擴增，增加訓練資料量與多樣性。
    2. 一堆CHS不想自己分類角色角色怎麼辦？

        我們透過自動化訓練流程，使每一位使用者只要上傳CHD便可以訓練出一個專屬的角色辨識模型，並運用此專屬模型辨識使用者所上傳CHS中那些是真正要上色的角色。
    3. 怎麼確保根據CHD為CHS 正確上色？
    
        我們透過Robotflow訓練一個分割辨識模型，以達到角色基礎部件的辨識與分割，再透過遮罩部分達到CHD的取色與CHS的上色。
## 系統功能劃分
## 系統架構
- **前端**
- **後端**
- **資料庫**

## 系統建置過程
## 開發可延伸研究