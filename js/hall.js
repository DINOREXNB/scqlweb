var account="";
var ishidden=1;
let isFirstKeyPressed = false;
let dbname="";
let theme_id=1;
const send=document.getElementById('send');
const importfile=document.getElementById('import');
const clear=document.getElementById('clear');
const logout=document.getElementById('logout');
const history=document.getElementById('history');
const interaction=document.getElementById('interaction');
const query=document.getElementById('query');
const fileimport=document.createElement('input');
const shortinstruction=document.getElementById('shortinstruction');
const ccl=document.getElementById('ccl');
const showdb=document.getElementById('showdb')
const exportcsv=document.getElementById('exportcsv');
const help=document.getElementById('help');
const theme=document.getElementById('theme');
fileimport.type = "file";
fileimport.style.display="none";
let selectedText="";
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
            <code class="response">${account}:</code><br>
            <code>${edittext}</code><br>
            <hr>
            <div class="spinner" id="spinner"></div>
        `;
        interaction.scrollTop=interaction.scrollHeight;
        //处理请求逻辑
        if(edittext.toUpperCase().indexOf("USE ")==-1){
            submit_get(text);
        }else{
            dbname=edittext.replace(/;/g,"").replace(/use/g,"").replace(/USE/g,"").replace(/ /g,"").replace(/\n/g,"").replace(/<br>/g,"");
            document.getElementById('spinner').remove();
            interaction.innerHTML+=`
                <code class="response">SCDB:</code><code style="color: #0deb53">[Execution Complete]</code><br>
                <code>Switch to database:<b>${dbname}</b></code><br><hr>
            `;
        }
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
history.addEventListener('click',()=>{
    alert('在做了在做了（');
});
help.addEventListener('click',()=>{
    var helptext=`<code>ctrl/cmd + s:快捷指令<br>导出为csv:使用鼠标框选查询数据，点击\"导出为csv\"生成csv文件<br>选择sql文件:将提前写好的sql语句快速导入输入框<br>SCQL语法:详见<a href="https://www.secretflow.org.cn/docs/scql/latest/zh-Hans/reference/lang/manual" target="_blank" style="color: rgb(148, 156, 206);">SCQL方言指南</a></code><br><hr>`
    // alert(helptext);
    interaction.innerHTML+=helptext;
    interaction.scrollTop=interaction.scrollHeight;
});
theme.addEventListener('click',changeTheme);
async function changeTheme(){
    if(theme_id){
        theme_id=1-theme_id;
        document.body.style.backgroundColor="#dadada";
        document.body.style.color="black";
        interaction.style.backgroundColor="white";
        document.getElementById('query').style.backgroundColor="white";
        document.getElementById('query').style.color="black";
        theme.innerHTML=`<i class="fa fa-moon-o">&nbsp;theme</i>`
        document.getElementById('floatingWindow').style.color="black";
        document.getElementById('floatingWindow').style.backgroundColor="#dadada";
        localStorage.setItem("theme","1");
    }else{
        theme_id=1-theme_id;
        document.body.style.backgroundColor="#333";
        document.body.style.color="white";
        interaction.style.backgroundColor="#24292e";
        document.getElementById('query').style.backgroundColor="#24292e";
        document.getElementById('query').style.color="white";
        theme.innerHTML=`<i class="fa fa-sun-o">&nbsp;theme</i>`;
        document.getElementById('floatingWindow').style.color="white";
        document.getElementById('floatingWindow').style.backgroundColor="#333";
        localStorage.setItem("theme","0");
    }

}
ccl.addEventListener('click',()=>{
    interaction.innerHTML+=`
        <div class="spinner" id="spinner"></div>
    `;
    interaction.scrollTop=interaction.scrollHeight;
    floatingWindow.classList.add("hidden");
    ishidden=1-ishidden;
    if(dbname==""){
        document.querySelector('.spinner').remove();
        interaction.innerHTML+=`
        <code class="response">SCDB:</code><code style="color: red">[Execution Fail]</code><br>
        <code>No database is selected</code><br><hr>
    `;
    interaction.scrollTop=interaction.scrollHeight;
    }else{
        submit_get(`SHOW GRANTS ON ${dbname} FOR ${account}`);
    }
});
showdb.addEventListener('click',()=>{
    interaction.innerHTML+=`
        <div class="spinner" id="spinner"></div>
    `;
    interaction.scrollTop=interaction.scrollHeight;
    floatingWindow.classList.add("hidden");
    ishidden=1-ishidden;
    submit_get(`SHOW DATABASES;`);
})
function padWithSpaces(inputString, desiredLength) {
    if (inputString.length >= desiredLength) {
        return inputString; // 字符串长度已达到或超过目标长度，不需要补齐
    } else {
        const spacesToAdd = desiredLength - inputString.length;
        const spaces = '&nbsp;'.repeat(spacesToAdd); // 创建需要的空格
        return inputString + spaces; // 将空格添加到字符串末尾
    }
}
async function submit_get(text){
    try{
        let request={
            "account":account,
            "query":text,
            "dbname":dbname
        }
        const response=await fetch('/submit_get',{
            method:'POST',
            body:JSON.stringify(request)
        })
        const data=await response.json();
        document.getElementById('spinner').remove();
        processResponse(data)
    }catch(error){
        console.log(error);
        return null;
    }
}
function processResponse(data){
    if(data.status.code==0){
        interaction.innerHTML+=`
            <code class="response">SCDB:</code><code style="color: #0deb53">[Execution Complete]</code><br>
        `;
        if(data.warnings.length!=0){
            interaction.innerHTML+=`<code style="color:#ff5c00;">Warning:${data.warnings[0].reason}</code><br>`;
        }
        maxlength=[];
        for(var i=0;i<data.out_columns.length;i++){
            maxlength.push(0);
            for(var j=0;j<parseInt(data.out_columns[0].shape.dim[0].dim_value);j++){
                if(data.out_columns[i].string_data.length!=0){
                    maxlength[i]=Math.max(maxlength[i],data.out_columns[i].string_data[j].length);
                }
                if(data.out_columns[i].double_data.length!=0){
                    maxlength[i]=Math.max(maxlength[i],data.out_columns[i].double_data[j].toString().length);
                }
                if(data.out_columns[i].int64_data.length!=0){
                    maxlength[i]=Math.max(maxlength[i],parseInt(Math.log10(data.out_columns[i].int64_data[j]))+1);
                }
            }
        }
        for(var i=0;i<data.out_columns.length;i++){
            maxlength[i]=Math.max(maxlength[i],data.out_columns[i].name.length);
        }
        for(var j=0;j<data.out_columns.length;j++){
            var temp=padWithSpaces(data.out_columns[j].name,maxlength[j]);
            interaction.innerHTML+=`<code class="response"><b>${temp}</b></code>\t`;
        }
        interaction.innerHTML+="<br>";
        for(var i=0;i<parseInt(data.out_columns[0].shape.dim[0].dim_value);i++){
            for(var j=0;j<data.out_columns.length;j++){
                switch(data.out_columns[j].elem_type){
                    case "STRING":
                        var temp=padWithSpaces(data.out_columns[j].string_data[i],maxlength[j]);
                        interaction.innerHTML+=`<code>${temp}</code>\t`;
                        break;
                    case "FLOAT64":
                        var temp=padWithSpaces(data.out_columns[j].double_data[i].toString(),maxlength[j]);
                        interaction.innerHTML+=`<code>${temp}</code>\t`;
                        break;
                    case "INT64":
                        var temp=padWithSpaces(data.out_columns[j].int64_data[i].toString(),maxlength[j]);
                        interaction.innerHTML+=`<code>${temp}</code>\t`;
                        break;
                    default:
                        console.log("未知数据类型:",data.out_columns[j].elem_type);
                        break;
                }
            }
            interaction.innerHTML+="<br>";
            interaction.scrollTop=interaction.scrollHeight;
        }
        interaction.innerHTML+="<hr>"
    }else{
        interaction.innerHTML+=`
            <code class="response">SCDB:</code><code style="color: red">[Execution Fail]</code><br>
            <code>${data.status.message}</code><br><hr>
        `;
        interaction.scrollTop=interaction.scrollHeight;
    }
}
function getSelectedText(){
    if(window.getSelection){
        return window.getSelection().toString();
    }else if(document.selection && document.selection.type != "Control"){
        return document.selection.createRange().text;
    }else{
        return "";
    }
}
interaction.addEventListener("mouseup",()=>{
    selectedText=getSelectedText();
})
// 导出选定文本为CSV
document.getElementById("exportcsv").addEventListener("click", function() {
    if (selectedText) {
        // 将选定文本转换为CSV格式
        var csvData = selectedText.replace(/ /g,",");
        // 创建数据URL并下载CSV文件
        var csvContent = "data:text/csv;charset=utf-8," + encodeURIComponent(csvData);
        var link = document.createElement("a");
        link.setAttribute("href", csvContent);
        link.setAttribute("download", "data.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } else {
        alert("请先框选要导出的数据！");
    }
});
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
    if(localStorage.getItem("theme")!=undefined){
        theme_id=parseInt(localStorage.getItem("theme"));
        await changeTheme();
    }
};