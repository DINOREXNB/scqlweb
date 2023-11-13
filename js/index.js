const register=document.getElementById('isRegister');
document.getElementById('submitform').addEventListener('submit',()=>{
    let pubkey=document.getElementById('pubkey').value;
    if(register.checked){
        if(pubkey.trim()==""){
            alert('注册须填写公钥！');
            event.preventDefault();
        }
    }
});
register.addEventListener('input',()=>{
    if(register.checked){
        document.getElementById('pubkey').style.display="block";
    }else{
        document.getElementById('pubkey').style.display="none";
    }
});