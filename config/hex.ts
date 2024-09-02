module.exports = {
    pyerrorscanner: function pyerrorscanner(data){
        if((data*1) - (data*1) == 0){
            return true;
        }else{
            return false;
        }
    },
    pyerrorinfo: function pyerrorinfo(error_log, code){
        let message = '';
        for(let i=0; i<error_log.length; i++){
            if(error_log[i].code == code){
                message = error_log[i].desc;
            }
        }
        return {code, message};
    },
    vaildFiles: (fi, max, min)=>{
        if(fi.files.length > 0){
            for(let i = 0; i <= fi.files.length - 1; i++){
                const fsize = fi.files.item(i).size;
                const file = Math.round((fsize / 1024));
                if(file >= max){
                    return "File too Big, please select a file less than 4mb";
                }else if(file < min){
                    return "File too small, please select a file greater than 2mb";
                }else{
                    return file;
                }
            }
        }
    },
    productListMaker: async function productListMaker(web, data, ejs){
        const productLib = [];
        data['Related-service'].forEach(service => {
            productLib.push(service);
        });
        let productList='';
        let new_productLib = await this.productSwapper(productLib);
        for(let i=0; i<new_productLib.length; i++){
            productList += await this.productCardMaker(i,new_productLib, ejs);
        }
        return productList;
    },
    productSwapper: function productSwapper(productLib){
        for(let i=0; i<productLib.length; i++){
            let id = Math.floor(Math.random()*productLib.length);
            let a = productLib[i];
            productLib[i] = productLib[id];
            productLib[id] = a;
        }
        return productLib;
    },
    productCardMaker: async function productCardMaker(id, productLib, ejs){
        if(id<=productLib.length && id>=0){
            let card = productLib[id].valueOf();
            let name = card.name, desc = card.desc, link = card.link, img = card.img=='#'?'../images/shape2.gif':card.img;
            const layout = await ejs.renderFile('./views/card.ejs',{name, desc, img, link});
            return (layout.toString());
        }else{
            return null;
        }
    },
    getRelatedServices: function getRelatedServices(data, relationName){
        const relatedServices = [];
        data['Related-service'].forEach(services => {
            if(services.related.includes(relationName)){
                relatedServices.push(services);
            }
        });
        let layout='';
        for(let i=0; i<relatedServices.length; i++){
            layout += `<li onclick="route('${relatedServices[i].link}');" title="${relatedServices[i].name}">${relatedServices[i].name}</li>`;
        }
        return layout;
    },
    featureLayout: function featureLayout(head, value, unit){
        try{
            let heading = '';
            let input = '';
            for(let i=0; i<head.length; i++){
                if(i==0){
                    heading += '<p>';
                    input += '<p>';
                }
                heading += `<span>${head[i]}: </span><br>`;
                input += `${value[i]} ${unit[i]==null?'':unit[i]}<br>`;
                if(i==head.length-1){
                    heading += '</p>';
                    input += '</p>';
                }
            }
            let layout = heading + input;
            return layout;
        }catch(e){
            return null;
        }
    },
    targetLayout: function targetLayout(head,statment){
        let layout='';
        for(let i=0; i<head.length; i++){
            if(i==0){
                layout += '<p class="wd-lg">';
            }
            layout += `<span>${head[i]}: </span> ${statment[i]}<br>`;
            if(i==head.length-1){
                layout += '</p>';
            }
        }
        return layout.toString();
    },
    foo:() => {
        return 0;
    }
};