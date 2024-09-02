const express = require('express');
const http = require('http');
const path = require('path');
const bodyParser = require('body-parser');
const {spawn} = require('child_process');
const exec = require('child_process').exec;
const querystring = require('querystring');
const ejs = require('ejs');
const jsonfile = require('jsonfile');
const varchar = require('./config/env-variables.ts');
const security = require('./config/security.ts');
const hex = require('./config/hex.ts');
require('./public/App.test.js');
require('dotenv').config();

const app = express();
let server = http.createServer(app);
const PORT = process.env.PORT || 9000;
const AppName = "XPredification";
let web = new WEB(PORT);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use('/images',express.static(path.join(__dirname,'images')));
app.use('/public',express.static(path.join(__dirname,'public')));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use((req, res, next) => {
    try{
        const url = req.originalUrl;
        const query = url.split('?')[1];
        const params = (new URL(path.join(__dirname, url))).searchParams;
        const public_key = varchar.duplex;
        if(params.has('encode')){
            if(query!=undefined){
                const decodedUrl = security.decodedURI(query.replace('encode=',''), public_key);
                req.url = `${url.split('?')[0]}?${decodedUrl}`;
                req.query = querystring.parse(decodedUrl);
            }
        }else{
            if(query!=undefined){
                const encodedUrl = security.encodedURI(query, public_key);
                req.url = `${url}?encode=${encodedUrl}`;
                req.query = querystring.parse(encodedUrl);
            }
        }
        const my_browser = security.browser(req.headers);
        if(!security.validBrowser([my_browser[0], my_browser[1].split('.')[0]*1], varchar.browser_data)){
            res.status(422).render('notfound',{error: 422, message: "Your browser is outdated and may not support certain features. Please upgrade to a modern browser."});
        }
        next();
    }catch(e){
        res.status(401).render('notfound',{error: 401, message: "Unauthorize entry not allow, check the source or report it"});
    }
});

const promises = [
    ejs.renderFile('./views/header.ejs'),
    ejs.renderFile('./views/footer.ejs'),
];

app.get('/', (req, res) => {
    res.status(200).redirect('/services');
});

app.get('/varchar', async (req, res) => {
    const navi = req.headers;
    res.status(200).json({varchar, navi, hex: {
        vaildFiles: hex.vaildFiles.toString(),
    }});
});

app.get('/services', async (req, res) => {
    productList = await web.ProductListMaker();
    Promise.all(promises).then(([header, footer]) => {
        res.status(200).render('services',{header, footer, productList});
    });
});

app.get('/services/realEstate', (req, res) => {
    Promise.all(promises).then(([header, footer]) => {
        res.status(200).render('realEstate',{header, footer});
    });
});

app.get('/services/realEstate_pricePredict', (req, res) => {
    const relatedServices = web.getRelatedServices('Diabetes').toString();
    Promise.all(promises).then(([header, footer]) => {
        res.status(200).render('realEstatePrice',{header, footer, relatedServices});
    });
});

app.post('/service/realEstate_pricePredict/process', async (req, res) => {
    if(req.query.encode!=undefined){
        res.redirect('*');
    }
    const model_name = "Real Estate Price Predicter";
    const listOfInput = req.body.data;
    let featureList = listOfInput.map(item => item);
    featureList[0] = listOfInput[0]==0?'Flat':'House';
    featureList[13] = listOfInput[13]==0?'No':'Yes';
    featureList[14] = listOfInput[14]==0?'No':'Yes';
    const meta_data = jsonfile.readFileSync('./weight/property_meta.json');
    const feature = web.featureLayout(meta_data['head'], featureList, meta_data['unit']);

    await callPythonProcess(listOfInput, 'property Price').then(price => {
        const result = web.targetLayout(['Price'],[price.value+'/-']);
        ejs.renderFile('./views/output.ejs',{model_name, feature, result}).then(layout => {
            res.status(200).json({layout});
        });
    }).catch(error => {
        console.error('Error:', error.message);
    });

});

