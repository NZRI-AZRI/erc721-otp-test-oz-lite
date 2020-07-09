
// ブロックチェーンにデプロイしたスマートコントラクトのアドレス
const geneContractAddress = "0x300bEDdBf16F121F7A8D8572cA83b4ec6aA483F1";
const authContractAddress = "0x1Ed13902e42592f8a3631793D39B74e48aA6D558";
//0x5e0218b0402578921a4bf200a5b4e67bd90cbc48<<<---これは難があるので使わない。いわゆる書き損じコントラクト。

//宣言
let myAccount;
let web3;

let geneInstance; // instance
let authInstance; // instance

var qrcode1;//QR code instance
var qrcodeCount1 = 0;
var qrcode2;//totp QR code instance
var qrcodeCount2 = 0;
var qrcode3;
var qrcodeCount3 = 0;

sessionStorage.setItem('authResult', 0 );//セッションストレージ初期化
sessionStorage.setItem('myAccount', 0 );

var now = new Date();

function copyPopUp(){
	window.alert("コピーしました");
}

//otpコードのクリップボードコピー関数 
window.clipBoardWrite = async (docIdText) => {

	let id = docIdText;
	let otp = document.getElementById(id).innerText;
	await navigator.clipboard.writeText(otp);
	copyPopUp();
}


//init　web3 初期化
async function initApp() {
  myAccount = (await web3.eth.getAccounts())[0];
  
  geneInstance = new web3.eth.Contract(abigene, geneContractAddress);
  authInstance = new web3.eth.Contract(abiauth, authContractAddress);

  //contract nameを表示。
	let result11 =  await geneInstance.methods.name().call();
	document.getElementById("contractname").innerText = result11 + '-' + geneContractAddress;
}


//getYourOTP   Only Owner can cahnge all OTP. 
window.getOtp = async () => {

  //Nft Id 取得
  let nftIdGetOtp = document.getElementById("nftidtoknowotp1").value;
  if (!nftIdGetOtp){
    return window.alert("nftid is empty")
  }
  document.getElementById("nftid1").innerText = nftIdGetOtp;

  //オーナー指示型OTP取得
  //ABIに記載の関数をコール。引数はtokenId   getConstOtp(uint256 tokenid) call returns bytes32
  let resOtp = await geneInstance.methods.getConstOtp(nftIdGetOtp).call({from: myAccount});

  document.getElementById("showGetYourOTP1").innerText = resOtp;
  document.getElementById("youraddress11").innerText = myAccount;

  //contract name , contract address
  let conName =  await geneInstance.methods.name().call();
  document.getElementById("contractname").innerText = conName;
  document.getElementById("contractAdr").innerText = geneContractAddress;
  //アクセスしているネットワークの情報
  let netId  =  await web3.eth.net.getId() ;
  document.getElementById("netid").innerText = netId;

  //otp取得時のブロック番号取得
  let bn1  =  await web3.eth.getBlockNumber() ;
  document.getElementById("netBn").innerText =  bn1;
  console.log(bn1);

  //playing card data
  let idToPlayingCard =  await geneInstance.methods.idToPlayingCard(nftIdGetOtp).call({from: myAccount});
  console.log(idToPlayingCard);
  console.log("suits",idToPlayingCard.cardSuits);
  console.log("Number",idToPlayingCard.cardNumber);


	//QR code に埋め込みできるアクセス者ロケーション情報
	//QR code otp
	let el = document.getElementById('qrcode1');
	let text1 = myAccount+'-'+nftIdGetOtp+'-'+resOtp; //アドレス-トークンID-OTPの順にQRコードに書き出し。 '-'は区切り文字。
	console.log(text1);
	
	if (qrcodeCount1 < 1){
		qrcode1 = new QRCode(el, text1);	
	}else if (qrcodeCount1 >= 1){
		qrcode1.makeCode(text1); // make another code.
	}
	qrcodeCount1 = qrcodeCount1 + 1 ;
	document.getElementById("qrcode1time").innerText = 'QRコードを表示しました。' ;	
	console.log(qrcodeCount1);
  
};


