var account="";
var ishidden=1;
let isFirstKeyPressed = false;
const send=document.getElementById('send');
const importfile=document.getElementById('import');
const clear=document.getElementById('clear');
const logout=document.getElementById('logout');
const history=document.getElementById('history');
const interaction=document.getElementById('interaction');
const query=document.getElementById('query');
const fileimport=document.createElement('input');
const shortinstruction=document.getElementById('shortinstruction');
fileimport.type = "file";
fileimport.style.display="none";
let shortcut_instruction=[
    document.getElementById('q0').addEventListener('click',()=>{query.value+=document.getElementById('q0').innerText}),
    document.getElementById('q1').addEventListener('click',()=>{query.value+=document.getElementById('q1').innerText}),
    document.getElementById('q2').addEventListener('click',()=>{query.value+=document.getElementById('q2').innerText}),
];
async function getAccount(){
    try{
        const response=await fetch('/getAccount',{
            method:'POST',
            headers:{
                'Content-Type': 'application/json'
            }
        });
        const data=await response.json();
        account=data.account;
        if(account=="forbidden"){
            alert("请重新登录");
            window.location.href="/";
        }
    }catch(error){
        console.log(error);
        return null;
    }
}
send.addEventListener('click',async()=>{
    if(query.value!=""){
        let text=query.value;
        edittext = text.replace(/\n/g, "<br>");
        query.value="";
        interaction.innerHTML+=`
            <code style="color: yellow;">${account}:</code><br>
            <code>${edittext}</code><br>
        `;
        interaction.scrollTop=interaction.scrollHeight;
        //处理请求逻辑
        submit_get(text);
        let res=`
            <code style="color: yellow;">SCDB:</code>
            <code>+----------+
            | Database |
            +----------+
            | demo&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;|
            +----------+
            </code>
        `
        interaction.innerHTML+=res.replace(/\n/g, "<br>");
        interaction.scrollTop=interaction.scrollHeight;
    }
});
logout.addEventListener('click',async()=>{
    if(confirm("确认返回登录界面？")){
        await fetch("/logout",{
            method:'GET'
        })
        .then(response=>{
            if (!response.ok) {
                throw new Error(`Request failed with status: ${response.status}`);
            }
        })
        .catch(error => {
            console.error('Request error:', error);
        });
        window.location.href="/"
    }
});
importfile.addEventListener('click',()=>{
    fileimport.click();
});
fileimport.addEventListener('change',()=>{
    const selectedFile = fileimport.files[0]; 
    if (selectedFile) {
        const reader = new FileReader();
        reader.onload = function(event) {
            query.value += event.target.result;
        };
        reader.readAsText(selectedFile);
    }
});
shortinstruction.addEventListener('click',()=>{
    if(ishidden){
        floatingWindow.classList.remove("hidden");
        ishidden=1-ishidden;
    }else{
        floatingWindow.classList.add("hidden");
        ishidden=1-ishidden;
    }
});
clear.addEventListener('click',()=>{
    if(confirm("确认清空历史内容？")){
       interaction.innerHTML="";
    }
});
async function submit_get(text){
    try{
        let request={
            "account":account,
            "query":text
        }
        const response=await fetch('/submit_get',{
            method:'POST',
            body:JSON.stringify(request)
        })
        const data=await response.json();
        console.log(body);
    }catch(error){
        console.log(error);
        return null;
    }
}
//快捷指令
document.addEventListener("keydown", function(event) {
    const isMac = /Mac|iPod|iPhone|iPad/.test(navigator.platform);
    if (isMac && event.metaKey && event.key === 'Meta') {
        isFirstKeyPressed = true;
    } else if (!isMac && event.ctrlKey && event.key === 'Control') {
        isFirstKeyPressed = true;
    } else if (isFirstKeyPressed && event.key === 's') {
        event.preventDefault();
        if(ishidden){
            floatingWindow.classList.remove("hidden");
        }else{
            floatingWindow.classList.add("hidden");
        }
        ishidden=1-ishidden;
        isFirstKeyPressed = false;
    } else if(isFirstKeyPressed && event.key === 'Enter'){
        event.preventDefault();
        send.click();
        isFirstKeyPressed = false;
    } else {
        isFirstKeyPressed = false;
    }
});
document.getElementById('closeFloatingWindow').addEventListener('click',()=>{
    floatingWindow.classList.add("hidden");
    ishidden=1-ishidden;
});
window.onload=async ()=>{
    await getAccount(); 
};