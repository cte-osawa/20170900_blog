/*
保存形式はPNG、JPEG、GIFの３種類。
サイズは４種類。
一度、ファイルを全て開いてから処理を実行。
ファイル名は xxx@0,5x.jpeg のようになる仕様。
プログレスバーの最大値は100。進捗は100 / 総処理数 で計算。
*/
MAIN: { //ラベル
    /*////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    入力ダイアログ表示
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////*/
    var flag = false; //フラグの初期化
    while (flag == false) {
        var myDialog = new Window('dialog', '書き出し設定', [830, 480, 1090, 680]); //見出し
        myDialog.center();
        myDialog.staticText = myDialog.add("statictext", [10, 5, 275, 25], "保存するファイル形式を選択してください。"); //固定テキスト
        myDialog.dropDownList = myDialog.add("dropdownlist", [10, 30, 250, 50], ["PNG", "JPEG", "GIF"]); //ドロップダウンリスト
        myDialog.dropDownList.selection = 0; //デフォルトで一番上のものを選択
        myDialog.staticText = myDialog.add("statictext", [10, 55, 275, 75], "数値を入力してください。"); //固定テキスト
        myDialog.editText01 = myDialog.add("edittext", [40, 80, 100, 35], "1"); //入力欄1
        myDialog.editText02 = myDialog.add("edittext", [40, 100, 100, 35], "0.5"); //入力欄2
        myDialog.editText03 = myDialog.add("edittext", [40, 120, 100, 35], "0.75"); //入力欄3
        myDialog.editText04 = myDialog.add("edittext", [40, 140, 100, 35], "0.25"); //入力欄4
        myDialog.okBtn = myDialog.add("button", [135, 170, 220, 35], "OK!", {
            name: "ok"
        }); //OKボタン
        myDialog.cancelBtn = myDialog.add("button", [50, 170, 135, 35], "キャンセル!", {
            name: "cancel"
        }); //キャンセルボタン

        var bottomFlag = myDialog.show(); //ダイアログを表示し、OK、キャンセルボタンの結果を取得
        var flag = true;
        if (bottomFlag == 2) { //キャンセルの場合処理を抜ける
            alert("処理を中断します。");
            break MAIN;
        }

        if (isNaN(myDialog.editText01.text) == true || isNaN(myDialog.editText02.text) == true || isNaN(myDialog.editText03.text) == true || isNaN(myDialog.editText04.text) == true) { //数値以外が入力されたら繰り返す　※入力値はstringになる
            var flag = false;
            alert("整数、または小数を入力してください。");
        }
    }
    var textResult01 = myDialog.editText01.text, //入力された解像度の数値を変数に格納
        textResult02 = myDialog.editText02.text,
        textResult03 = myDialog.editText03.text,
        textResult04 = myDialog.editText04.text;

    var array = [textResult01, textResult02, textResult03, textResult04]; //配列に追加
    var textArray = []; //空欄以外を格納する配列を準備
    for (var k = 0, arrayLength = array.length; k < arrayLength; k++) {
        if (array[k] != "") {
            textArray.push(array[k]); //空欄以外の入力値を配列に追加
        }
    }
    var preFolder = Folder.selectDialog("処理するフォルダを選択してください");
    if (!preFolder) {
        alert("処理を中断します。");
        break MAIN; //キャンセルの場合処理を抜ける
    }
    var afterFolder = Folder.selectDialog("保存するフォルダを選択してください");
    if (!afterFolder) {
        alert("処理を中断します。");
        break MAIN; //キャンセルの場合処理を抜ける
    }
    var preFiles = new Array;
    var preFiles = preFolder.getFiles(); //処理前のフォルダから全てのファイルを取得

    for (var i = 0, preFilesLength = preFiles.length; i < preFilesLength; i++) { //一度全てのファイルを開ききる
        open(preFiles[i]);
    }
    /*////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    リサイズと保存処理
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////*/
    //▼プログレッシブバー表示
    var myProDialog = new Window('palette', '処理中...', [800, 480, 1200, 560]);
    myProDialog.center();
    myProDialog.myProgressBar = myProDialog.add("progressbar", [10, 30, 394, 45], 0, 100);
    myProDialog.show();

    //▼処理
    for (var j = 0, preFilesLength = preFiles.length; j < preFilesLength; j++) { //開いてから処理を開始する
        var doc = app.activeDocument; //ドキュメント
        var fileName = doc.name; //ファイル名
        var fileName = fileName.split("."); //ファイル名を小数点で分割
        //var docPath = activeDocument.path; //ディレクトリ
        var docWidth = activeDocument.width.value; //横幅
        var docHeight = activeDocument.height.value; //高さ

        for (var l = 0, textArrayLength = textArray.length; l < textArrayLength; l++) {

            /////////////////　↓　ここに追加したい処理を書く /////////////////

            ////////////////////////////////////////////////////////////////////////////////////

            doc.resizeImage(docWidth * textArray[l], docHeight * textArray[l]); //指定された数値でリサイズ
            if (textArray[l] != 1) {
                var fileObj = new File(afterFolder + "/" + fileName[0] + "@" + dot2Com(textArray[l]) + "x"); // 1以外のファイル名の処理
            } else {
                var fileObj = new File(afterFolder + "/" + fileName[0]); // 1の場合のファイル名の処理
            }

            var n = myDialog.dropDownList.selection; //ドロップダウンリストで選ばれた保存形式を関数に格納

            //▼保存
            switch (n + 0) {
                case 0:
                    pngOutput(); //PNG保存
                    break;
                case 1:
                    jpegOutput(); //JPEG保存
                    break;
                case 2:
                    gifOutput(); //GIF保存
                    break;
            }

            //▼プログレッシブバーの値
            var processLength = preFilesLength * textArrayLength; //総処理画像数
            myProDialog.myProgressBar.value += 100 / processLength;

            //▼復帰
            var desc = new ActionDescriptor();
            var revert = charIDToTypeID('Rvrt');
            app.executeAction(revert, desc, DialogModes.NO);
        }
        //▼保存しないで閉じる
        activeDocument.close(SaveOptions.DONOTSAVECHANGES);
    }
    //▼プログレスバーを閉じる
    myProDialog.close();

    alert("処理が終わりました");
}