//Auth your OTP  
window.authOtp = async () => {

  let nftid2auth = document.getElementById("nftid2auth1").value;
  if (!nftid2auth){
    return window.alert("nftid is empty")
  }
  let otp2auth = document.getElementById("otp2auth1").value;
  if (!otp2auth){
    return window.alert("otp is empty")
  }
  
  let authResult = false ;

  authResult =  await authInstance.methods.authConstOtp(myAccount, nftid2auth, otp2auth).call({from: myAccount});
  console.log('auth Result is ', authResult);

  document.getElementById("showAuthResult1").innerText = authResult;

	//入り口のページに既にコンテンツデータがロードされてしまうので、ページ遷移機能を実装。
	if (authResult == true) {
		//セッション記録
		//sessionStorage.getItem('key') 取得
		//sessionStorage.setItem('key', 'value');
		//trueフラグを保存。遷移先のページがあるとき、そこで使う。
		sessionStorage.setItem('authResult', 1 );
		sessionStorage.setItem('myAccount', myAccount );

		//ページ遷移
		window.location.href = '../data/contents.html'; 
		//window.open('./contents.html', '_blank');
		return false;	
	}

};


//Get your TOTP 7number
window.getTotp7num = async () => {
	let nftidtoknowotp = document.getElementById("nftidtoknowotp3").value;
  
	if (!nftidtoknowotp){
	  return window.alert("nftid is empty")
	}
	document.getElementById("nftid3").innerText = nftidtoknowotp;
  
	//ABIに記載のtotp関数をコール。引数はtokenId   getYourOTP(uint256 tokenid) call returns bytes32
	//getYourTotp7Num(id)　もしくは　getYourTotp7NumRn(id)　が利用可能
	let result2 = await geneInstance.methods.getTotpRn7Num(nftidtoknowotp).call({from: myAccount});
	//totp取得時のブロック番号取得
	let bn  =  await web3.eth.getBlockNumber() ;
	//アクセスしているネットワークの情報
	let netId  =  await web3.eth.net.getId() ;
	//UNIXベース年月日・時刻を取得
	let nowUnixTime = now.toLocaleString();

	document.getElementById("showGetYourOTP3").innerText = result2;
	document.getElementById("youraddress13").innerText = myAccount;
  
	//contract name
	let result11 =  await geneInstance.methods.name().call();
	document.getElementById("contractname3").innerText = result11 + '-' + geneContractAddress;

	//QR code totp   text2はアドレス-トークンID-OTPの順にQRコードに書き出し。 '-'は区切り文字。
	//ETHアドレス、tokenId、totpOtpCode、ブロックナンバー、現在のブロック時間、台帳ネットワークID、ユーザーIPアドレス
	let el = document.getElementById('qrcode3');
	let text2 = myAccount + '-' + nftidtoknowotp + '-' + result2 + '-'+ bn +'-' + netId + '-' + nowUnixTime ; 
	console.log(text2);
	document.getElementById("qrcode3time").innerText = 'QRコードを表示しました。' + bn ;
	if (qrcodeCount3 < 1){
		qrcode3 = new QRCode(el, text2);	
	}else if (qrcodeCount3 >= 1){
		qrcode3.makeCode(text2); // make another code.
	}
	qrcodeCount3 = qrcodeCount3 + 1 ;
}


//Auth your TOTP 7number  
window.authTotp7num = async () => {
	let nftid2auth = document.getElementById("nftid2auth3").value;
	if (!nftid2auth){
	  return window.alert("nftid is empty")
	}
	let otp2auth = document.getElementById("otp2auth3").value;
	if (!otp2auth){
	  return window.alert("otp is empty")
	}
	let authResult = false ;
	authResult =  await authInstance.methods.authTotpRn7Num(myAccount, nftid2auth, otp2auth).call({from: myAccount});
	console.log('auth Result is ', authResult);
	document.getElementById("showAuthResult3").innerText = authResult;
	if (authResult == true) {
		//セッション記録trueフラグを保存。遷移先のページがあるとき、そこで使う。
		sessionStorage.setItem('authResult', 1 );
		sessionStorage.setItem('myAccount', myAccount );
		//ページ遷移
		window.location.href = '../data/contents.html'; 
		return false;	
	}
}


