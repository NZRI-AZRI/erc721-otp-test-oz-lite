// ページ読み込み時に実行したい処理
window.onload = function authCheck(){

    if(sessionStorage.getItem('authResult')  > 0 ){
        console.log('AuthResult "true"');
        console.log(sessionStorage.getItem('authResult') );
        console.log(sessionStorage.getItem('myAccount') );

    }else{
        location.href="./ban/index.htm";//アクセス禁止措置
    }
    
}
//phpを使いアクセス遮断をしても良いハズ。