/*////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
関数定義
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////*/
//▼PNG保存関数
function pngOutput() {
    var pngOption = new PNGSaveOptions();
    //pngOption.embedColorProfile=false;//効かない
    pngOption.compression = 9; //圧縮：最小/低速
    pngOption.interlaced = false; //インターレース：なし
    activeDocument.saveAs(fileObj, pngOption, true, Extension.LOWERCASE); //保存内容、保存オプション、複製保存
}

//▼JPEG保存関数
function jpegOutput() {
    var jpegOption = new JPEGSaveOptions();
    jpegOption.embedColorProfile = false; //カラープロファイルを含めない
    jpegOption.formatOptions = FormatOptions.PROGRESSIVE; //形式オプション：プログレッシブ
    jpegOption.scans = 3; //スキャン：3
    jpegOption.quality = 12; //画質：最高（低圧縮率）
    activeDocument.saveAs(fileObj, jpegOption, true, Extension.LOWERCASE); //保存内容、保存オプション、複製保存
}

//▼GIF保存関数
function gifOutput() {
    var gifOption = new GIFSaveOptions();
    gifOption.palette = Palette.LOCALSELECTIVE; //パレット：ローカル(特定)
    gifOption.colors = 256; //表示色：256
    gifOption.forced = ForcedColors.BLACKWHITE; //強制：白黒
    gifOption.transparency = true; //透明
    gifOption.dither = Dither.NONE; //オプション：ディザなし
    activeDocument.saveAs(fileObj, gifOption, true, Extension.LOWERCASE); //保存内容、保存オプション、複製保存
}

//▼小数点をカンマに変換する関数
function dot2Com(textResult) {
    if (textResult.length > 1) {
        var textResult = textResult.split(".");
        var textResult = textResult[0] + "," + textResult[1]; //小数ならば小数点をカンマに変換
    } else {
        var textResult = textResult; //整数ならばそのまま
    }
    return textResult;
}