//Auto login  TOTP 7number  
window.autoLoginBy7num = async () => {

	let nftid = document.getElementById("nftidtoknowotp4").value;
  
	if (!nftid){
	  return window.alert("nftid is empty")
	}
	let otp7num = await geneInstance.methods.getTotpRn7Num(nftid).call({from: myAccount});

	let authResult = false ;

	authResult =  await authInstance.methods.authTotpRn7Num(myAccount, nftid, otp7num).call({from: myAccount});
	console.log('auth Result is ', authResult);

	if (authResult == true) {
		//セッション記録trueフラグを保存。遷移先のページがあるとき、そこで使う。
		sessionStorage.setItem('authResult', 1 );
		sessionStorage.setItem('myAccount', myAccount );
		//ページ遷移
		window.location.href = '../data/contents.html'; 
		return false;	
	}
}




window.addEventListener('load', async function() {
// web3 がブラウザのアドオンなどから提供されているかチェック。(MetaMask)
	if (typeof window.ethereum !== 'undefined' || (typeof window.web3 !== 'undefined')) {
	// MetaMask の provider を使う
	let provider = window['ethereum'] || window.web3.currentProvider;
	await provider.enable();

	web3 = new Web3(provider);
	} else {
	// ユーザが web3 を持っていないケースのハンドリング。 
	console.log('METAMASK NOT DETECTED');
	
	//portis
	const portis = new Portis("34cdf51c-dc40-4193-96e7-55b56a25e565", "rinkeby");
	web3 = new Web3(portis.provider);
	console.log('Portis will be start');
	}

	// アプリを初期化して起動
	initApp();
});





/*
//------------------------------------------------
//Author
//1.Code by NZRI.
//2020-07-9
//------------------------------------------------
*/

/*
//動作環境 2020-7-9 by nzri
＜PC＞
win10-chrome-Metamask
win10-FireFox-Metamask
(win10-Brave-BraveMetamask)
win10-Edge-portis (おそらく opera,safariもPortisを使えば動作すると推測される) 

Linux(Lubuntu)-FireFox-Metamask
(Mac PC についてはportis がつかえる見込み。)

＜スマートフォン＞
Andoroid-9-Metamask_app
Andoroid-9-Firefox_app-Metamask
Andoroid-9-opera-opera_Built_In_Wallet
*/


/*
	//code 参考元
    <!-- web3 js -->
    <script src="https://cdn.jsdelivr.net/gh/ethereum/web3.js/dist/web3.min.js"></script>

    <!--portis -->
    <script
    src="https://cdn.jsdelivr.net/npm/@portis/web3@2.0.0-beta.54/umd/index.js"
    integrity="sha256-pPwrJF/X2v9erIHBoY3ZWb4P/cRx3j3/zyvQvycabs0="
    crossorigin="anonymous"></script>

    <!--QR code write -->
    <script type="text/javascript" src="./public/qrcode.min.js"></script>
    
    <script
    src="https://code.jquery.com/jquery-3.5.0.min.js"
    integrity="sha256-xNzN2a4ltkB44Mc/Jz3pT4iU1cmeR0FkXs4pru/JxaQ="
    crossorigin="anonymous"></script>


<p>―免責事項―</p>
<p>※当サイトはワンタイムパスワードのテストページです。</p>
<p>【重要】パスワード認証後ログイン先のページには何もありません。またこのパスワード認証結果に対応する現実世界でのサービスはありません。</p>
<p>※当サイトはお客様の閲覧履歴等を保存していません。</p>
<p>ただし、IPアドレスもしくはセッションIDとイーサリアムアドレスは何らかの形で取得し情報処理を行うことがあります。</p>
<p>これは秘密鍵漏洩があるとき、同一秘密鍵の異なる環境からのアクセスを検知するためです。（コンテンツへの不正アクセス防止のためです。）</p>
<p>当サイトはweb3.jsを利用しています。イーサリアムのRinkebyにアクセス出来るようにしてください。</p>
<!--利用している技術やモジュールのMITライセンス表記-->

<p>―利用したテクノロジー及びライセンス表記―</p>
<p>Ethereumネットワークを使用。(OpenSorceLicense)  </p>
<p>ERC721コードのベース部分はopen-zeppelin-contract(MIT License)を使用。 </p>
<p>web3.js(GPL3 License) をイーサリアムアクセスに利用。</p>
<p>メタマスクがない場合、Portis API（MIT License https://www.portis.io/（MIT License ））が使用可能。</p>
<p>qrcode.js（MIT License　https://davidshimjs.github.io/qrcodejs/）を使用。 </p>
<p>jquery.jsを使用。 </p>


<!--footer-->
<footer>Author NZRI (https://github.com/NZRI-AZRI)</footer>


*/
//THANKS! 
