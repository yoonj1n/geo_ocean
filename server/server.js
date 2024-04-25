const express = require('express');
const app = express();
const fs = require('fs');
const util = require('util');
const path = require('path');

const readdir = util.promisify(fs.readdir);
const readFile = util.promisify(fs.readFile);

app.listen(7002,()=>{
    console.log('server is running on port 7002')
})

// map folder
app.use('/api/map',express.static(path.join(__dirname ,'../Data/MAP')))

// data folder
app.use('/api/data',express.static(path.join(__dirname , '../Data/MODEL')))

/************** API ***************/
// get Map Json
app.get('/api/mapList',async (req,res)=>{
    // get map list
    const mapDirectory = path.join(__dirname ,'../Data/MAP/crop');
    const mapFiles = await readdir(mapDirectory);
    
    // Read and parse JSON files asynchronously
    const mapJson = await Promise.all(
        mapFiles
          .filter((map) => map.endsWith('.json'))
          .map(async (map) => {
            const mapPath = path.join(mapDirectory, map);
            const jsonContent = await readFile(mapPath, 'utf8');
            return JSON.parse(jsonContent);
          })
      );
  
      res.json({ result: mapJson });
})

// get txt 검증결과
app.get('/api/result/:data/:where',(req,res)=>{
    const data = req.params.data
    const where = req.params.where
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
    
    const dataDirectory = '/Volumes/GSRB02/GNOMS-V/Data/TIMESERIES/LAST'

    let rawData;

    if(data === 'chl'){
        rawData = fs.readFileSync('/Volumes/GSRB02/GNOMS-V/Data/TIMESERIES/LAST/result/chl/ust21_chl_a_skill_score.txt','utf8');
    }else{
        rawData = fs.readFileSync(path.join(dataDirectory,'result',data,`${where}_skill_score.txt`),'utf8');
    }
    
    const lines = rawData.trim().split('\n');
    const result_data = [];

    let currentData = {};

    lines.forEach((line,idx) => {
    const [key, value] = line.split(' : ');

    if (idx === 0){
        currentData['date'] = 'total';
    }
    if (key === 'R' && value.includes('years_')||key === 'R' && value.includes('month_')) {
        
        currentData['date'] = value.includes('month_')? months[parseInt(value.split('_')[1])-1]:value.split('_')[1];

    } else if (key === 'R') {
        currentData['r'] = parseFloat(value).toFixed(2);
    } else if (key === 'R^2') {
        currentData['rr'] = parseFloat(value).toFixed(2);
    } else if (key === 'ARE') {
        currentData['are'] = parseFloat(value).toFixed(2);
    } else if (key === 'IOA') {
        currentData['ioa'] = parseFloat(value).toFixed(2);
        if (Object.keys(currentData).length > 0) {
            result_data.push(currentData);
            currentData = {};
        }
    }
    });

    // Push the last set of data
    if (Object.keys(currentData).length > 0) {
    result_data.push(currentData);
    }
    
    res.json({result:result_data})

})

app.get('/api/dataresult/:data/:date/:inter',(req,res)=>{
    const data = req.params.data
    const date = req.params.date
    const interver = req.params.inter
    
    const dataDirectory = '/Volumes/GSRB02/GNOMS-V/Data/MODEL/LAST'
    
    
    const targetDirectory = data !== 'SST'?path.join(dataDirectory,data):path.join(dataDirectory,data,interver)
    const files = fs.readdirSync(targetDirectory)
    const targetFile = files.filter((file)=>file.includes(date))
    
    res.sendFile(path.join(targetDirectory,targetFile[0]))
    // res.sendFile('/home/nifs_big/model_web_yj/geo-modelweb/Tools/test.tif')

})

app.get('/api/SST',(req,res)=>{
    res.sendFile('/Volumes/GSRB02/GNOMS-V/Data/MODEL/UNIST/SST/Daily/2021/01/01/tif/20210101_UNIST-IRIS-L4-SSTsubskin-MURTI_Daily_DL_V0.1.tif')
})

app.get('/api/SSS',(req,res)=>{
    res.sendFile('/Volumes/GSRB02/GNOMS-V/Data/MODEL/UNIST/SSS/tif/20201228_DL_Reconstructed_SSS.tif')
})

app.get('/api/chl',(req,res)=>{
    res.sendFile('/Volumes/GSRB02/GNOMS-V/Data/MODEL/UST21/2021/01/tif/test.tif')
})

app.get('/api/10m',(req,res)=>{
    res.sendFile('/Volumes/GSRB02/GNOMS-V/Data/MODEL/PNU/10msalinity/tif/20150502_10m salinity_cnn_PNU.tif')
})


app.get('/api/ssctest',(req,res)=>{
    res.sendFile('/Volumes/GSRB02/GNOMS-V/Data/MODEL/PNU/ssc/tif/20180108_sf_current_2018.tif')
})

app.get('/',(req,res)=>{
    res.sendFile(path.join(__dirname ,'../public/index.html'))
})