app.get('/diabetes', (req, res) => {
    const layout = undefined;
    const relatedServices = web.getRelatedServices('Diabetes').toString();
    res.status(200).render('diabetes',{layout, relatedServices});
});

app.get('/diabetes/predict', async (req, res) => {
    if(req.query.encode!=undefined){
        res.redirect('*');
    }
    try{
        const name = req.query.name;
        const age = web.getAge(req.query.age);
        const bp = req.query.bp * 1;
        const glu = req.query.glu * 1;
        const fru = req.query.fru * 1;
        const blv = req.query.blv * 1;
        const slh = req.query.slh * 1;
        const wl = req.query.wl * 1;
        const listOfInput = [age, bp, glu, fru, blv, slh, wl];
        if(listOfInput.length > 0){
            let new_fru = fru==0?'No':'Yes';
            let new_blv = blv==0?'No':'Yes';
            let new_slh = slh==0?'No':'Yes';
            let new_wl = wl==0?'No':'Yes';
            let feature = web.featureLayout(['Blood Pressure', 'Glucose Level', 'Frequent Urination', 'Blurred Vision', 'Slow Healing', 'Weight Loss'],[bp, glu, new_fru, new_blv, new_slh, new_wl],['mmHg','mg/dL',null,null,null,null]);
            await callPythonProcess(listOfInput, 'diabetes').then(results => {
                const result = web.targetLayout(['Result'],[results.value==0?'Negative (No Diabetes Detected)':'Positive (Diabetes Detected)']);
                ejs.renderFile('./views/output.ejs',{name, age, feature, result}).then(layout => {
                    res.status(200).render('diabetes',{layout});
                });
            }).catch(error => {
                console.error('Error:', error.message);
            });
        }
    }catch(e){
        console.log(">> Something wrong to process recent request!\n");
    }
});

function WEB(port){
    this.port = port;
    this.filename = path.basename(__filename);
    this.appInfo = jsonfile.readFileSync('./public/manifest.json');
}

WEB.prototype.featureLayout = function(head, value, unit){
    return hex.featureLayout(head, value, unit);
}

WEB.prototype.targetLayout = function(head,statment){
    return hex.targetLayout(head, statment);
}

WEB.prototype.getRelatedServices = function(relationName){
    const data = web.appInfo;
    return hex.getRelatedServices(data, relationName);
}

WEB.prototype.ProductListMaker = async function(){
    const data = web.appInfo;
    return hex.productListMaker(web, data, ejs);
}

function callPythonProcess(list, functionValue){
    return new Promise((resolve, reject) => {
        const pythonProcess = spawn('python', ['./model/main.py', list, functionValue]);
        let resultData = '';
        pythonProcess.stdout.on('data', (data) => {
            resultData += data.toString();
        });
        pythonProcess.stderr.on('data', (data) => {
            console.error(`stderr: ${data}`);
        });
        pythonProcess.on('close', (code) => {
            if(code !== 0){
                console.log(`Python script exited with code ${code}`);
            }
            let result = null;
            try{
                if(typeof resultData === 'string'){
                    result = JSON.parse(resultData);
                }else{
                    result = resultData;
                }
                resolve(result);
            }catch(error){
                console.error(`Error parsing JSON: ${error.message}`);
                reject(new Error("Error parsing JSON from Python script"));
            }
        });
    });
}

app.get('*', (req, res) => {
    res.status(404).render('notfound',{error: 404, message: "Page not found on this url, check the source or report it"});
});

server.listen(PORT, (err) => {
    if(err) console.log("Oops an error occure:  "+err);
    console.log(`Compiled successfully!\n\nYou can now view \x1b[33m./${path.basename(__filename)}\x1b[0m in the browser.`);
    console.info(`\thttp://localhost:${PORT}`);
    console.log("\n\x1b[32mNode web compiled!\x1b[0m \n");
});
